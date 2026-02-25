import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getClientForUser } from '@/lib/google-auth';
import type { BaseIntegrationConfig, ToolExecutor, ToolResult } from './types';

export interface GoogleToolDefinition {
    path: string;
    [key: string]: unknown;
}

export class GoogleServicesExecutor implements ToolExecutor<BaseIntegrationConfig & { userId: string }, GoogleToolDefinition> {
    async execute(
        config: BaseIntegrationConfig & { userId: string },
        tool: GoogleToolDefinition,
        args: Record<string, unknown>
    ): Promise<ToolResult> {
        const startTime = Date.now();
        const userId = config.userId;

        if (!userId) {
            return {
                success: false,
                error: 'User ID missing from configuration',
                latencyMs: Date.now() - startTime,
            };
        }

        try {
            const auth = await getClientForUser(userId);
            const operation = tool.path; // We'll use path as the operation name in the DB

            switch (operation) {
                // --- Google Sheets ---
                case 'sheets.get_rows': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config.spreadsheetId as string);
                    const sheetName = (args.sheetName as string) || (config.sheetName as string);
                    const range = (args.range as string) || (sheetName ? `${sheetName}!A1:Z100` : 'A1:Z100');
                    return await this.getRows(auth, { ...args, spreadsheetId, range });
                }
                case 'sheets.add_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config.spreadsheetId as string);
                    const sheetName = (args.sheetName as string) || (config.sheetName as string);
                    const range = (args.range as string) || sheetName || 'Sheet1';
                    return await this.addRow(auth, { ...args, spreadsheetId, range });
                }
                case 'sheets.update_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config.spreadsheetId as string);
                    const sheetName = (args.sheetName as string) || (config.sheetName as string);
                    return await this.updateRow(auth, { ...args, spreadsheetId, sheetName });
                }
                case 'sheets.delete_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config.spreadsheetId as string);
                    const sheetName = (args.sheetName as string) || (config.sheetName as string);
                    return await this.deleteRow(auth, { ...args, spreadsheetId, sheetName });
                }

                // --- Google Calendar ---
                case 'calendar.check_availability':
                    return await this.checkAvailability(auth, args);
                case 'calendar.set_meeting':
                    return await this.setMeeting(auth, args);
                case 'calendar.list_events':
                    return await this.listEvents(auth, args);

                default:
                    return {
                        success: false,
                        error: `Unsupported Google operation: ${operation}`,
                        latencyMs: Date.now() - startTime,
                    };
            }
        } catch (error: unknown) {
            return {
                success: false,
                error: (error as Error).message || 'Google API Error',
                latencyMs: Date.now() - startTime,
            };
        }
    }

    private async getRows(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: args.spreadsheetId as string,
            range: args.range as string,
        });
        return { success: true, data: res.data.values, latencyMs: 0 };
    }

    private async addRow(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId: args.spreadsheetId as string,
            range: args.range as string,
            valueInputOption: 'RAW',
            requestBody: {
                values: [args.values as unknown[]],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async updateRow(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.update({
            spreadsheetId: args.spreadsheetId as string,
            range: `${args.sheetName as string}!A${args.rowNumber as number}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [args.values as unknown[]],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async deleteRow(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        // Deleting a row is more complex as it requires sheetId
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: args.spreadsheetId as string,
        });
        const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === args.sheetName as string);
        if (!sheet) throw new Error('Sheet not found');

        const res = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: args.spreadsheetId as string,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties?.sheetId,
                                dimension: 'ROWS',
                                startIndex: (args.rowNumber as number) - 1,
                                endIndex: args.rowNumber as number,
                            },
                        },
                    },
                ],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async checkAvailability(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.freebusy.query({
            requestBody: {
                timeMin: args.timeMin as string,
                timeMax: args.timeMax as string,
                items: [{ id: 'primary' }],
            },
        });
        return { success: true, data: res.data.calendars?.primary, latencyMs: 0 };
    }

    private async setMeeting(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: args.summary as string,
                description: args.description as string,
                start: { dateTime: args.start as string },
                end: { dateTime: args.end as string },
                attendees: (args.attendees as string[])?.map((email: string) => ({ email })),
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async listEvents(auth: OAuth2Client, args: Record<string, unknown>): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (args.timeMin as string) || new Date().toISOString(),
            maxResults: (args.maxResults as number) || 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return { success: true, data: res.data.items, latencyMs: 0 };
    }
}

export const googleServicesExecutor = new GoogleServicesExecutor();
