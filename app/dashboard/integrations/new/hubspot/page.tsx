"use client";

import { ChevronLeft, LayoutGrid, Zap, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HubSpotPlaceholder = () => {
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
                            src="https://cdn.worldvectorlogo.com/logos/hubspot.svg"
                            alt="HubSpot"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">HubSpot CRM</h1>
                        <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight leading-tight">
                            Your CRM, powered by AI
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Empower your AI agents with complete access to your HubSpot portal. Manage contacts, deals, and pipelines seamlessly.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {[
                            "Search and update contacts in real-time",
                            "Manage deal pipelines and stage movements",
                            "Track communication history automatically",
                            "Workflow-driven task assignment"
                        ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button disabled className="h-12 px-8 bg-muted text-muted-foreground cursor-not-allowed">
                            <Lock className="w-4 h-4 mr-2" />
                            Join the Waitlist
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center">
                            Exclusive early access for professional plan users coming soon.
                        </p>
                    </div>
                </div>

                <div className="relative aspect-square rounded-3xl bg-secondary/30 border border-border border-dashed flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-orange-500/5 to-transparent" />
                    <LayoutGrid className="w-32 h-32 text-orange-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-full h-full border border-border/50 rounded-2xl bg-background/50 backdrop-blur-sm shadow-2xl flex flex-col p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                                <div className="grow space-y-2">
                                    <div className="h-3 w-1/3 bg-muted rounded" />
                                    <div className="h-2 w-1/2 bg-muted/60 rounded" />
                                </div>
                            </div>
                            <div className="grow space-y-4">
                                <div className="h-8 bg-orange-500/10 rounded-lg border border-orange-500/20 flex items-center px-4">
                                    <div className="h-2 w-24 bg-orange-500/20 rounded" />
                                </div>
                                <div className="h-20 bg-muted/30 rounded-lg border border-border/50" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-muted rounded-full" />
                                    <div className="h-6 w-16 bg-muted rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-border/50">
                <div className="flex flex-col items-center text-center space-y-4">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Urgent Integration?</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            HubSpot offers a robust REST API. You can connect it manually right now using our
                            standard integration flow.
                        </p>
                    </div>
                    <Button variant="outline" asChild className="h-9">
                        <Link href="/dashboard/integrations/new/rest">
                            Configure Manually (REST API)
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HubSpotPlaceholder;
