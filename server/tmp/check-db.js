
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany({
            include: { class: true },
            take: 10
        });
        console.log('Students and their classes:');
        students.forEach(s => {
            console.log(`${s.firstName} ${s.lastName}: ClassId=${s.classId}, ClassName=${s.class?.name || 'None'}`);
        });

        const classes = await prisma.class.findMany();
        console.log('\nAvailable Classes:');
        classes.forEach(c => {
            console.log(`ID=${c.id}, Name=${c.name}, Grade=${c.grade}`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
