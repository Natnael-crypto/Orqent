/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Tool Registry
 *
 * A lightweight registry that maps an IntegrationType string to the
 * ToolExecutor implementation that handles it.
 *
 * Usage:
 *   // Register a new executor once at startup:
 *   toolRegistry.register('GOOGLE_SHEET', googleSheetExecutor);
 *
 *   // Dispatch a tool call at runtime:
 *   const result = await toolRegistry.execute(integration, tool, args);
 *
 * Adding a new tool type:
 *   1. Create services/tools/google-sheet.executor.ts implementing ToolExecutor
 *   2. Call toolRegistry.register('GOOGLE_SHEET', googleSheetExecutor) in that file
 *   3. Import the file once (e.g. in ai-agent.ts) so the side-effect runs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
    BaseIntegrationConfig,
    IntegrationType,
    ToolExecutor,
    ToolResult,
} from './types.js';

import { restApiExecutor } from './rest-api.executor.js';
import { googleServicesExecutor } from './google-services.executor.js';

// ─── Registry class ───────────────────────────────────────────────────────────

class ToolRegistry {
    /** Map from integration type string → executor */
    private readonly executors = new Map<string, ToolExecutor>();

    /**
     * Register an executor for a given integration type.
     * Calling register() again for the same type replaces the previous executor.
     */
    register(type: IntegrationType, executor: ToolExecutor): void {
        this.executors.set(type, executor);
        console.log(`[ToolRegistry] Registered executor for type: ${type}`);
    }

    /**
     * Execute a tool call using the registered executor for `integrationType`.
     *
     * @throws {Error} if no executor is registered for the given type
     */
    async execute(
        integrationType: IntegrationType,
        config: BaseIntegrationConfig,
        tool: unknown,
        args: Record<string, unknown>
    ): Promise<ToolResult> {
        const executor = this.executors.get(integrationType);

        if (!executor) {
            const msg = `[ToolRegistry] No executor registered for integration type: "${integrationType}". Registered: [${[...this.executors.keys()].join(', ')}]`;
            console.error(msg);
            return {
                success: false,
                error: `Unsupported integration type: ${integrationType}`,
                latencyMs: 0,
            };
        }

        return executor.execute(config, tool, args);
    }

    /** Returns true if an executor is registered for the given type */
    hasExecutor(type: IntegrationType): boolean {
        return this.executors.has(type);
    }

    /** List all registered executor types (useful for debugging) */
    registeredTypes(): string[] {
        return [...this.executors.keys()];
    }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const toolRegistry = new ToolRegistry();

// ─── Register built-in executors ─────────────────────────────────────────────
// 'REST_API' is always available.
// Future executors: import their file and call toolRegistry.register() below.

toolRegistry.register('REST_API', restApiExecutor);
toolRegistry.register('GOOGLE_SERVICES', googleServicesExecutor);

/*
 * Example — adding Google Sheets support in the future:
 *
 *   import { googleSheetExecutor } from './google-sheet.executor.js';
 *   toolRegistry.register('GOOGLE_SHEET', googleSheetExecutor);
 */
