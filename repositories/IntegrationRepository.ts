import { prisma } from "@/lib/prisma";
import { Prisma, Integration } from "@prisma/client";

export class IntegrationRepository {
    async findById(id: string): Promise<Integration | null> {
        return prisma.integration.findUnique({ where: { id }, include: { restTools: true } });
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

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.IntegrationWhereInput;
        orderBy?: Prisma.IntegrationOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return prisma.integration.findMany({ skip, take, where, orderBy, include: { restTools: true } });
    }

    async count(where?: Prisma.IntegrationWhereInput): Promise<number> {
        return prisma.integration.count({ where });
    }
}

export const integrationRepository = new IntegrationRepository();
