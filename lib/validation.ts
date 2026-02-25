import { z } from "zod";

// --- Users ---
export const UserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    companyName: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const UserUpdateSchema = UserSchema.partial();

// --- Widgets ---
export const WidgetValuesSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    model: z.string().default("gpt-4"),
    systemPrompt: z.string().min(1, "System prompt is required"),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().int().positive().default(1000),
    uiCustomizationId: z.string().uuid().optional(),
    allowedDomains: z.array(z.string()).optional(),
    integrationIds: z.array(z.string().uuid()).optional(),
});

export const UICustomizationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    chatButtonText: z.string().default("Chat"),
    agentName: z.string().default("AI Assistant"),
    welcomeMessage: z.string().default("Hello! How can I help you?"),
    primaryColor: z.string().default("#000000"),
    backgroundColor: z.string().default("#ffffff"),
    borderRadius: z.number().int().min(0).default(8),
    fontSize: z.number().int().min(10).default(16),
    height: z.number().int().min(100).default(600),
    width: z.number().int().min(100).default(400),
    position: z.enum(["left", "right"]).default("right"),
    chatButtonLogoUrl: z.string().optional().nullable(),
    agentAvatarUrl: z.string().optional().nullable(),
    showPoweredBy: z.boolean().default(true),
});

// --- Integrations ---
export const JsonSchemaPropertySchema = z.object({
    type: z.enum(["string", "number", "boolean", "integer"]),
    description: z.string().optional(),
    enum: z.array(z.string()).optional(),
});

// For properties that carry a static value (cookies, headers, path params)
export const ValuePropertySchema = z.object({
    value: z.string().optional(),
    description: z.string().optional(),
});

export const JsonSchemaSchema = z.object({
    type: z.literal("object"),
    properties: z.record(z.string(), JsonSchemaPropertySchema),
    required: z.array(z.string()).optional(),
});

export const ValueSchemaSchema = z.object({
    type: z.literal("object"),
    properties: z.record(z.string(), ValuePropertySchema),
    required: z.array(z.string()).optional(),
});

export const RestRequestBodyConfigSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("JSON"), schema: JsonSchemaSchema }),
    z.object({ type: z.literal("FORM_URLENCODED"), schema: JsonSchemaSchema }),
    z.object({ type: z.literal("MULTIPART"), schema: JsonSchemaSchema }),
]);

export const RestRequestConfigSchema = z.object({
    pathParams: ValueSchemaSchema.optional(),
    queryParams: JsonSchemaSchema.optional(),
    headers: ValueSchemaSchema.optional(),
    cookies: ValueSchemaSchema.optional(),
    body: RestRequestBodyConfigSchema.optional(),
    timeoutMs: z.number().int().positive().optional().default(30000),
});

export const RestResponseConfigSchema = z.object({
    successStatusCodes: z.array(z.number().int()).min(1, "At least one success status code is required"),
    responseSchema: JsonSchemaSchema.optional(),
    dataPath: z.string().optional(),
    errorPath: z.string().optional(),
    strictValidation: z.boolean().optional().default(false),
});

export const RestApiConfigSchema = z.object({
    baseUrl: z.string().url("Invalid URL"),
    headers: z.record(z.string(), z.string()).optional(),
});

export const RestToolSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
    path: z.string().startsWith("/", "Path must start with /"),
    contentType: z.enum(["application/json", "application/x-www-form-urlencoded", "multipart/form-data"]).default("application/json"),
    headers: z.record(z.string(), z.string()).optional(),
    requestConfig: RestRequestConfigSchema,
    responseConfig: RestResponseConfigSchema,
    requiresConfirmation: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
});

export const IntegrationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.literal("REST_API"),
    description: z.string().optional(),
    config: RestApiConfigSchema,
    restTools: z.array(RestToolSchema).optional(),
});
