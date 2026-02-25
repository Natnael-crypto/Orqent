import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-auth';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // state can be used to track the user or extra context
    const state = JSON.stringify({ userId: user.id });
    const url = getGoogleAuthUrl(state);

    return NextResponse.redirect(url);
}
