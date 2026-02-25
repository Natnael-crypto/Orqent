import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { conversationService } from '@/services/ConversationService';
import { handleApiError } from '@/lib/api-error';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const conversation = await conversationService.getConversationById(user.id, id);

        return NextResponse.json(conversation);
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
