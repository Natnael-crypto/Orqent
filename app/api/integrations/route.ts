import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { integrationService } from '@/services/IntegrationService';
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
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;
        const type = searchParams.get('type') || undefined;

        const result = await integrationService.getIntegrations(user.id, page, limit, search, status, type);

        return NextResponse.json(result);
    } catch (error: unknown) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const integration = await integrationService.createIntegration(user.id, body);

        return NextResponse.json(integration, { status: 201 });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
