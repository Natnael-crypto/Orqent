"use client";

import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";

import { useEffect, useState } from "react";

const tokenChartConfig = {
    tokens: {
        label: "Tokens",
        color: "hsl(210, 60%, 55%)",
    },
} satisfies ChartConfig;

const convChartConfig = {
    conversations: {
        label: "Conversations",
        color: "hsl(210, 60%, 55%)",
    },
} satisfies ChartConfig;

const costChartConfig = {
    cost: {
        label: "Cost",
        color: "hsl(210, 40%, 70%)",
    },
} satisfies ChartConfig;

const toolChartConfig = {
    value: {
        label: "Usage",
    },
    "REST API": {
        label: "REST API",
        color: "hsl(210, 60%, 55%)",
    },
    "Google Sheets": {
        label: "Google Sheets",
        color: "hsl(210, 40%, 70%)",
    },
    "MCP Server": {
        label: "MCP Server",
        color: "hsl(210, 20%, 80%)",
    },
    Webhooks: {
        label: "Webhooks",
        color: "hsl(0, 0%, 75%)",
    },
} satisfies ChartConfig;

interface TokenData {
    date: string;
    tokens: number;
}

interface ConvData {
    week: string;
    conversations: number;
}

interface CostData {
    month: string;
    cost: number;
}

interface ToolData {
    tool: string;
    value: number;
    fill: string;
}

interface DashboardData {
    stats: { label: string; value: string | number; change: string }[];
    tokenData: TokenData[];
    convData: ConvData[];
    costData: CostData[];
    toolData: ToolData[];
}

const Overview = () => {
    const [data, setData] = useState<DashboardData>({
        stats: [],
        tokenData: [],
        convData: [],
        costData: [],
        toolData: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dashboard/overview");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch overview data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading overview...</div>;
    }

    const { stats, tokenData, convData, costData, toolData } = data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-medium tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Your AI chat platform at a glance.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-light tracking-tight mt-1">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.change} vs last month</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4">
                <div className="stat-card">
                    <p className="text-sm font-medium mb-4">Token Usage Trend</p>
                    <ChartContainer config={tokenChartConfig} className="h-[240px] w-full">
                        <LineChart data={tokenData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="tokens"
                                stroke="var(--color-tokens)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </div>

                <div className="stat-card">
                    <p className="text-sm font-medium mb-4">Weekly Conversations</p>
                    <ChartContainer config={convChartConfig} className="h-[240px] w-full">
                        <BarChart data={convData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="conversations"
                                fill="var(--color-conversations)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="stat-card">
                    <p className="text-sm font-medium mb-4">Cost Growth</p>
                    <ChartContainer config={costChartConfig} className="h-[240px] w-full">
                        <AreaChart data={costData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                stroke="var(--color-cost)"
                                fill="var(--color-cost)"
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>

                <div className="stat-card">
                    <p className="text-sm font-medium mb-4">Tool Usage</p>
                    <ChartContainer config={toolChartConfig} className="h-[240px] w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={toolData}
                                dataKey="value"
                                nameKey="tool"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default Overview;
