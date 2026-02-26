"use client";

import { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MessageSquare, Cpu, Activity, User, Globe,
    TrendingUp, Zap, Clock, CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface AnalyticsData {
    summary: {
        totalConversations: number;
        totalMessages: number;
        totalTokens: number;
        totalToolsExecuted: number;
        avgMessagesPerConv: number;
        avgTokensPerConv: number;
    };
    dailyActivity: { date: string, count: number }[];
    toolStats: {
        name: string;
        count: number;
        successRate: number;
        avgLatency: number;
    }[];
    demographics: {
        browsers: { name: string, value: number }[];
        os: { name: string, value: number }[];
    };
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/dashboard/analytics?days=30");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Activity className="h-8 w-8 animate-pulse text-primary" />
                    <p className="text-sm text-muted-foreground">Generating analytics...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const activityConfig = {
        count: { label: "Messages", color: "hsl(var(--primary))" }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-2">Comprehensive overview of your AI agent's performance and usage.</p>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalMessages.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.summary.totalConversations} conversations
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ~{(data.summary.avgTokensPerConv).toFixed(0)} tokens/conv
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tool Execution</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalToolsExecuted.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Most active: {data.toolStats[0]?.name.split(': ')[0] || "None"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Intensity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(data.summary.avgMessagesPerConv).toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Messages per conversation
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Activity Chart */}
                <Card className="shadow-sm border-border/50 col-span-2 md:col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Conversation Activity</CardTitle>
                        <CardDescription>Daily message volume over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={activityConfig} className="h-[350px] w-full">
                            <AreaChart data={data.dailyActivity}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--color-count)"
                                    fillOpacity={1}
                                    fill="url(#colorCount)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Tool Usage Table */}
                <Card className="shadow-sm border-border/50 col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Tool Efficiency</CardTitle>
                        <CardDescription>Performance breakdown of executed tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tool</TableHead>
                                    <TableHead className="text-right">Calls</TableHead>
                                    <TableHead className="text-right">SR%</TableHead>
                                    <TableHead className="text-right">Latency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.toolStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No tool executions logged.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.toolStats.map((tool) => (
                                        <TableRow key={tool.name}>
                                            <TableCell className="font-medium max-w-[200px] truncate" title={tool.name}>
                                                {tool.name.split(': ')[1] || tool.name}
                                            </TableCell>
                                            <TableCell className="text-right">{tool.count}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={tool.successRate > 90 ? "text-emerald-600" : "text-amber-600"}>
                                                    {tool.successRate.toFixed(0)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {tool.avgLatency.toFixed(0)}ms
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Demographic Breakdown */}
                <Card className="shadow-sm border-border/50 col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Visitor Demographics</CardTitle>
                        <CardDescription>Top browsers and operating systems</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-8">
                        <div className="h-[180px] w-full relative">
                            <ChartContainer config={{}} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.demographics.browsers}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.demographics.browsers.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <Globe className="h-5 w-5 text-muted-foreground mb-1" />
                                <span className="text-xs font-medium uppercase text-muted-foreground">Browsers</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {data.demographics.os.slice(0, 4).map((item, idx) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-medium">{((item.value / data.summary.totalConversations) * 100).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
