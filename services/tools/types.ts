/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Tool Abstraction Layer — Shared Types
 *
 * Every tool executor (REST API, Google Sheets, SQL, Slack, …) must implement
 * the `ToolExecutor` interface below.  The `ToolRegistry` picks the right
 * executor at runtime based on the integration type string.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Result returned by any executor ─────────────────────────────────────────

export interface ToolResult {
    /** Whether the upstream call succeeded */
    success: boolean;
    /** Parsed response data (on success) */
    data?: unknown;
    /** Human-readable error string (on failure) */
    error?: string;
    /** HTTP status code, if applicable */
    statusCode?: number;
    /** Wall-clock milliseconds the call took */
    latencyMs: number;
}

// ─── Integration & tool config shapes ────────────────────────────────────────

/** Base-level integration config shared by all tool types */
export interface BaseIntegrationConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
    /** Arbitrary extra keys for custom executors */
    [key: string]: unknown;
}

/** A fully-resolved REST API tool definition (from DB / Prisma) */
export interface RestToolDefinition {
    id: string;
    method: string;
    path: string;
    contentType: string;
    headers?: Record<string, string> | null;
    requestConfig: {
        pathParams?: {
            type: string;
            properties: Record<string, { value?: string; type?: string; description?: string }>;
        };
        queryParams?: {
            type: string;
            properties: Record<string, { type: string; description?: string; value?: string }>;
        };
        headers?: {
            type: string;
            properties: Record<string, { value?: string }>;
        };
        body?: {
            type: string;
            schema?: {
                type: string;
                properties: Record<string, { type: string; description?: string }>;
                required?: string[];
            };
        };
        /** Per-request timeout in milliseconds (default 30 000) */
        timeoutMs?: number;
    };
    responseConfig: {
        successStatusCodes: number[];
        /** Dot-notation path to extract from response JSON, e.g. "data.results" */
        dataPath?: string;
        /** Dot-notation path to extract error message from response JSON */
        errorPath?: string;
    };
    isActive: boolean;
}

// ─── Executor interface ───────────────────────────────────────────────────────

/**
 * Every tool executor must implement this interface.
 *
 * @template TConfig  Integration-level config (e.g. BaseIntegrationConfig)
 * @template TTool    Tool-level definition (e.g. RestToolDefinition)
 */
export interface ToolExecutor<
    TConfig extends BaseIntegrationConfig = BaseIntegrationConfig,
    TTool = unknown,
> {
    /**
     * Execute the tool with the AI-provided arguments.
     *
     * @param config  Integration-level config (credentials, base URL, …)
     * @param tool    Tool-level definition (path, method, schema, …)
     * @param args    Key→value arguments provided by the AI model
     */
    execute(
        config: TConfig,
        tool: TTool,
        args: Record<string, unknown>
    ): Promise<ToolResult>;
}

// ─── Integration type discriminator ──────────────────────────────────────────

/**
 * Known integration types.  Add new values here when adding new executors
 * (e.g. 'GOOGLE_SHEET', 'SLACK', 'MYSQL').
 */
export type IntegrationType =
    | 'REST_API'
    | 'GOOGLE_SERVICES'
    | 'GOOGLE_SHEET'
    | 'GOOGLE_CALENDAR'
    | 'SLACK'
    | 'MYSQL'
    | 'POSTGRES'
    | string; // allow arbitrary future types without breaking TS
