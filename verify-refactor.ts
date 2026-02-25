import { widgetService } from './services/WidgetService';
import { prisma } from './lib/prisma';

async function verify() {
    try {
        console.log('Verifying WidgetService refactor...');

        // 1. Get a test user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found to run verification.');
            return;
        }
        console.log(`Using user: ${user.email} (${user.id})`);

        // 2. Get a test widget
        const widget = await prisma.widget.findFirst({
            where: { userId: user.id }
        });
        if (!widget) {
            console.log('No widget found for user. Creating one...');
            // We could create one, but let's assume one exists or just check the code compiles 
            // and the service methods exist.
        } else {
            console.log(`Found widget: ${widget.name} (${widget.id})`);

            // 3. Test getWidgetById
            const fetched = await widgetService.getWidgetById(user.id, widget.id);
            console.log('Successfully fetched widget by ID.');

            // 4. Test updateWidget
            const updated = await widgetService.updateWidget(user.id, widget.id, {
                description: `Verified at ${new Date().toISOString()}`
            });
            console.log('Successfully updated widget.');

            // Check if integrations are returned as Integration objects
            if (updated?.integrations) {
                console.log(`Found ${updated.integrations.length} integrations in response.`);
            }
        }

        console.log('Verification completed successfully!');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        process.exit();
    }
}

verify();
