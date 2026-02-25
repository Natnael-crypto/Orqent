import { NextResponse } from 'next/server';
import { userService } from '@/services/UserService';
import { handleApiError } from '@/lib/api-error';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const updatedUser = await userService.updateProfile(user.id, body);

        // Return user without password
        const { password, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ user: userWithoutPassword });
    } catch (error: unknown) {
        return handleApiError(error);
    }
}
