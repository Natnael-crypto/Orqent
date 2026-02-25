import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from './db';
import { Users } from '@/types/users';

const SECRET_KEY = process.env.JWT_SECRATE || process.env.JWT_SECRET || 'fallback-secret-key-change-me';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}

export function generateToken(payload: object): string {
    return sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string): string | object | null {
    try {
        return verify(token, SECRET_KEY);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return null;
    }
}

import { headers } from 'next/headers';

export async function getUserFromRequest(): Promise<Users | null> {
    // Development bypass for testing
    if (process.env.NODE_ENV === 'development') {
        const headerStore = await headers();
        const testUserId = headerStore.get('x-test-user-id');
        if (testUserId) {
            try {
                const result = await query('SELECT * FROM users WHERE id = $1', [testUserId]);
                if (result.rows.length > 0) {
                    return result.rows[0];
                }
            } catch (e) {
                console.error('Error fetching test user:', e);
            }
        }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return null;
    }

    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string' || !('id' in payload)) {
        return null;
    }

    try {
        const result = await query('SELECT * FROM users WHERE id = $1', [(payload as { id: string }).id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user from request:', error);
        return null;
    }
}
