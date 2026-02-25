/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Groq AI Agent — Agentic Tool-Calling Loop
 *
 * Flow per user message:
 *   1. Build messages array  (system + history + user)
 *   2. Build Groq tool definitions from all active integrations
 *   3. POST to Groq — if response contains tool_calls → execute them in parallel
 *      (capped at MAX_PARALLEL_TOOLS) then loop back to step 3
 *   4. Once Groq returns a plain text response → return it to the caller
 *   5. Safety: if MAX_TOOL_ITERATIONS reached → one final call without tools
 *
 * Adding a new tool type:
 *   • Create services/tools/<name>.executor.ts implementing ToolExecutor
 *   • Call toolRegistry.register('<TYPE>', yourExecutor) in that file
 *   • Import the file once anywhere (it auto-registers on import)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import { toolRegistry } from './tools/tool-registry.js';
import { SystemPrompt } from './promte.js';
import type { RestToolDefinition, BaseIntegrationConfig } from './tools/types.js';

dotenv.config();

// ─── Constants ────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API! });

/** Fallback model when the widget model is not recognised */
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/** Maximum agentic loop iterations (prevents infinite tool-call cycles) */
const MAX_TOOL_ITERATIONS = 10;

/**
 * Maximum number of tool calls executed in parallel within a single iteration.
 * Limits runaway resource usage under heavy load.
 */
const MAX_PARALLEL_TOOLS = 5;

// ─── Public input / output types ─────────────────────────────────────────────

export interface AiAgentInput {
    systemPrompt: string;
    /** Widget.model field — will be mapped to a valid Groq model ID */
    model: string;
    temperature: number;
    maxTokens: number;
    conversationHistory: Array<{ role: string; content: string }>;
    userMessage: string;
    integrations: IntegrationWithTools[];
    conversationId: string;
    /**
     * Optional callback invoked before each tool call.
     * Use to stream progress events (e.g. WebSocket "tool_call" frames).
     */
    onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
}

export interface IntegrationWithTools {
    id: string;
    name: string;
    userId: string;
    /** Must match a registered ToolRegistry type, e.g. 'REST_API' */
    type: string;
    status: string;
    config: unknown; // Prisma JsonValue can be complex, and executors handle casting
    restTools: RestToolDefinition[];
}

export interface AiAgentResult {
    content: string;
    toolCallsExecuted: number;
    model: string;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Maps known non-Groq model aliases to actual Groq model IDs */
function resolveGroqModel(widgetModel: string): string {
    const modelMap: Record<string, string> = {
        'gpt-4': 'llama-3.3-70b-versatile',
        'gpt-4o': 'llama-3.3-70b-versatile',
        'gpt-4-turbo': 'llama-3.3-70b-versatile',
        'gpt-3.5-turbo': 'llama-3.1-8b-instant',
        'claude-3': 'llama-3.3-70b-versatile',
    };
    return modelMap[widgetModel] ?? widgetModel ?? DEFAULT_MODEL;
}

/**
 * Converts a RestToolDefinition into a Groq-compatible function tool definition.
 * The function name encodes integrationId + toolId so we can look it up in toolMap.
 */
function buildGroqToolDef(
    integration: IntegrationWithTools,
    tool: RestToolDefinition
): Groq.Chat.Completions.ChatCompletionTool {
    const fnName = makeToolFunctionName(integration.id, tool.id);
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    // --- Query params ---
    const queryProps = tool.requestConfig?.queryParams?.properties ?? {};
    for (const [name, def] of Object.entries(queryProps)) {
        if (def.value !== undefined) continue;

        const type = def.type || 'string';
        let description = def.description || name;

        // Hint for AI to omit optional numbers if unknown
        if (type === 'number' || type === 'integer') {
            description += ' (Optional: Leave blank/omit if unknown, do NOT send empty string)';
        }

        properties[name] = {
            type,
            description
        };
    }

    // --- Body params ---
    const bodySchema = tool.requestConfig?.body?.schema;
    if (bodySchema?.properties) {
        for (const [name, def] of Object.entries(bodySchema.properties)) {
            const type = def.type || 'string';
            let description = def.description || name;

            if (type === 'number' || type === 'integer') {
                description += ' (Optional: Leave blank/omit if unknown, do NOT send empty string)';
            }

            properties[name] = {
                type,
                description
            };
        }
        if (Array.isArray(bodySchema.required)) {
            required.push(...bodySchema.required);
        }
    }

    // --- Dynamic path params ---
    const pathProps = tool.requestConfig?.pathParams?.properties ?? {};
    for (const [name, def] of Object.entries(pathProps)) {
        if (!def.value) {
            properties[name] = {
                type: def.type || 'string',
                description: def.description || `Path parameter: ${name}`
            };
            required.push(name);
        }
    }

    const description = `[${integration.name}] ${tool.method.toUpperCase()} ${tool.path}`;

    return {
        type: 'function',
        function: {
            name: fnName,
            description,
            parameters: {
                type: 'object',
                properties,
                ...(required.length > 0 ? { required: [...new Set(required)] } : {}),
            },
        },
    };
}

/** Stable, deterministic function name from integration + tool IDs */
function makeToolFunctionName(integrationId: string, toolId: string): string {
    return `call_${integrationId.replace(/-/g, '_')}_${toolId.replace(/-/g, '_')}`;
}

/**
 * Build lookup map: Groq function name → { integration, tool }
 * Only includes ACTIVE integrations with ACTIVE tools.
 */
function buildToolMap(
    integrations: IntegrationWithTools[]
): Map<string, { integration: IntegrationWithTools; tool: RestToolDefinition }> {
    const map = new Map<string, { integration: IntegrationWithTools; tool: RestToolDefinition }>();

    for (const integration of integrations) {
        if (integration.status !== 'ACTIVE') continue;
        for (const tool of integration.restTools) {
            if (!tool.isActive) continue;
            map.set(makeToolFunctionName(integration.id, tool.id), { integration, tool });
        }
    }

    return map;
}

/**
 * Simple async concurrency limiter — runs `tasks` with at most `limit` in flight.
 */
async function runWithConcurrencyLimit<T>(
    tasks: Array<() => Promise<T>>,
    limit: number
): Promise<T[]> {
    const results: T[] = [];
    let i = 0;

    async function worker(): Promise<void> {
        while (i < tasks.length) {
            const idx = i++;
            results[idx] = await tasks[idx]();
        }
    }

    const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
    await Promise.all(workers);
    return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Run the Groq AI agent with a full agentic tool-calling loop.
 */
export async function runAiAgent(input: AiAgentInput): Promise<AiAgentResult> {
    const model = resolveGroqModel(input.model);

    // Build initial message array — Prepend Platform System Prompt for hierarchy
    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SystemPrompt },
        { role: 'system', content: input.systemPrompt ?? '' },
        ...input.conversationHistory.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        })),
        { role: 'user', content: input.userMessage },
    ];

    // Build Groq tool definitions — only active integrations with active tools
    const groqTools: Groq.Chat.Completions.ChatCompletionTool[] = [];
    const activeIntegrations = input.integrations.filter(
        (i) => i.status === 'ACTIVE' && i.restTools.some((t) => t.isActive)
    );

    for (const integration of activeIntegrations) {
        // Only expose tool types the registry knows how to execute
        if (!toolRegistry.hasExecutor(integration.type)) {
            console.warn(
                `[AiAgent] Skipping integration "${integration.name}" — ` +
                `no executor registered for type "${integration.type}". ` +
                `Registered types: [${toolRegistry.registeredTypes().join(', ')}]`
            );
            continue;
        }
        for (const tool of integration.restTools) {
            if (tool.isActive) {
                groqTools.push(buildGroqToolDef(integration, tool));
            }
        }
    }

    const toolMap = buildToolMap(input.integrations);
    let toolCallsExecuted = 0;

    // ── Agentic loop ──────────────────────────────────────────────────────────
    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
        // Build request params
        const requestParams: Parameters<typeof groq.chat.completions.create>[0] = {
            model,
            messages,
            temperature: input.temperature ?? 0.7,
            max_tokens: input.maxTokens ?? 1024,
            stream: false,
        };

        if (groqTools.length > 0) {
            requestParams.tools = groqTools;
            requestParams.tool_choice = 'auto';
        }

        const response = (await groq.chat.completions.create(
            requestParams
        )) as Groq.Chat.Completions.ChatCompletion;
        const choice = response.choices[0];

        if (!choice) {
            throw new Error('[AiAgent] Groq returned no choices');
        }

        const assistantMessage = choice.message;

        // ── No tool calls — return final answer ───────────────────────────────
        if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
            return {
                content: assistantMessage.content ?? '',
                toolCallsExecuted,
                model,
            };
        }

        // ── Tool calls requested — append assistant turn ───────────────────────
        messages.push({
            role: 'assistant',
            content: assistantMessage.content ?? null,
            tool_calls: assistantMessage.tool_calls,
        });

        // Execute tool calls with concurrency cap
        const toolCallTasks = assistantMessage.tool_calls.map((toolCall: Groq.Chat.Completions.ChatCompletionMessageToolCall) => async () => {
            const fnName = toolCall.function.name;
            const entry = toolMap.get(fnName);

            if (!entry) {
                console.warn(`[AiAgent] Unknown tool called: ${fnName}`);
                return {
                    role: 'tool' as const,
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ error: `Tool "${fnName}" not found` }),
                };
            }

            let args: Record<string, unknown> = {};
            try {
                const parsed = JSON.parse(toolCall.function.arguments);
                args = (parsed && typeof parsed === 'object') ? parsed : {};
            } catch {
                args = {};
            }

            console.log(`[AiAgent] Executing tool: ${fnName}`, args);

            // Fire optional progress callback (e.g. to send WS event)
            try {
                input.onToolCall?.(fnName, args);
            } catch {
                // Callbacks must never crash the agent loop
            }

            const result = await toolRegistry.execute(
                entry.integration.type,
                { ...(entry.integration.config as BaseIntegrationConfig), userId: entry.integration.userId },
                entry.tool,
                args
            );

            toolCallsExecuted++;

            console.log(
                `[AiAgent] Tool ${fnName} → ${result.success ? 'OK' : 'ERR'} (${result.latencyMs}ms)`,
                result.success ? '' : result.error
            );

            return {
                role: 'tool' as const,
                tool_call_id: toolCall.id,
                content: result.success
                    ? JSON.stringify(result.data ?? {})
                    : JSON.stringify({ error: result.error }),
            };
        });

        const toolResults = await runWithConcurrencyLimit(toolCallTasks, MAX_PARALLEL_TOOLS);
        messages.push(...toolResults);
    }

    // ── Max iterations hit — do a final call without tools ────────────────────
    console.warn(
        `[AiAgent] Max tool iterations (${MAX_TOOL_ITERATIONS}) reached ` +
        `for conversation ${input.conversationId}`
    );

    const finalResponse = await groq.chat.completions.create({
        model,
        messages,
        temperature: input.temperature ?? 0.7,
        max_tokens: input.maxTokens ?? 1024,
        stream: false,
    });

    return {
        content:
            finalResponse.choices[0]?.message?.content ??
            'I was unable to complete the request after multiple attempts.',
        toolCallsExecuted,
        model,
    };
}
