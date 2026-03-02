require('dotenv').config()
const prisma = require('../src/db')
;(async () => {
  try {
    const [a,b,c] = await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.teacher.count()
    ])
    console.log(JSON.stringify({students:a, classes:b, teachers:c}))
    process.exit(0)
  } catch (e) {
    console.error('ERR', e.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
