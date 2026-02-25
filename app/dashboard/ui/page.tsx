"use client";

import { useState, useEffect } from "react";
import { Plus, Palette, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const UICustomizationList = () => {
    const [customizations, setCustomizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCustomizations = async () => {
        try {
            const res = await fetch("/api/ui-customizations");
            if (res.ok) {
                const data = await res.json();
                setCustomizations(data);
            }
        } catch (error) {
            console.error("Error fetching customizations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomizations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customization?")) return;

        try {
            const res = await fetch(`/api/ui-customizations/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Success", description: "UI Customization deleted successfully" });
                fetchCustomizations();
            } else {
                toast({ title: "Error", description: "Failed to delete customization", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight">UI Customizations</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage reusable styles for your chat widgets.</p>
                </div>
                <Link
                    href="/dashboard/ui/new"
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Customization
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl border border-border bg-card animate-pulse" />
                    ))}
                </div>
            ) : customizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Palette className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No customizations yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">Create your first UI customization to style your widgets.</p>
                    <Link
                        href="/dashboard/ui/new"
                        className="mt-6 text-sm font-medium text-foreground hover:underline"
                    >
                        Create your first one →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customizations.map((c) => (
                        <div key={c.id} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-lg bg-secondary">
                                        <Palette className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push(`/dashboard/ui/${c.id}`)}
                                            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium truncate">{c.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created on {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-background" style={{ backgroundColor: c.primaryColor }} />
                                        <div className="w-6 h-6 rounded-full border-2 border-background" style={{ backgroundColor: c.backgroundColor }} />
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{c.position} position</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UICustomizationList;
