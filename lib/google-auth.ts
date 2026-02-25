import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';
import { prisma } from './prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/callback';

export const googleOAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

export const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

export function getGoogleAuthUrl(state: string) {
    return googleOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_SCOPES,
        state,
        prompt: 'consent',
    });
}

export async function getGoogleTokens(code: string) {
    const { tokens } = await googleOAuth2Client.getToken(code);
    return tokens;
}

export async function saveGoogleTokens(userId: string, tokens: Credentials) {
    const { access_token, refresh_token, expiry_date, scope } = tokens;

    console.log(`[GoogleAuth] Saving tokens for user ${userId}. Refresh token present: ${!!refresh_token}`);

    // Check if a token record already exists for this user + provider
    const existingToken = await prisma.oAuthToken.findFirst({
        where: {
            userId,
            provider: 'google',
        },
    });

    if (existingToken) {
        console.log(`[GoogleAuth] Updating existing token record ${existingToken.id}`);
        return prisma.oAuthToken.update({
            where: { id: existingToken.id },
            data: {
                accessToken: access_token || undefined,
                refreshToken: refresh_token ?? undefined,
                expiryDate: expiry_date ? new Date(expiry_date) : undefined,
                scopes: scope ? scope.split(' ') : undefined,
            },
        });
    } else {
        console.log(`[GoogleAuth] Creating new token record for user ${userId}`);
        return prisma.oAuthToken.create({
            data: {
                userId,
                provider: 'google',
                accessToken: access_token as string,
                refreshToken: refresh_token ?? null,
                expiryDate: expiry_date ? new Date(expiry_date) : null,
                scopes: scope ? scope.split(' ') : [],
            },
        });
    }
}

export async function getClientForUser(userId: string) {
    const token = await prisma.oAuthToken.findFirst({
        where: {
            userId,
            provider: 'google',
        },
    });

    if (!token) {
        throw new Error('Google account not connected');
    }

    const client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    client.setCredentials({
        access_token: token.accessToken,
        refresh_token: token.refreshToken || undefined,
        expiry_date: token.expiryDate ? token.expiryDate.getTime() : undefined,
    });

    // Handle token refresh automatically
    client.on('tokens', async (newTokens) => {
        if (newTokens.access_token) {
            await prisma.oAuthToken.update({
                where: { id: token.id },
                data: {
                    accessToken: newTokens.access_token,
                    expiryDate: newTokens.expiry_date ? new Date(newTokens.expiry_date) : undefined,
                    refreshToken: newTokens.refresh_token || undefined,
                },
            });
        }
    });

    return client;
}
