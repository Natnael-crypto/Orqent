import { Widget, UICustomization, AllowedDomain, Integration } from "@prisma/client";

export type Widgets = Widget;
export type { UICustomization, AllowedDomain };

// Request types can stay as interfaces or infer from Zod
export interface UICustomizationRequest {
    name: string;
    chatButtonText: string;
    agentName: string;
    welcomeMessage: string;
    primaryColor: string;
    backgroundColor: string;
    borderRadius: number;
    fontSize: number;
    height: number;
    width: number;
    position: string; // "left" | "right"
    chatButtonLogoUrl?: string | null;
    agentAvatarUrl?: string | null;
    showPoweredBy: boolean;
}

export interface WidgetRequest {
    name: string;
    description?: string;
    model: string;
    systemPrompt: string;
    temperature?: number;
    maxTokens?: number;
    uiCustomizationId?: string;
    allowedDomains?: string[];
    integrationIds?: string[];
}

export type WidgetResponse = Widget & {
    uiCustomization: UICustomization | null;
    allowedDomains: AllowedDomain[];
    integrations: Integration[];
}