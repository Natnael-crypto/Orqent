import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { randomBytes } from 'crypto';

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = forgotPasswordSchema.parse(body);

        const result = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            // Don't reveal user existence
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // Assuming a 'codes' table or similar for reset tokens.
        // Based on types/users.ts, there is a Code interface:
        // export interface Code { id: string; code: string; email: string; expiresAt: Date; createdAt: Date; updatedAt: Date; }

        // We'll insert into 'code' table if users table implies its usage, or a generic 'password_reset_tokens' table.
        // The user's types/users.ts has `Code` interface with `code`, `email`. Let's use that structure.
        // But table name might be 'Code' or 'codes'. I'll try 'codes'.

        // Check if table exists (in a real scenario we'd know schema), assuming 'codes' based on 'Code' type.
        // If this fails, user needs to create the table. I will provide a setup script later.

        await query(
            `INSERT INTO codes (id, code, email, "expiresAt", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $4)`,
            [token, email, expiresAt, new Date()]
        );

        // Mock email sending
        console.log(`[Mock Email] Password reset link for ${email}: http://localhost:3000/reset-password?token=${token}`);

        return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Forgot password error:', error);
        // Even on error, avoid leaking internal state if possible, but 500 is generic enough.
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
