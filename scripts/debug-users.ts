import { prisma } from "../lib/prisma";

async function list() {
    const users = await prisma.user.findMany({
        include: {
            widgets: true
        }
    });

    console.log("Users and Widgets:");
    users.forEach(u => {
        console.log(`- ${u.email} (${u.id}) - ${u.widgets.length} widgets`);
        u.widgets.forEach(w => {
            console.log(`  * Widget: ${w.name} (${w.id})`);
        });
    });
}

list().then(() => process.exit(0));
