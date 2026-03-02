require('dotenv').config()
const prisma = require('../src/db')

async function main() {
  const t1 = await prisma.teacher.upsert({
    where: { email: 'sarah.williams@smart.school' },
    update: {},
    create: { name: 'Sarah Williams', email: 'sarah.williams@smart.school', subject: 'Mathematics' },
  })
  const t2 = await prisma.teacher.upsert({
    where: { email: 'leo.wood@smart.school' },
    update: {},
    create: { name: 'Leo Wood', email: 'leo.wood@smart.school', subject: 'Science' },
  })
  const c1 = await prisma.class.create({ data: { name: 'Alpha', grade: 'Grade 6' } })
  const c2 = await prisma.class.create({ data: { name: 'Beta', grade: 'Grade 7' } })
  const s1 = await prisma.student.create({ data: { firstName: 'Ava', lastName: 'Stone', email: 'ava.stone@parent.com', grade: '6', classId: c1.id } })
  const s2 = await prisma.student.create({ data: { firstName: 'Eli', lastName: 'Park', email: 'eli.park@parent.com', grade: '6', classId: c1.id } })
  const s3 = await prisma.student.create({ data: { firstName: 'Mia', lastName: 'Chen', email: 'mia.chen@parent.com', grade: '7', classId: c2.id } })
  const s4 = await prisma.student.create({ data: { firstName: 'Noah', lastName: 'Khan', email: 'noah.khan@parent.com', grade: '7', classId: c2.id } })
  const s5 = await prisma.student.create({ data: { firstName: 'Zoe', lastName: 'Ng', email: 'zoe.ng@parent.com', grade: '7', classId: c2.id } })
  await prisma.lesson.createMany({
    data: [
      { topic: 'Algebra Basics', content: 'Expressions and equations', teacherId: t1.id },
      { topic: 'Photosynthesis', content: 'Plant energy conversion', teacherId: t2.id },
    ],
  })
  await prisma.transaction.createMany({
    data: [
      { studentId: s1.id, amount: 25.5, type: 'Canteen', description: 'Lunch' },
      { studentId: s2.id, amount: 15, type: 'Library', description: 'Book fee' },
      { studentId: s3.id, amount: 120, type: 'Fee', description: 'Tuition' },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
