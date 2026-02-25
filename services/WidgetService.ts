import { widgetRepository } from "@/repositories/WidgetRepository";
import { WidgetValuesSchema } from "@/lib/validation";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export class WidgetService {
    async createWidget(userId: string, data: z.infer<typeof WidgetValuesSchema>) {
        const validated = WidgetValuesSchema.parse(data);

        // Transaction to ensure all parts are created or none
        return prisma.$transaction(async (tx) => {
            // 1. Create Widget
            const widget = await tx.widget.create({
                data: {
                    userId,
                    name: validated.name,
                    description: validated.description,
                    model: validated.model,
                    systemPrompt: validated.systemPrompt,
                    temperature: validated.temperature,
                    maxTokens: validated.maxTokens,
                    status: "ACTIVE",
                    uiCustomizationId: validated.uiCustomizationId,
                },
            });

            // 2. Allowed Domains
            if (validated.allowedDomains && validated.allowedDomains.length > 0) {
                await tx.allowedDomain.createMany({
                    data: validated.allowedDomains.map((domain) => ({
                        userId,
                        widgetId: widget.id,
                        domain,
                    })),
                });
            }

            // 3. Integrations
            if (validated.integrationIds && validated.integrationIds.length > 0) {
                // Implicit many-to-many: "integrations Integration[]" in schema
                // We need to connect them.
                await tx.widget.update({
                    where: { id: widget.id },
                    data: {
                        integrations: {
                            connect: validated.integrationIds.map((id) => ({ id })),
                        },
                    },
                });
            }

            // Return complete widget
            return widgetRepository.findById(widget.id);
        });
    }

    async getWidgets(userId: string, page: number = 1, limit: number = 10, search?: string, status?: string, model?: string) {
        const skip = (page - 1) * limit;
        const where: any = { userId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) where.status = status;
        if (model) where.model = model;

        const [data, total] = await Promise.all([
            widgetRepository.findAll({
                skip,
                take: limit,
                where,
                orderBy: { updatedAt: "desc" },
            }),
            widgetRepository.count(where),
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

    async getWidgetById(userId: string, widgetId: string) {
        const widget = await widgetRepository.findById(widgetId);
        if (!widget) throw new ApiError(404, "Widget not found");
        if (widget.userId !== userId) throw new ApiError(403, "Unauthorized");
        return widget;
    }

    async updateWidget(userId: string, widgetId: string, data: Partial<z.infer<typeof WidgetValuesSchema>>) {
        const validated = WidgetValuesSchema.partial().parse(data);
        const existingWidget = await this.getWidgetById(userId, widgetId);

        return prisma.$transaction(async (tx) => {
            // 1. Update Basic Fields
            const updateData: any = {};
            if (validated.name !== undefined) updateData.name = validated.name;
            if (validated.description !== undefined) updateData.description = validated.description;
            if (validated.model !== undefined) updateData.model = validated.model;
            if (validated.systemPrompt !== undefined) updateData.systemPrompt = validated.systemPrompt;
            if (validated.temperature !== undefined) updateData.temperature = validated.temperature;
            if (validated.maxTokens !== undefined) updateData.maxTokens = validated.maxTokens;
            if (validated.uiCustomizationId !== undefined) updateData.uiCustomizationId = validated.uiCustomizationId;

            if (Object.keys(updateData).length > 0) {
                await tx.widget.update({
                    where: { id: widgetId },
                    data: updateData,
                });
            }

            // 2. Allowed Domains (Replace strategy)
            if (validated.allowedDomains !== undefined) {
                await tx.allowedDomain.deleteMany({
                    where: { widgetId },
                });

                if (validated.allowedDomains.length > 0) {
                    await tx.allowedDomain.createMany({
                        data: validated.allowedDomains.map((domain) => ({
                            userId,
                            widgetId,
                            domain,
                        })),
                    });
                }
            }

            // 3. Integrations (Replace strategy)
            if (validated.integrationIds !== undefined) {
                // Clear existing connections
                // In Prisma, we use `set` to replace the entire relation
                await tx.widget.update({
                    where: { id: widgetId },
                    data: {
                        integrations: {
                            set: validated.integrationIds.map((id) => ({ id })),
                        },
                    },
                });
            }

            // Return updated widget
            return tx.widget.findUnique({
                where: { id: widgetId },
                include: {
                    uiCustomization: true,
                    allowedDomains: true,
                    integrations: true,
                },
            });
        });
    }

    async deleteWidget(userId: string, widgetId: string) {
        await this.getWidgetById(userId, widgetId); // Security check
        return prisma.widget.delete({
            where: { id: widgetId },
        });
    }
}

export const widgetService = new WidgetService();
