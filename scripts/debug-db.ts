import { prisma } from "../lib/prisma";

async function list() {
    const widgets = await prisma.widget.findMany();
    console.log(`Total widgets: ${widgets.length}`);
    widgets.forEach(w => {
        console.log(`- Widget: ${w.name} (${w.id}), Owned by User: ${w.userId}`);
    });

    const users = await prisma.user.findMany();
    console.log(`Total users: ${users.length}`);
    users.forEach(u => {
        console.log(`- User: ${u.email} (${u.id})`);
    });
}

list().then(() => process.exit(0));
