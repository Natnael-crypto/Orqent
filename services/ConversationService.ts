import { conversationRepository } from "@/repositories/ConversationRepository";
import { ApiError } from "@/lib/api-error";
import { Prisma } from "@prisma/client";

export class ConversationService {
    async getConversations(
        userId: string,
        params: {
            page?: number;
            limit?: number;
            widgetId?: string;
            startDate?: string;
            endDate?: string;
        }
    ) {
        const { page = 1, limit = 10, widgetId, startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ConversationWhereInput = {
            widget: {
                userId: userId, // Ensure isolation: only conversations from user's widgets
            },
        };

        if (widgetId) {
            where.widgetId = widgetId;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const [data, total] = await Promise.all([
            conversationRepository.findAll({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: "desc" },
                include: {
                    widget: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            conversationRepository.count(where),
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

    async getConversationById(userId: string, conversationId: string) {
        const conversation = await conversationRepository.findById(conversationId, {
            widget: true,
            messages: {
                orderBy: { createdAt: "asc" },
            },
        });

        if (!conversation) {
            throw new ApiError(404, "Conversation not found");
        }

        if (conversation.widget.userId !== userId) {
            throw new ApiError(403, "Unauthorized access to this conversation");
        }

        return conversation;
    }
}

export const conversationService = new ConversationService();
