import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens, saveGoogleTokens } from '@/lib/google-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const stateStr = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        console.error('Google OAuth Error:', error);
        return NextResponse.redirect(new URL('/dashboard/integrations?error=google_auth_failed', req.url));
    }

    if (!code || !stateStr) {
        return NextResponse.redirect(new URL('/dashboard/integrations?error=invalid_request', req.url));
    }

    try {
        console.log('[Google Callback] Starting token exchange process...');

        let state;
        try {
            state = JSON.parse(stateStr);
        } catch (e) {
            console.error('[Google Callback] Failed to parse state:', stateStr);
            return NextResponse.redirect(new URL('/dashboard/integrations?error=invalid_state', req.url));
        }

        const userId = state.userId;
        if (!userId) {
            console.error('[Google Callback] User ID missing from state');
            return NextResponse.redirect(new URL('/dashboard/integrations?error=missing_user_id', req.url));
        }

        console.log(`[Google Callback] Exchanging code for tokens for user: ${userId}`);
        let tokens;
        try {
            tokens = await getGoogleTokens(code);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[Google Callback] Token exchange failed:', errorMessage);
            return NextResponse.redirect(new URL('/dashboard/integrations?error=token_exchange_failed_api', req.url));
        }

        console.log('[Google Callback] Tokens received, saving to database...');
        try {
            await saveGoogleTokens(userId, tokens);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[Google Callback] Failed to save tokens:', errorMessage);
            return NextResponse.redirect(new URL('/dashboard/integrations?error=token_save_failed', req.url));
        }

        console.log('[Google Callback] Tokens saved. Checking integration record...');

        // Check if an integration record already exists for this user + type
        // If not, create a default one so it shows up as "Connected" in the list
        const existingIntegration = await prisma.integration.findFirst({
            where: {
                userId,
                type: 'GOOGLE_SERVICES', // General type for both Sheets and Calendar, or we could split
            },
        });

        if (!existingIntegration) {
            await prisma.integration.create({
                data: {
                    userId,
                    name: 'Google Services',
                    type: 'GOOGLE_SERVICES',
                    description: 'Access to Google Sheets and Calendar',
                    config: {}, // Tokens are stored in OAuthToken table
                    status: 'ACTIVE',
                    restTools: {
                        create: [
                            // --- Sheets ---
                            {
                                method: 'GET',
                                path: 'sheets.get_rows',
                                requestConfig: {
                                    queryParams: {
                                        type: 'object',
                                        properties: {
                                            spreadsheetId: { type: 'string', description: 'The ID of the spreadsheet' },
                                            range: { type: 'string', description: 'The A1 notation of the range, e.g. Sheet1!A1:E10' },
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                            {
                                method: 'POST',
                                path: 'sheets.add_row',
                                requestConfig: {
                                    body: {
                                        type: 'object',
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                spreadsheetId: { type: 'string', description: 'The ID of the spreadsheet' },
                                                range: { type: 'string', description: 'The A1 notation of the range to append to, e.g. Sheet1' },
                                                values: { type: 'array', description: 'Array of values for the new row' },
                                            },
                                            required: ['spreadsheetId', 'range', 'values'],
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                            {
                                method: 'PUT',
                                path: 'sheets.update_row',
                                requestConfig: {
                                    body: {
                                        type: 'object',
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                spreadsheetId: { type: 'string', description: 'The ID of the spreadsheet' },
                                                sheetName: { type: 'string', description: 'Name of the sheet' },
                                                rowNumber: { type: 'number', description: 'The 1-indexed row number to update' },
                                                values: { type: 'array', description: 'Array of new values' },
                                            },
                                            required: ['spreadsheetId', 'sheetName', 'rowNumber', 'values'],
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                            {
                                method: 'DELETE',
                                path: 'sheets.delete_row',
                                requestConfig: {
                                    body: {
                                        type: 'object',
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                spreadsheetId: { type: 'string', description: 'The ID of the spreadsheet' },
                                                sheetName: { type: 'string', description: 'Name of the sheet' },
                                                rowNumber: { type: 'number', description: 'The 1-indexed row number to delete' },
                                            },
                                            required: ['spreadsheetId', 'sheetName', 'rowNumber'],
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                            // --- Calendar ---
                            {
                                method: 'GET',
                                path: 'calendar.check_availability',
                                requestConfig: {
                                    queryParams: {
                                        type: 'object',
                                        properties: {
                                            timeMin: { type: 'string', description: 'Start of the interval to check (ISO timestamp)' },
                                            timeMax: { type: 'string', description: 'End of the interval to check (ISO timestamp)' },
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                            {
                                method: 'POST',
                                path: 'calendar.set_meeting',
                                requestConfig: {
                                    body: {
                                        type: 'object',
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                summary: { type: 'string', description: 'Event title' },
                                                description: { type: 'string', description: 'Event description' },
                                                start: { type: 'string', description: 'Start time (ISO timestamp)' },
                                                end: { type: 'string', description: 'End time (ISO timestamp)' },
                                                attendees: { type: 'array', description: 'List of attendee emails' },
                                            },
                                            required: ['summary', 'start', 'end'],
                                        }
                                    }
                                },
                                responseConfig: { successStatusCodes: [200] },
                            },
                        ]
                    }
                },
            });
        }

        return NextResponse.redirect(new URL('/dashboard/integrations?success=google_connected', req.url));
    } catch (err) {
        console.error('Error in Google OAuth Callback:', err);
        return NextResponse.redirect(new URL('/dashboard/integrations?error=token_exchange_failed', req.url));
    }
}
