"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface Widget {
    id: string;
    name: string;
    description: string;
    status: string;
    model: string;
    updatedAt: string;
    allowedDomains: { domain: string }[];
    // We don't have conversations/tokens in the schema yet, keeping placeholders for UI
}

const ChatWidgets = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchWidgets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(search && { search }),
                ...(statusFilter !== "ALL" && { status: statusFilter }),
            });

            const res = await fetch(`/api/widgets?${params}`);
            if (res.ok) {
                const data = await res.json();
                setWidgets(data.data);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total,
                    totalPages: data.pagination.totalPages
                }));
            }
        } catch (error) {
            console.error("Error fetching widgets:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWidgets();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchWidgets]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight">Chat Widgets</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your deployed AI chat widgets.</p>
                </div>
                <Link href="/dashboard/widgets/new" className="text-sm font-medium px-4 py-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors">
                    Create widget
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Search widgets..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="h-9 w-full text-sm bg-background border border-border rounded-md pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="h-9 text-sm bg-background border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DRAFT">Draft</option>
                </select>

                <div className="flex-1" />

                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>More Filters</span>
                </button>
            </div>

            {/* List */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
                <div className="flex items-center px-4 py-2.5 bg-secondary/30 text-xs text-muted-foreground font-medium border-b border-border">
                    <span className="flex-1">Name</span>
                    <span className="w-48">Domain</span>
                    <span className="w-24">Status</span>
                    <span className="w-24 text-right">Model</span>
                    <span className="w-32 text-right">Last Updated</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p className="text-sm">Loading widgets...</p>
                    </div>
                ) : widgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm text-muted-foreground">No widgets found</p>
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="text-xs font-medium text-foreground mt-2 hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    widgets.map((w) => (
                        <div key={w.id} className="stripe-row flex items-center px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/10 transition-colors cursor-pointer group" onClick={() => window.location.href = `/dashboard/widgets/${w.id}`}>
                            <div className="flex-1 min-w-0 pr-4">
                                <span className="block text-sm font-medium group-hover:text-foreground transition-colors">{w.name}</span>
                                <span className="block text-xs text-muted-foreground truncate">{w.description || "No description"}</span>
                            </div>
                            <span className="w-48 text-sm text-muted-foreground truncate font-mono">
                                {w.allowedDomains?.[0]?.domain || "—"}
                            </span>
                            <span className="w-24">
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${w.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : w.status === "PAUSED"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-secondary text-muted-foreground border-border"
                                        }`}
                                >
                                    {w.status}
                                </span>
                            </span>
                            <span className="w-24 text-[11px] text-right font-medium uppercase tracking-wider text-muted-foreground">
                                {w.model.replace("gpt-", "GPT-").replace("claude-", "Claude ")}
                            </span>
                            <span className="w-32 text-xs text-right text-muted-foreground">
                                {new Date(w.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    Showing {widgets.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} widgets
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                        className="p-1.5 border border-border rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1 bg-secondary/50 rounded-md border border-border font-medium">
                        {pagination.page} / {pagination.totalPages || 1}
                    </div>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || loading}
                        className="p-1.5 border border-border rounded-md hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWidgets;
