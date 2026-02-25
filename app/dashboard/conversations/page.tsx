"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationFilters } from "@/components/conversations/ConversationFilters";
import { ConversationList } from "@/components/conversations/ConversationList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Conversations, ConversationSummary } from "@/types/conversations";
import { Widget } from "@/types/widgets";
import { JsonSchema, PropertyConfig, RestRequestBodyConfig } from "@/types/restApi";

interface Filters {
    widgetId?: string;
    startDate?: string;
    endDate?: string;
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filters, setFilters] = useState<Filters>({});

    const fetchWidgets = async () => {
        try {
            const res = await fetch("/api/widgets?limit=100");
            const result = await res.json();
            setWidgets(result.data || []);
        } catch (error: unknown) {
            console.error("Failed to fetch widgets", error);
        }
    };

    const fetchConversations = useCallback(async (page: number, currentFilters: Filters) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                ...Object.fromEntries(
                    Object.entries(currentFilters).filter(([_, v]) => v !== undefined) as [string, string][]
                ),
            });

            const res = await fetch(`/api/conversations?${queryParams.toString()}`);
            const result = await res.json();
            setConversations(result.data || []);
            setPagination(result.pagination);
        } catch (error: unknown) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWidgets();
    }, []);

    useEffect(() => {
        fetchConversations(pagination.page, filters);
    }, [pagination.page, filters, fetchConversations]);

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">Conversations</h1>
                <p className="text-sm text-muted-foreground">
                    Monitor and review all chat interactions across your widgets.
                </p>
            </div>

            <ConversationFilters widgets={widgets} onFilterChange={handleFilterChange} />

            <ConversationList conversations={conversations} isLoading={isLoading} />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4 border-t border-border mt-4">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages || isLoading}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
