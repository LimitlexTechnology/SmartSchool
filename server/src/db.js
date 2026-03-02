const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

let poolConfig
try {
  const u = new URL(process.env.DATABASE_URL)
  poolConfig = {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database: u.pathname.replace(/^\//, '') || 'postgres',
    ssl: { rejectUnauthorized: false },
  }
} catch {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
}
const pool = new Pool(poolConfig)
const adapter = new PrismaPg(pool)

let prisma
if (!global.prisma) {
  global.prisma = new PrismaClient({ adapter })
}
prisma = global.prisma
module.exports = prisma
