import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { widgetService } from '@/services/WidgetService';
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
        const model = searchParams.get('model') || undefined;

        const result = await widgetService.getWidgets(user.id, page, limit, search, status, model);

        return NextResponse.json(result);
    } catch (error) {
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

        const widget = await widgetService.createWidget(user.id, body);

        return NextResponse.json(widget, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}
