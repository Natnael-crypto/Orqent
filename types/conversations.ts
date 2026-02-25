
export interface Conversations {
    id: string;
    widgetId: string;
    visitorId: string | null;
    cost: number;
    totalTokens: number;
    toolExecutions: number;
    createdAt: string;
    updatedAt: string;
}

export interface Messages {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    tokens: number;
    createdAt: string;
    updatedAt: string;
}

export interface FullConversation extends Conversations {
    widget: {
        id: string;
        name: string;
    };
    messages: Messages[];
    metadata: Record<string, unknown> | null;
    externalId: string | null;
}

export interface ConversationSummary extends Conversations {
    lastMessage: string | null;
    widget: {
        name: string;
    };
}
