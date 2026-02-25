import { prisma } from "../lib/prisma";

async function seed() {
    console.log("Seeding dummy conversation data...");

    const user = await prisma.user.findUnique({ where: { email: "naty@gmail.com" } });
    if (!user) {
        console.error("User not found.");
        return;
    }
    console.log(`User found: ${user.id}`);

    const widget = await prisma.widget.findFirst({
        where: { userId: user.id }
    });
    if (!widget) {
        const allWidgets = await prisma.widget.findMany();
        console.error(`No widget found for user ${user.id}. Total widgets in DB: ${allWidgets.length}`);
        return;
    }

    const conversation = await prisma.conversation.create({
        data: {
            widgetId: widget.id,
            visitorId: "test-visitor-123",
            lastMessage: "Hello, I need help with my pool.",
            messages: {
                create: [
                    {
                        role: "user",
                        content: "Hello, I need help with my pool.",
                    },
                    {
                        role: "assistant",
                        content: "Hello! I'd be happy to help. What seems to be the problem with your pool?",
                    },
                ],
            },
        },
    });

    console.log(`Created conversation: ${conversation.id}`);
}

seed().then(() => process.exit(0));
