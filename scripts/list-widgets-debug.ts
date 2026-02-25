import { prisma } from '../lib/prisma.js';

async function main() {
    const widgets = await (prisma as any).widget.findMany({
        select: { id: true, name: true }
    });
    console.log('--- WIDGET LIST START ---');
    widgets.forEach((w: any) => {
        console.log(`NAME: "${w.name}" | ID: [${w.id}] | LENGTH: ${w.id.length}`);
    });
    console.log('--- WIDGET LIST END ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
