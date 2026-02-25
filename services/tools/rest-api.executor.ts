/**
 * ─────────────────────────────────────────────────────────────────────────────
 * REST API Tool Executor
 *
 * Implements ToolExecutor for integrations whose type === 'REST_API'.
 * Takes an AI-provided argument map, builds the HTTP request from the tool
 * definition, executes it with a configurable timeout, and returns a
 * normalised ToolResult.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
    BaseIntegrationConfig,
    RestToolDefinition,
    ToolExecutor,
    ToolResult,
} from './types.js';

// Default request timeout — honour tool-level override if set
const DEFAULT_TIMEOUT_MS = 30_000;

// Maximum response body size to avoid OOM on huge responses (1 MB)
const MAX_RESPONSE_BYTES = 1_048_576;

// ─── Tiny helper — dot-notation path extractor ────────────────────────────────
function getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((cur, key) => {
        if (cur === null || cur === undefined) return undefined;
        return (cur as Record<string, unknown>)[key];
    }, obj);
}

// ─── Executor class ───────────────────────────────────────────────────────────

export class RestApiExecutor
    implements ToolExecutor<BaseIntegrationConfig, RestToolDefinition> {
    async execute(
        config: BaseIntegrationConfig,
        tool: RestToolDefinition,
        aiArgs: Record<string, unknown>
    ): Promise<ToolResult> {
        const startTime = Date.now();

        try {
            // ── 1. Resolve URL with path params ──────────────────────────────
            let path = tool.path;

            if (tool.requestConfig.pathParams?.properties) {
                for (const [param, paramDef] of Object.entries(
                    tool.requestConfig.pathParams.properties
                )) {
                    // Static value from config takes precedence over AI arg
                    const value = paramDef.value ?? aiArgs[param];
                    if (value !== undefined) {
                        const encoded = encodeURIComponent(String(value));
                        path = path.replace(`:${param}`, encoded);
                        path = path.replace(`{${param}}`, encoded);
                    }
                }
            }

            const baseUrl = (config.baseUrl ?? '').replace(/\/$/, '');
            const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl);

            // ── 2. Query params ───────────────────────────────────────────────
            if (tool.requestConfig.queryParams?.properties) {
                for (const [param, paramDef] of Object.entries(
                    tool.requestConfig.queryParams.properties
                )) {
                    // Prefer static config value, then AI-provided arg
                    const value = paramDef.value ?? aiArgs[param];

                    // Defensive: If schema says number/integer but we got empty string, skip it
                    if ((paramDef.type === 'number' || paramDef.type === 'integer') && value === '') {
                        continue;
                    }

                    if (value !== undefined && value !== null) {
                        url.searchParams.set(param, String(value));
                    }
                }
            }

            // ── 3. Headers — merge in priority order ──────────────────────────
            const headers: Record<string, string> = {
                'Content-Type': tool.contentType,
                'User-Agent': 'Orqent-Agent/1.0',
            };

            // Integration-level base headers (e.g. Authorization)
            if (config.headers) {
                Object.assign(headers, config.headers);
            }

            // Tool-level header overrides
            if (tool.headers) {
                Object.assign(headers, tool.headers);
            }

            // Static header values from requestConfig
            if (tool.requestConfig.headers?.properties) {
                for (const [key, def] of Object.entries(
                    tool.requestConfig.headers.properties
                )) {
                    if (def.value) headers[key] = def.value;
                }
            }

            // ── 4. Build request body ─────────────────────────────────────────
            let body: string | undefined;

            if (
                tool.requestConfig.body &&
                ['POST', 'PUT', 'PATCH'].includes(tool.method.toUpperCase())
            ) {
                const bodyData: Record<string, unknown> = {};

                if (tool.requestConfig.body.schema?.properties) {
                    for (const field of Object.keys(
                        tool.requestConfig.body.schema.properties
                    )) {
                        if (aiArgs[field] !== undefined) {
                            bodyData[field] = aiArgs[field];
                        }
                    }
                }

                body =
                    tool.contentType === 'application/x-www-form-urlencoded'
                        ? new URLSearchParams(
                            bodyData as Record<string, string>
                        ).toString()
                        : JSON.stringify(bodyData);
            }

            // ── 5. Execute fetch with timeout ─────────────────────────────────
            const timeoutMs = tool.requestConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            let response: Response;
            try {
                response = await fetch(url.toString(), {
                    method: tool.method.toUpperCase(),
                    headers,
                    body,
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeoutId);
            }

            const latencyMs = Date.now() - startTime;

            // ── 6. Parse response (guard against huge bodies) ─────────────────
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
                return {
                    success: false,
                    error: `Response too large (${contentLength} bytes)`,
                    statusCode: response.status,
                    latencyMs,
                };
            }

            const responseText = await response.text();
            let responseData: unknown;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = responseText;
            }

            // ── 7. Success / error handling ───────────────────────────────────
            const isSuccess = (tool.responseConfig.successStatusCodes ?? [200]).includes(
                response.status
            );

            if (!isSuccess) {
                const rawError = tool.responseConfig.errorPath
                    ? getNestedValue(responseData, tool.responseConfig.errorPath)
                    : responseData;

                return {
                    success: false,
                    error:
                        typeof rawError === 'string'
                            ? rawError
                            : JSON.stringify(rawError),
                    statusCode: response.status,
                    latencyMs,
                };
            }

            // ── 8. Extract data via dataPath if configured ────────────────────
            const extractedData = tool.responseConfig.dataPath
                ? getNestedValue(responseData, tool.responseConfig.dataPath)
                : responseData;

            return {
                success: true,
                data: extractedData,
                statusCode: response.status,
                latencyMs,
            };
        } catch (err: unknown) {
            const latencyMs = Date.now() - startTime;
            const error = err as Error & { name?: string };

            const message =
                error.name === 'AbortError'
                    ? `Tool timed out after ${tool.requestConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`
                    : error.message ?? 'Unknown error';

            console.error(`[RestApiExecutor] Error executing tool ${tool.id}:`, message);

            return { success: false, error: message, latencyMs };
        }
    }
}

// Singleton instance — import this instead of instantiating each time
export const restApiExecutor = new RestApiExecutor();
