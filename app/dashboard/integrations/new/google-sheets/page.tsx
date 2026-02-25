"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    CheckCircle2,
    Lock,
    ArrowRight,
    Table as TableIcon,
    ShieldCheck,
    Zap,
    Users,
    Loader2,
    Save
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { SpreadsheetSelector } from "@/components/integrations/google/SpreadsheetSelector";
import { SheetSelector } from "@/components/integrations/google/SheetSelector";
import { toast } from "sonner";

export default function GoogleSheetsSetup() {
    const router = useRouter();
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [integrationId, setIntegrationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Configuration state
    const [spreadsheetId, setSpreadsheetId] = useState("");
    const [spreadsheetName, setSpreadsheetName] = useState("");
    const [sheetName, setSheetName] = useState("");

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch("/api/integrations?type=GOOGLE_SERVICES");
                if (!res.ok) throw new Error("Failed to check connection");
                const data = await res.json();

                if (data.data && data.data.length > 0) {
                    const integration = data.data[0];
                    setIsConnected(true);
                    setIntegrationId(integration.id);
                    // Load existing config if available
                    if (integration.config) {
                        setSpreadsheetId(integration.config.spreadsheetId || "");
                        setSpreadsheetName(integration.config.spreadsheetName || "");
                        setSheetName(integration.config.sheetName || "");
                    }
                } else {
                    setIsConnected(false);
                }
            } catch (err) {
                console.error(err);
                setIsConnected(false);
            } finally {
                setLoading(false);
            }
        };

        checkConnection();
    }, []);

    const handleConnect = () => {
        window.location.href = '/api/integrations/google/auth';
    };

    const handleSaveConfig = async () => {
        if (!integrationId) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/integrations/${integrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        spreadsheetId,
                        spreadsheetName,
                        sheetName
                    }
                })
            });

            if (!res.ok) throw new Error("Failed to save configuration");

            toast.success("Configuration saved successfully!");
            router.push("/dashboard/integrations");
        } catch (err: any) {
            toast.error(err.message || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-3 w-fit text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/integrations">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Integrations
                    </Link>
                </Button>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center p-3 shadow-sm border border-emerald-100">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg"
                            alt="Google Sheets"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Google Sheets Integration</h1>
                        <p className="text-muted-foreground mt-1">
                            {isConnected
                                ? "Configure your spreadsheet selection to guide your AI agent."
                                : "Connect your spreadsheets to enable structured data access and real-time updates."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {!isConnected ? (
                        <Card>
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
                                            title: "Read Data",
                                            desc: "Fetch rows and columns from any accessible spreadsheet.",
                                            icon: <TableIcon className="w-4 h-4 text-emerald-500" />
                                        },
                                        {
                                            title: "Write & Update",
                                            desc: "Add new rows or update existing data points automatically.",
                                            icon: <Zap className="w-4 h-4 text-emerald-500" />
                                        },
                                        {
                                            title: "Structured Storage",
                                            desc: "Use Sheets as a lightweight database for your agent's findings.",
                                            icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        },
                                        {
                                            title: "Multi-user Support",
                                            desc: "Each user connects their own account securely via OAuth.",
                                            icon: <Users className="w-4 h-4 text-emerald-500" />
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
                                            We use industry-standard OAuth 2.0 to request only necessary permissions.
                                            You can revoke access at any time through your Google Account settings.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-emerald-100/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    Account Connected
                                </CardTitle>
                                <CardDescription>
                                    Select the spreadsheet and sheet you want the AI agent to use by default.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Select Spreadsheet</label>
                                        <SpreadsheetSelector
                                            currentValue={spreadsheetId}
                                            onSelect={(id, name) => {
                                                setSpreadsheetId(id);
                                                setSpreadsheetName(name);
                                                setSheetName(""); // Reset sheet when spreadsheet changes
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Select Sheet</label>
                                        <SheetSelector
                                            spreadsheetId={spreadsheetId}
                                            currentValue={sheetName}
                                            onSelect={setSheetName}
                                        />
                                    </div>
                                </div>

                                {spreadsheetId && (
                                    <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-sm">
                                        <p className="text-emerald-900 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            Selected: <strong>{spreadsheetName}</strong> {sheetName && <>({sheetName})</>}
                                        </p>
                                        <p className="text-emerald-700/70 text-xs mt-1">
                                            Your agent will prioritize this sheet for data operations.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t justify-end py-4">
                                <Button
                                    onClick={handleSaveConfig}
                                    disabled={!spreadsheetId || !sheetName || saving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Configuration
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {!isConnected ? (
                        <Card className="border-emerald-100 shadow-lg shadow-emerald-500/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base uppercase tracking-wider text-muted-foreground/60 font-bold">
                                    Setup
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>Google Cloud Project Ready</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>OAuth Scopes Configured</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleConnect}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                                >
                                    Connect Google Account
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground">
                                    By connecting, you agree to allow our AI to access your Sheets data as requested during chat.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-emerald-50/30 border-emerald-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-emerald-900">Connection Active</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-emerald-800/70">
                                    You have successfully linked your Google account. You can now select which spreadsheet to use as a data source.
                                </p>
                                <div className="space-y-2 pt-2 border-t border-emerald-100">
                                    <div className="flex items-center justify-between text-[10px] text-emerald-900 font-medium">
                                        <span>OAuth Status</span>
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Active
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleConnect}
                                        className="w-full h-8 text-[10px] border-emerald-200 hover:bg-emerald-50"
                                    >
                                        Reconnect Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
                        <h4 className="text-xs font-semibold mb-1">Need help?</h4>
                        <p className="text-[10px] text-muted-foreground">
                            Check our documentation on how to set up spreadsheets for AI access.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
