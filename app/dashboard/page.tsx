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

const tokenData = [
    { date: "Jan", tokens: 12400 },
    { date: "Feb", tokens: 18200 },
    { date: "Mar", tokens: 24800 },
    { date: "Apr", tokens: 21600 },
    { date: "May", tokens: 32100 },
    { date: "Jun", tokens: 38400 },
    { date: "Jul", tokens: 42300 },
];

const convData = [
    { week: "W1", conversations: 320 },
    { week: "W2", conversations: 410 },
    { week: "W3", conversations: 380 },
    { week: "W4", conversations: 520 },
    { week: "W5", conversations: 490 },
    { week: "W6", conversations: 610 },
    { week: "W7", conversations: 580 },
];

const costData = [
    { month: "Jan", cost: 120 },
    { month: "Feb", cost: 180 },
    { month: "Mar", cost: 240 },
    { month: "Apr", cost: 210 },
    { month: "May", cost: 310 },
    { month: "Jun", cost: 380 },
    { month: "Jul", cost: 420 },
];

const toolData = [
    { tool: "REST API", value: 45, fill: "hsl(210, 60%, 55%)" },
    { tool: "Google Sheets", value: 25, fill: "hsl(210, 40%, 70%)" },
    { tool: "MCP Server", value: 20, fill: "hsl(210, 20%, 80%)" },
    { tool: "Webhooks", value: 10, fill: "hsl(0, 0%, 75%)" },
];

const stats = [
    { label: "Total Conversations", value: "3,412", change: "+12.3%" },
    { label: "Total Tokens Used", value: "189.7K", change: "+8.1%" },
    { label: "Total Cost", value: "$1,860", change: "+15.4%" },
    { label: "Active Widgets", value: "7", change: "+2" },
];

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

const Overview = () => (
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

export default Overview;
