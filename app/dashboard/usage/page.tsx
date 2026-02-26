"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
    ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
} from "@/components/ui/chart";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageRecord {
    id: string;
    createdAt: string | Date;
    model?: string;
    role: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number | string;
}

export default function UsagePage() {
    const [data, setData] = useState<{ chartData: any[], usageRecords: UsageRecord[] }>({ chartData: [], usageRecords: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await fetch("/api/dashboard/usage?days=30");
                if (res.ok) {
                    const json = await res.json();
                    setData({
                        chartData: json.chartData || [],
                        usageRecords: json.usageRecords || [],
                    });
                }
            } catch (err) {
                console.error("Failed to fetch usage:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, []);

    const chartConfig = {
        promptTokens: {
            label: "Prompt Tokens",
            color: "hsl(210, 60%, 55%)",
        },
        completionTokens: {
            label: "Completion Tokens",
            color: "hsl(210, 40%, 70%)",
        },
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading usage data...</div>;
    }

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-2xl font-medium tracking-tight">Token Usage</h1>
                <p className="text-sm text-muted-foreground mt-1">Monitor your AI integration token usage and costs.</p>
            </div>

            <Card className="shadow-none border border-border/40">
                <CardHeader>
                    <CardTitle>Usage Over Last 30 Days</CardTitle>
                    <CardDescription>Daily breakdown of prompt and completion tokens.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={data.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="promptTokens" stackId="a" fill="var(--color-promptTokens)" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="completionTokens" stackId="a" fill="var(--color-completionTokens)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="shadow-none border border-border/40">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Detailed log of recent token consumption events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border/40">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Operation</TableHead>
                                    <TableHead className="text-right">Prompt</TableHead>
                                    <TableHead className="text-right">Completion</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.usageRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No usage records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.usageRecords.map((record: UsageRecord) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(record.createdAt), "MMM d, h:mm a")}
                                            </TableCell>
                                            <TableCell>{record.model || "Unknown"}</TableCell>
                                            <TableCell className="capitalize">{record.role}</TableCell>
                                            <TableCell className="text-right">{record.promptTokens}</TableCell>
                                            <TableCell className="text-right">{record.completionTokens}</TableCell>
                                            <TableCell className="text-right font-medium">{record.totalTokens}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                ${parseFloat(String(record.cost)).toFixed(4)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
