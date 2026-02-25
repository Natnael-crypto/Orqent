import { NextResponse } from "next/server";
import { z } from "zod";

export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    }
}

export function handleApiError(error: unknown) {
    console.error("API Error:", error);

    if (error instanceof ApiError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
        );
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: "Validation Error", details: error.errors },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    );
}
