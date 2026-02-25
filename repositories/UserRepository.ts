import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";

export class UserRepository {
    async findById<T extends Prisma.UserInclude>(id: string, include?: T) {
        return prisma.user.findUnique({ where: { id }, include });
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

    async findAll<T extends Prisma.UserFindManyArgs>(args: T) {
        return prisma.user.findMany(args);
    }
}

export const userRepository = new UserRepository();
