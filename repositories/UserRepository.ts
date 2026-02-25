import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";

export class UserRepository {
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({ where: { id }, data });
    }

    async delete(id: string): Promise<User> {
        return prisma.user.delete({ where: { id } });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, where, orderBy } = params;
        return prisma.user.findMany({ skip, take, where, orderBy });
    }
}

export const userRepository = new UserRepository();
