const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const student = await prisma.student.findFirst();
        if (student) {
            console.log('Columns found:', Object.keys(student));
            if ('password' in student) {
                console.log('SUCCESS: password column exists');
            } else {
                console.log('FAILURE: password column MISSING');
            }
        } else {
            console.log('No students found to check columns against');
        }
    } catch (e) {
        console.error('Check error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
