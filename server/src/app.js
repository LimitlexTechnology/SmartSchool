const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
dotenv.config();
const prisma = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Smart School API is running' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const u = new URL(process.env.DATABASE_URL);
        const pool = new Pool({
            user: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
            host: u.hostname,
            port: u.port ? Number(u.port) : 5432,
            database: u.pathname.replace(/^\//, '') || 'postgres',
            ssl: { rejectUnauthorized: false },
        });
        await pool.query('SELECT 1');
        await pool.end();
        res.json({ status: 'OK', database: 'connected' });
    } catch (e) {
        console.error('DB health check failed:', e);
        res.status(503).json({ status: 'DEGRADED', database: 'unavailable' });
    }
});

// Mock Auth Middleware
const auth = (req, res, next) => {
    // Simple auth for demo
    next();
};

// Routes placeholder
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const students = await prisma.student.count()
    const classes = await prisma.class.count()
    const staff = await prisma.teacher.count()
    const revenueAgg = await prisma.transaction.aggregate({ _sum: { amount: true } })
    const revenue = revenueAgg._sum.amount ?? 0
    res.json({
      totalStudents: students,
      totalClasses: classes,
      totalStaff: staff,
      totalGuardians: 0,
      revenue,
      status: 'ok',
    })
  } catch (e) {
    console.error('Stats error:', e)
    res.status(200).json({
      totalStudents: 0,
      totalClasses: 0,
      totalStaff: 0,
      totalGuardians: 0,
      revenue: 0,
      status: 'degraded',
      error: e?.message || 'unknown',
    })
  }
});

app.put('/api/students/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const {
      firstName, lastName, email, grade, classId, wristbandId,
      gender, birthday, admittedAt,
      religion, nationality, hometown, address,
      guardianName, guardianRelationship, guardianContact,
    } = req.body || {}
    const data = {}
    if (firstName !== undefined) data.firstName = firstName
    if (lastName !== undefined) data.lastName = lastName
    if (email !== undefined) data.email = email
    if (grade !== undefined) data.grade = grade
    if (classId !== undefined) data.classId = classId
    if (wristbandId !== undefined) data.wristbandId = wristbandId
    if (gender !== undefined) data.gender = gender
    if (birthday !== undefined) data.birthday = birthday ? new Date(birthday) : null
    if (admittedAt !== undefined) data.admittedAt = admittedAt ? new Date(admittedAt) : null
    if (religion !== undefined) data.religion = religion
    if (nationality !== undefined) data.nationality = nationality
    if (hometown !== undefined) data.hometown = hometown
    if (address !== undefined) data.address = address
    if (guardianName !== undefined) data.guardianName = guardianName
    if (guardianRelationship !== undefined) data.guardianRelationship = guardianRelationship
    if (guardianContact !== undefined) data.guardianContact = guardianContact
    const updated = await prisma.student.update({
      where: { id },
      data,
      include: { class: true },
    })
    res.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      className: updated.class?.name || '',
      grade: updated.class?.grade || updated.grade || '',
      studentId: updated.wristbandId || updated.id.slice(0, 8).toUpperCase(),
      createdAt: updated.createdAt
    })
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint failed' })
    }
    console.error('Update student error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});
app.get('/api/students', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString().trim()
    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}
    const [total, items] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { class: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    const data = items.map((s, i) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      className: s.class?.name || '',
      grade: s.class?.grade || s.grade || '',
      studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
      gender: null,
      index: (page - 1) * pageSize + i + 1,
    }))
    res.json({ total, page, pageSize, data })
  } catch (e) {
    console.error('Students error:', e)
    res.status(200).json({ total: 0, page: 1, pageSize: 20, data: [], error: e?.message || 'unknown' })
  }
});
app.get('/api/classes', auth, async (req, res) => {
  try {
    const items = await prisma.class.findMany({ orderBy: [{ grade: 'asc' }, { name: 'asc' }] })
    res.json(items.map(c => ({ id: c.id, name: c.name, grade: c.grade })))
  } catch (e) {
    console.error('Classes error:', e)
    res.status(200).json([])
  }
});

app.post('/api/students', auth, async (req, res) => {
  try {
    const {
      firstName, lastName, email, grade, classId, wristbandId,
      gender, birthday, admittedAt,
      religion, nationality, hometown, address,
      guardianName, guardianRelationship, guardianContact,
    } = req.body || {}
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName and email are required' })
    }
    const created = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        grade: grade || '',
        classId: classId || null,
        wristbandId: wristbandId || null,
        gender: gender || null,
        birthday: birthday ? new Date(birthday) : null,
        admittedAt: admittedAt ? new Date(admittedAt) : null,
        religion: religion || null,
        nationality: nationality || null,
        hometown: hometown || null,
        address: address || null,
        guardianName: guardianName || null,
        guardianRelationship: guardianRelationship || null,
        guardianContact: guardianContact || null,
      },
      include: { class: true },
    })
    res.status(201).json({
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      className: created.class?.name || '',
      grade: created.class?.grade || created.grade || '',
      studentId: created.wristbandId || created.id.slice(0, 8).toUpperCase(),
      createdAt: created.createdAt
    })
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint failed' })
    }
    console.error('Create student error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});
app.get('/api/students/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const s = await prisma.student.findUnique({ where: { id }, include: { class: true } })
    if (!s) return res.status(404).json({ error: 'not found' })
    res.json({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      className: s.class?.name || '',
      grade: s.class?.grade || s.grade || '',
      studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
      createdAt: s.createdAt,
      gender: s.gender || null,
      birthday: s.birthday || null,
      admittedAt: s.admittedAt || null,
      religion: s.religion || null,
      nationality: s.nationality || null,
      hometown: s.hometown || null,
      address: s.address || null,
      guardianName: s.guardianName || null,
      guardianRelationship: s.guardianRelationship || null,
      guardianContact: s.guardianContact || null,
    })
  } catch (e) {
    console.error('Student detail error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
