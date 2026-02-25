import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { hashPassword, verifyPassword, getUserFromRequest } from '@/lib/auth';

const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { oldPassword, newPassword } = changePasswordSchema.parse(body);

        // Get current password hash from DB (user object from getUserFromRequest might not have it or might be stale)
        const result = await query('SELECT password FROM users WHERE id = $1', [user.id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const currentHash = result.rows[0].password;

        const isValid = await verifyPassword(oldPassword, currentHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid old password' }, { status: 400 });
        }

        const newHash = await hashPassword(newPassword);
        await query('UPDATE users SET password = $1, "updatedAt" = $2 WHERE id = $3', [newHash, new Date(), user.id]);

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
