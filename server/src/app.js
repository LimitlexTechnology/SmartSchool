const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
dotenv.config();
const prisma = require('./db');
const { randomUUID } = require('crypto');
const fileGroups = require('./groupsStore')

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

// Ensure Group tables exist when migrations are unavailable
let groupsSchemaReady = false
let groupsMode = (process.env.GROUPS_MODE || 'auto').toLowerCase() // 'auto' | 'file' | 'prisma'
async function ensureGroupsSchema() {
  if (groupsMode === 'file') return
  if (groupsSchemaReady) return
  try {
    // Enable UUID generation
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
    // Create Group table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Group" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL UNIQUE,
        description text NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `)
    // Create StudentGroup table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StudentGroup" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "studentId" uuid NOT NULL,
        "groupId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_student" FOREIGN KEY ("studentId") REFERENCES "Student"(id) ON DELETE CASCADE,
        CONSTRAINT "fk_group" FOREIGN KEY ("groupId") REFERENCES "Group"(id) ON DELETE CASCADE,
        CONSTRAINT "uniq_student_group" UNIQUE ("studentId","groupId")
      );
    `)
    groupsSchemaReady = true
  } catch (e) {
    // If this fails, the subsequent ORM call will still error and be reported by route handlers
    console.error('ensureGroupsSchema error:', e?.message || e)
    // Fallback to file mode
    groupsMode = 'file'
  }
}
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
    const includeArchived = (req.query.includeArchived || 'false') === 'true'
    const baseFilter = includeArchived ? {} : { status: { not: 'archived' } }
    const where = q
      ? {
          AND: [
            baseFilter,
            {
              OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
          ],
        }
      : baseFilter
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

app.post('/api/students/:id/archive', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { reason } = req.body || {}
    if (!reason) return res.status(400).json({ error: 'reason is required' })
    if (reason === 'Incorrect entry') {
      await prisma.student.delete({ where: { id } })
      return res.json({ status: 'deleted' })
    }
    const updated = await prisma.student.update({
      where: { id },
      data: { status: 'archived', archivedAt: new Date(), archiveReason: reason },
    })
    res.json({ status: 'archived', id: updated.id, reason })
  } catch (e) {
    console.error('Archive student error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});

async function queryStudentsForSearch(q, includeArchived=false) {
  const baseFilter = includeArchived ? {} : { status: { not: 'archived' } }
  const where = (q || '').trim()
    ? {
        AND: [
          baseFilter,
          {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        ],
      }
    : baseFilter
  return prisma.student.findMany({ where, include: { class: true }, orderBy: { createdAt: 'desc' } })
}

// ============== Groups APIs ==============
// List groups with counts
app.get('/api/groups', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    if (groupsMode === 'file') {
      const list = fileGroups.list()
      res.json(list.map(g => ({ id: g.id, name: g.name, description: g.description || '', membersCount: g.members.length, createdAt: g.createdAt })))
    } else {
      const groups = await prisma.group.findMany({
        orderBy: { name: 'asc' },
        include: { memberships: true },
      })
      res.json(groups.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        membersCount: g.memberships.length,
        createdAt: g.createdAt
      })))
    }
  } catch (e) {
    console.error('Groups list error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Create a group
app.post('/api/groups', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const { name, description } = req.body || {}
    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' })
    if (groupsMode === 'file') {
      try {
        const created = fileGroups.create({ name: name.trim(), description })
        res.status(201).json({ id: created.id, name: created.name, description: created.description || '', createdAt: created.createdAt })
      } catch (err) {
        if (err.code === 'EEXISTS') return res.status(409).json({ error: 'Group name already exists' })
        throw err
      }
    } else {
      const created = await prisma.group.create({ data: { id: randomUUID(), name: name.trim(), description: description || null } })
      res.status(201).json({ id: created.id, name: created.name, description: created.description || '', createdAt: created.createdAt })
    }
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Group name already exists' })
    console.error('Create group error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Update group flags (file mode supports flags)
app.put('/api/groups/:id', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const id = req.params.id
    const { name, description, scholarship, debtor, billingTag } = req.body || {}
    if (groupsMode === 'file') {
      const updated = fileGroups.update(id, { name, description, scholarship, debtor, billingTag })
      return res.json({ id: updated.id, name: updated.name, description: updated.description || '', scholarship: !!updated.scholarship, debtor: !!updated.debtor, billingTag: updated.billingTag || '' })
    } else {
      // DB mode: update name/description only (flags not supported in schema)
      const data = {}
      if (typeof name === 'string' && name.trim()) data.name = name.trim()
      if (typeof description === 'string') data.description = description
      const updated = await prisma.group.update({ where: { id }, data })
      return res.json({ id: updated.id, name: updated.name, description: updated.description || '' })
    }
  } catch (e) {
    console.error('Update group error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Get group with members
app.get('/api/groups/:id', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const id = req.params.id
    if (groupsMode === 'file') {
      const g = fileGroups.get(id)
      if (!g) return res.status(404).json({ error: 'not found' })
      let members = []
      try {
        if (g.members.length) {
          const items = await prisma.student.findMany({ where: { id: { in: g.members } }, include: { class: true } })
          members = items.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            className: s.class?.name || '',
            grade: s.class?.grade || s.grade || '',
            memberId: s.id, // in file mode, memberId == studentId
          }))
        }
      } catch (_) {}
      return res.json({ id: g.id, name: g.name, description: g.description || '', members, scholarship: !!g.scholarship, debtor: !!g.debtor, billingTag: g.billingTag || '' })
    } else {
      const group = await prisma.group.findUnique({
        where: { id },
        include: { memberships: { include: { student: { include: { class: true } } } } }
      })
      if (!group) return res.status(404).json({ error: 'not found' })
      res.json({
        id: group.id,
        name: group.name,
        description: group.description || '',
        members: group.memberships.map(m => ({
          id: m.student.id,
          firstName: m.student.firstName,
          lastName: m.student.lastName,
          email: m.student.email,
          className: m.student.class?.name || '',
          grade: m.student.class?.grade || m.student.grade || '',
          memberId: m.id
        })),
      })
    }
  } catch (e) {
    console.error('Group detail error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Add students to a group
app.post('/api/groups/:id/members', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const id = req.params.id
    const { studentIds } = req.body || {}
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds must be a non-empty array' })
    }
    if (groupsMode === 'file') {
      fileGroups.addMembers(id, studentIds)
      res.status(201).json({ added: studentIds.length })
    } else {
      // Create many while ignoring duplicates
      const data = studentIds.map(sid => ({ id: randomUUID(), studentId: sid, groupId: id }))
      // Use try/catch per insert to ignore existing
      const created = []
      for (const item of data) {
        try {
          const m = await prisma.studentGroup.create({ data: item })
          created.push(m)
        } catch (_) {}
      }
      res.status(201).json({ added: created.length })
    }
  } catch (e) {
    console.error('Add members error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Bulk add by filter
app.post('/api/groups/:id/members/bulk', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const id = req.params.id
    const { q = '', includeArchived = false } = req.body || {}
    const students = await queryStudentsForSearch(q, !!includeArchived)
    const ids = students.map(s => s.id)
    if (groupsMode === 'file') {
      fileGroups.addMembers(id, ids)
      return res.status(201).json({ added: ids.length })
    } else {
      const data = ids.map(sid => ({ id: randomUUID(), studentId: sid, groupId: id }))
      let added = 0
      for (const item of data) {
        try { await prisma.studentGroup.create({ data: item }); added += 1 } catch (_) {}
      }
      return res.status(201).json({ added })
    }
  } catch (e) {
    console.error('Bulk add error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Export CSV
app.get('/api/groups/:id/export.csv', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const id = req.params.id
    let memberIds = []
    let groupName = 'group'
    if (groupsMode === 'file') {
      const g = fileGroups.get(id)
      if (!g) return res.status(404).send('not found')
      memberIds = g.members
      groupName = g.name
    } else {
      const g = await prisma.group.findUnique({ where: { id }, include: { memberships: true } })
      if (!g) return res.status(404).send('not found')
      memberIds = g.memberships.map(m => m.studentId)
      groupName = g.name
    }
    const students = memberIds.length ? await prisma.student.findMany({ where: { id: { in: memberIds } }, include: { class: true } }) : []
    const rows = [
      ['First Name','Last Name','Email','Class','Grade','Student ID'].join(','),
      ...students.map(s => [
        `"${(s.firstName||'').replace(/"/g,'""')}"`,
        `"${(s.lastName||'').replace(/"/g,'""')}"`,
        `"${(s.email||'').replace(/"/g,'""')}"`,
        `"${(s.class?.name||'').replace(/"/g,'""')}"`,
        `"${(s.class?.grade||s.grade||'').replace(/"/g,'""')}"`,
        `"${(s.wristbandId||s.id.slice(0,8).toUpperCase()).replace(/"/g,'""')}"`,
      ].join(','))
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${groupName.replace(/[^a-z0-9_-]/gi,'_')}.csv"`)
    res.send(rows)
  } catch (e) {
    console.error('Export CSV error:', e)
    res.status(500).send('error')
  }
})

// Remove a member from a group
app.delete('/api/groups/:groupId/members/:memberId', auth, async (req, res) => {
  try {
    await ensureGroupsSchema()
    const { groupId, memberId } = req.params
    if (groupsMode === 'file') {
      fileGroups.removeMember(groupId, memberId) // memberId is studentId in file mode
      res.json({ status: 'removed' })
    } else {
      await prisma.studentGroup.delete({ where: { id: memberId } })
      res.json({ status: 'removed' })
    }
  } catch (e) {
    console.error('Remove member error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
