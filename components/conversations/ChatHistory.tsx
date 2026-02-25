"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { User, Bot } from "lucide-react";

interface Message {
    id: string;
    role: string;
    content: string;
    createdAt: string | Date;
}

interface ChatHistoryProps {
    messages: Message[];
    agentName: string;
}

export const ChatHistory = ({ messages, agentName }: ChatHistoryProps) => {
    return (
        <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 py-4">
                {messages.map((message) => {
                    const isAssistant = message.role === "assistant";
                    return (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
                        >
                            {/* <Avatar className={`h-8 w-8 border ${isAssistant ? "bg-primary/10" : "bg-slate-100"} text-center`}>
                                {isAssistant ? (
                                    <Bot className="h-4 w-4 text-primary text-center" />
                                ) : (
                                    <User className="h-4 w-4 text-slate-600 text-center" />
                                )}
                            </Avatar> */}
                            <div className={`flex flex-col max-w-[80%] ${isAssistant ? "items-start" : "items-end"} mx-4`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-slate-900">
                                        {isAssistant ? agentName : "User"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {format(new Date(message.createdAt), "HH:mm")}
                                    </span>
                                </div>
                                <div
                                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${isAssistant
                                        ? "bg-white border border-border text-slate-800 rounded-tl-none"
                                        : "bg-foreground text-background rounded-tr-none"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
};
