import { NextResponse } from 'next/server';
import { userService } from '@/services/UserService';
import { handleApiError } from '@/lib/api-error';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // userService.register handles validation and hashing
        const user = await userService.register(body);

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 1,
            path: '/',
        });

        // Return user without password (prisma default or explicit filtering)
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
