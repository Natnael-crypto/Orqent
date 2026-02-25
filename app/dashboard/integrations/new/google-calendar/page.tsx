"use client";

import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    CheckCircle2,
    Lock,
    ArrowRight,
    Calendar as CalendarIcon,
    ShieldCheck,
    Zap,
    Users,
    Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

export default function GoogleCalendarSetup() {
    const router = useRouter();

    const handleConnect = () => {
        // Redirect to our OAuth initiation route
        window.location.href = '/api/integrations/google/auth';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/integrations/new">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Selection
                    </Link>
                </Button>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center p-3 shadow-sm border border-blue-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                            alt="Google Calendar"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Google Calendar Integration</h1>
                        <p className="text-muted-foreground mt-1">
                            Automate scheduling, manage events, and check availability across calendars with your AI agent.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">What can your agent do?</CardTitle>
                        <CardDescription>
                            Once connected, your AI agent will have the following capabilities:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    title: "Check Availability",
                                    desc: "Quickly find free slots and avoid scheduling conflicts.",
                                    icon: <Clock className="w-4 h-4 text-blue-500" />
                                },
                                {
                                    title: "Create Events",
                                    desc: "Set up meetings, reminders, and events automatically.",
                                    icon: <Zap className="w-4 h-4 text-blue-500" />
                                },
                                {
                                    title: "List Schedule",
                                    desc: "Get an overview of your upcoming appointments and meetings.",
                                    icon: <CalendarIcon className="w-4 h-4 text-blue-500" />
                                },
                                {
                                    title: "Secure Access",
                                    desc: "Your calendar data is accessed only when needed by the AI.",
                                    icon: <ShieldCheck className="w-4 h-4 text-blue-500" />
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl border bg-muted/30 space-y-2">
                                    <div className="flex items-center gap-2 font-medium text-sm">
                                        {item.icon}
                                        {item.title}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                            <Lock className="w-5 h-5 text-blue-500 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-blue-900">Secure OAuth 2.0</h4>
                                <p className="text-xs text-blue-800/70 leading-relaxed">
                                    Industry-standard OAuth 2.0 ensures your credentials are never shared.
                                    Grant specific permissions for calendar management securely.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-blue-100 shadow-lg shadow-blue-500/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base uppercase tracking-wider text-muted-foreground/60 font-bold">
                                Setup
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    <span>Google Cloud Project Ready</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    <span>Calendar API Scopes Enabled</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleConnect}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                            >
                                Connect Google Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground">
                                By connecting, you agree to allow our AI to manage your calendar events as requested.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
                        <h4 className="text-xs font-semibold mb-1">Need help?</h4>
                        <p className="text-[10px] text-muted-foreground">
                            Learn more about how the AI agent schedules meetings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
