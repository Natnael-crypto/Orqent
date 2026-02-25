import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

// Extend WebSocket type for heartbeat
interface ExtendedWebSocket extends WebSocket {
    isAlive?: boolean;
}

const wss = new WebSocketServer({ port: 8080 });
const PING_INTERVAL = 30000; // 30 seconds

console.log('WebSocket server for Chat Widget started on port 8080');

// Simple cache for widget configurations to reduce DB load (LRU could be better for 100K users)
const widgetCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

// Store connection info: socket -> { widgetId, conversationId, visitorId }
const socketInfo = new WeakMap<WebSocket, { widgetId: string; conversationId: string; visitorId: string }>();

// Heartbeat mechanism
const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, PING_INTERVAL);

wss.on('close', () => {
    clearInterval(interval);
});

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
        // Get widget from cache or DB
        let widget = widgetCache.get(widgetId)?.data;
        const now = Date.now();

        if (!widget || (now - widgetCache.get(widgetId)!.timestamp > CACHE_TTL)) {
            widget = await (prisma as any).widget.findUnique({
                where: { id: widgetId },
                include: { allowedDomains: true, uiCustomization: true }
            });
            if (widget) {
                widgetCache.set(widgetId, { data: widget, timestamp: now });
            }
        }

        if (!widget) {
            ws.close(1008, 'Invalid widgetId');
            return;
        }

        // Domain verification logic (in production, check req.headers.origin or Referer)
        const origin = req.headers.origin || req.headers.referer;
        if (origin && widget.allowedDomains.length > 0) {
            const isAllowed = widget.allowedDomains.some((ad: any) => origin.includes(ad.domain));
            if (!isAllowed) {
                ws.close(1008, 'Domain not allowed');
                return;
            }
        }

        // Initialize or get conversation
        let conversation: any = null;

        // Requirement: "if there is no conversation iD in the query if there is load the message"
        if (conversationIdParam) {
            conversation = await (prisma as any).conversation.findUnique({
                where: { id: conversationIdParam },
                include: { messages: { orderBy: { createdAt: 'asc' }, take: 50 } }
            });

            // Security check: ensure same visitor and widget
            if (conversation && (conversation.widgetId !== widgetId || conversation.visitorId !== visitorId)) {
                conversation = null;
            }
        }

        // Create new if none found or none provided
        if (!conversation) {
            conversation = await (prisma as any).conversation.create({
                data: {
                    widgetId,
                    visitorId: visitorId as string,
                    metadata: {
                        userAgent: req.headers['user-agent'],
                        ip: req.socket.remoteAddress
                    }
                },
                include: { messages: true }
            });
        }

        socketInfo.set(ws, { widgetId, conversationId: conversation.id, visitorId });

        // Send history and welcome info
        ws.send(JSON.stringify({
            type: 'history',
            messages: conversation.messages || [],
            conversationId: conversation.id,
            visitorId,
            config: widget.uiCustomization ? {
                primaryColor: widget.uiCustomization.primaryColor,
                backgroundColor: widget.uiCustomization.backgroundColor,
                agentName: widget.uiCustomization.agentName,
                welcomeMessage: widget.uiCustomization.welcomeMessage,
                borderRadius: `${widget.uiCustomization.borderRadius}px`,
                fontSize: `${widget.uiCustomization.fontSize}px`,
                agentAvatarUrl: widget.uiCustomization.agentAvatarUrl
            } : null
        }));

        ws.on('message', async (data) => {
            try {
                const payload = JSON.parse(data.toString());
                const info = socketInfo.get(ws);

                if (!info) return;

                if (payload.type === 'message') {
                    // Save user message
                    const userMessage = await (prisma as any).message.create({
                        data: {
                            conversationId: info.conversationId,
                            role: 'user',
                            content: payload.content
                        }
                    });

                    // Update conversation last message & timestamp
                    await (prisma as any).conversation.update({
                        where: { id: info.conversationId },
                        data: { lastMessage: payload.content, updatedAt: new Date() }
                    });

                    // Acknowledgement
                    ws.send(JSON.stringify({
                        type: 'message',
                        id: userMessage.id,
                        role: userMessage.role,
                        content: userMessage.content,
                        createdAt: userMessage.createdAt
                    }));

                    // Typing...
                    ws.send(JSON.stringify({ type: 'typing', status: true }));

                    // Enhanced AI Mockup response
                    setTimeout(async () => {
                        const responses = [
                            `I'm currently in mockup mode. You said: "${payload.content}"`,
                            `Processing your request using ${widget.model || 'GPT-4'}.`,
                            "That's an interesting question! Let me check the details for you.",
                            "I'm here to help. Could you tell me more?"
                        ];
                        const aiResponseContent = responses[Math.floor(Math.random() * responses.length)];

                        const aiMessage = await (prisma as any).message.create({
                            data: {
                                conversationId: info.conversationId,
                                role: 'assistant',
                                content: aiResponseContent
                            }
                        });

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: 'typing', status: false }));
                            ws.send(JSON.stringify({
                                type: 'message',
                                id: aiMessage.id,
                                role: aiMessage.role,
                                content: aiMessage.content,
                                createdAt: aiMessage.createdAt
                            }));
                        }
                    }, 1000 + Math.random() * 1000);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                ws.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
            }
        });

    } catch (error) {
        console.error('Connection error:', error);
        ws.close(1011, 'Internal server error');
    }
});
