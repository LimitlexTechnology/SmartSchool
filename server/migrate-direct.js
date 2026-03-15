const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from current dir
const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '.env')));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Attempting to connect to:', process.env.DATABASE_URL.split('@')[1]);
        await client.connect();
        console.log('Connected to DB');
        await client.query('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "password" TEXT');
        console.log('SUCCESS: manually added password column');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
