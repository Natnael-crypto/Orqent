import { prisma } from "@/lib/prisma";
import { Prisma, Widget, UICustomization, AllowedDomain, Integration } from "@prisma/client";

export const STANDARD_WIDGET_INCLUDE = {
    uiCustomization: true,
    allowedDomains: true,
    integrations: true,
} as const;

export class WidgetRepository {
    async findById(id: string) {
        return prisma.widget.findUnique({
            where: { id },
            include: STANDARD_WIDGET_INCLUDE,
        });
    }

    async create(data: Prisma.WidgetCreateInput): Promise<Widget> {
        return prisma.widget.create({
            data,
            include: {
                uiCustomization: true,
                allowedDomains: true,
                integrations: true,
            },
        });
    }

    async update(id: string, data: Prisma.WidgetUpdateInput): Promise<Widget> {
        return prisma.widget.update({
            where: { id },
            data,
            include: {
                uiCustomization: true,
                allowedDomains: true,
                integrations: true,
            },
        });
    }

    async delete(id: string): Promise<Widget> {
        return prisma.widget.delete({
            where: { id },
        });
    }

    async findAll<T extends Prisma.WidgetFindManyArgs>(args: T) {
        return prisma.widget.findMany(args);
    }

    async count(where?: Prisma.WidgetWhereInput): Promise<number> {
        return prisma.widget.count({ where });
    }
}

export const widgetRepository = new WidgetRepository();
