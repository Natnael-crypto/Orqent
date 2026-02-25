import { query } from '@/lib/db';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "companyName" VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        "isEmailVerified" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Database setup complete.');
  } catch (error: unknown) {
    console.error('Database setup failed:', error);
  }
}

// Check if running directly
if (require.main === module) {
  setupDatabase();
}

export default setupDatabase;
