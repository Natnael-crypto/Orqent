import { prisma } from "@/lib/prisma";
import { Prisma, Widget, UICustomization, AllowedDomain, Integration } from "@prisma/client";

export class WidgetRepository {
    async findById(id: string): Promise<(Widget & { uiCustomization: UICustomization | null; allowedDomains: AllowedDomain[]; integrations: Integration[] }) | null> {
        return prisma.widget.findUnique({
            where: { id },
            include: {
                uiCustomization: true,
                allowedDomains: true,
                integrations: true,
            },
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

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.WidgetWhereInput;
        orderBy?: Prisma.WidgetOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return prisma.widget.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                uiCustomization: true,
                allowedDomains: true,
                integrations: true,
            },
        });
    }

    async count(where?: Prisma.WidgetWhereInput): Promise<number> {
        return prisma.widget.count({ where });
    }
}

export const widgetRepository = new WidgetRepository();
