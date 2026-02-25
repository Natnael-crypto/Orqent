"use client";

import { useState, useEffect, use } from "react";
import {
    Settings,
    Bot,
    Layout,
    Link as LinkIcon,
    Save,
    RotateCcw,
    ExternalLink,
    Check,
    Copy,
    ChevronLeft,
    RefreshCw,
    Palette
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SimulatedChat } from "@/components/widgets/SimulatedChat";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WidgetDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function WidgetDetailPage({ params }: WidgetDetailPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loadingIntegrations, setLoadingIntegrations] = useState(false);
    const [uiCustomizations, setUiCustomizations] = useState<any[]>([]);
    const [loadingCustomizations, setLoadingCustomizations] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scriptType, setScriptType] = useState<"html" | "react">("html");

    const [widget, setWidget] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        description: "",
        model: "gpt-4o",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 1000,
        uiCustomizationId: "",
        allowedDomains: [],
        integrationIds: []
    });

    useEffect(() => {
        fetchWidget();
        fetchIntegrations();
        fetchCustomizations();
    }, [id]);

    const fetchWidget = async () => {
        try {
            const res = await fetch(`/api/widgets/${id}`);
            if (!res.ok) throw new Error("Failed to fetch widget");
            const data = await res.json();
            setWidget(data);
            setFormData({
                name: data.name,
                description: data.description || "",
                model: data.model,
                systemPrompt: data.systemPrompt,
                temperature: data.temperature,
                maxTokens: data.maxTokens,
                uiCustomizationId: data.uiCustomizationId || "",
                allowedDomains: data.allowedDomains?.map((d: any) => d.domain) || [],
                integrationIds: data.integrationIds?.map((i: any) => i.id) || []
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to load widget details", variant: "destructive" });
            router.push("/dashboard/widgets");
        } finally {
            setLoading(false);
        }
    };

    const fetchIntegrations = async () => {
        setLoadingIntegrations(true);
        try {
            const res = await fetch("/api/integrations");
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching integrations:", error);
        } finally {
            setLoadingIntegrations(false);
        }
    };

    const fetchCustomizations = async () => {
        setLoadingCustomizations(true);
        try {
            const res = await fetch("/api/ui-customizations");
            if (res.ok) {
                const data = await res.json();
                setUiCustomizations(data || []);
            }
        } catch (error) {
            console.error("Error fetching customizations:", error);
        } finally {
            setLoadingCustomizations(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/widgets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updated = await res.json();
                setWidget(updated);
                toast({ title: "Success", description: "Widget updated successfully" });
            } else {
                toast({ title: "Error", description: "Failed to update widget", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const toggleIntegration = (id: string) => {
        setFormData((prev: any) => ({
            ...prev,
            integrationIds: prev.integrationIds.includes(id)
                ? prev.integrationIds.filter((iid: string) => iid !== id)
                : [...prev.integrationIds, id]
        }));
    };

    const currentCustomization = uiCustomizations.find(c => c.id === formData.uiCustomizationId) || widget?.uiCustomization;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading widget configuration...</p>
            </div>
        );
    }

    const embedScript = scriptType === "html"
        ? `<script src="https://cdn.velora.io/widget/${widget?.id}.js"></script>`
        : `import Script from 'next/script';\n\n<Script\n  src="https://cdn.velora.io/widget/${widget?.id}.js"\n  strategy="lazyOnload"\n/>`;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/dashboard/widgets">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{widget?.name}</h1>
                            <Badge variant={widget?.status === "ACTIVE" ? "default" : "secondary"}>
                                {widget?.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{widget?.description || "No description provided"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={fetchWidget} disabled={saving}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Changes
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
                            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">AI Model</TabsTrigger>
                            <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Integrations</TabsTrigger>
                            <TabsTrigger value="ui" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Interface</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-6 space-y-6">
                            <Card className="border-muted/60 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">Basic Information</CardTitle>
                                    <CardDescription>Update your widget's display name and deployment settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Widget Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Customer Support"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="What is this bot for?"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Deployment Script</Label>
                                                <div className="flex bg-muted/50 p-0.5 rounded-lg">
                                                    <button
                                                        onClick={() => setScriptType("html")}
                                                        className={cn(
                                                            "px-2 py-1 text-[10px] font-medium rounded-md transition-all",
                                                            scriptType === "html" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        HTML
                                                    </button>
                                                    <button
                                                        onClick={() => setScriptType("react")}
                                                        className={cn(
                                                            "px-2 py-1 text-[10px] font-medium rounded-md transition-all",
                                                            scriptType === "react" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        React (Next.js)
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <div className="p-3 bg-muted/40 rounded-lg font-mono text-xs border border-dashed text-muted-foreground whitespace-pre-wrap break-all min-h-[48px] flex items-start">
                                                    <code className="pr-10">{embedScript}</code>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(embedScript);
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 2000);
                                                            toast({ title: "Copied", description: "Script copied to clipboard" });
                                                        }}
                                                    >
                                                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {scriptType === "html"
                                                    ? "Add this script to your website's <head> or before the closing </body> tag."
                                                    : "Use this component in your Next.js application for optimized loading."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-muted/60 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">Security & Domains</CardTitle>
                                    <CardDescription>Restrict where this widget can be embedded.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="domains">Allowed Domains</Label>
                                            <Input
                                                id="domains"
                                                value={formData.allowedDomains.join(", ")}
                                                onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                                placeholder="example.com, dashboard.example.com"
                                            />
                                            <p className="text-[10px] text-muted-foreground">Separate multiple domains with commas.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ai" className="mt-6 space-y-6">
                            <Card className="border-muted/60 shadow-none">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Model Configuration</CardTitle>
                                            <CardDescription>Fine-tune the AI behavior and model parameters.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="model">Model Provider</Label>
                                            <Select
                                                value={formData.model}
                                                onValueChange={(v) => setFormData({ ...formData, model: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
                                                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</SelectItem>
                                                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                                    <SelectItem value="o1-preview">o1 Preview (Reasoning)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="temp">Temperature: {formData.temperature}</Label>
                                            <Input
                                                type="range"
                                                min="0"
                                                max="2"
                                                step="0.1"
                                                value={formData.temperature}
                                                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="prompt">System Prompt</Label>
                                        <Textarea
                                            id="prompt"
                                            className="min-h-[250px] font-mono text-sm leading-relaxed"
                                            value={formData.systemPrompt}
                                            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                                            placeholder="You are a helpful assistant..."
                                        />
                                        <p className="text-[10px] text-muted-foreground">This prompt defines the personality and constraints of your AI agent.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tokens">Max Response Tokens</Label>
                                        <Input
                                            id="tokens"
                                            type="number"
                                            value={formData.maxTokens}
                                            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="integrations" className="mt-6 space-y-6">
                            <Card className="border-muted/60 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">Connected Services</CardTitle>
                                    <CardDescription>Enable tools that the AI can call during conversations.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingIntegrations ? (
                                        <div className="py-10 text-center">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Fetching integrations...</p>
                                        </div>
                                    ) : integrations.length === 0 ? (
                                        <div className="py-10 text-center border border-dashed rounded-xl">
                                            <p className="text-sm text-muted-foreground mb-4">No integrations available.</p>
                                            <Button variant="outline" asChild>
                                                <Link href="/dashboard/integrations">Configure Integrations</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {integrations.map((i) => (
                                                <div
                                                    key={i.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border transition-colors",
                                                        formData.integrationIds.includes(i.id)
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-muted/60 hover:border-muted-foreground/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted">
                                                            <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{i.name}</p>
                                                            <p className="text-xs text-muted-foreground uppercase tracking-tighter">{i.type}</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.integrationIds.includes(i.id)}
                                                        onCheckedChange={() => toggleIntegration(i.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ui" className="mt-6 space-y-6">
                            <Card className="border-muted/60 shadow-none">
                                <CardHeader>
                                    <CardTitle className="text-xl">UI Customization</CardTitle>
                                    <CardDescription>Choose how your chat widget looks on your website.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingCustomizations ? (
                                        <div className="py-10 text-center">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Fetching UI presets...</p>
                                        </div>
                                    ) : uiCustomizations.length === 0 ? (
                                        <div className="py-10 text-center border border-dashed rounded-xl">
                                            <p className="text-sm text-muted-foreground mb-4">No customizations available.</p>
                                            <Button variant="outline" asChild>
                                                <Link href="/dashboard/ui/new">Create Customization</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {uiCustomizations.map((c) => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => setFormData({ ...formData, uiCustomizationId: c.id })}
                                                    className={cn(
                                                        "cursor-pointer p-4 rounded-xl border transition-all",
                                                        formData.uiCustomizationId === c.id
                                                            ? "border-primary ring-1 ring-primary bg-primary/5"
                                                            : "border-muted/60 hover:border-muted-foreground/30"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                                            <Palette className="w-4 h-4" />
                                                        </div>
                                                        {formData.uiCustomizationId === c.id && (
                                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-medium text-sm mb-1">{c.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                                            style={{ backgroundColor: c.primaryColor }}
                                                            title="Primary Color"
                                                        />
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                                            style={{ backgroundColor: c.backgroundColor }}
                                                            title="Background Color"
                                                        />
                                                        <Badge variant="outline" className="text-[9px] uppercase tracking-widest px-1.5 h-4">
                                                            {c.position}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Preview */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Live Preview</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Interactive</Badge>
                        </div>
                        <SimulatedChat customization={currentCustomization} />
                        <div className="mt-6 p-4 bg-muted/40 rounded-xl border border-dashed">
                            <h4 className="font-medium text-xs mb-2">Note:</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                This is a simulated preview using the current configuration. Some features like specific integration tool calls may not execute in this demo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
