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
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Teacher" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "email" text UNIQUE NOT NULL,
        "subject" text NOT NULL
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Class" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "grade" text NOT NULL
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Student" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "firstName" text NOT NULL,
        "lastName" text NOT NULL,
        "email" text UNIQUE NOT NULL,
        "grade" text NOT NULL,
        "gender" text,
        "birthday" date,
        "admittedAt" timestamptz,
        "religion" text,
        "nationality" text,
        "hometown" text,
        "address" text,
        "guardianName" text,
        "guardianRelationship" text,
        "guardianContact" text,
        "wristbandId" text UNIQUE,
        "walletBalance" double precision NOT NULL DEFAULT 0.0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "classId" uuid REFERENCES "Class"("id") ON DELETE SET NULL
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Assessment" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "type" text NOT NULL,
        "dueDate" timestamptz NOT NULL,
        "subject" text NOT NULL
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AssessmentSubmission" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "studentId" uuid NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
        "assessmentId" uuid NOT NULL REFERENCES "Assessment"("id") ON DELETE CASCADE,
        "score" double precision,
        "status" text NOT NULL,
        "submittedAt" timestamptz
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "studentId" uuid NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
        "amount" double precision NOT NULL,
        "type" text NOT NULL,
        "description" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Lesson" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "topic" text NOT NULL,
        "content" text NOT NULL,
        "teacherId" uuid NOT NULL REFERENCES "Teacher"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error(e)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
