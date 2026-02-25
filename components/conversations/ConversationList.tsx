"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, ChevronRight } from "lucide-react";

interface Conversation {
    id: string;
    widgetId: string;
    visitorId: string | null;
    lastMessage: string | null;
    createdAt: string;
    updatedAt: string;
    widget: {
        name: string;
    };
}

interface ConversationListProps {
    conversations: Conversation[];
    isLoading: boolean;
}

export const ConversationList = ({ conversations, isLoading }: ConversationListProps) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="p-8 text-center text-muted-foreground">
                    Loading conversations...
                </div>
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No conversations found</p>
                    <p className="text-sm">Try adjusting your filters or wait for new messages.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50">
                        <TableHead>Widget</TableHead>
                        <TableHead>Visitor ID</TableHead>
                        <TableHead>Last Message</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {conversations.map((conv) => (
                        <TableRow key={conv.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                            <TableCell>
                                <Link href={`/dashboard/conversations/${conv.id}`} className="block">
                                    <Badge variant="outline" className="font-normal">
                                        {conv.widget.name}
                                    </Badge>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link href={`/dashboard/conversations/${conv.id}`} className="block font-mono text-xs text-muted-foreground">
                                    {conv.visitorId || "Anonymous"}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link href={`/dashboard/conversations/${conv.id}`} className="block max-w-[300px] truncate text-sm">
                                    {conv.lastMessage || "No messages yet"}
                                </Link>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                <Link href={`/dashboard/conversations/${conv.id}`} className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(conv.createdAt).toLocaleDateString()}
                                </Link>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                <Link href={`/dashboard/conversations/${conv.id}`} className="block">
                                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link href={`/dashboard/conversations/${conv.id}`}>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
