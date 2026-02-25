import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";
import { UICustomizationSchema } from "@/lib/validation";

export class UICustomizationService {
    async create(userId: string, data: z.infer<typeof UICustomizationSchema>) {
        const validated = UICustomizationSchema.parse(data);
        return prisma.uICustomization.create({
            data: {
                ...validated,
                userId,
            },
        });
    }

    async update(userId: string, id: string, data: Partial<z.infer<typeof UICustomizationSchema>>) {
        const customization = await prisma.uICustomization.findUnique({
            where: { id },
        });

        if (!customization) throw new ApiError(404, "UI Customization not found");
        if (customization.userId !== userId) throw new ApiError(403, "Unauthorized");

        return prisma.uICustomization.update({
            where: { id },
            data,
        });
    }

    async list(userId: string) {
        return prisma.uICustomization.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
        });
    }

    async getById(userId: string, id: string) {
        const customization = await prisma.uICustomization.findUnique({
            where: { id },
        });

        if (!customization) throw new ApiError(404, "UI Customization not found");
        if (customization.userId !== userId) throw new ApiError(403, "Unauthorized");

        return customization;
    }

    async delete(userId: string, id: string) {
        const customization = await prisma.uICustomization.findUnique({
            where: { id },
        });

        if (!customization) throw new ApiError(404, "UI Customization not found");
        if (customization.userId !== userId) throw new ApiError(403, "Unauthorized");

        return prisma.uICustomization.delete({
            where: { id },
        });
    }
}

export const uiCustomizationService = new UICustomizationService();
