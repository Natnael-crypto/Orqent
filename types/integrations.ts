import { Integration as PrismaIntegration } from "@prisma/client";
import { RestApiConfigSchema, RestToolSchema } from "@/lib/validation";
import { z } from "zod";

export type IntegrationType = "REST_API";
export type IntegrationStatus = "ACTIVE" | "INACTIVE" | "ERROR" | "DELETED";

export type Integration = PrismaIntegration;

export type RestApiConfig = z.infer<typeof RestApiConfigSchema>;

export type RestTool = z.infer<typeof RestToolSchema>;

export interface IntegrationRequest {
    name: string;
    type: IntegrationType;
    description?: string;
    config: RestApiConfig;
    restTools?: RestTool[];
}
