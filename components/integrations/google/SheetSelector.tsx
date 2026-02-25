"use client";

import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, List } from "lucide-react";

interface SheetSelectorProps {
    spreadsheetId: string;
    onSelect: (name: string) => void;
    currentValue?: string;
}

export function SheetSelector({ spreadsheetId, onSelect, currentValue }: SheetSelectorProps) {
    const [sheets, setSheets] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!spreadsheetId) {
            setLoading(false);
            return;
        }

        const fetchSheets = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/integrations/google/spreadsheets/${spreadsheetId}/sheets`);
                if (!res.ok) throw new Error("Failed to fetch sheets");
                const data = await res.json();
                setSheets(data.sheets || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSheets();
    }, [spreadsheetId]);

    if (!spreadsheetId) {
        return (
            <div className="h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                Select a spreadsheet first
            </div>
        );
    }

    if (loading) {
        return <Skeleton className="h-10 w-full" />;
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        );
    }

    return (
        <Select onValueChange={onSelect} defaultValue={currentValue}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Sheet" />
            </SelectTrigger>
            <SelectContent>
                {sheets.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                        No sheets found
                    </div>
                ) : (
                    sheets.map((name) => (
                        <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-emerald-500" />
                                {name}
                            </div>
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}
