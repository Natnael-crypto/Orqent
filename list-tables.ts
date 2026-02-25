import pool from './lib/db';

async function listTables() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log('Tables in database:');
        res.rows.forEach(row => console.log(`- ${row.table_name}`));

        console.log('\nColumns in _IntegrationToWidget (if exists):');
        try {
            const colRes = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '_IntegrationToWidget'
                ORDER BY ordinal_position;
            `);
            colRes.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
        } catch (e) {
            console.log('_IntegrationToWidget table not found');
        }

    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        process.exit();
    }
}

listTables();
