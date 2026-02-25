

export interface Conversations {
    id: string;
    widgetId: string;
    visitorId: string;
    cost: number;
    totalTokens: number;
    toolExecutions: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Messages {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    tokens: number;
    createdAt: Date;
    updatedAt: Date;
}

