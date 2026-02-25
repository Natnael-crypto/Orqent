export interface ToolExecutionLog {
    id: string;
    integrationId: string;
    toolId: string;

    conversationId: string;

    requestPayload: unknown;
    responsePayload: unknown;

    status: "SUCCESS" | "FAILED";
    errorMessage?: string;

    latencyMs: number;
    tokensUsed?: number;

    createdAt: Date;
}
