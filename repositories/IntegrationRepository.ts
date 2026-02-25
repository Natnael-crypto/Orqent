import { prisma } from "@/lib/prisma";
import { Prisma, Integration } from "@prisma/client";

export class IntegrationRepository {
    async findById<T extends Prisma.IntegrationInclude>(id: string, include?: T) {
        return prisma.integration.findUnique({ where: { id }, include });
    }

    async findByUserId(userId: string): Promise<Integration[]> {
        return prisma.integration.findMany({ where: { userId } });
    }

    async create(data: Prisma.IntegrationCreateInput): Promise<Integration> {
        return prisma.integration.create({ data });
    }

    async update(id: string, data: Prisma.IntegrationUpdateInput): Promise<Integration> {
        return prisma.integration.update({ where: { id }, data });
    }

    async delete(id: string): Promise<Integration> {
        return prisma.integration.delete({ where: { id } });
    }

    async findAll<T extends Prisma.IntegrationFindManyArgs>(args: T) {
        return prisma.integration.findMany(args);
    }

    async count(where?: Prisma.IntegrationWhereInput): Promise<number> {
        return prisma.integration.count({ where });
    }
}

export const integrationRepository = new IntegrationRepository();
