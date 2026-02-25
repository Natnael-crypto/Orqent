import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { widgetService } from '@/services/WidgetService';
import { handleApiError } from '@/lib/api-error';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const widget = await widgetService.getWidgetById(user.id, id);

        // Map to format expected by frontend
        const formattedWidget = {
            ...widget,
            integrationIds: widget.integrations || []
        };

        return NextResponse.json(formattedWidget);

    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();

        const updatedWidget = await widgetService.updateWidget(user.id, id, body);

        // Map to format expected by frontend
        const formattedWidget = {
            ...updatedWidget,
            integrationIds: updatedWidget?.integrations || []
        };

        return NextResponse.json(formattedWidget);

    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        await widgetService.deleteWidget(user.id, id);

        return NextResponse.json({ success: true, message: 'Widget deleted successfully' });

    } catch (error) {
        return handleApiError(error);
    }
}
