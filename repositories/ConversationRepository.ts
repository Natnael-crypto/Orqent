import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ConversationRepository {
    async findAll(args: Prisma.ConversationFindManyArgs) {
        return prisma.conversation.findMany(args);
    }

    async findById(id: string, include?: Prisma.ConversationInclude) {
        return prisma.conversation.findUnique({
            where: { id },
            include,
        });
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
