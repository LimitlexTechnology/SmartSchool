require('dotenv').config()
const { Pool } = require('pg')

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active'`)
    await client.query(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "archivedAt" timestamptz`)
    await client.query(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "archiveReason" text`)
    await client.query('COMMIT')
    console.log('Archive columns migration complete')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('Migration failed', e)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()

