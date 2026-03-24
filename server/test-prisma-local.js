const prisma = require('./src/db');

async function main() {
  const id = 'a660a9f5-3cd5-4927-9c98-dfdcef7698f2';
  console.log('Testing Prisma for ID:', id);
  try {
    const prof = await prisma.teacherProfile.findUnique({ where: { teacherId: id } });
    console.log('Prisma result:', prof);
  } catch (e) {
    console.error('Prisma error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
