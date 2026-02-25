import { query } from '@/lib/db';

async function setupWidgetsDatabase() {
    try {
        console.log('Setting up widgets database...');

        // 1. Integrations Table (dependency for widget_integrations)
        await query(`
            CREATE TABLE IF NOT EXISTS integrations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
                description TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // Create UI Customizations table
        console.log('Creating ui_customizations table...');
        await query(`
            CREATE TABLE IF NOT EXISTS ui_customizations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                "chatButtonText" TEXT DEFAULT 'Chat',
                "agentName" TEXT DEFAULT 'AI Assistant',
                "welcomeMessage" TEXT DEFAULT 'Hello! How can I help you?',
                "primaryColor" TEXT DEFAULT '#000000',
                "backgroundColor" TEXT DEFAULT '#ffffff',
                "borderRadius" INTEGER DEFAULT 8,
                "fontSize" INTEGER DEFAULT 16,
                height INTEGER DEFAULT 600,
                width INTEGER DEFAULT 400,
                position TEXT DEFAULT 'right',
                "chatButtonLogoUrl" TEXT,
                "agentAvatarUrl" TEXT,
                "showPoweredBy" BOOLEAN DEFAULT true,
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Widgets table
        console.log('Creating widgets table...');
        await query(`
            CREATE TABLE IF NOT EXISTS widgets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                description TEXT,
                model TEXT DEFAULT 'gpt-4',
                "systemPrompt" TEXT NOT NULL,
                temperature DOUBLE PRECISION DEFAULT 0.7,
                "maxTokens" INTEGER DEFAULT 1000,
                status TEXT DEFAULT 'ACTIVE',
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "uiCustomizationId" UUID REFERENCES ui_customizations(id) ON DELETE SET NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Allowed Domains Table
        await query(`
            CREATE TABLE IF NOT EXISTS allowed_domains (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                "widgetId" UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
                domain VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);

        // 5. Widget Integrations Junction Table
        await query(`
            CREATE TABLE IF NOT EXISTS widget_integrations (
                "widgetId" UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
                "integrationId" UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                PRIMARY KEY ("widgetId", "integrationId")
            );
        `);

        console.log('Widgets database setup complete.');
    } catch (error: unknown) {
        console.error('Widgets database setup failed:', error);
    }
}

// Check if running directly
if (require.main === module) {
    setupWidgetsDatabase();
}

export default setupWidgetsDatabase;
