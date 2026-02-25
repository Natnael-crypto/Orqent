import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { integrationService } from '@/services/IntegrationService';
import { handleApiError } from '@/lib/api-error';

// GET /api/integrations/[id]
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
        const integration = await integrationService.getIntegrationById(user.id, id);

        return NextResponse.json(integration);
    } catch (error: unknown) {
        return handleApiError(error);
    }
}

// PATCH /api/integrations/[id]
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const updated = await integrationService.updateIntegration(user.id, id, body);

        return NextResponse.json(updated);
    } catch (error: unknown) {
        return handleApiError(error);
    }
}

// DELETE /api/integrations/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await integrationService.deleteIntegration(user.id, id);

        return NextResponse.json({ message: 'Integration deleted successfully', id });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
