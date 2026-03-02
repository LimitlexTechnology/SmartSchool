require('dotenv').config()
const prisma = require('../src/db')
;(async () => {
  try {
    const [students, classes, staff, revenueAgg] = await Promise.all([
      prisma.student.count(),
      prisma.class.count(),
      prisma.teacher.count(),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
    ])
    console.log(JSON.stringify({ students, classes, staff, revenue: revenueAgg._sum.amount || 0 }))
  } catch (e) {
    console.error('ERR', e.message)
  } finally {
    await prisma.$disconnect()
  }
})()
