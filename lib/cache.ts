import { redis } from './redis.js';

// ─── Key Factories ───────────────────────────────────────────────────────────
const KEYS = {
    widget: (id: string) => `widget:${id}`,
    conversation: (id: string) => `conv:${id}`,
    messages: (conversationId: string) => `messages:${conversationId}`,
};

// ─── TTLs (seconds) ──────────────────────────────────────────────────────────
const TTL = {
    widget: 300,       // 5 minutes — widget config changes infrequently
    conversation: 600, // 10 minutes
    messages: 1800,    // 30 minutes
};

// ─── Widget Cache ─────────────────────────────────────────────────────────────
export async function getCachedWidget(widgetId: string): Promise<any | null> {
    try {
        return await redis.get(KEYS.widget(widgetId));
    } catch (err) {
        console.error('[Cache] getCachedWidget error:', err);
        return null;
    }
}

export async function setCachedWidget(widget: any): Promise<void> {
    try {
        await redis.set(KEYS.widget(widget.id), widget, { ex: TTL.widget });
    } catch (err) {
        console.error('[Cache] setCachedWidget error:', err);
    }
}

export async function invalidateCachedWidget(widgetId: string): Promise<void> {
    try {
        await redis.del(KEYS.widget(widgetId));
    } catch (err) {
        console.error('[Cache] invalidateCachedWidget error:', err);
    }
}

// ─── Conversation Cache ───────────────────────────────────────────────────────
export async function getCachedConversation(conversationId: string): Promise<any | null> {
    try {
        return await redis.get(KEYS.conversation(conversationId));
    } catch (err) {
        console.error('[Cache] getCachedConversation error:', err);
        return null;
    }
}

export async function setCachedConversation(conversation: any): Promise<void> {
    try {
        // Store without messages array (messages are stored separately)
        const { messages: _messages, ...convData } = conversation;
        await redis.set(KEYS.conversation(conversation.id), convData, { ex: TTL.conversation });
    } catch (err) {
        console.error('[Cache] setCachedConversation error:', err);
    }
}

export async function updateCachedConversationLastMessage(conversationId: string, lastMessage: string): Promise<void> {
    try {
        const conv = await getCachedConversation(conversationId);
        if (conv) {
            conv.lastMessage = lastMessage;
            conv.updatedAt = new Date().toISOString();
            await redis.set(KEYS.conversation(conversationId), conv, { ex: TTL.conversation });
        }
    } catch (err) {
        console.error('[Cache] updateCachedConversationLastMessage error:', err);
    }
}

export async function invalidateCachedConversation(conversationId: string): Promise<void> {
    try {
        await redis.del(KEYS.conversation(conversationId));
    } catch (err) {
        console.error('[Cache] invalidateCachedConversation error:', err);
    }
}

// ─── Messages Cache ───────────────────────────────────────────────────────────
export async function getCachedMessages(conversationId: string): Promise<any[] | null> {
    try {
        const data = await redis.get<any[]>(KEYS.messages(conversationId));
        return data ?? null;
    } catch (err) {
        console.error('[Cache] getCachedMessages error:', err);
        return null;
    }
}

export async function setCachedMessages(conversationId: string, messages: any[]): Promise<void> {
    try {
        await redis.set(KEYS.messages(conversationId), messages, { ex: TTL.messages });
    } catch (err) {
        console.error('[Cache] setCachedMessages error:', err);
    }
}

/**
 * Append a single message to the Redis message list and refresh TTL.
 * Falls back gracefully if the existing cache is missing (cache miss is OK).
 */
export async function appendCachedMessage(conversationId: string, message: any): Promise<void> {
    try {
        const existing = await getCachedMessages(conversationId);
        if (existing !== null) {
            existing.push(message);
            await setCachedMessages(conversationId, existing);
        }
        // If cache miss, we don't populate here — the next connection will re-seed from DB
    } catch (err) {
        console.error('[Cache] appendCachedMessage error:', err);
    }
}

export async function invalidateCachedMessages(conversationId: string): Promise<void> {
    try {
        await redis.del(KEYS.messages(conversationId));
    } catch (err) {
        console.error('[Cache] invalidateCachedMessages error:', err);
    }
}
