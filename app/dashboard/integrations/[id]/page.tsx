"use client";

import { useIntegration, useIntegrationLogs, useIntegrationActions } from "@/hooks/useIntegrations";
import {
    Loader2,
    ArrowLeft,
    Settings,
    Activity,
    Users,
    Info,
    CheckCircle2,
    XCircle,
    Calendar,
    ExternalLink,
    RefreshCw,
    Trash2,
    Globe,
    Code2,
    ArrowRight,
    ShieldCheck,
    FileJson,
    Cookie,
    Hash,
    Link2,
    Clock,
    Pencil,
    Save,
    X,
    Plus,
    Settings2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useParams, useRouter } from "next/navigation";

/* ─── helpers ─── */

const METHOD_COLORS: Record<string, string> = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
    POST: "bg-blue-50 text-blue-700 border-blue-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    PATCH: "bg-violet-50 text-violet-700 border-violet-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
};

const MethodBadge = ({ method }: { method: string }) => (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded border ${METHOD_COLORS[method] || "bg-secondary text-foreground border-border"}`}>
        {method}
    </span>
);

/* ─── PropertyRow (editable field row) ─── */

const PropertyRow = ({
    name,
    config,
    onRemove,
    onUpdateProperty,
    onUpdateName,
    showValue = false
}: {
    name: string;
    config: any;
    onRemove: () => void;
    onUpdateProperty: (field: string, value: any) => void;
    onUpdateName: (newName: string) => void;
    showValue?: boolean;
}) => {
    const [localName, setLocalName] = useState(name);

    useEffect(() => {
        setLocalName(name);
    }, [name]);

    return (
        <div className="group relative flex flex-col gap-3 p-3 bg-background border border-border rounded-md transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4 space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase font-medium">Field Name</Label>
                    <Input
                        className="h-8 text-xs font-mono border-border focus:ring-1 focus:ring-ring"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        onBlur={() => onUpdateName(localName)}
                        onKeyDown={(e) => e.key === "Enter" && onUpdateName(localName)}
                        placeholder="property_name"
                    />
                </div>
                <div className="md:col-span-3 space-y-1">
                    {showValue ? (
                        <>
                            <Label className="text-[10px] text-muted-foreground uppercase font-medium">Value</Label>
                            <Input
                                className="h-8 text-xs border-border focus:ring-1 focus:ring-ring"
                                placeholder="Static value"
                                value={config.value || ""}
                                onChange={(e) => onUpdateProperty("value", e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <Label className="text-[10px] text-muted-foreground uppercase font-medium">Type</Label>
                            <Select
                                value={config.type}
                                onValueChange={(val) => onUpdateProperty("type", val)}
                            >
                                <SelectTrigger className="h-8 text-xs border-border focus:ring-1 focus:ring-ring">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="integer">Integer</SelectItem>
                                </SelectContent>
                            </Select>
                        </>
                    )}
                </div>
                <div className="md:col-span-5 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground uppercase font-medium">Description</Label>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-muted-foreground hover:text-destructive transition-all p-1"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <Input
                        className="h-8 text-xs border-border focus:ring-1 focus:ring-ring"
                        placeholder="What's this field for?"
                        value={config.description || ""}
                        onChange={(e) => onUpdateProperty("description", e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

/* ─── PropertyEditor (editable property list) ─── */

const PropertyEditor = ({
    title,
    schema,
    onChange,
    showValue = false
}: {
    title: string;
    schema: any;
    onChange: (newSchema: any) => void;
    showValue?: boolean;
}) => {
    const properties = schema?.properties || {};

    const addProperty = () => {
        const count = Object.keys(properties).length;
        const name = `field_${count + 1}`;
        onChange({
            ...schema,
            properties: {
                ...properties,
                [name]: showValue
                    ? { value: "", description: "" }
                    : { type: "string", description: "" }
            }
        });
    };

    const updateProperty = (name: string, field: string, value: any) => {
        onChange({
            ...schema,
            properties: {
                ...properties,
                [name]: { ...properties[name], [field]: value }
            }
        });
    };

    const updatePropertyName = (oldName: string, newName: string) => {
        if (!newName || newName === oldName) return;
        const sanitizedName = newName.trim().replace(/\s+/g, '_').toLowerCase();
        if (properties[sanitizedName] && sanitizedName !== oldName) return;
        const newProps = { ...properties };
        newProps[sanitizedName] = newProps[oldName];
        delete newProps[oldName];
        onChange({ ...schema, properties: newProps });
    };

    const removeProperty = (name: string) => {
        const newProps = { ...properties };
        delete newProps[name];
        onChange({ ...schema, properties: newProps });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {title}
                    </h3>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addProperty}
                    className="h-7 text-[10px] font-medium uppercase tracking-tight"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Field
                </Button>
            </div>
            <div className="space-y-3">
                {Object.entries(properties).map(([name, config]: [string, any]) => (
                    <PropertyRow
                        key={name}
                        name={name}
                        config={config}
                        showValue={showValue}
                        onRemove={() => removeProperty(name)}
                        onUpdateProperty={(field, val) => updateProperty(name, field, val)}
                        onUpdateName={(newName) => updatePropertyName(name, newName)}
                    />
                ))}
            </div>
            {Object.keys(properties).length === 0 && (
                <div className="py-6 text-center border border-dashed border-border rounded-md bg-muted/20">
                    <p className="text-xs text-muted-foreground italic">No fields defined.</p>
                </div>
            )}
        </div>
    );
};

/* ─── read-only property table ─── */

const PropertyTable = ({ title, icon, properties }: { title: string; icon: React.ReactNode; properties: Record<string, any> }) => {
    const entries = Object.entries(properties || {});
    if (entries.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                {icon}
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h4>
                <span className="text-[10px] text-muted-foreground/60 ml-auto">{entries.length} field{entries.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
                {entries.map(([name, config]: [string, any], i) => (
                    <div
                        key={name}
                        className={`flex items-start gap-4 px-3 py-2.5 text-sm ${i % 2 === 0 ? "bg-background" : "bg-muted/30"} ${i < entries.length - 1 ? "border-b border-border" : ""}`}
                    >
                        <code className="font-mono text-xs text-foreground/90 min-w-[120px] pt-0.5">{name}</code>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-medium shrink-0">
                            {config.type || "—"}
                        </span>
                        <span className="text-xs text-muted-foreground flex-1 leading-relaxed">
                            {config.description || config.value || "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── detail row ─── */

const DetailRow = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="flex items-baseline gap-6 py-2.5 border-b border-border/60 last:border-0">
        <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wide font-medium">{label}</span>
        <span className={`text-sm flex-1 ${mono ? "font-mono text-foreground/80" : ""}`}>{value || "—"}</span>
    </div>
);

/* ─── deep clone helper ─── */

function cloneDeep<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/* ─── build default form data from integration ─── */

function buildFormData(integration: any) {
    return {
        name: integration.name || "",
        description: integration.description || "",
        type: integration.type || "REST_API",
        config: {
            baseUrl: integration.config?.baseUrl || "",
            headers: integration.config?.headers || {},
        },
        restTools: (integration.restTools || []).map((tool: any) => ({
            method: tool.method || "GET",
            path: tool.path || "/",
            contentType: tool.contentType || "application/json",
            headers: tool.headers || {},
            requestConfig: {
                pathParams: tool.requestConfig?.pathParams || { type: "object", properties: {} },
                queryParams: tool.requestConfig?.queryParams || { type: "object", properties: {} },
                headers: tool.requestConfig?.headers || { type: "object", properties: {} },
                cookies: tool.requestConfig?.cookies || { type: "object", properties: {} },
                body: tool.requestConfig?.body || { type: "JSON", schema: { type: "object", properties: {} } },
                timeoutMs: tool.requestConfig?.timeoutMs || 30000,
            },
            responseConfig: {
                successStatusCodes: tool.responseConfig?.successStatusCodes || [200],
                responseSchema: tool.responseConfig?.responseSchema || { type: "object", properties: {} },
                dataPath: tool.responseConfig?.dataPath || "",
                errorPath: tool.responseConfig?.errorPath || "",
                strictValidation: tool.responseConfig?.strictValidation || false,
            },
            requiresConfirmation: tool.requiresConfirmation || false,
            isActive: tool.isActive !== undefined ? tool.isActive : true,
        })),
    };
}

/* ─── main ─── */

const IntegrationDetails = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: integration, isLoading, isError, refetch } = useIntegration(id);
    const { data: logs, isLoading: isLoadingLogs } = useIntegrationLogs(id);
    const { deleteIntegration, updateIntegration } = useIntegrationActions();

    const [activeTab, setActiveTab] = useState("overview");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    // Initialize form data when entering edit mode
    const enterEditMode = () => {
        if (integration) {
            setFormData(cloneDeep(buildFormData(integration)));
            setIsEditing(true);
        }
    };

    const cancelEdit = () => {
        setFormData(null);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData) return;
        await updateIntegration.mutateAsync({ id, payload: formData });
        setIsEditing(false);
        setFormData(null);
        refetch();
    };

    const handleDelete = async () => {
        await deleteIntegration.mutateAsync(id);
        router.push("/dashboard/integrations");
    };

    /* ─── tool-level update helpers ─── */

    const updateToolField = (toolIndex: number, field: string, value: any) => {
        const newTools = [...formData.restTools];
        (newTools[toolIndex] as any)[field] = value;
        setFormData({ ...formData, restTools: newTools });
    };

    const updateToolRequestConfig = (toolIndex: number, field: string, value: any) => {
        const newTools = [...formData.restTools];
        (newTools[toolIndex].requestConfig as any)[field] = value;
        setFormData({ ...formData, restTools: newTools });
    };

    const updateToolResponseConfig = (toolIndex: number, field: string, value: any) => {
        const newTools = [...formData.restTools];
        (newTools[toolIndex].responseConfig as any)[field] = value;
        setFormData({ ...formData, restTools: newTools });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading integration…</p>
            </div>
        );
    }

    if (isError || !integration) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                <div className="p-3 bg-red-50 rounded-full text-red-500">
                    <XCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-medium">Integration not found</h3>
                    <p className="text-sm text-muted-foreground mt-1">We couldn't locate this integration.</p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/integrations">Back to Integrations</Link>
                </Button>
            </div>
        );
    }

    const restTools = integration.restTools || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Link href="/dashboard/integrations">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            {isEditing ? (
                                <Input
                                    className="h-8 text-xl font-medium tracking-tight border-border w-80"
                                    value={formData?.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <h1 className="text-xl font-medium tracking-tight">{integration.name}</h1>
                            )}
                            {integration.status === "ACTIVE" ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 text-[10px] font-semibold">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 h-5 text-[10px] font-semibold">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{integration.type.replace("_", " ")} · Created {format(new Date(integration.createdAt), "MMM d, yyyy")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-xs h-8">
                                <X className="w-3.5 h-3.5 mr-1.5" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={updateIntegration.isPending}
                                className="text-xs h-8 bg-foreground text-background hover:bg-foreground/90"
                            >
                                {updateIntegration.isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <Save className="w-3.5 h-3.5 mr-1.5" />
                                )}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={enterEditMode} className="text-xs h-8">
                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-xs h-8">
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Refresh
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete integration?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently remove the integration and disconnect it from all agents. This cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
                    {[
                        { value: "overview", label: "Overview", icon: Info },
                        { value: "agents", label: "Agents", icon: Users },
                        { value: "usage", label: "Logs", icon: Activity },
                        { value: "settings", label: "Configuration", icon: Settings },
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-1 text-xs font-medium gap-1.5 text-muted-foreground data-[state=active]:text-foreground transition-colors"
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ─── Overview ─── */}
                <TabsContent value="overview" className="pt-6 space-y-6 animate-in fade-in duration-200">
                    {/* Stat row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="stat-card">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Status</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                {integration.status === "ACTIVE" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-amber-500" />
                                )}
                                <span className="text-lg font-light tracking-tight capitalize">{integration.status.toLowerCase()}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Type</p>
                            <p className="text-lg font-light tracking-tight mt-2">{integration.type.replace("_", " ")}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Endpoints</p>
                            <p className="text-lg font-light tracking-tight mt-2">{restTools.length} tool{restTools.length !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Created</p>
                            <p className="text-lg font-light tracking-tight mt-2">{format(new Date(integration.createdAt), "MMM d, yyyy")}</p>
                        </div>
                    </div>

                    {/* Detail section */}
                    <div className="border border-border rounded-lg p-5">
                        <h3 className="text-sm font-medium mb-3">Details</h3>
                        <DetailRow label="ID" value={integration.id} mono />
                        {isEditing ? (
                            <>
                                <div className="flex items-baseline gap-6 py-2.5 border-b border-border/60">
                                    <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wide font-medium">Base URL</span>
                                    <div className="flex-1 relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input
                                            className="h-8 pl-9 text-xs font-mono border-border"
                                            value={formData?.config?.baseUrl || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, baseUrl: e.target.value }
                                            })}
                                            placeholder="https://api.example.com/v1"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-6 py-2.5 border-b border-border/60">
                                    <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wide font-medium">Description</span>
                                    <Textarea
                                        className="flex-1 text-sm min-h-[80px] resize-none border-border"
                                        value={formData?.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="What can the LLM do with this integration?"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <DetailRow label="Base URL" value={integration.config?.baseUrl} mono />
                                <DetailRow label="Description" value={integration.description || "No description provided."} />
                            </>
                        )}
                        <DetailRow label="Updated" value={format(new Date(integration.updatedAt), "MMM d, yyyy · h:mm a")} />
                    </div>

                    {/* Tools quick view */}
                    {restTools.length > 0 && (
                        <div className="border border-border rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium">Endpoints</h3>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                                >
                                    View full config <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {restTools.map((tool: any) => (
                                    <div key={tool.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-muted/30 border border-border/60">
                                        <MethodBadge method={tool.method} />
                                        <code className="text-xs font-mono text-foreground/80">{tool.path}</code>
                                        <span className="text-[10px] text-muted-foreground ml-auto">{tool.contentType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* ─── Connected Agents ─── */}
                <TabsContent value="agents" className="pt-6 animate-in fade-in duration-200">
                    <div className="border border-border rounded-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div>
                                <h3 className="text-sm font-medium">Connected Agents</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Widgets currently using this integration.</p>
                            </div>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{integration.widgets?.length || 0}</span>
                        </div>
                        <div className="p-5">
                            {integration.widgets && integration.widgets.length > 0 ? (
                                <div className="space-y-2">
                                    {integration.widgets.map((widget: any) => (
                                        <div
                                            key={widget.id}
                                            className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-border/60"
                                            onClick={() => router.push(`/dashboard/widgets/${widget.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-foreground/5 rounded-full flex items-center justify-center text-xs font-semibold text-foreground/70">
                                                    {widget.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{widget.name}</p>
                                                    <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-sm">{widget.systemPrompt}</p>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">No agents connected</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Connect this integration to a widget to start using it.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ─── Usage Logs ─── */}
                <TabsContent value="usage" className="pt-6 animate-in fade-in duration-200">
                    <div className="border border-border rounded-lg">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <div>
                                <h3 className="text-sm font-medium">Execution History</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Recent tool executions for this integration.</p>
                            </div>
                            {logs && logs.length > 0 && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                                    ● Live
                                </span>
                            )}
                        </div>
                        <div className="p-0">
                            {isLoadingLogs ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : logs && logs.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="text-[10px] uppercase tracking-wider font-medium">Time</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-medium">Tool</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-medium">Status</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-medium">Latency</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-wider font-medium text-right">Tokens</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log: any) => (
                                            <TableRow key={log.id} className="hover:bg-muted/30">
                                                <TableCell className="text-xs text-muted-foreground font-mono">
                                                    {format(new Date(log.createdAt), "HH:mm:ss, MMM d")}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono">
                                                    {log.tool?.path || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {log.status === "SUCCESS" ? (
                                                        <span className="text-[10px] font-semibold text-emerald-600">OK</span>
                                                    ) : (
                                                        <span className="text-[10px] font-semibold text-red-600">FAIL</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{log.latencyMs}ms</TableCell>
                                                <TableCell className="text-right text-xs font-mono text-muted-foreground">{log.tokensUsed || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">No logs yet</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Logs will appear once tools are executed by an agent.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* ─── Configuration ─── */}
                <TabsContent value="settings" className="pt-6 space-y-6 animate-in fade-in duration-200">
                    {isEditing ? (
                        /* ─── Editable Configuration ─── */
                        <>
                            {/* Connection section */}
                            <div className="border border-border rounded-lg p-5 space-y-4">
                                <h3 className="text-sm font-medium">Connection</h3>
                                <div className="flex items-baseline gap-6 py-2.5">
                                    <span className="text-xs text-muted-foreground w-28 shrink-0 uppercase tracking-wide font-medium">Base URL</span>
                                    <div className="flex-1 relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <Input
                                            className="h-8 pl-9 text-xs font-mono border-border"
                                            value={formData?.config?.baseUrl || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                config: { ...formData.config, baseUrl: e.target.value }
                                            })}
                                            placeholder="https://api.example.com/v1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* REST Tools — editable */}
                            {formData?.restTools?.map((tool: any, toolIndex: number) => (
                                <div key={toolIndex} className="border border-border rounded-lg overflow-hidden">
                                    {/* Tool header — editable */}
                                    <div className="px-5 py-4 bg-muted/20 border-b border-border space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            <div className="md:col-span-3 space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Method</Label>
                                                <Select
                                                    value={tool.method}
                                                    onValueChange={(val) => updateToolField(toolIndex, "method", val)}
                                                >
                                                    <SelectTrigger className="h-9 text-sm border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="GET">GET</SelectItem>
                                                        <SelectItem value="POST">POST</SelectItem>
                                                        <SelectItem value="PUT">PUT</SelectItem>
                                                        <SelectItem value="PATCH">PATCH</SelectItem>
                                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="md:col-span-5 space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Endpoint Path</Label>
                                                <Input
                                                    className="h-9 text-sm font-mono border-border"
                                                    value={tool.path}
                                                    onChange={(e) => updateToolField(toolIndex, "path", e.target.value)}
                                                    placeholder="/v1/resource"
                                                />
                                            </div>
                                            <div className="md:col-span-4 space-y-1.5">
                                                <Label className="text-xs text-muted-foreground">Content Type</Label>
                                                <Select
                                                    value={tool.contentType}
                                                    onValueChange={(val) => updateToolField(toolIndex, "contentType", val)}
                                                >
                                                    <SelectTrigger className="h-9 text-sm border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="application/json">application/json</SelectItem>
                                                        <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                                                        <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateToolField(toolIndex, "isActive", !tool.isActive)}
                                                    className={`w-10 h-5 rounded-full relative transition-colors ${tool.isActive ? "bg-emerald-500" : "bg-border"}`}
                                                >
                                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${tool.isActive ? "left-5" : "left-0.5"}`} />
                                                </button>
                                                <span className="text-xs text-muted-foreground">{tool.isActive ? "Active" : "Disabled"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-8">
                                        {/* Request Config — editable */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                                                <ArrowRight className="w-3 h-3" />
                                                Request
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <PropertyEditor
                                                    title="Query Parameters"
                                                    schema={tool.requestConfig.queryParams}
                                                    onChange={(s) => updateToolRequestConfig(toolIndex, "queryParams", s)}
                                                />
                                                <PropertyEditor
                                                    title="Body Schema"
                                                    showValue={true}
                                                    schema={tool.requestConfig.body?.schema}
                                                    onChange={(s) => updateToolRequestConfig(toolIndex, "body", { ...tool.requestConfig.body, schema: s })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                                <PropertyEditor
                                                    title="Path Parameters"
                                                    showValue={true}
                                                    schema={tool.requestConfig.pathParams}
                                                    onChange={(s) => updateToolRequestConfig(toolIndex, "pathParams", s)}
                                                />
                                                <PropertyEditor
                                                    title="Headers"
                                                    showValue={true}
                                                    schema={tool.requestConfig.headers}
                                                    onChange={(s) => updateToolRequestConfig(toolIndex, "headers", s)}
                                                />
                                                <PropertyEditor
                                                    title="Cookies"
                                                    showValue={true}
                                                    schema={tool.requestConfig.cookies}
                                                    onChange={(s) => updateToolRequestConfig(toolIndex, "cookies", s)}
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-border/60" />

                                        {/* Response Config — editable */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                                                <ArrowLeft className="w-3 h-3" />
                                                Response
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Data Path</Label>
                                                    <Input
                                                        className="h-8 text-xs font-mono border-border"
                                                        value={tool.responseConfig.dataPath}
                                                        onChange={(e) => updateToolResponseConfig(toolIndex, "dataPath", e.target.value)}
                                                        placeholder="e.g. data.results"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Error Path</Label>
                                                    <Input
                                                        className="h-8 text-xs font-mono border-border"
                                                        value={tool.responseConfig.errorPath}
                                                        onChange={(e) => updateToolResponseConfig(toolIndex, "errorPath", e.target.value)}
                                                        placeholder="e.g. error.message"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-muted-foreground">Success Status Codes</Label>
                                                    <Input
                                                        className="h-8 text-xs font-mono border-border"
                                                        value={tool.responseConfig.successStatusCodes?.join(", ") || ""}
                                                        onChange={(e) => updateToolResponseConfig(toolIndex, "successStatusCodes",
                                                            e.target.value.split(",").map((v: string) => parseInt(v.trim())).filter((v: number) => !isNaN(v))
                                                        )}
                                                        placeholder="200, 201"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3 pt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateToolResponseConfig(toolIndex, "strictValidation", !tool.responseConfig.strictValidation)}
                                                        className={`w-10 h-5 rounded-full relative transition-colors ${tool.responseConfig.strictValidation ? "bg-foreground" : "bg-border"}`}
                                                    >
                                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${tool.responseConfig.strictValidation ? "left-5" : "left-0.5"}`} />
                                                    </button>
                                                    <span className="text-xs text-muted-foreground">Strict Validation</span>
                                                </div>
                                            </div>
                                            <PropertyEditor
                                                title="Response Schema"
                                                schema={tool.responseConfig.responseSchema}
                                                onChange={(s) => updateToolResponseConfig(toolIndex, "responseSchema", s)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData?.restTools?.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                    <Settings className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">No tools configured</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">This integration has no REST tools set up yet.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ─── Read-only Configuration ─── */
                        <>
                            {/* Connection */}
                            <div className="border border-border rounded-lg p-5">
                                <h3 className="text-sm font-medium mb-3">Connection</h3>
                                <DetailRow label="Base URL" value={
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <code className="font-mono text-xs">{integration.config?.baseUrl || "—"}</code>
                                    </span>
                                } />
                                {integration.config?.headers && Object.keys(integration.config.headers).length > 0 && (
                                    <div className="mt-4">
                                        <PropertyTable
                                            title="Global Headers"
                                            icon={<Code2 className="w-3.5 h-3.5 text-muted-foreground" />}
                                            properties={integration.config.headers}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* REST Tools */}
                            {restTools.map((tool: any, toolIndex: number) => (
                                <div key={tool.id} className="border border-border rounded-lg overflow-hidden">
                                    {/* Tool header */}
                                    <div className="flex items-center gap-3 px-5 py-4 bg-muted/20 border-b border-border">
                                        <MethodBadge method={tool.method} />
                                        <code className="text-sm font-mono text-foreground/90">{tool.path}</code>
                                        <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <FileJson className="w-3 h-3" />
                                                {tool.contentType}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {tool.requestConfig?.timeoutMs ? `${tool.requestConfig.timeoutMs / 1000}s` : "30s"}
                                            </span>
                                            {tool.isActive ? (
                                                <span className="text-emerald-600 font-medium">Active</span>
                                            ) : (
                                                <span className="text-amber-600 font-medium">Disabled</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="p-5 space-y-6">
                                        {/* Request Config */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                                                <ArrowRight className="w-3 h-3" />
                                                Request
                                            </h4>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <PropertyTable
                                                    title="Query Parameters"
                                                    icon={<Hash className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    properties={tool.requestConfig?.queryParams?.properties}
                                                />
                                                <PropertyTable
                                                    title="Path Parameters"
                                                    icon={<Link2 className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    properties={tool.requestConfig?.pathParams?.properties}
                                                />
                                                <PropertyTable
                                                    title="Headers"
                                                    icon={<Code2 className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    properties={tool.requestConfig?.headers?.properties}
                                                />
                                                <PropertyTable
                                                    title="Cookies"
                                                    icon={<Cookie className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    properties={tool.requestConfig?.cookies?.properties}
                                                />
                                                <PropertyTable
                                                    title="Body Schema"
                                                    icon={<FileJson className="w-3.5 h-3.5 text-muted-foreground" />}
                                                    properties={tool.requestConfig?.body?.schema?.properties}
                                                />
                                            </div>
                                            {/* No request config note */}
                                            {(!tool.requestConfig?.queryParams?.properties || Object.keys(tool.requestConfig.queryParams.properties).length === 0) &&
                                                (!tool.requestConfig?.pathParams?.properties || Object.keys(tool.requestConfig.pathParams.properties).length === 0) &&
                                                (!tool.requestConfig?.headers?.properties || Object.keys(tool.requestConfig.headers.properties).length === 0) &&
                                                (!tool.requestConfig?.cookies?.properties || Object.keys(tool.requestConfig.cookies.properties).length === 0) &&
                                                (!tool.requestConfig?.body?.schema?.properties || Object.keys(tool.requestConfig.body.schema.properties).length === 0) && (
                                                    <p className="text-xs text-muted-foreground/60 italic py-4 text-center">No request parameters configured.</p>
                                                )}
                                        </div>

                                        <div className="border-t border-border/60" />

                                        {/* Response Config */}
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                                                <ArrowLeft className="w-3 h-3" />
                                                Response
                                            </h4>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                                                <div className="bg-muted/30 rounded-md px-3 py-2.5 border border-border/60">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Data Path</p>
                                                    <code className="text-xs font-mono mt-1 block text-foreground/80">{tool.responseConfig?.dataPath || "—"}</code>
                                                </div>
                                                <div className="bg-muted/30 rounded-md px-3 py-2.5 border border-border/60">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Error Path</p>
                                                    <code className="text-xs font-mono mt-1 block text-foreground/80">{tool.responseConfig?.errorPath || "—"}</code>
                                                </div>
                                                <div className="bg-muted/30 rounded-md px-3 py-2.5 border border-border/60">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Success Codes</p>
                                                    <p className="text-xs font-mono mt-1 text-foreground/80">{tool.responseConfig?.successStatusCodes?.join(", ") || "—"}</p>
                                                </div>
                                                <div className="bg-muted/30 rounded-md px-3 py-2.5 border border-border/60">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Strict Mode</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        {tool.responseConfig?.strictValidation ? (
                                                            <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">Enabled</span></>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Disabled</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <PropertyTable
                                                title="Response Schema"
                                                icon={<FileJson className="w-3.5 h-3.5 text-muted-foreground" />}
                                                properties={tool.responseConfig?.responseSchema?.properties}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {restTools.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                    <Settings className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">No tools configured</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">This integration has no REST tools set up yet.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Edit button at bottom of config tab when not editing */}
                    {!isEditing && (
                        <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={enterEditMode} className="text-xs h-8">
                                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                Edit Configuration
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default IntegrationDetails;
