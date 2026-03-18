const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('Attempting to manually add password column...');
        await prisma.$executeRawUnsafe('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "password" TEXT');
        console.log('SUCCESS: Altered table successfully');
    } catch (e) {
        console.error('SQL Error:', e.message);
        if (e.message.includes('already exists')) {
            console.log('It seems the column might already exist.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

run();
