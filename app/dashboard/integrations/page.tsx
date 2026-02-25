"use client";

import { useIntegrations, useIntegrationActions } from "@/hooks/useIntegrations";
import {
    Loader2,
    Plus,
    Trash2,
    AlertCircle,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

const Integrations = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [integrationToDelete, setIntegrationToDelete] = useState<string | null>(null);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const { data: response, isLoading, isError, refetch } = useIntegrations({
        search: searchQuery || undefined
    });
    const { deleteIntegration, bulkDeleteIntegrations } = useIntegrationActions();

    const integrations = useMemo(() => response?.data || [], [response]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(integrations.map(ig => ig.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleDelete = async () => {
        if (integrationToDelete) {
            await deleteIntegration.mutateAsync(integrationToDelete);
            setIntegrationToDelete(null);
            setIsDeleteDialogOpen(false);
            setSelectedIds(prev => prev.filter(id => id !== integrationToDelete));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length > 0) {
            await bulkDeleteIntegrations.mutateAsync(selectedIds);
            setSelectedIds([]);
            setIsBulkDeleteDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading integrations...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="p-3 bg-red-50 rounded-full text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">Failed to load integrations</h3>
                    <p className="text-sm text-muted-foreground mt-1">There was an error fetching your integrations. Please try again.</p>
                </div>
                <Button onClick={() => refetch()} variant="outline">Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
                    <p className="text-sm text-muted-foreground">Manage your connections to external services.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/integrations/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add integration
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search integrations..."
                        className="pl-9 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-9"
                            onClick={() => setIsBulkDeleteDialogOpen(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete ({selectedIds.length})
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-9">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            {integrations.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-4 bg-muted/20">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium">No integrations yet</h3>
                        <p className="text-xs text-muted-foreground mt-1">Get started by creating your first integration.</p>
                    </div>
                    <Button asChild variant="link">
                        <Link href="/dashboard/integrations/new">
                            Create integration
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/30">
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedIds.length === integrations.length && integrations.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Name</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last Updated</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {integrations.map((ig) => (
                                <TableRow
                                    key={ig.id}
                                    className="group cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => router.push(`/dashboard/integrations/${ig.id}`)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(ig.id)}
                                            onCheckedChange={(checked) => handleSelectRow(ig.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-foreground">{ig.name}</span>
                                            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                                                {ig.config?.baseUrl || "No URL"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize font-normal text-xs bg-muted/50">
                                            {ig.type.toLowerCase().replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            {ig.status === "ACTIVE" ? (
                                                <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium px-2 py-0 text-[10px] items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-medium px-2 py-0 text-[10px] items-center gap-1">
                                                    <XCircle className="w-3 h-3" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(ig.updatedAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/dashboard/integrations/${ig.id}`)}>
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => {
                                                    setIntegrationToDelete(ig.id);
                                                    setIsDeleteDialogOpen(true);
                                                }}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the integration and its configuration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIntegrationToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} integrations?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete these integrations? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Integrations;
