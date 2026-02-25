import { prisma } from "../lib/prisma";

async function fixAndSeed() {
    const user = await prisma.user.findUnique({ where: { email: "naty@gmail.com" } });
    if (!user) {
        console.error("User not found.");
        return;
    }

    const widget = await prisma.widget.findFirst();
    if (!widget) {
        console.error("No widget found.");
        return;
    }

    // Fix ownership
    await prisma.widget.update({
        where: { id: widget.id },
        data: { userId: user.id }
    });
    console.log(`Updated widget ${widget.id} to be owned by user ${user.id}`);

    // Create conversation
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

fixAndSeed().then(() => process.exit(0));
