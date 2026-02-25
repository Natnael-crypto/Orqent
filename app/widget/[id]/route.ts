import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const widgetId = id.replace('.js', '');

    try {
        const widget = await prisma.widget.findUnique({
            where: { id: widgetId },
            include: { uiCustomization: true }
        });

        if (!widget) {
            return new NextResponse('Widget not found', { status: 404 });
        }

        // Read the template
        const templatePath = path.join(process.cwd(), 'public', 'widget', 'widget-template.js');
        const script = fs.readFileSync(templatePath, 'utf8');

        // Prepare context-specific config
        const ui = widget.uiCustomization;
        const config = {
            primaryColor: ui?.primaryColor || '#000000',
            backgroundColor: ui?.backgroundColor || '#ffffff',
            agentName: ui?.agentName || 'AI Assistant',
            welcomeMessage: ui?.welcomeMessage || 'Hello! How can I help you?',
            agentAvatarUrl: ui?.agentAvatarUrl || null,
            borderRadius: ui?.borderRadius || 8,
            fontSize: ui?.fontSize || 14,
            widgetId: widget.id,
            wsUrl: process.env.NEXT_PUBLIC_WS_URL || (process.env.NODE_ENV === 'development' ? 'ws://localhost:3000/ws' : `wss://${request.headers.get('host')}/ws`)
        };

        // Simplified injection: Prepend config and send
        const finalScript = `
window.VELORA_CONFIG = ${JSON.stringify(config)};
${script}
        `;

        return new NextResponse(finalScript, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error: unknown) {
        console.error('Error serving widget script:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
