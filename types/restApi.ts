

export type RestAuthentication =
    | { type: "NONE" }
    | { type: "API_KEY"; headerName: string; encryptedValue: string }
    | { type: "BEARER_TOKEN"; encryptedToken: string }
    | {
        type: "OAUTH2";
        clientId: string;
        encryptedClientSecret: string;
        tokenUrl: string;
        encryptedRefreshToken?: string;
        scopes: string[];
    };


export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

export type ContentType =
    | "application/json"
    | "application/x-www-form-urlencoded"
    | "multipart/form-data";

export interface RestTool {
    id: string;
    integrationId: string;

    method: HttpMethod;
    path: string; // /users/{id}

    contentType: ContentType;

    headers?: Record<string, string>; // JSONB

    requestConfig: RestRequestConfig;   // <-- updated
    responseConfig: RestResponseConfig; // <-- updated

    requiresConfirmation?: boolean;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}


export type JsonSchema = {
    type: "object";
    properties: Record<
        string,
        {
            type: string;
            description?: string;
            enum?: string[];
        }
    >;
    required?: string[];
};


export interface RestRequestConfig {
    pathParams?: JsonSchema;
    queryParams?: JsonSchema;
    headers?: JsonSchema;

    body?: RestRequestBodyConfig;

    timeoutMs?: number;
}


export type RestRequestBodyConfig =
    | JsonBodyConfig
    | FormUrlEncodedBodyConfig
    | MultipartBodyConfig;


export interface JsonBodyConfig {
    type: "JSON";
    schema: JsonSchema;
}

export interface FormUrlEncodedBodyConfig {
    type: "FORM_URLENCODED";
    schema: JsonSchema;
}


export interface MultipartBodyConfig {
    type: "MULTIPART";
    schema: JsonSchema;
}


export interface RestResponseConfig {
    successStatusCodes: number[];

    responseSchema?: JsonSchema;

    dataPath?: string;
    // e.g. "data.user" (dot notation)

    errorPath?: string;
    // e.g. "error.message"

    strictValidation?: boolean;
}
