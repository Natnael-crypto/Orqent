"use client";

import { useState, useEffect } from "react";
import { Palette, RefreshCw, ExternalLink, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

const steps = ["Basic Info", "AI Configuration", "Integrations", "UI Selection", "Install Script"];

const WidgetCreation = () => {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [loadingIntegrations, setLoadingIntegrations] = useState(false);
    const [uiCustomizations, setUiCustomizations] = useState<any[]>([]);
    const [loadingCustomizations, setLoadingCustomizations] = useState(false);

    const [config, setConfig] = useState({
        name: "",
        domain: "",
        description: "",
        active: true,
        model: "gpt-4o",
        prompt: "",
        temperature: 0.7,
        maxTokens: 2048,
        memory: true,
        integrationIds: [] as string[],
        uiCustomizationId: "",
    });

    const fetchIntegrations = async () => {
        setLoadingIntegrations(true);
        try {
            const res = await fetch("/api/integrations");
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data.data);
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
                setUiCustomizations(data);
            }
        } catch (error) {
            console.error("Error fetching customizations:", error);
        } finally {
            setLoadingCustomizations(false);
        }
    };

    useEffect(() => {
        fetchCustomizations();
        fetchIntegrations();
    }, []);

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
    };
    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };
    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch("/api/widgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: config.name,
                    description: config.description,
                    model: config.model,
                    systemPrompt: config.prompt,
                    temperature: config.temperature,
                    maxTokens: config.maxTokens,
                    uiCustomizationId: config.uiCustomizationId,
                    allowedDomains: [config.domain],
                    integrationIds: config.integrationIds,
                }),
            });

            if (res.ok) {
                toast({ title: "Success", description: "Widget published successfully" });
                router.push("/dashboard/widgets");
            } else {
                toast({ title: "Error", description: "Failed to publish widget", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setCreating(false);
        }
    };

    const embedScript = `<script src="https://cdn.velora.io/widget/${config.name.toLowerCase().replace(/\s/g, "-") || "my-widget"}.js"></script>`;

    const toggleIntegration = (id: string) => {
        setConfig(prev => ({
            ...prev,
            integrationIds: prev.integrationIds.includes(id)
                ? prev.integrationIds.filter(iid => iid !== id)
                : [...prev.integrationIds, id]
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-medium tracking-tight">Create Widget</h1>
                <p className="text-sm text-muted-foreground mt-1">Set up a new AI chat widget in 5 steps.</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <button
                            onClick={() => setStep(i)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${i === step ? "bg-foreground text-background" : i < step ? "bg-secondary text-foreground" : "bg-secondary text-muted-foreground"
                                }`}
                        >
                            {s}
                        </button>
                        {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 0 && (
                <div className="max-w-lg space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Widget Name *</label>
                        <input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="mt-1 w-full h-9 text-sm border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g., Support Bot" />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Allowed Domain *</label>
                        <input value={config.domain} onChange={(e) => setConfig({ ...config, domain: e.target.value })} className="mt-1 w-full h-9 text-sm border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" placeholder="e.g., app.example.com" />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Description</label>
                        <textarea value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} rows={3} className="mt-1 w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="What does this widget do?" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground">Status</label>
                        <button onClick={() => setConfig({ ...config, active: !config.active })} className={`w-10 h-5 rounded-full relative transition-colors ${config.active ? "bg-foreground" : "bg-border"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${config.active ? "left-5" : "left-0.5"}`} />
                        </button>
                        <span className="text-sm text-muted-foreground">{config.active ? "Active" : "Inactive"}</span>
                    </div>
                </div>
            )}

            {/* Step 2: AI Config */}
            {step === 1 && (
                <div className="max-w-lg space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Model</label>
                        <select value={config.model} onChange={(e) => setConfig({ ...config, model: e.target.value })} className="mt-1 w-full h-9 text-sm border border-border rounded-md px-3 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                            <option value="claude-3.5">Claude 3.5 Sonnet</option>
                            <option value="claude-3-haiku">Claude 3 Haiku</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">System Prompt</label>
                        <textarea value={config.prompt} onChange={(e) => setConfig({ ...config, prompt: e.target.value })} rows={5} className="mt-1 w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="You are a helpful assistant..." />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Temperature: {config.temperature}</label>
                        <input type="range" min="0" max="1" step="0.1" value={config.temperature} onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })} className="mt-2 w-full" />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Max Tokens</label>
                        <input type="number" value={config.maxTokens} onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) || 0 })} className="mt-1 w-full h-9 text-sm border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground">Conversation Memory</label>
                        <button onClick={() => setConfig({ ...config, memory: !config.memory })} className={`w-10 h-5 rounded-full relative transition-colors ${config.memory ? "bg-foreground" : "bg-border"}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${config.memory ? "left-5" : "left-0.5"}`} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Integrations */}
            {step === 2 && (
                <div className="max-w-2xl space-y-4">
                    <p className="text-sm text-muted-foreground">Select the integrations your widget can use during conversations to perform actions or fetch data.</p>

                    {loadingIntegrations ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground border border-dashed border-border rounded-xl">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <p className="text-xs">Loading integrations...</p>
                        </div>
                    ) : integrations.length === 0 ? (
                        <div className="p-10 border border-dashed border-border rounded-xl bg-card text-center">
                            <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-sm font-medium">No integrations found</h3>
                            <p className="text-xs text-muted-foreground mt-1 text-balance">You need to create an integration before you can add it to your widget.</p>
                            <Link
                                href="/dashboard/integrations/new"
                                target="_blank"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                            >
                                Create your first integration <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {integrations.map((integration) => (
                                <div
                                    key={integration.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${config.integrationIds.includes(integration.id)
                                        ? "border-foreground bg-foreground/[0.02]"
                                        : "border-border hover:border-foreground/20 bg-card hover:bg-secondary/20"
                                        }`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                            {integration.type === "REST_API" ? (
                                                <ExternalLink className="w-5 h-5 text-muted-foreground" />
                                            ) : (
                                                <Plus className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-medium truncate">{integration.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{integration.type.replace(/_/g, " ")}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleIntegration(integration.id)}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${config.integrationIds.includes(integration.id) ? "bg-foreground" : "bg-border"
                                            }`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${config.integrationIds.includes(integration.id) ? "left-5" : "left-0.5"
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 4: UI Selection */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between max-w-2xl">
                        <div>
                            <p className="text-sm text-muted-foreground">Select a UI customization to style your widget or create a new one.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchCustomizations}
                                disabled={loadingCustomizations}
                                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                title="Refresh customizations"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingCustomizations ? "animate-spin" : ""}`} />
                            </button>
                            <Link
                                href="/dashboard/ui/new"
                                target="_blank"
                                className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create New
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                            </Link>
                        </div>
                    </div>

                    {loadingCustomizations ? (
                        <div className="flex items-center gap-4 animate-pulse max-w-2xl">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 flex-1 bg-secondary rounded-xl border border-border" />
                            ))}
                        </div>
                    ) : uiCustomizations.length === 0 ? (
                        <div className="p-10 border border-dashed border-border rounded-xl bg-card text-center max-w-2xl">
                            <Palette className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-sm font-medium">No UI customizations found</h3>
                            <p className="text-xs text-muted-foreground mt-1">You need at least one customization to continue.</p>
                            <Link
                                href="/dashboard/ui/new"
                                target="_blank"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                            >
                                Create your first customization <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                            {uiCustomizations.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setConfig({ ...config, uiCustomizationId: c.id })}
                                    className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${config.uiCustomizationId === c.id
                                        ? "border-foreground ring-1 ring-foreground bg-foreground/5 shadow-sm"
                                        : "border-border hover:border-foreground/30 bg-card hover:bg-secondary/30"}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-1.5 rounded-lg bg-secondary">
                                            <Palette className="w-4 h-4" />
                                        </div>
                                        {config.uiCustomizationId === c.id && (
                                            <div className="w-2 h-2 rounded-full bg-foreground" />
                                        )}
                                    </div>
                                    <p className="text-sm font-medium truncate pr-4">{c.name}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border border-background" style={{ backgroundColor: c.primaryColor }} />
                                        <div className="w-4 h-4 rounded-full border border-background" style={{ backgroundColor: c.backgroundColor }} />
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-1">{c.position}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}


                </div>
            )}

            {/* Step 5: Install */}
            {step === 4 && (
                <div className="max-w-2xl space-y-4">
                    <p className="text-sm text-muted-foreground">Add this script to your website to deploy the chat widget.</p>
                    <div className="bg-foreground text-background rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        {embedScript}
                    </div>
                    <button
                        onClick={() => { navigator.clipboard.writeText(embedScript); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-sm px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors"
                    >
                        {copied ? "Copied ✓" : "Copy to clipboard"}
                    </button>
                    <div className="pt-4">
                        <button onClick={handleCreate} disabled={creating} className="text-sm font-medium px-6 py-2.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50">
                            {creating ? "Publishing..." : "Publish widget"}
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
                {step > 0 && (
                    <button onClick={handleBack} className="text-sm px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors">
                        Back
                    </button>
                )}
                {step < steps.length - 1 && (
                    <button onClick={handleNext} className="text-sm font-medium px-4 py-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors">
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
};

export default WidgetCreation;
