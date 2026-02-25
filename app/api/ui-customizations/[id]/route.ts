import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uiCustomizationService } from "@/services/UICustomizationService";
import { handleApiError } from "@/lib/api-error";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;
        const result = await uiCustomizationService.getById(user.id, id);
        return NextResponse.json(result);
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
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;
        const body = await req.json();
        const result = await uiCustomizationService.update(user.id, id, body);
        return NextResponse.json(result);
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
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;
        await uiCustomizationService.delete(user.id, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
