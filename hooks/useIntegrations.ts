import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationService } from "./services/integrationService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiError } from "@/types/common";

export function useIntegrations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
} = {}) {
    return useQuery({
        queryKey: ["integrations", params],
        queryFn: () => integrationService.getIntegrations(params),
    });
}

export const useIntegrationActions = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const createIntegration = useMutation({
        mutationFn: (payload: unknown) => integrationService.createIntegration(payload),
        onSuccess: () => {
            toast.success("Integration created successfully");
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
            router.push("/dashboard/integrations");
        },
        onError: (err: unknown) => {
            toast.error((err as ApiError)?.response?.data?.error || "Failed to create integration");
        },
    });

    const updateIntegration = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
            integrationService.updateIntegration(id, payload),
        onSuccess: () => {
            toast.success("Integration updated successfully");
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (err: unknown) => {
            toast.error((err as ApiError)?.response?.data?.error || "Update failed");
        },
    });

    const deleteIntegration = useMutation({
        mutationFn: (id: string) => integrationService.deleteIntegration(id),
        onSuccess: () => {
            toast.success("Integration deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (err: unknown) => {
            toast.error((err as ApiError)?.response?.data?.error || "Deletion failed");
        },
    });

    const bulkDeleteIntegrations = useMutation({
        mutationFn: (ids: string[]) => integrationService.bulkDeleteIntegrations(ids),
        onSuccess: () => {
            toast.success("Integrations deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
        },
        onError: (err: unknown) => {
            toast.error((err as ApiError)?.response?.data?.error || "Bulk deletion failed");
        },
    });

    return { createIntegration, updateIntegration, deleteIntegration, bulkDeleteIntegrations };
};

export function useIntegration(id: string) {
    return useQuery({
        queryKey: ["integration", id],
        queryFn: () => integrationService.getIntegrationById(id),
        enabled: !!id,
    });
}

export function useIntegrationLogs(id: string) {
    return useQuery({
        queryKey: ["integration-logs", id],
        queryFn: () => integrationService.getIntegrationLogs(id),
        enabled: !!id,
        refetchInterval: 10000, // Refetch logs every 10 seconds
    });
}
