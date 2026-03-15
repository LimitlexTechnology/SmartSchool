const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const sid = '821271BA';
        const rawPass = 'Petals';
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(rawPass.trim(), salt, 64).toString('hex');
        const saved = `${salt}:${hash}`;

        console.log('Updating password for student search term:', sid);

        // Cast id (UUID) to TEXT before using LEFT()
        const res = await client.query(
            'UPDATE "Student" SET "password" = $1 WHERE UPPER("wristbandId") = $2 OR UPPER(LEFT("id"::TEXT, 8)) = $2',
            [saved, sid.toUpperCase()]
        );

        if (res.rowCount > 0) {
            console.log('SUCCESS: Updated student password for', res.rowCount, 'student(s)');
        } else {
            console.log('FAILURE: Could not find student with ID/Wristband matching', sid);
            const list = await client.query('SELECT "id", "firstName", "lastName", "wristbandId" FROM "Student" LIMIT 5');
            console.log('Existing students sample:', list.rows.map(r => ({ id: r.id.toString().slice(0, 8), name: r.firstName, wristband: r.wristbandId })));
        }
    } catch (err) {
        console.error('Update failed:', err.message);
    } finally {
        await client.end();
    }
}

run();
