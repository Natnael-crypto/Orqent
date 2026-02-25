import { prisma } from '../lib/prisma.js';

async function main() {
    const widgets = await prisma.widget.findMany({
        take: 1,
        select: { id: true, name: true }
    });
    if (widgets.length > 0) {
        process.stdout.write(`---WIDGET_START---${widgets[0].id}---WIDGET_END---\n`);
    } else {
        console.log('NO_WIDGETS');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
