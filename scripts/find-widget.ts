
import { prisma } from '../lib/prisma.js';

async function main() {
    try {
        const widgets = await prisma.widget.findMany();
        console.log('Available Widgets:', JSON.stringify(widgets, null, 2));
        if (widgets.length === 0) {
            // Find or create a user first
            let user = await prisma.user.findFirst();
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: 'Test User',
                        email: 'test@example.com',
                        password: 'hashed_password_here'
                    }
                });
                console.log('Created test user:', user.id);
            }

            const newWidget = await prisma.widget.create({
                data: {
                    userId: user.id,
                    name: 'Test Widget',
                    model: 'gpt-4o',
                    systemPrompt: 'You are a helpful assistant.'
                }
            });
            console.log('Created new widget:', newWidget.id);
        }
    } catch (e) {
        console.error('Error in main:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
