import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { startOfDay, subDays, format } from "date-fns";

export async function GET(req: Request) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "30", 10);
        const startDate = startOfDay(subDays(new Date(), days));

        // 1. Basic Stats
        const [
            totalConversations,
            totalMessages,
            totalTokens,
            totalToolsExecuted
        ] = await Promise.all([
            prisma.conversation.count({
                where: { widget: { userId: user.id }, createdAt: { gte: startDate } }
            }),
            prisma.message.count({
                where: { conversation: { widget: { userId: user.id } }, createdAt: { gte: startDate } }
            }),
            prisma.tokenUsage.aggregate({
                where: { userId: user.id, createdAt: { gte: startDate } },
                _sum: { totalTokens: true, promptTokens: true, completionTokens: true }
            }),
            prisma.toolExecutionLog.count({
                where: { integration: { userId: user.id }, createdAt: { gte: startDate } }
            })
        ]);

        // 2. Activity Over Time (Messages per day)
        const messages = await prisma.message.findMany({
            where: {
                conversation: { widget: { userId: user.id } },
                createdAt: { gte: startDate }
            },
            select: { createdAt: true }
        });

        const dailyActivity = Array.from({ length: days }).map((_, i) => {
            const date = format(subDays(new Date(), i), "yyyy-MM-dd");
            return { date, count: 0 };
        }).reverse();

        messages.forEach(m => {
            const date = format(m.createdAt, "yyyy-MM-dd");
            const entry = dailyActivity.find(d => d.date === date);
            if (entry) entry.count++;
        });

        // 3. Tool Usage Stats
        const toolLogs = await prisma.toolExecutionLog.findMany({
            where: { integration: { userId: user.id }, createdAt: { gte: startDate } },
            include: { tool: { select: { path: true, method: true } }, integration: { select: { name: true } } }
        });

        const toolsMap: Record<string, { count: number, success: number, latency: number }> = {};
        toolLogs.forEach(log => {
            const key = `${log.integration.name}: ${log.tool.method} ${log.tool.path}`;
            if (!toolsMap[key]) toolsMap[key] = { count: 0, success: 0, latency: 0 };
            toolsMap[key].count++;
            if (log.status === "SUCCESS") toolsMap[key].success++;
            toolsMap[key].latency += log.latencyMs;
        });

        const toolStats = Object.entries(toolsMap).map(([name, stats]) => ({
            name,
            count: stats.count,
            successRate: (stats.success / stats.count) * 100,
            avgLatency: stats.latency / stats.count
        })).sort((a, b) => b.count - a.count);

        // 4. User Agent & IP Analytics (Demographics)
        const conversations = await prisma.conversation.findMany({
            where: { widget: { userId: user.id }, createdAt: { gte: startDate } },
            select: { metadata: true }
        });

        const browsers: Record<string, number> = {};
        const os: Record<string, number> = {};

        conversations.forEach(conv => {
            const metadata = conv.metadata as { userAgent?: string } | null;
            if (metadata?.userAgent) {
                const ua = metadata.userAgent.toLowerCase();
                if (ua.includes("chrome")) browsers["Chrome"] = (browsers["Chrome"] || 0) + 1;
                else if (ua.includes("firefox")) browsers["Firefox"] = (browsers["Firefox"] || 0) + 1;
                else if (ua.includes("safari")) browsers["Safari"] = (browsers["Safari"] || 0) + 1;
                else if (ua.includes("edge")) browsers["Edge"] = (browsers["Edge"] || 0) + 1;
                else browsers["Other"] = (browsers["Other"] || 0) + 1;

                if (ua.includes("windows")) os["Windows"] = (os["Windows"] || 0) + 1;
                else if (ua.includes("mac os")) os["macOS"] = (os["macOS"] || 0) + 1;
                else if (ua.includes("linux")) os["Linux"] = (os["Linux"] || 0) + 1;
                else if (ua.includes("android")) os["Android"] = (os["Android"] || 0) + 1;
                else if (ua.includes("iphone") || ua.includes("ipad")) os["iOS"] = (os["iOS"] || 0) + 1;
                else os["Other"] = (os["Other"] || 0) + 1;
            }
        });

        return NextResponse.json({
            summary: {
                totalConversations,
                totalMessages,
                totalTokens: totalTokens._sum.totalTokens || 0,
                totalToolsExecuted,
                avgMessagesPerConv: totalConversations > 0 ? totalMessages / totalConversations : 0,
                avgTokensPerConv: totalConversations > 0 ? (totalTokens._sum.totalTokens || 0) / totalConversations : 0,
            },
            dailyActivity,
            toolStats,
            demographics: {
                browsers: Object.entries(browsers).map(([name, value]) => ({ name, value })),
                os: Object.entries(os).map(([name, value]) => ({ name, value }))
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
