import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { conversationService } from '@/services/ConversationService';
import { handleApiError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const widgetId = searchParams.get('widgetId') || undefined;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;

        const result = await conversationService.getConversations(user.id, {
            page,
            limit,
            widgetId,
            startDate,
            endDate,
        });

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error);
    }
}
