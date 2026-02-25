import { NextResponse } from 'next/server';
import { userService } from '@/services/UserService';
import { handleApiError } from '@/lib/api-error';
import { generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        const user = await userService.login(email, password);

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
