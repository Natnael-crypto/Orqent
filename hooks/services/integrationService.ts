import { api } from "@/lib/api";
import { Widget } from "@/types/widgets";

export interface RestTool {
    id: string;
    integrationId: string;
    method: string;
    path: string;
    contentType: string;
    headers: unknown;
    requestConfig: {
        pathParams?: unknown;
        queryParams?: unknown;
        headers?: unknown;
        cookies?: unknown;
        body?: { type: string; schema?: unknown };
        timeoutMs?: number;
    };
    responseConfig: {
        successStatusCodes?: number[];
        responseSchema?: unknown;
        dataPath?: string;
        errorPath?: string;
        strictValidation?: boolean;
    };
    requiresConfirmation: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IntegrationLog {
    id: string;
    integrationId: string;
    toolId: string;
    conversationId: string;
    requestPayload: unknown;
    responsePayload: unknown;
    status: string;
    errorMessage: string | null;
    latencyMs: number;
    tokensUsed: number | null;
    createdAt: string;
    tool?: RestTool;
}

export interface Integration {
    id: string;
    name: string;
    type: string;
    description?: string;
    status: string;
    config: {
        baseUrl?: string;
        headers?: Record<string, string>;
        [key: string]: unknown;
    };
    restTools?: RestTool[];
    widgets?: Widget[];
    createdAt: string;
    updatedAt: string;
}

export interface IntegrationsResponse {
    data: Integration[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const integrationService = {
    async getIntegrations(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        type?: string;
    } = {}): Promise<IntegrationsResponse> {
        const { data } = await api.get<IntegrationsResponse>("/integrations", {
            params,
        });
        return data;
    },

    async createIntegration(payload: unknown) {
        const { data } = await api.post("/integrations", payload);
        return data;
    },

    async getIntegrationById(id: string): Promise<Integration> {
        const { data } = await api.get<Integration>(`/integrations/${id}`);
        return data;
    },

    async updateIntegration(id: string, payload: unknown) {
        const { data } = await api.patch(`/integrations/${id}`, payload);
        return data;
    },

    async deleteIntegration(id: string) {
        const { data } = await api.delete(`/integrations/${id}`);
        return data;
    },

    async bulkDeleteIntegrations(ids: string[]) {
        const { data } = await api.post('/integrations/bulk-delete', { ids });
        return data;
    },

    async getIntegrationLogs(id: string): Promise<IntegrationLog[]> {
        const { data } = await api.get<IntegrationLog[]>(`/integrations/${id}/logs`);
        return data;
    }
};
