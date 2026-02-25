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
import { AlertCircle, FileSpreadsheet } from "lucide-react";

interface Spreadsheet {
    id: string;
    name: string;
}

interface SpreadsheetSelectorProps {
    onSelect: (id: string, name: string) => void;
    currentValue?: string;
}

export function SpreadsheetSelector({ onSelect, currentValue }: SpreadsheetSelectorProps) {
    const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSpreadsheets = async () => {
            try {
                const res = await fetch("/api/integrations/google/spreadsheets");
                if (!res.ok) throw new Error("Failed to fetch spreadsheets");
                const data = await res.json();
                setSpreadsheets(data.files || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpreadsheets();
    }, []);

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
        <Select
            onValueChange={(id) => {
                const sheet = spreadsheets.find(s => s.id === id);
                if (sheet) onSelect(id, sheet.name);
            }}
            defaultValue={currentValue}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Spreadsheet" />
            </SelectTrigger>
            <SelectContent>
                {spreadsheets.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                        No spreadsheets found
                    </div>
                ) : (
                    spreadsheets.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                {s.name}
                            </div>
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}
