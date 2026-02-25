import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from './lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { AllowedDomain, Message, Conversation, Prisma } from "@prisma/client";

type FullWidget = Prisma.WidgetGetPayload<{
    include: {
        allowedDomains: true,
        uiCustomization: true,
        integrations: {
            include: {
                restTools: true
            }
        }
    }
}>;

type FullConversation = Conversation & { messages?: Message[] };

import {
    getCachedWidget, setCachedWidget,
    getCachedConversation, setCachedConversation, updateCachedConversationLastMessage,
    getCachedMessages, setCachedMessages, appendCachedMessage,
} from './lib/cache.js';

import { runAiAgent, IntegrationWithTools } from './services/ai-agent.js';

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Extend WebSocket type for heartbeat
interface ExtendedWebSocket extends WebSocket {
    isAlive?: boolean;
}

const PING_INTERVAL = 30000; // 30 seconds

// Per-connection metadata
const socketInfo = new WeakMap<WebSocket, {
    widgetId: string;
    conversationId: string;
    visitorId: string;
}>();

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const wss = new WebSocketServer({ noServer: true });

    // ─── Heartbeat ──────────────────────────────────────────────────────────────
    const interval = setInterval(() => {
        wss.clients.forEach((ws: ExtendedWebSocket) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, PING_INTERVAL);

    wss.on('close', () => { clearInterval(interval); });

    // ─── New Connection ──────────────────────────────────────────────────────────
    wss.on('connection', async (ws: ExtendedWebSocket, req) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const widgetId = url.searchParams.get('widgetId');
        const visitorId = url.searchParams.get('visitorId') || uuidv4();
        const conversationIdParam = url.searchParams.get('conversationId');

        if (!widgetId) {
            ws.close(1008, 'Missing widgetId');
            return;
        }

        try {
            // ── 1. Load Widget (Redis → DB fallback) ────────────────────────────
            let widget = await getCachedWidget(widgetId) as FullWidget | null;

            if (!widget) {
                widget = await prisma.widget.findUnique({
                    where: { id: widgetId },
                    include: {
                        allowedDomains: true,
                        uiCustomization: true,
                        integrations: {
                            where: { status: 'ACTIVE' },
                            include: {
                                restTools: {
                                    where: { isActive: true },
                                },
                            },
                        },
                    },
                });

                if (widget) {
                    await setCachedWidget(widget);
                }
            }

            if (!widget) {
                ws.close(1008, 'Invalid widgetId');
                return;
            }

            // ── 2. Domain Verification ──────────────────────────────────────────
            const origin = req.headers.origin || req.headers.referer;
            if (origin && widget.allowedDomains && widget.allowedDomains.length > 0) {
                const isAllowed = widget.allowedDomains.some((ad: AllowedDomain) => origin.includes(ad.domain));
                if (!isAllowed) {
                    ws.close(1008, 'Domain not allowed');
                    return;
                }
            }

            // ── 3. Load or Create Conversation ──────────────────────────────────
            let conversation: (Conversation & { messages?: Message[] }) | null = null;
            let messages: Message[] = [];

            if (conversationIdParam) {
                // Try Redis first
                conversation = await getCachedConversation(conversationIdParam);
                const cachedMessages = await getCachedMessages(conversationIdParam);

                if (conversation && cachedMessages !== null) {
                    messages = cachedMessages;
                } else {
                    // Cache miss → fetch from DB
                    conversation = await prisma.conversation.findUnique({
                        where: { id: conversationIdParam },
                        include: { messages: { orderBy: { createdAt: 'asc' }, take: 100 } },
                    });

                    if (conversation) {
                        // Security: must belong to same widget + visitor
                        if (conversation.widgetId !== widgetId || conversation.visitorId !== visitorId) {
                            conversation = null;
                        } else {
                            messages = conversation.messages ?? [];
                            // Seed cache
                            await Promise.all([
                                setCachedConversation(conversation),
                                setCachedMessages(conversation.id, messages),
                            ]);
                        }
                    }
                }
            }

            // No existing conversation found → create one
            if (!conversation) {
                // Get welcome message from widget config or use fallback
                const welcomeMessage = widget.uiCustomization?.welcomeMessage || 'Hello! How can I help you?';

                conversation = await prisma.conversation.create({
                    data: {
                        widgetId,
                        visitorId: visitorId as string,
                        metadata: {
                            userAgent: req.headers['user-agent'],
                            ip: req.socket.remoteAddress,
                        },
                        // Set the welcome message as the last message
                        lastMessage: welcomeMessage,
                        messages: {
                            create: {
                                role: 'assistant',
                                content: welcomeMessage,
                            }
                        },
                    },
                    include: {
                        messages: true,
                    }
                });

                messages = conversation.messages || [];

                // Seed cache for new conversation
                await Promise.all([
                    setCachedConversation(conversation),
                    setCachedMessages(conversation.id, messages),
                ]);
            }

            socketInfo.set(ws, { widgetId, conversationId: conversation.id, visitorId });

            // ── 4. Send History + Widget Config ─────────────────────────────────
            ws.send(JSON.stringify({
                type: 'history',
                messages,
                conversationId: conversation.id,
                visitorId,
                config: widget.uiCustomization ? {
                    primaryColor: widget.uiCustomization.primaryColor,
                    backgroundColor: widget.uiCustomization.backgroundColor,
                    agentName: widget.uiCustomization.agentName,
                    welcomeMessage: widget.uiCustomization.welcomeMessage,
                    borderRadius: `${widget.uiCustomization.borderRadius}px`,
                    fontSize: `${widget.uiCustomization.fontSize}px`,
                    agentAvatarUrl: widget.uiCustomization.agentAvatarUrl,
                    chatButtonText: widget.uiCustomization.chatButtonText,
                    chatButtonLogoUrl: widget.uiCustomization.chatButtonLogoUrl,
                    showPoweredBy: widget.uiCustomization.showPoweredBy,
                    position: widget.uiCustomization.position,
                    height: widget.uiCustomization.height,
                    width: widget.uiCustomization.width,
                } : null,
            }));

            // ── 5. Message Handler ───────────────────────────────────────────────
            ws.on('message', async (data) => {
                try {
                    const payload = JSON.parse(data.toString());
                    const info = socketInfo.get(ws);
                    if (!info) return;

                    if (payload.type === 'message') {
                        const content = payload.content?.trim();
                        if (!content) return;

                        // ── 5a. Persist user message to DB ───────────────────────
                        const userMessage = await prisma.message.create({
                            data: {
                                conversationId: info.conversationId,
                                role: 'user',
                                content,
                            },
                        });

                        // ── 5b. Update conversation lastMessage in DB ─────────────
                        await prisma.conversation.update({
                            where: { id: info.conversationId },
                            data: { lastMessage: content, updatedAt: new Date() },
                        });

                        // ── 5c. Sync cache ────────────────────────────────────────
                        await Promise.all([
                            appendCachedMessage(info.conversationId, userMessage),
                            updateCachedConversationLastMessage(info.conversationId, content),
                        ]);

                        // ── 5d. Echo user message back to client ──────────────────
                        ws.send(JSON.stringify({
                            type: 'message',
                            id: userMessage.id,
                            role: 'user',
                            content: userMessage.content,
                            createdAt: userMessage.createdAt,
                        }));

                        // ── 5e. Typing indicator ──────────────────────────────────
                        ws.send(JSON.stringify({ type: 'typing', status: true }));

                        // ── 5f. Build conversation history for AI ─────────────────
                        // Fetch current messages from cache (includes the one we just added)
                        const cachedMsgs = await getCachedMessages(info.conversationId);
                        const historyForAi = (cachedMsgs ?? [])
                            .filter((m: Message) => m.role === 'user' || m.role === 'assistant')
                            .slice(-12) // Optimize context: keep last 12 turns (6 user/assistant pairs)
                            .map((m: Message) => ({ role: m.role, content: m.content }));

                        // Remove the last entry (the new user message) since runAiAgent adds it
                        const conversationHistory = historyForAi.slice(0, -1);

                        // Re-fetch widget from cache (may include integrations if cached as full object)
                        const widgetWithIntegrations = (await getCachedWidget(info.widgetId) as FullWidget | null) ?? widget;

                        // ── 5g. Run Groq AI Agent ─────────────────────────────────
                        try {
                            const aiResult = await runAiAgent({
                                systemPrompt: widgetWithIntegrations.systemPrompt,
                                model: widgetWithIntegrations.model,
                                temperature: widgetWithIntegrations.temperature,
                                maxTokens: widgetWithIntegrations.maxTokens,
                                conversationHistory,
                                userMessage: content,
                                integrations: widgetWithIntegrations.integrations as unknown as IntegrationWithTools[] ?? [],
                                conversationId: info.conversationId,
                                // ── Progress callback: notify client when a tool is being called
                                onToolCall: (toolName, args) => {
                                    if (ws.readyState === WebSocket.OPEN) {
                                        ws.send(JSON.stringify({
                                            type: 'tool_call',
                                            toolName,
                                            args,
                                        }));
                                    }
                                },
                            });

                            // ── 5h. Persist AI response to DB ─────────────────────
                            const aiMessage = await prisma.message.create({
                                data: {
                                    conversationId: info.conversationId,
                                    role: 'assistant',
                                    content: aiResult.content,
                                    metadata: {
                                        model: aiResult.model,
                                        toolCallsExecuted: aiResult.toolCallsExecuted,
                                    },
                                },
                            });

                            // ── 5i. Update conversation with AI response in DB ─────
                            await prisma.conversation.update({
                                where: { id: info.conversationId },
                                data: { lastMessage: aiResult.content, updatedAt: new Date() },
                            });

                            // ── 5j. Sync cache ────────────────────────────────────
                            await Promise.all([
                                appendCachedMessage(info.conversationId, aiMessage),
                                updateCachedConversationLastMessage(info.conversationId, aiResult.content),
                            ]);

                            // ── 5k. Send AI response to client ────────────────────
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ type: 'typing', status: false }));
                                ws.send(JSON.stringify({
                                    type: 'message',
                                    id: aiMessage.id,
                                    role: 'assistant',
                                    content: aiMessage.content,
                                    createdAt: aiMessage.createdAt,
                                }));
                            }
                        } catch (aiError) {
                            const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
                            console.error('[AI Agent] Error:', errorMessage);

                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ type: 'typing', status: false }));
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    message: 'The AI agent encountered an error. Please try again.',
                                }));
                            }
                        }
                    }
                } catch (error: unknown) {
                    console.error('[WS] Error handling message:', error);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
                    }
                }
            });

        } catch (error: unknown) {
            console.error('[WS] Connection error:', error);
            ws.close(1011, 'Internal server error');
        }
    });

    // ─── WebSocket Upgrade Routing ───────────────────────────────────────────────
    server.on('upgrade', (request, socket, head) => {
        const { pathname } = parse(request.url!);
        if (pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
        // All other upgrades (HMR etc.) pass through to Next.js
    });

    wss.on('error', (err) => { console.error('[WS] Server error:', err); });
    server.on('error', (err) => {
        console.error('[HTTP] Server error:', err);
        process.exit(1);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket handler active at ws://${hostname}:${port}/ws`);
        console.log(`> Groq AI Agent: ENABLED`);
        console.log(`> Redis Cache: ENABLED (Upstash)`);
    });
});
