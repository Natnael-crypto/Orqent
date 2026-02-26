import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-error";
import { startOfDay, subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30", 10);

        const now = new Date();
        const startDate = startOfDay(subDays(now, days - 1));

        // Fetch all usages for the user in the given time frame
        const usages = await prisma.tokenUsage.findMany({
            where: {
                userId: user.id,
                createdAt: { gte: startDate },
            },
            include: {
                user: { select: { email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100, // Limit table to recent 100 entries for performance
        });

        // Group by day for the chart
        const dailyAggregates = await prisma.tokenUsage.groupBy({
            by: ["createdAt"],
            where: {
                userId: user.id,
                createdAt: { gte: startDate },
            },
            _sum: {
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
                cost: true,
            },
        });

        // Prisma groupBy doesn't directly truncate to date easily without raw sql,
        // so we aggregate it in memory for the chart.
        const dailyDataMap = new Map();
        for (let i = 0; i < days; i++) {
            const date = startOfDay(subDays(now, i));
            const dateString = format(date, "MMM dd");
            dailyDataMap.set(dateString, { date: dateString, promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 });
        }

        for (const record of dailyAggregates) {
            const dateString = format(record.createdAt, "MMM dd");
            if (dailyDataMap.has(dateString)) {
                const existing = dailyDataMap.get(dateString);
                existing.promptTokens += record._sum.promptTokens || 0;
                existing.completionTokens += record._sum.completionTokens || 0;
                existing.totalTokens += record._sum.totalTokens || 0;
                existing.cost += record._sum.cost || 0;
            }
        }

        // Sort chronologically
        const chartData = Array.from(dailyDataMap.values()).reverse();

        return NextResponse.json({
            usageRecords: usages,
            chartData,
        });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
