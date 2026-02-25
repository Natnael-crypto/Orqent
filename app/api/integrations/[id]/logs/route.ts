import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { integrationService } from '@/services/IntegrationService';
import { handleApiError } from '@/lib/api-error';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const logs = await integrationService.getIntegrationLogs(user.id, params.id, limit);

        return NextResponse.json(logs);
    } catch (error) {
        return handleApiError(error);
    }
}
