import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getClientForUser } from '@/lib/google-auth';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const auth = await getClientForUser(user.id);
        const drive = google.drive({ version: 'v3', auth });

        // List only spreadsheets
        const res = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name, webViewLink, iconLink)',
            orderBy: 'modifiedTime desc',
            pageSize: 50,
        });

        return NextResponse.json({
            files: res.data.files || []
        });
    } catch (error: unknown) {
        console.error('[Google Spreadsheets API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch spreadsheets';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
