const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function setup() {
    try {
        const studentId = '821271BA';
        const rawPassword = 'Petals';

        // Hash password
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(rawPassword.trim(), salt, 64).toString('hex');
        const savedPassword = `${salt}:${hash}`;

        console.log('Looking for student with ID prefix or wristband:', studentId);

        // Find student
        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { wristbandId: { equals: studentId, mode: 'insensitive' } },
                    { id: { startsWith: studentId.toLowerCase() } }
                ]
            }
        });

        if (student) {
            await prisma.student.update({
                where: { id: student.id },
                data: { password: savedPassword }
            });
            console.log('SUCCESS: Updated student password for', student.firstName, student.lastName);
            console.log('Student ID:', student.id);
        } else {
            console.log('FAILURE: Could not find student with ID', studentId);
            // Let's try to list some students to see what's available
            const all = await prisma.student.findMany({ take: 5 });
            console.log('Available students in DB:', all.map(s => s.wristbandId || s.id.slice(0, 8)));
        }
    } catch (e) {
        console.error('Setup error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

setup();
