import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }


        const result = await query('SELECT id, name, email, "companyName", role, "createdAt" FROM users WHERE id = $1', [user.id]);
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({ user: result.rows[0] }, { status: 200 });
    } catch (error: unknown) {
        console.error('Me route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
