import { prisma } from '../lib/prisma.js';

async function main() {
    const widget = await (prisma as any).widget.findFirst({
        select: { id: true, name: true }
    });
    if (widget) {
        console.log(`FOUND_WIDGET_ID: ${widget.id}`);
        console.log(`NAME: ${widget.name}`);
    } else {
        console.log('NO_WIDGET_FOUND');
    }
}

main().catch(console.error);
