const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
}
const pool = new Pool(poolConfig)
const adapter = new PrismaPg(pool)

let prisma
if (!global.prisma) {
  global.prisma = new PrismaClient({ adapter })
}
prisma = global.prisma
module.exports = prisma
