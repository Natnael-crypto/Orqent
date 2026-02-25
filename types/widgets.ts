import { Integration } from "@/hooks/services/integrationService";
export type { Integration };

export interface UiCustomization {
    id: string;
    userId: string;
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
    position: "left" | "right";
    chatButtonLogoUrl?: string | null;
    agentAvatarUrl?: string | null;
    showPoweredBy: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Widget {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    status: "ACTIVE" | "PAUSED" | "DRAFT";
    uiCustomizationId: string | null;
    uiCustomization?: UiCustomization;
    allowedDomains: { id: string; domain: string }[];
    integrations: Integration[];
    createdAt: string;
    updatedAt: string;
}

export interface WidgetFormData {
    name: string;
    description: string;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    uiCustomizationId: string;
    allowedDomains: string[];
    integrationIds: string[];
}