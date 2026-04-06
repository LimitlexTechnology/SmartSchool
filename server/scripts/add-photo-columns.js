const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "profilePhoto" TEXT');
    console.log('Added profilePhoto column');
    await pool.query('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "guardianPhoto" TEXT');
    console.log('Added guardianPhoto column');
    console.log('Migration complete!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
