import { integrationRepository } from "@/repositories/IntegrationRepository";
import { IntegrationSchema, RestApiConfigSchema } from "@/lib/validation";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class IntegrationService {
    async createIntegration(userId: string, data: z.infer<typeof IntegrationSchema>) {
        const validated = IntegrationSchema.parse(data);

        // Ensure config is valid JSON object for Prisma
        const config = validated.config as Prisma.InputJsonValue;

        const createData: Prisma.IntegrationCreateInput = {
            user: { connect: { id: userId } },
            name: validated.name,
            type: validated.type,
            description: validated.description,
            status: "ACTIVE",
            config: config,
        };

        if (validated.restTools && validated.restTools.length > 0) {
            createData.restTools = {
                create: validated.restTools.map((tool) => ({
                    method: tool.method,
                    path: tool.path,
                    contentType: tool.contentType,
                    headers: tool.headers as Prisma.InputJsonValue,
                    requestConfig: tool.requestConfig as Prisma.InputJsonValue,
                    responseConfig: tool.responseConfig as Prisma.InputJsonValue,
                    requiresConfirmation: tool.requiresConfirmation,
                    isActive: tool.isActive,
                })),
            };
        }

        return integrationRepository.create(createData);
    }

    async getIntegrations(userId: string, page: number = 1, limit: number = 10, search?: string, status?: string, type?: string) {
        const skip = (page - 1) * limit;
        const where: Prisma.IntegrationWhereInput = { userId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) where.status = status;
        if (type) where.type = type;

        // Filter out DELETED status by default if not strictly requested? 
        // The original code had: WHERE "userId" = $1 AND status != 'DELETED'
        if (!status) {
            where.status = { not: "DELETED" };
        }

        const [data, total] = await Promise.all([
            integrationRepository.findAll({
                skip,
                take: limit,
                where,
                orderBy: { updatedAt: "desc" },
            }),
            integrationRepository.count(where),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getIntegrationById(userId: string, integrationId: string) {
        const integration = await integrationRepository.findById(integrationId);
        if (!integration) throw new ApiError(404, "Integration not found");
        if (integration.userId !== userId) throw new ApiError(403, "Unauthorized");

        // Also fetch widgets (agents) connected to this integration
        const fullIntegration = await prisma.integration.findUnique({
            where: { id: integrationId },
            include: {
                widgets: true,
                restTools: true,
            }
        });

        return fullIntegration;
    }

    async getIntegrationLogs(userId: string, integrationId: string, limit: number = 50) {
        await this.getIntegrationById(userId, integrationId); // Security check

        return prisma.toolExecutionLog.findMany({
            where: { integrationId },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                tool: true
            }
        });
    }

    async updateIntegration(userId: string, integrationId: string, data: Partial<z.infer<typeof IntegrationSchema>>) {
        const integration = await this.getIntegrationById(userId, integrationId);

        return prisma.$transaction(async (tx) => {
            // Update top-level integration fields
            const updateData: Prisma.IntegrationUpdateInput = {};
            if (data.name !== undefined) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.type !== undefined) updateData.type = data.type;
            if (data.config !== undefined) updateData.config = data.config as Prisma.InputJsonValue;

            await tx.integration.update({
                where: { id: integrationId },
                data: updateData,
            });

            // If restTools are provided, replace them atomically (delete old + create new)
            if (data.restTools && data.restTools.length > 0) {
                // Delete all existing rest tools for this integration
                await tx.restTool.deleteMany({
                    where: { integrationId },
                });

                // Create new rest tools
                await tx.restTool.createMany({
                    data: data.restTools.map((tool) => ({
                        integrationId,
                        method: tool.method,
                        path: tool.path,
                        contentType: tool.contentType,
                        headers: tool.headers as Prisma.InputJsonValue,
                        requestConfig: tool.requestConfig as Prisma.InputJsonValue,
                        responseConfig: tool.responseConfig as Prisma.InputJsonValue,
                        requiresConfirmation: tool.requiresConfirmation,
                        isActive: tool.isActive,
                    })),
                });
            }

            // Return updated integration with restTools included
            return tx.integration.findUnique({
                where: { id: integrationId },
                include: {
                    restTools: true,
                    widgets: true,
                },
            });
        });
    }

    async deleteIntegration(userId: string, integrationId: string) {
        await this.getIntegrationById(userId, integrationId);
        return integrationRepository.delete(integrationId);
    }

    async bulkDeleteIntegrations(userId: string, ids: string[]) {
        // Simple security check: ensure all belong to user
        const integrations = await prisma.integration.findMany({
            where: {
                id: { in: ids },
                userId: userId
            }
        });

        if (integrations.length !== ids.length) {
            throw new ApiError(403, "One or more integrations not found or unauthorized");
        }

        return prisma.integration.deleteMany({
            where: {
                id: { in: ids },
                userId: userId
            }
        });
    }
}

export const integrationService = new IntegrationService();
