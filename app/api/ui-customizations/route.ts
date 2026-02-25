import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { uiCustomizationService } from "@/services/UICustomizationService";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await uiCustomizationService.list(user.id);
        return NextResponse.json(result);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const result = await uiCustomizationService.create(user.id, body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
