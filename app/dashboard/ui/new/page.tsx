"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Palette, Upload, X, MessageSquare } from "lucide-react";
import Link from "next/link";

const UICustomizationForm = () => {
    const router = useRouter();
    const params = useParams();
    const isEditing = params?.id && params.id !== "new";

    const [loading, setLoading] = useState(isEditing ? true : false);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        name: "",
        buttonText: "Chat with us",
        primaryColor: "#141414",
        bgColor: "#ffffff",
        windowBg: "#ffffff",
        agentName: "AI Assistant",
        welcomeMessage: "Hello! How can I help you?",
        borderRadius: 12,
        fontSize: 14,
        position: "right" as "left" | "right",
        launcher: "button",
        agentAvatarUrl: "" as string | null,
    });

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: "File too large", description: "Image must be less than 2MB", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                method: "POST",
                body: file,
            });

            if (res.ok) {
                const blob = await res.json();
                setConfig({ ...config, agentAvatarUrl: blob.url });
                toast({ title: "Upload Success", description: "Avatar uploaded successfully" });
            } else {
                toast({ title: "Upload Error", description: "Failed to upload image", variant: "destructive" });
            }
        } catch (error: unknown) {
            toast({ title: "Error", description: "Something went wrong during upload", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            const fetchCustomization = async () => {
                try {
                    const res = await fetch(`/api/ui-customizations/${params.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Map DB fields to form state if needed
                        setConfig({
                            name: data.name,
                            buttonText: data.chatButtonText,
                            primaryColor: data.primaryColor,
                            bgColor: data.backgroundColor,
                            windowBg: data.backgroundColor, // assuming windowBg is same for now
                            agentName: data.agentName,
                            welcomeMessage: data.welcomeMessage || "Hello! How can I help you?",
                            borderRadius: data.borderRadius,
                            fontSize: data.fontSize,
                            position: data.position as "left" | "right",
                            launcher: "button",
                            agentAvatarUrl: data.agentAvatarUrl || "",
                        });
                    }
                } catch (error: unknown) {
                    console.error("Error fetching customization:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCustomization();
        }
    }, [isEditing, params?.id]);

    const handleSave = async () => {
        if (!config.name) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: config.name,
                chatButtonText: config.buttonText,
                agentName: config.agentName,
                welcomeMessage: config.welcomeMessage,
                primaryColor: config.primaryColor,
                backgroundColor: config.bgColor,
                borderRadius: config.borderRadius,
                fontSize: config.fontSize,
                position: config.position,
                agentAvatarUrl: config.agentAvatarUrl,
            };

            const url = isEditing ? `/api/ui-customizations/${params.id}` : "/api/ui-customizations";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast({ title: "Success", description: `UI Customization ${isEditing ? "updated" : "created"} successfully` });
                router.push("/dashboard/ui");
            } else {
                toast({ title: "Error", description: "Failed to save customization", variant: "destructive" });
            }
        } catch (error: unknown) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-4">Loading customization...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-medium tracking-tight">
                            {isEditing ? "Edit Customization" : "Create Customization"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Define the visual style for your chat widgets.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isEditing ? "Update" : "Create"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium">Customization Name</label>
                        <input
                            value={config.name}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            className="mt-2 w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-card"
                            placeholder="e.g. Modern Dark, Support Style"
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Visual Settings
                        </h3>

                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Chat Button Text</label>
                            <input value={config.buttonText} onChange={(e) => setConfig({ ...config, buttonText: e.target.value })} className="mt-1.5 w-full h-9 text-sm border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Agent Name</label>
                                <input value={config.agentName} onChange={(e) => setConfig({ ...config, agentName: e.target.value })} className="mt-1.5 w-full h-9 text-sm border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Welcome Message</label>
                                <textarea
                                    value={config.welcomeMessage}
                                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                    className="mt-1.5 w-full min-h-[80px] text-sm border border-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                    placeholder="e.g. Hello! How can I help you today?"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-2">Agent Avatar</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-full border border-border bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                    {config.agentAvatarUrl ? (
                                        <>
                                            <img src={config.agentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setConfig({ ...config, agentAvatarUrl: null })}
                                                className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <Upload className="w-6 h-6 text-muted-foreground" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("avatar-upload")?.click()}
                                        disabled={uploading}
                                        className="text-xs font-medium px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {config.agentAvatarUrl ? "Change Image" : "Upload Image"}
                                    </button>
                                    <p className="text-[10px] text-muted-foreground">JPG, PNG or SVG. Max 2MB.</p>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Primary Color</label>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <input type="color" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="w-8 h-8 border border-border rounded cursor-pointer" />
                                    <input value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="flex-1 h-9 text-xs border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Background</label>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <input type="color" value={config.bgColor} onChange={(e) => setConfig({ ...config, bgColor: e.target.value })} className="w-8 h-8 border border-border rounded cursor-pointer" />
                                    <input value={config.bgColor} onChange={(e) => setConfig({ ...config, bgColor: e.target.value })} className="flex-1 h-9 text-xs border border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex justify-between">
                                Border Radius
                                <span className="font-medium text-foreground">{config.borderRadius}px</span>
                            </label>
                            <input type="range" min="0" max="24" value={config.borderRadius} onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) })} className="mt-2 w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex justify-between">
                                Font Size
                                <span className="font-medium text-foreground">{config.fontSize}px</span>
                            </label>
                            <input type="range" min="12" max="18" value={config.fontSize} onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })} className="mt-2 w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Position</label>
                            <div className="mt-2 flex gap-2">
                                {(["left", "right"] as const).map((p) => (
                                    <button key={p} onClick={() => setConfig({ ...config, position: p })} className={`flex-1 text-xs py-2 rounded-md border transition-colors capitalize ${config.position === p ? "border-foreground bg-foreground text-background font-medium" : "border-border hover:bg-secondary text-muted-foreground"}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium">Live Preview</label>
                    <div className="flex-1 border border-border rounded-2xl p-8 bg-secondary/30 flex items-end justify-end overflow-hidden min-h-[400px]">
                        <div className="space-y-4 w-full max-w-[320px]">
                            <div className="bg-card border border-border shadow-2xl overflow-hidden" style={{ borderRadius: config.borderRadius }}>
                                <div className="px-4 py-3.5 flex items-center gap-3" style={{ backgroundColor: config.primaryColor }}>
                                    {config.agentAvatarUrl ? (
                                        <img src={config.agentAvatarUrl} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold" style={{ color: config.bgColor }}>
                                            {config.agentName.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold leading-tight" style={{ color: config.bgColor }}>{config.agentName}</span>
                                        <span className="text-[10px] opacity-70" style={{ color: config.bgColor }}>Online</span>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3 bg-card" style={{ fontSize: config.fontSize }}>
                                    <div className="bg-secondary/50 rounded-2xl rounded-tl-none p-3.5 text-sm max-w-[85%]">
                                        {config.welcomeMessage}
                                    </div>
                                    <div className="ml-auto rounded-2xl rounded-tr-none p-3.5 text-sm max-w-[85%]" style={{ backgroundColor: config.primaryColor, color: config.bgColor }}>
                                        I have a question about my account.
                                    </div>
                                </div>
                                <div className="px-4 py-4 border-t border-border bg-card">
                                    <div className="h-10 bg-secondary/50 rounded-xl" />
                                </div>
                            </div>
                            <div className={`flex ${config.position === "right" ? "justify-end" : "justify-start"}`}>
                                <div className="px-5 py-3 rounded-full text-sm font-semibold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer" style={{ backgroundColor: config.primaryColor, color: config.bgColor }}>
                                    {config.agentAvatarUrl ? (
                                        <img src={config.agentAvatarUrl} className="w-5 h-5 rounded-full border border-white/10" alt="Avatar" />
                                    ) : (
                                        <MessageSquare className="w-4 h-4" />
                                    )}
                                    {config.buttonText}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UICustomizationForm;
