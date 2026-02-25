import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { integrationService } from '@/services/IntegrationService';
import { handleApiError } from '@/lib/api-error';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ids } = await req.json();
        if (!Array.isArray(ids)) {
            return NextResponse.json({ error: 'Invalid input: ids must be an array' }, { status: 400 });
        }

        await integrationService.bulkDeleteIntegrations(user.id, ids);

        return NextResponse.json({ message: 'Integrations deleted successfully' });
    } catch (error) {
        return handleApiError(error);
    }
}
