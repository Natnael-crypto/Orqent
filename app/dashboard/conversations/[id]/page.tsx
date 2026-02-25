"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatHistory } from "@/components/conversations/ChatHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Calendar, User, MessageCircle, Info } from "lucide-react";
import { format } from "date-fns";

export default function ConversationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [conversation, setConversation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConversation = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/conversations/${params.id}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const result = await res.json();
                setConversation(result);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchConversation();
        }
    }, [params.id]);

    if (isLoading) {
        return <div className="p-8 text-center">Loading conversation...</div>;
    }

    if (!conversation) {
        return (
            <div className="p-8 text-center">
                <p>Conversation not found.</p>
                <Button variant="link" onClick={() => router.push("/dashboard/conversations")}>
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/conversations")}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-outfit">
                        Conversation Detail
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{conversation.widget.name}</Badge>
                        <span className="text-xs text-muted-foreground">ID: {conversation.id}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat History */}
                <Card className="lg:col-span-2 shadow-sm border-border">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                Chat History
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {conversation.messages.length} messages
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ChatHistory
                            messages={conversation.messages}
                            agentName={conversation.widget.name}
                        />
                    </CardContent>
                </Card>

                {/* Info / Metadata */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-border">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Conversation Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Started At</Label>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {format(new Date(conversation.createdAt), "PPP p")}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Visitor ID</Label>
                                <div className="flex items-center gap-2 text-sm font-mono">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    {conversation.visitorId || "Anonymous"}
                                </div>
                            </div>
                            {conversation.externalId && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">External ID</Label>
                                    <div className="text-sm font-mono">
                                        {conversation.externalId}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {conversation.metadata && (
                        <Card className="shadow-sm border-border">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">Metadata</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-[10px] bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto">
                                    {JSON.stringify(conversation.metadata, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
);
