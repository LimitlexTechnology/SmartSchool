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
    const alters = [
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "gender" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "birthday" date`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "admittedAt" timestamptz`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "religion" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "nationality" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "hometown" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "address" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "guardianName" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "guardianRelationship" text`,
      `ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "guardianContact" text`,
    ]
    for (const sql of alters) {
      await client.query(sql)
    }
    await client.query('COMMIT')
    console.log('Migration complete')
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

