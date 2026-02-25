import { api } from "@/lib/api";

export interface RestTool {
    id: string;
    integrationId: string;
    method: string;
    path: string;
    contentType: string;
    headers: any;
    requestConfig: any;
    responseConfig: any;
    requiresConfirmation: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Integration {
    id: string;
    name: string;
    type: string;
    description?: string;
    status: string;
    config: any;
    restTools?: RestTool[];
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

    async createIntegration(payload: any) {
        const { data } = await api.post("/integrations", payload);
        return data;
    },

    async getIntegrationById(id: string): Promise<Integration> {
        const { data } = await api.get<Integration>(`/integrations/${id}`);
        return data;
    },

    async updateIntegration(id: string, payload: any) {
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

    async getIntegrationLogs(id: string) {
        const { data } = await api.get(`/integrations/${id}/logs`);
        return data;
    }
};
