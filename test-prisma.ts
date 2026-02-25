import { prisma } from './lib/prisma.js';

async function test() {
    try {
        console.log('Attempting to connect to Prisma...');
        const widgetCount = await prisma.widget.count();
        console.log('Connection successful! Widget count:', widgetCount);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

test();
