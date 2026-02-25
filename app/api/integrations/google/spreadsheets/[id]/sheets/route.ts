import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getClientForUser } from '@/lib/google-auth';
import { google } from 'googleapis';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: spreadsheetId } = await params;
        const auth = await getClientForUser(user.id);
        const sheets = google.sheets({ version: 'v4', auth });

        const res = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const sheetNames = res.data.sheets?.map(s => s.properties?.title) || [];

        return NextResponse.json({
            sheets: sheetNames
        });
    } catch (error: unknown) {
        console.error('[Google Sheets API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sheets';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
