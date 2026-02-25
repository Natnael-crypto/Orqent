"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface SimulatedChatProps {
    customization?: {
        primaryColor: string;
        backgroundColor: string;
        borderRadius: number;
        fontSize: number;
        agentName: string;
        welcomeMessage: string;
        agentAvatarUrl?: string | null;
    };
}

export function SimulatedChat({ customization }: SimulatedChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const primaryColor = customization?.primaryColor || "#000000";
    const backgroundColor = customization?.backgroundColor || "#ffffff";
    const borderRadius = customization?.borderRadius || 8;
    const fontSize = customization?.fontSize || 14;
    const agentName = customization?.agentName || "AI Assistant";
    const welcomeMessage = customization?.welcomeMessage || "Hello! How can I help you?";

    useEffect(() => {
        setMessages([{ role: "assistant", content: welcomeMessage }]);
    }, [welcomeMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsTyping(true);

        // Simulate agent response
        setTimeout(() => {
            setIsTyping(false);
            const responses = [
                "That's a great question! Let me check that for you.",
                "I'm here to help. What else can I do?",
                "Sure, I can assist with that.",
                "I'm a simulated agent, but I'm learning fast!",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
        }, 1500);
    };

    return (
        <div
            className="flex flex-col h-[500px] border shadow-xl overflow-hidden"
            style={{
                borderRadius: `${borderRadius}px`,
                backgroundColor: backgroundColor,
                fontSize: `${fontSize}px`
            }}
        >
            {/* Header */}
            <div
                className="p-4 text-white flex items-center gap-3 shrink-0"
                style={{ backgroundColor: primaryColor }}
            >
                <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={customization?.agentAvatarUrl || undefined} />
                    <AvatarFallback className="bg-white/10 text-white text-[10px]">
                        {agentName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-medium text-sm leading-tight text-white">{agentName}</h3>
                    <p className="text-[10px] text-white/70">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 p-4 overflow-y-auto"
                ref={scrollRef}
            >
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] p-3 rounded-2xl text-sm",
                                    msg.role === "user"
                                        ? "bg-stone-100 text-stone-900 rounded-tr-none"
                                        : "text-white rounded-tl-none"
                                )}
                                style={msg.role === "assistant" ? { backgroundColor: primaryColor } : {}}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div
                                className="p-3 rounded-2xl rounded-tl-none flex items-center gap-1"
                                style={{ backgroundColor: primaryColor, opacity: 0.7 }}
                            >
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t shrink-0 flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 h-9 rounded-full px-4 border-stone-200 focus-visible:ring-stone-400"
                />
                <Button
                    size="icon"
                    onClick={handleSend}
                    className="h-9 w-9 rounded-full shrink-0"
                    style={{ backgroundColor: primaryColor }}
                >
                    <Send className="w-4 h-4 text-white" />
                </Button>
            </div>

            {/* Powered by */}
            <div className="px-4 py-2 border-t text-[10px] text-center text-muted-foreground bg-stone-50">
                Powered by Orqent
            </div>
        </div>
    );
}
