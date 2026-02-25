import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");

        if (!filename) {
            return NextResponse.json({ error: "Filename is required" }, { status: 400 });
        }

        if (!request.body) {
            return NextResponse.json({ error: "No body provided" }, { status: 400 });
        }

        const blob = await put(filename, request.body, {
            access: "public",
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error("Error uploading to Vercel Blob:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
