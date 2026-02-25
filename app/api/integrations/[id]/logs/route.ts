import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { integrationService } from '@/services/IntegrationService';
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
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const logs = await integrationService.getIntegrationLogs(user.id, id, limit);

        return NextResponse.json(logs);
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
