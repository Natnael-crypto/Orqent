"use client";

import { ChevronLeft, Calendar, Zap, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CalendlyPlaceholder = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/integrations/new">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center p-2">
                        <img
                            src="https://cdn.worldvectorlogo.com/logos/calendly.svg"
                            alt="Calendly"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calendly</h1>
                        <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight leading-tight">
                            Automate your booking flow with AI
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Integrate your Calendly scheduling links and let your AI agent handle booking requests, qualification, and confirmations.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {[
                            "Automated booking link generation",
                            "Smart lead qualification before booking",
                            "Real-time sync with your Calendly events",
                            "Custom questions and redirection logic"
                        ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button disabled className="h-12 px-8 bg-muted text-muted-foreground cursor-not-allowed">
                            <Lock className="w-4 h-4 mr-2" />
                            Notify Me When Ready
                        </Button>
                    </div>
                </div>

                <div className="relative aspect-square rounded-3xl bg-secondary/30 border border-border border-dashed flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-blue-400/5 to-transparent" />
                    <Calendar className="w-32 h-32 text-blue-400/20" />
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full h-full border border-border/50 rounded-2xl bg-background/50 backdrop-blur-sm shadow-2xl flex flex-col p-8 space-y-6 items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-500">C</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-muted rounded-full mx-auto" />
                                <div className="h-2 w-48 bg-muted/60 rounded-full mx-auto" />
                            </div>
                            <div className="grow w-full space-y-2 pt-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-10 border border-border/50 rounded-lg flex items-center px-4">
                                        <div className="h-2 w-1/2 bg-muted/40 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-border/50 text-center space-y-4">
                <Zap className="w-8 h-8 text-yellow-500 mx-auto" />
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Looking for more?</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Calendly&apos;s V2 API is available for REST integration. You can already connect it using
                        our power-user <strong>REST API</strong> builder.
                    </p>
                </div>
                <Button variant="outline" asChild className="h-9">
                    <Link href="/dashboard/integrations/new/rest">
                        Setup via REST API
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default CalendlyPlaceholder;
