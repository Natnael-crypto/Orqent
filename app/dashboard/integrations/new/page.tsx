"use client";

import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Globe,
    ArrowRight,
    CheckCircle2,
    Lock,
    Zap,
    LayoutGrid,
    Calendar,
    Table as TableIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

const INTEGRATION_TEMPLATES = [
    {
        id: "REST_API",
        name: "REST API",
        path: "/dashboard/integrations/new/rest",
        description: "Connect to any standard JSON API endpoint with custom request/response schemas.",
        logo: "https://cdn.worldvectorlogo.com/logos/api-1.svg",
        features: ["Custom Headers & Cookies", "Request/Response Mapping", "Automatic LLM Tooling"],
        isAvailable: true,
        color: "blue"
    },
    {
        id: "GOOGLE_SHEETS",
        name: "Google Sheets",
        path: "/dashboard/integrations/new/google-sheets",
        description: "Read, write, and sync data directly with your Google Sheets spreadsheets.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg",
        features: ["Real-time Sync", "Sheet Mutations", "Structured Data Access"],
        isAvailable: true,
        color: "emerald"
    },
    {
        id: "GOOGLE_CALENDAR",
        name: "Google Calendar",
        path: "/dashboard/integrations/new/google-calendar",
        description: "Automate scheduling, manage events, and check availability across calendars.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        features: ["Availability Checking", "Event Management", "Smart Scheduling"],
        isAvailable: true,
        color: "blue"
    },
    {
        id: "CALENDLY",
        name: "Calendly",
        path: "/dashboard/integrations/new/calendly",
        description: "Seamlessly integrate your booking links and automate meeting workflows.",
        logo: "https://cdn.worldvectorlogo.com/logos/calendly.svg",
        features: ["Booking Automation", "Meeting Sync", "Custom Questions"],
        isAvailable: false,
        color: "blue"
    },
    {
        id: "HUBSPOT",
        name: "HubSpot",
        path: "/dashboard/integrations/new/hubspot",
        description: "Manage CRM contacts, deals, and pipelines directly from your AI agent.",
        logo: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",
        features: ["Contact Sync", "Pipeline Management", "CRM Workflows"],
        isAvailable: false,
        color: "orange"
    }
];

const SelectionPage = () => {
    const router = useRouter();

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" asChild className="-ml-3 h-8 text-muted-foreground hover:text-foreground transition-colors">
                        <Link href="/dashboard/integrations">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Integrations
                        </Link>
                    </Button>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Add New Integration</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Choose a tool to connect to your AI agent. Each integration comes with pre-built capabilities and secure authentication.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INTEGRATION_TEMPLATES.map((tpl) => (
                    <Card
                        key={tpl.id}
                        className={`group relative flex flex-col h-full border-border/50 bg-background hover:border-foreground/20 hover:shadow-2xl hover:shadow-foreground/5 transition-all duration-300 ${!tpl.isAvailable && 'opacity-75 grayscale-[0.5]'}`}
                    >
                        <CardHeader className="space-y-4 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden p-2.5">
                                    <img
                                        src={tpl.logo}
                                        alt={tpl.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                {!tpl.isAvailable && (
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50 border-border/50 px-2 py-0.5">
                                        Coming Soon
                                    </Badge>
                                )}
                                {tpl.isAvailable && (
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-500 border-none px-2 py-0.5">
                                        Ready to Use
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-semibold tracking-tight">{tpl.name}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed line-clamp-2">
                                    {tpl.description}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <ul className="space-y-2.5">
                                {tpl.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-foreground/40" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4">
                                {tpl.isAvailable ? (
                                    <Button
                                        asChild
                                        className="w-full justify-between h-10 px-4 group/btn bg-foreground text-background hover:bg-foreground/90 transition-all rounded-lg"
                                    >
                                        <Link href={tpl.path}>
                                            <span>Get Started</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        variant="outline"
                                        className="w-full justify-between h-10 px-4 border-dashed border-border text-muted-foreground cursor-not-allowed rounded-lg"
                                    >
                                        <span>Notify Me</span>
                                        <Lock className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-8 rounded-2xl bg-muted/30 border border-border/50 border-dashed flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-background border border-border shadow-sm">
                    <Zap className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold">Custom Requirement?</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Our REST API option can connect to virtually any internal or external service.
                        Need help with a specific enterprise integration?
                    </p>
                </div>
                <Button variant="link" className="text-sm font-medium">
                    Request a Partner Integration
                </Button>
            </div>
        </div>
    );
};

export default SelectionPage;
