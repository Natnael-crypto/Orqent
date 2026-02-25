import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ConversationRepository {
    async findAll<T extends Prisma.ConversationFindManyArgs>(args: T) {
        return prisma.conversation.findMany(args);
    }

    async findById<T extends Prisma.ConversationInclude>(id: string, include?: T) {
        return prisma.conversation.findUnique({
            where: { id },
            include,
        }) as Promise<Prisma.ConversationGetPayload<{ include: T }> | null>;
    }

    async count(where: Prisma.ConversationWhereInput) {
        return prisma.conversation.count({ where });
    }

    async findMessages(conversationId: string) {
        return prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
        });
    }
}

export const conversationRepository = new ConversationRepository();
