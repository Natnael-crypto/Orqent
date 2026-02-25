import { PrismaClient } from '@prisma/client'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'

dotenv.config()

// Use native WebSocket available in Node 22+ to avoid ws package issues
neonConfig.webSocketConstructor = globalThis.WebSocket

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
export const prisma = new PrismaClient({ adapter })

console.log('DEBUG: Prisma initialized. Available keys:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
