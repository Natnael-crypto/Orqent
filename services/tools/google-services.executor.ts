import { google } from 'googleapis';
import { getClientForUser } from '@/lib/google-auth';
import type { BaseIntegrationConfig, ToolExecutor, ToolResult } from './types';

export class GoogleServicesExecutor implements ToolExecutor<BaseIntegrationConfig & { userId: string }, any> {
    async execute(
        config: BaseIntegrationConfig & { userId: string },
        tool: any,
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
                    const spreadsheetId = (args.spreadsheetId as string) || (config as any).spreadsheetId;
                    const sheetName = (args.sheetName as string) || (config as any).sheetName;
                    const range = (args.range as string) || (sheetName ? `${sheetName}!A1:Z100` : 'A1:Z100');
                    return await this.getRows(auth, { ...args, spreadsheetId, range });
                }
                case 'sheets.add_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config as any).spreadsheetId;
                    const sheetName = (args.sheetName as string) || (config as any).sheetName;
                    const range = (args.range as string) || sheetName || 'Sheet1';
                    return await this.addRow(auth, { ...args, spreadsheetId, range });
                }
                case 'sheets.update_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config as any).spreadsheetId;
                    const sheetName = (args.sheetName as string) || (config as any).sheetName;
                    return await this.updateRow(auth, { ...args, spreadsheetId, sheetName });
                }
                case 'sheets.delete_row': {
                    const spreadsheetId = (args.spreadsheetId as string) || (config as any).spreadsheetId;
                    const sheetName = (args.sheetName as string) || (config as any).sheetName;
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Google API Error',
                latencyMs: Date.now() - startTime,
            };
        }
    }

    private async getRows(auth: any, args: any): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: args.spreadsheetId,
            range: args.range,
        });
        return { success: true, data: res.data.values, latencyMs: 0 };
    }

    private async addRow(auth: any, args: any): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId: args.spreadsheetId,
            range: args.range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [args.values],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async updateRow(auth: any, args: any): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.update({
            spreadsheetId: args.spreadsheetId,
            range: `${args.sheetName}!A${args.rowNumber}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [args.values],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async deleteRow(auth: any, args: any): Promise<ToolResult> {
        const sheets = google.sheets({ version: 'v4', auth });
        // Deleting a row is more complex as it requires sheetId
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: args.spreadsheetId,
        });
        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === args.sheetName);
        if (!sheet) throw new Error('Sheet not found');

        const res = await sheets.spreadsheets.batchUpdate({
            spreadsheetId: args.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties?.sheetId,
                                dimension: 'ROWS',
                                startIndex: args.rowNumber - 1,
                                endIndex: args.rowNumber,
                            },
                        },
                    },
                ],
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async checkAvailability(auth: any, args: any): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.freebusy.query({
            requestBody: {
                timeMin: args.timeMin,
                timeMax: args.timeMax,
                items: [{ id: 'primary' }],
            },
        });
        return { success: true, data: res.data.calendars?.primary, latencyMs: 0 };
    }

    private async setMeeting(auth: any, args: any): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: args.summary,
                description: args.description,
                start: { dateTime: args.start },
                end: { dateTime: args.end },
                attendees: args.attendees?.map((email: string) => ({ email })),
            },
        });
        return { success: true, data: res.data, latencyMs: 0 };
    }

    private async listEvents(auth: any, args: any): Promise<ToolResult> {
        const calendar = google.calendar({ version: 'v3', auth });
        const res = await calendar.events.list({
            calendarId: 'primary',
            timeMin: args.timeMin || new Date().toISOString(),
            maxResults: args.maxResults || 10,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return { success: true, data: res.data.items, latencyMs: 0 };
    }
}

export const googleServicesExecutor = new GoogleServicesExecutor();
