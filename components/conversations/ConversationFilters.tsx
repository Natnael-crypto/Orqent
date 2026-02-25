"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ConversationFiltersProps {
    widgets: { id: string; name: string }[];
    onFilterChange: (filters: { widgetId?: string; startDate?: string; endDate?: string }) => void;
}

export const ConversationFilters = ({ widgets, onFilterChange }: ConversationFiltersProps) => {
    const [selectedWidget, setSelectedWidget] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const handleApply = () => {
        onFilterChange({
            widgetId: selectedWidget === "all" ? undefined : selectedWidget,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
    };

    const handleClear = () => {
        setSelectedWidget("all");
        setStartDate("");
        setEndDate("");
        onFilterChange({});
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-border shadow-sm mb-6 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5 min-w-[200px]">
                <Label htmlFor="widget-filter">Filter by Widget</Label>
                <Select value={selectedWidget} onValueChange={setSelectedWidget}>
                    <SelectTrigger id="widget-filter">
                        <SelectValue placeholder="All Widgets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Widgets</SelectItem>
                        {widgets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                                {w.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Button onClick={handleApply} variant="default" size="sm" className="h-10">
                    <Search className="w-4 h-4 mr-2" />
                    Apply Filters
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm" className="h-10">
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>
        </div>
    );
};
