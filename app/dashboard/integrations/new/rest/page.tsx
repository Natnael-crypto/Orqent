"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIntegrationActions } from "@/hooks/useIntegrations";
import {
    ChevronLeft,
    Loader2,
    Plus,
    Trash2,
    Settings2,
    Globe,
    FileJson,
    Save,
    X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
    const properties = schema.properties || {};

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

const steps = ["General Info", "Tool Setup", "Request Schema", "Response Schema", "LLM Preview"];

const CreateRestIntegration = () => {
    const router = useRouter();
    const { createIntegration } = useIntegrationActions();
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "REST_API" as const,
        config: {
            baseUrl: "",
            headers: {}
        },
        restTools: [{
            method: "GET",
            path: "/",
            contentType: "application/json",
            headers: {},
            requestConfig: {
                pathParams: { type: "object", properties: {} },
                queryParams: { type: "object", properties: {} },
                headers: { type: "object", properties: {} },
                cookies: { type: "object", properties: {} },
                body: { type: "JSON", schema: { type: "object", properties: {} } },
                timeoutMs: 30000
            },
            responseConfig: {
                successStatusCodes: [200],
                responseSchema: { type: "object", properties: {} },
                dataPath: "",
                errorPath: "",
                strictValidation: false
            },
            requiresConfirmation: false,
            isActive: true
        }]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createIntegration.mutate(formData);
    };

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const updateTool = (field: string, value: any) => {
        const newRestTools = [...formData.restTools];
        (newRestTools[0] as any)[field] = value;
        setFormData({ ...formData, restTools: newRestTools });
    };

    const updateRequestConfig = (field: string, value: any) => {
        const newRestTools = [...formData.restTools];
        (newRestTools[0].requestConfig as any)[field] = value;
        setFormData({ ...formData, restTools: newRestTools });
    };

    const updateResponseConfig = (field: string, value: any) => {
        const newRestTools = [...formData.restTools];
        (newRestTools[0].responseConfig as any)[field] = value;
        setFormData({ ...formData, restTools: newRestTools });
    };

    const toolDefinition = {
        name: formData.name,
        description: formData.description,
        endpoint: {
            method: formData.restTools[0].method,
            path: formData.restTools[0].path,
        },
        parameters: {
            path: formData.restTools[0].requestConfig.pathParams.properties,
            query: formData.restTools[0].requestConfig.queryParams.properties,
            headers: formData.restTools[0].requestConfig.headers.properties,
            cookies: formData.restTools[0].requestConfig.cookies.properties,
            body: formData.restTools[0].requestConfig.body?.schema.properties,
        },
        response: formData.restTools[0].responseConfig.responseSchema.properties
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="-ml-2 h-8 w-8"
                >
                    <Link href="/dashboard/integrations/new">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-medium tracking-tight">REST API Integration</h1>
                    <p className="text-sm text-muted-foreground mt-1">Connect to any standard JSON API endpoint.</p>
                </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <button
                            onClick={() => setStep(i)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${i === step
                                ? "bg-foreground text-background"
                                : i < step
                                    ? "bg-secondary text-foreground"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                        >
                            {s}
                        </button>
                        {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                    </div>
                ))}
            </div>

            <div className="min-h-[400px]">
                {/* Step 0: Basic Info */}
                {step === 0 && (
                    <div className="max-w-lg space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Integration Name *</Label>
                            <Input
                                required
                                placeholder="e.g., Slack, Hubspot"
                                className="h-9 text-sm border-border rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-ring"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Base API URL *</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    required
                                    type="url"
                                    className="h-9 pl-9 text-sm border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                                    placeholder="https://api.example.com/v1"
                                    value={formData.config.baseUrl}
                                    onChange={(e) => setFormData({ ...formData, config: { ...formData.config, baseUrl: e.target.value } })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Description</Label>
                            <Textarea
                                className="min-h-[100px] resize-none text-sm border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="What can the LLM do with this integration?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Step 1: Tool Setup */}
                {step === 1 && (
                    <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-4 space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Method</Label>
                                <Select
                                    value={formData.restTools[0].method}
                                    onValueChange={(val) => updateTool("method", val)}
                                >
                                    <SelectTrigger className="h-9 text-sm border-border rounded-md bg-background focus:ring-1 focus:ring-ring">
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
                            <div className="md:col-span-8 space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Endpoint Path</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">/</span>
                                    <Input
                                        required
                                        className="h-9 pl-6 font-mono text-sm border-border rounded-md focus:ring-1 focus:ring-ring"
                                        placeholder="v1/resource"
                                        value={formData.restTools[0].path}
                                        onChange={(e) => updateTool("path", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 max-w-sm">
                            <Label className="text-sm text-muted-foreground">Content Strategy</Label>
                            <Select
                                value={formData.restTools[0].contentType}
                                onValueChange={(val) => updateTool("contentType", val)}
                            >
                                <SelectTrigger className="w-full h-9 text-sm border-border rounded-md bg-background focus:ring-1 focus:ring-ring">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                    <SelectItem value="application/json">application/json</SelectItem>
                                    <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                                    <SelectItem value="multipart/form-data">multipart/form-data</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Step 2: Request Schema */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <PropertyEditor
                                title="URL Queries"
                                schema={formData.restTools[0].requestConfig.queryParams}
                                onChange={(s) => updateRequestConfig("queryParams", s)}
                            />
                            <PropertyEditor
                                title="Body Blueprint"
                                showValue={true}
                                schema={formData.restTools[0].requestConfig.body?.schema}
                                onChange={(s) => updateRequestConfig("body", { ...formData.restTools[0].requestConfig.body, schema: s })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <PropertyEditor
                                title="URL Segments"
                                showValue={true}
                                schema={formData.restTools[0].requestConfig.pathParams}
                                onChange={(s) => updateRequestConfig("pathParams", s)}
                            />
                            <PropertyEditor
                                title="Headers"
                                showValue={true}
                                schema={formData.restTools[0].requestConfig.headers}
                                onChange={(s) => updateRequestConfig("headers", s)}
                            />
                            <PropertyEditor
                                title="Cookies"
                                showValue={true}
                                schema={formData.restTools[0].requestConfig.cookies}
                                onChange={(s) => updateRequestConfig("cookies", s)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Response Schema */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Data Pointer</Label>
                                <Input
                                    placeholder="e.g. data.results"
                                    className="h-9 text-sm border-border rounded-md font-mono"
                                    value={formData.restTools[0].responseConfig.dataPath}
                                    onChange={(e) => updateResponseConfig("dataPath", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Error Pointer</Label>
                                <Input
                                    placeholder="e.g. error.message"
                                    className="h-9 text-sm border-border rounded-md font-mono"
                                    value={formData.restTools[0].responseConfig.errorPath}
                                    onChange={(e) => updateResponseConfig("errorPath", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Success Codes</Label>
                                <Input
                                    placeholder="200, 201"
                                    className="h-9 text-sm border-border rounded-md font-mono"
                                    value={formData.restTools[0].responseConfig.successStatusCodes.join(", ")}
                                    onChange={(e) => updateResponseConfig("successStatusCodes", e.target.value.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v)))}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <button
                                    onClick={() => updateResponseConfig("strictValidation", !formData.restTools[0].responseConfig.strictValidation)}
                                    className={`w-10 h-5 rounded-full relative transition-colors \${formData.restTools[0].responseConfig.strictValidation ? "bg-foreground" : "bg-border"}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform \${formData.restTools[0].responseConfig.strictValidation ? "left-5" : "left-0.5"}`} />
                                </button>
                                <span className="text-sm text-muted-foreground">Strict Validation</span>
                            </div>
                        </div>

                        <PropertyEditor
                            title="Response Schema"
                            schema={formData.restTools[0].responseConfig.responseSchema}
                            onChange={(s) => updateResponseConfig("responseSchema", s)}
                        />
                    </div>
                )}

                {/* Step 4: Preview */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">LLM Tool Definition Preview</Label>
                            <pre className="p-4 bg-secondary text-foreground rounded-md text-xs font-mono overflow-x-auto border border-border">
                                {JSON.stringify(toolDefinition, null, 2)}
                            </pre>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={createIntegration.isPending}
                                className="h-10 px-6 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                            >
                                {createIntegration.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Publish integration
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-6 border-t border-border">
                {step > 0 && (
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="h-9 px-4 text-sm rounded-md border-border hover:bg-secondary transition-colors"
                    >
                        Back
                    </Button>
                )}
                {step < steps.length - 1 && (
                    <Button
                        onClick={handleNext}
                        className="h-9 px-4 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    >
                        Continue
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CreateRestIntegration;
