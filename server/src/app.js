const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
dotenv.config();
const prisma = require('./db');
const { randomUUID } = require('crypto');
const fs = require('fs')
const path = require('path')
const fileGroups = require('./groupsStore')
const staffStore = require('./staffStore')
const allocationsStore = require('./allocationsStore')
const timetableStore = require('./timetableStore')
const schoolsStore = require('./schoolsStore')
const { generateQuestions, evaluateShortAnswer } = require('./services/gemini');
const { generateQuestionsDS, evaluateShortAnswerDS, isDSAvailable } = require('./services/deepseek');

// Global DB health flag
let isDBConnected = false;
async function checkDBStatus() {
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
    isDBConnected = true;
    console.log('Database connected');
  } catch (e) {
    isDBConnected = false;
    console.log('Database unavailable, using file-based fallback');
  }
}
checkDBStatus();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic Health Check
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Skullar API</title>
        <link rel="icon" type="image/svg+xml" href="http://localhost:5173/src/assets/Skullar%20Favicon.svg" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
          .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; max-width: 400px; text-align: center; }
          h1 { color: #0f172a; margin-top: 0; }
          p { color: #64748b; line-height: 1.5; }
          .links { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem; }
          a { color: #0ea5e9; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Skullar API</h1>
          <p>The backend server is running successfully. This is an API-only server.</p>
          <div class="links">
            <a href="http://localhost:5173">Go to Web App (Frontend)</a>
            <a href="/api/health">Check API Health</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Skullar API is running' });
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

const auth = (req, res, next) => {
  const raw = req.headers.cookie || ''
  const parts = raw.split(';').map(s => s.trim()).filter(Boolean)
  let sid = ''
  let tid = ''
  let studentId = ''
  for (const p of parts) {
    const eq = p.indexOf('=')
    if (eq > 0) {
      const k = p.slice(0, eq)
      const v = p.slice(eq + 1)
      if (k === 'schoolId') sid = decodeURIComponent(v || '')
      if (k === 'teacherId') tid = decodeURIComponent(v || '')
      if (k === 'studentId') studentId = decodeURIComponent(v || '')
    }
  }
  let schoolId = sid || 'local'
  // If DB is down and we are on local, we stay on local but the routes will now use file fallback
  req.schoolId = schoolId
  req.teacherId = tid || ''
  req.studentId = studentId || ''
  next();
};

app.get('/api/marks', auth, async (req, res) => {
  try {
    const { examId, classId, subject, assessmentType, elementName } = req.query
    console.log('GET /api/marks query received:', req.query);
    
    const schoolId = req.schoolId || 'local'
    const store = readTenantMarks(schoolId)
    let filtered = store.marks || []
    
    // Determine the target exam identifier
    const isCa = (assessmentType || '').toLowerCase().includes('ca') || (assessmentType || '').toLowerCase().includes('continuous');
    const targetExamId = examId || (isCa ? 'ca-marks' : null);
    
    if (targetExamId) filtered = filtered.filter(m => m.examId === targetExamId)
    
    if (classId) {
      // Find canonical class ID
      const classesStore = readTenantClasses(schoolId)
      const targetClass = classesStore.classes.find(c => 
        c.id === classId || 
        (c.name || '').toLowerCase().trim() === classId.toLowerCase().trim() ||
        (c.grade || '').toLowerCase().trim() === classId.toLowerCase().trim()
      )
      const canonId = targetClass ? targetClass.id : classId
      filtered = filtered.filter(m => m.classId === canonId || (targetClass && (m.classId === targetClass.name || m.classId === targetClass.grade)))
    }
    
    if (subject) {
      filtered = filtered.filter(m => (m.subject || '').toLowerCase().trim() === subject.toLowerCase().trim())
    }
    
    if (assessmentType) {
      filtered = filtered.filter(m => (m.assessmentType || '').toLowerCase().trim() === assessmentType.toLowerCase().trim())
    }
    
    if (elementName) {
      filtered = filtered.filter(m => (m.elementName || '').toLowerCase().trim() === elementName.toLowerCase().trim())
    }
    
    return res.json(filtered)
  } catch (e) {
    console.error('GET /api/marks error:', e);
    return res.status(500).json({ error: e.message })
  }
});

const TENANT_DIR = path.join(__dirname, '..', 'data', 'tenants')
function ensureTenantStudentsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'students.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ students: [] }, null, 2))
  return file
}
function readTenantStudents(schoolId) {
  const file = ensureTenantStudentsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { students: [] } }
}
function writeTenantStudents(schoolId, data) {
  const file = ensureTenantStudentsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantTeachersFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'teachers.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ teachers: [] }, null, 2))
  return file
}
function readTenantTeachers(schoolId) {
  const file = ensureTenantTeachersFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { teachers: [] } }
}
function writeTenantTeachers(schoolId, data) {
  const file = ensureTenantTeachersFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantClassesFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'classes.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ classes: [] }, null, 2))
  return file
}
function readTenantClasses(schoolId) {
  const file = ensureTenantClassesFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { classes: [] } }
}
function writeTenantClasses(schoolId, data) {
  const file = ensureTenantClassesFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantBehaviorLogsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'behavior_logs.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ logs: [] }, null, 2))
  return file
}
function readTenantBehaviorLogs(schoolId) {
  const file = ensureTenantBehaviorLogsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { logs: [] } }
}
function writeTenantBehaviorLogs(schoolId, data) {
  const file = ensureTenantBehaviorLogsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantSubjectsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'subjects.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ subjects: [] }, null, 2))
  return file
}
function readTenantSubjects(schoolId) {
  const file = ensureTenantSubjectsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { subjects: [] } }
}
function writeTenantSubjects(schoolId, data) {
  const file = ensureTenantSubjectsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantAnnouncementsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'announcements.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ announcements: [] }, null, 2))
  return file
}
function readTenantAnnouncements(schoolId) {
  const file = ensureTenantAnnouncementsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { announcements: [] } }
}
function writeTenantAnnouncements(schoolId, data) {
  const file = ensureTenantAnnouncementsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
function readTenantSubjects(schoolId) {
  const file = ensureTenantSubjectsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { subjects: [] } }
}
function writeTenantSubjects(schoolId, data) {
  const file = ensureTenantSubjectsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantClassAssignmentsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'class_assignments.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ assignments: [] }, null, 2))
  return file
}
function readTenantClassAssignments(schoolId) {
  const file = ensureTenantClassAssignmentsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { assignments: [] } }
}
function writeTenantClassAssignments(schoolId, data) {
  const file = ensureTenantClassAssignmentsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantQuestionPapersFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'question_papers.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ papers: [], sections: [], questions: [] }, null, 2))
  return file
}
function readTenantQuestionPapers(schoolId) {
  const file = ensureTenantQuestionPapersFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { papers: [], sections: [], questions: [] } }
}
function writeTenantQuestionPapers(schoolId, data) {
  const file = ensureTenantQuestionPapersFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantCourseMaterialsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'course_materials.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ materials: [] }, null, 2))
  return file
}
function readTenantCourseMaterials(schoolId) {
  const file = ensureTenantCourseMaterialsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { materials: [] } }
}
function writeTenantCourseMaterials(schoolId, data) {
  const file = ensureTenantCourseMaterialsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantTeachingAssignmentsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'teaching_assignments.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ assignments: [] }, null, 2))
  return file
}
function readTenantTeachingAssignments(schoolId) {
  const file = ensureTenantTeachingAssignmentsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { assignments: [] } }
}
function writeTenantTeachingAssignments(schoolId, data) {
  const file = ensureTenantTeachingAssignmentsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantSubmissionsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'submissions.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ submissions: [] }, null, 2))
  return file
}
function readTenantSubmissions(schoolId) {
  const file = ensureTenantSubmissionsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { submissions: [] } }
}
function writeTenantSubmissions(schoolId, data) {
  const file = ensureTenantSubmissionsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantExamsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'exams.json')
  if (!fs.existsSync(file)) {
    const defaultExams = {
      exams: [
        { id: 'mid-term-1', title: 'Mid-Term 1', term: 'First Term', year: '2025/2026' },
        { id: 'end-term-1', title: 'End of Term 1', term: 'First Term', year: '2025/2026' }
      ]
    }
    fs.writeFileSync(file, JSON.stringify(defaultExams, null, 2))
  }
  return file
}
function readTenantExams(schoolId) {
  const file = ensureTenantExamsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { exams: [] } }
}
function writeTenantExams(schoolId, data) {
  const file = ensureTenantExamsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantExamSettingsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'exam-settings.json')
  if (!fs.existsSync(file)) {
    const defaultSettings = {
      systems: [
        {
          id: randomUUID(),
          name: 'END OF TERM EXAMS',
          grades: [
            { id: 1, lower: 90, upper: 100, grade: '1', remarks: 'HIGHEST', descriptor: 'EXCELLENT PERFORMANCE' },
            { id: 2, lower: 80, upper: 89, grade: '2', remarks: 'HIGHER', descriptor: 'VERY GOOD' },
            { id: 3, lower: 70, upper: 79, grade: '3', remarks: 'HIGH', descriptor: 'GOOD' },
            { id: 4, lower: 60, upper: 69, grade: '4', remarks: 'HIGH AVERAGE', descriptor: 'ABOVE AVERAGE' },
            { id: 5, lower: 55, upper: 59, grade: '5', remarks: 'AVERAGE', descriptor: 'SATISFACTORY' },
            { id: 6, lower: 52, upper: 54, grade: '6', remarks: 'LOW AVERAGE', descriptor: 'FAIR' },
            { id: 7, lower: 49, upper: 51, grade: '7', remarks: 'LOW', descriptor: 'BELOW' },
            { id: 8, lower: 30, upper: 48, grade: '8', remarks: 'LOWER', descriptor: 'POOR' },
            { id: 9, lower: 0, upper: 29, grade: '9', remarks: 'LOWEST', descriptor: 'NEEDS IMPROVEMENT' },
          ],
          assignedClasses: []
        }
      ],
      scales: [
        {
          id: randomUUID(),
          name: 'PRIMARY END OF TERM EXAMS SCALE',
          overallScore: 100,
          from: 60,
          to: 40,
          assignedClasses: [],
          status: 'active'
        }
      ],
      assessments: [
        {
          id: randomUUID(),
          name: 'End of Term',
          items: [
            { id: 1, name: 'MID TERM', total: 20 },
            { id: 2, name: 'CLASS TEST', total: 10 },
            { id: 3, name: 'GROUP WORK', total: 10 },
            { id: 4, name: 'PROJECT WORK', total: 10 },
            { id: 5, name: 'CLASS WORK', total: 5 },
            { id: 6, name: 'HOMEWORK', total: 5 }
          ],
          assignedClasses: [],
          status: 'active'
        }
      ],
      examConfigs: [
        {
          id: randomUUID(),
          name: 'End of Year Science Exam',
          gradingSystem: '',
          scale: '',
          assessmentType: '',
          classes: [],
          terms: ['Term 1', 'Term 2', 'Term 3'],
          status: 'active'
        }
      ],
      rules: {
        autoCalculatePositions: true,
        showPositionOnReport: true,
        allowTeacherModifications: false,
        requireAdminApproval: true,
      },
      repeatingStudents: []
    }
    fs.writeFileSync(file, JSON.stringify(defaultSettings, null, 2))
  }
  return file
}
function readTenantExamSettings(schoolId) {
  const file = ensureTenantExamSettingsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { systems: [], rules: {} } }
}
function writeTenantExamSettings(schoolId, data) {
  const file = ensureTenantExamSettingsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantMarksFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'marks.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ marks: [] }, null, 2))
  return file
}
function readTenantMarks(schoolId) {
  const file = ensureTenantMarksFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { marks: [] } }
}
function writeTenantMarks(schoolId, data) {
  const file = ensureTenantMarksFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantRemarksFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'remarks.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ remarks: [] }, null, 2))
  return file
}
function readTenantRemarks(schoolId) {
  const file = ensureTenantRemarksFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { remarks: [] } }
}
function writeTenantRemarks(schoolId, data) {
  const file = ensureTenantRemarksFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function ensureTenantEventsFile(schoolId) {
  if (!fs.existsSync(TENANT_DIR)) fs.mkdirSync(TENANT_DIR, { recursive: true })
  const dir = path.join(TENANT_DIR, schoolId)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'events.json')
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ events: [] }, null, 2))
  return file
}
function readTenantEvents(schoolId) {
  const file = ensureTenantEventsFile(schoolId)
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return { events: [] } }
}
function writeTenantEvents(schoolId, data) {
  const file = ensureTenantEventsFile(schoolId)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// Super Admin profile store (file-based)
const SUPERADMIN_FILE = path.join(__dirname, '..', 'data', 'superadmin-profile.json')
function ensureSuperAdminFile() {
  const dir = path.dirname(SUPERADMIN_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(SUPERADMIN_FILE)) {
    const def = {
      name: process.env.SUPERADMIN_NAME || 'Super Admin',
      phone: (process.env.SUPERADMIN_PHONE || '0000000000'),
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@skullar'
    }
    fs.writeFileSync(SUPERADMIN_FILE, JSON.stringify(def, null, 2))
  }
}
function readSuperAdminProfile() {
  ensureSuperAdminFile()
  try { return JSON.parse(fs.readFileSync(SUPERADMIN_FILE, 'utf8')) } catch { return { name: 'Super Admin', phone: '', email: '' } }
}
function writeSuperAdminProfile(p) {
  ensureSuperAdminFile()
  const cur = readSuperAdminProfile()
  const next = { ...cur, ...p }
  fs.writeFileSync(SUPERADMIN_FILE, JSON.stringify(next, null, 2))
  return next
}

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
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const { students } = readTenantStudents(req.schoolId)
      const { classes } = readTenantClasses(req.schoolId)
      const { teachers } = readTenantTeachers(req.schoolId)
      return res.json({ 
        totalStudents: students.length, 
        totalClasses: classes.length, 
        totalStaff: teachers.length, 
        totalGuardians: 0, 
        revenue: 0, 
        status: 'ok' 
      })
    }
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
      profilePicture, password, profilePhoto, guardianPhoto,
    } = req.body || {}

    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantStudents(req.schoolId || 'local')
      const classesStore = readTenantClasses(req.schoolId || 'local')
      const idx = store.students.findIndex(s => s.id === id)
      if (idx < 0) return res.status(404).json({ error: 'not found' })
      const s = store.students[idx]

      if (email !== undefined && email.toLowerCase() !== (s.email || '').toLowerCase()) {
        const exists = store.students.some(st => (st.email || '').toLowerCase() === email.toLowerCase())
        if (exists) return res.status(409).json({ error: `A student with email ${email} already exists.` })
      }

      if (wristbandId !== undefined && wristbandId !== s.wristbandId) {
        const idExists = store.students.some(st => st.wristbandId === wristbandId)
        if (idExists) return res.status(409).json({ error: `A student with ID ${wristbandId} already exists.` })
      }
      if (firstName !== undefined) s.firstName = firstName
      if (lastName !== undefined) s.lastName = lastName
      if (email !== undefined) s.email = email
      if (grade !== undefined) s.grade = grade
      if (classId !== undefined) s.classId = classId
      if (wristbandId !== undefined) s.wristbandId = wristbandId
      if (gender !== undefined) s.gender = gender
      if (birthday !== undefined) s.birthday = birthday ? new Date(birthday).toISOString() : s.birthday
      if (admittedAt !== undefined) s.admittedAt = admittedAt ? new Date(admittedAt).toISOString() : s.admittedAt
      if (religion !== undefined) s.religion = religion
      if (nationality !== undefined) s.nationality = nationality
      if (hometown !== undefined) s.hometown = hometown
      if (address !== undefined) s.address = address
      if (guardianName !== undefined) s.guardianName = guardianName
      if (guardianRelationship !== undefined) s.guardianRelationship = guardianRelationship
      if (guardianContact !== undefined) s.guardianContact = guardianContact
      if (profilePicture !== undefined) s.profilePicture = profilePicture
      if (profilePhoto !== undefined) s.profilePhoto = profilePhoto
      if (guardianPhoto !== undefined) s.guardianPhoto = guardianPhoto
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        s.password = `${salt}:${hash}`
      }
      s.updatedAt = new Date().toISOString()
      writeTenantStudents(req.schoolId, store)
      const c = classesStore.classes.find(cx => cx.id === s.classId)
      return res.json({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        className: c?.name || '',
        grade: c?.grade || s.grade || '',
        studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
        createdAt: s.createdAt
      })
    }
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
    if (profilePicture !== undefined) data.profilePicture = profilePicture
    if (profilePhoto !== undefined) data.profilePhoto = profilePhoto
    if (guardianPhoto !== undefined) data.guardianPhoto = guardianPhoto
    if (password && password.trim()) {
      const crypto = require('crypto')
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
      data.password = `${salt}:${hash}`
    }

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantStudents(req.schoolId)
      const idx = (store.students || []).findIndex(s => s.id === id)
      if (idx === -1) return res.status(404).json({ error: 'not found' })
      const now = new Date().toISOString()
      store.students[idx] = { ...store.students[idx], ...data, updatedAt: now }
      writeTenantStudents(req.schoolId, store)
      const updated = store.students[idx]
      return res.json({
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        className: '',
        grade: updated.grade || '',
        studentId: updated.wristbandId || updated.id.slice(0, 8).toUpperCase(),
        createdAt: updated.createdAt
      })
    }

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
      const field = (e.meta?.target || []).join(', ')
      return res.status(409).json({ error: `Update failed: A student with this ${field || 'email or student ID'} already exists.` })
    }
    console.error('Update student error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});
app.get('/api/students', auth, async (req, res) => {
  try {
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
      const q = (req.query.q || '').toString().trim().toLowerCase()
      const classIdFilter = (req.query.classId || '').toString().trim()
      const store = readTenantStudents(req.schoolId)
      const classesStore = readTenantClasses(req.schoolId)
      const all = Array.isArray(store.students) ? store.students : []
      let filtered = all
      if (q) {
        filtered = filtered.filter(s =>
          (s.firstName || '').toLowerCase().includes(q) ||
          (s.lastName || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q))
      }
      if (classIdFilter) {
        // Find the class by ID or Name/Grade to handle mismatches
        const targetClass = classesStore.classes.find(c => 
          c.id === classIdFilter || 
          (c.name || '').toLowerCase().trim() === classIdFilter.toLowerCase().trim() ||
          (c.grade || '').toLowerCase().trim() === classIdFilter.toLowerCase().trim()
        )
        
        if (targetClass) {
          filtered = filtered.filter(s => s.classId === targetClass.id || s.classId === targetClass.name || s.classId === targetClass.grade)
        } else {
          filtered = filtered.filter(s => s.classId === classIdFilter)
        }
      }
      const total = filtered.length
      const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
      const data = items.map((s, i) => {
        const c = classesStore.classes.find(cx => cx.id === s.classId)
        return {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          className: c?.name || '',
          grade: c?.grade || s.grade || '',
          studentId: s.wristbandId || (s.id || '').slice(0, 8).toUpperCase(),
          profilePicture: s.profilePicture || null,
          behaviorPoints: s.behaviorPoints !== undefined ? s.behaviorPoints : 100,
          gender: s.gender || null,
          profilePhoto: s.profilePhoto || null,
          guardianPhoto: s.guardianPhoto || null,
          index: (page - 1) * pageSize + i + 1,
        }
      })
      return res.json({ total, page, pageSize, data })
    }
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString().trim()
    const classIdFilter = (req.query.classId || '').toString().trim()
    const includeArchived = (req.query.includeArchived || 'false') === 'true'
    const baseFilter = includeArchived ? {} : { status: { not: 'archived' } }

    const andConditions = [baseFilter]
    if (q) {
      andConditions.push({
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      })
    }
    if (classIdFilter) {
      andConditions.push({ classId: classIdFilter })
    }

    const where = { AND: andConditions }
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
      profilePicture: s.profilePicture || null,
      behaviorPoints: s.behaviorPoints,
      gender: null,
      profilePhoto: s.profilePhoto || null,
      guardianPhoto: s.guardianPhoto || null,
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
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const { classes } = readTenantClasses(req.schoolId)
      const { students } = readTenantStudents(req.schoolId)
      const { teachers } = readTenantTeachers(req.schoolId)
      const data = classes.map(c => {
        const t = teachers.find(tx => tx.id === c.teacherId)
        return {
          ...c,
          studentCount: students.filter(s => s.classId === c.id).length,
          teacherName: t ? t.name : 'Unassigned',
          teacherId: c.teacherId || null
        }
      })
      return res.json(data)
    }
    const items = await prisma.class.findMany({ 
      include: { 
        _count: { select: { students: true } },
        teacher: { select: { name: true } }
      },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }] 
    })
    res.json(items.map(c => ({ 
      id: c.id, 
      name: c.name, 
      grade: c.grade, 
      studentCount: c._count.students,
      teacherName: c.teacher?.name || 'Unassigned',
      teacherId: c.teacherId || null
    })))
  } catch (e) {
    console.error('Classes error:', e)
    res.status(200).json([])
  }
});

app.post('/api/classes', auth, async (req, res) => {
  try {
    const { name, grade } = req.body
    if (!grade) return res.status(400).json({ error: 'Grade is required' })

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantClasses(req.schoolId)
      const newClass = {
        id: randomUUID(),
        name: name || '',
        grade,
        createdAt: new Date().toISOString()
      }
      store.classes.push(newClass)
      writeTenantClasses(req.schoolId, store)
      return res.json(newClass)
    }
    const created = await prisma.class.create({ data: { name: name || '', grade } })
    res.json(created)
  } catch (e) {
    console.error('Create class error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});

app.put('/api/classes/:id/assign-teacher', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { teacherId } = req.body
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantClasses(req.schoolId)
      const cIdx = store.classes.findIndex(c => c.id === id)
      if (cIdx < 0) return res.status(404).json({ error: 'Class not found' })
      store.classes[cIdx].teacherId = teacherId || null
      writeTenantClasses(req.schoolId, store)
      return res.json({ success: true })
    }
    await prisma.class.update({
      where: { id },
      data: { teacherId: teacherId || null }
    })
    res.json({ success: true })
  } catch (e) {
    console.error('Assign teacher error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});

app.delete('/api/classes/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantClasses(req.schoolId)
      store.classes = store.classes.filter(c => c.id !== id)
      writeTenantClasses(req.schoolId, store)
      return res.json({ success: true })
    }
    await prisma.class.delete({ where: { id } })
    res.json({ success: true })
  } catch (e) {
    console.error('Delete class error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});

// ============== Subjects & Teaching Assignments ==============
app.get('/api/subjects', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const grade = (req.query.grade || '').toString().toLowerCase()
    
    // 1. Load tenant-specific subjects
    let tenantSubjects = []
    try {
      const store = readTenantSubjects(schoolId)
      tenantSubjects = (store.subjects || []).map(s => typeof s === 'string' ? s : s.name)
    } catch (e) {
      console.error('Error reading tenant subjects:', e)
    }
    
    // 2. Load grade-specific common subjects as fallback
    const common = ['Mathematics', 'English', 'Science', 'Social Studies', 'Religious Moral Education', 'Computing', 'Creative Arts']
    const early = ['Computing', 'Numeracy', 'Language and Literacy', 'Phonics', 'Pre-writing', 'Geography', 'Creative Arts']
    const upper = ['Mathematics', 'English', 'Science', 'Computing', 'History', 'Geography', 'Religious Moral Education', 'Social Studies', 'Creative Arts']
    
    let defaultList = common
    if (grade.includes('nursery') || grade.includes('kg') || grade.includes('creche')) defaultList = early
    else if (grade.includes('grade') || grade.includes('primary')) defaultList = upper
    
    // 3. Merge and deduplicate (case-insensitive)
    const merged = [...tenantSubjects]
    defaultList.forEach(s => {
      if (!merged.some(m => m.toLowerCase().trim() === s.toLowerCase().trim())) {
        merged.push(s)
      }
    })
    
    // Return both formats for backward compatibility
    res.json({ subjects: merged, data: merged })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown', subjects: [] })
  }
})

app.post('/api/subjects', auth, async (req, res) => {
  try {
    const { name, category } = req.body
    if (!name) return res.status(400).json({ error: 'Subject name is required' })
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantSubjects(req.schoolId)
      const newSub = { id: randomUUID(), name, category: category || 'General', createdAt: new Date().toISOString() }
      store.subjects.push(newSub)
      writeTenantSubjects(req.schoolId, store)
      return res.json(newSub)
    }
    res.status(501).json({ error: 'DB implementation for subjects pending' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/subjects/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantSubjects(req.schoolId)
      store.subjects = store.subjects.filter(s => s.id !== id)
      writeTenantSubjects(req.schoolId, store)
      return res.json({ success: true })
    }
    res.status(501).json({ error: 'DB implementation for subjects pending' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/teaching-assignments', auth, async (req, res) => {
  try {
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const { assignments } = readTenantTeachingAssignments(req.schoolId)
      const { subjects } = readTenantSubjects(req.schoolId)
      const { teachers } = readTenantTeachers(req.schoolId)
      const { classes } = readTenantClasses(req.schoolId)

      const data = assignments.map(a => {
        const s = subjects.find(sx => sx.id === a.subjectId)
        const t = teachers.find(tx => tx.id === a.teacherId)
        const c = classes.find(cx => cx.id === a.classId)
        return {
          ...a,
          subjectName: s?.name || 'Unknown',
          teacherName: t?.name || 'Unknown',
          className: c?.name || 'Unknown',
          grade: c?.grade || ''
        }
      })
      return res.json({ assignments: data, classes, teachers, subjects })
    }
    res.json({ assignments: [], classes: [], teachers: [], subjects: [] })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/teaching-assignments', auth, async (req, res) => {
  try {
    const { teacherId, classIds, subjectIds } = req.body
    if (!teacherId || !classIds || !subjectIds || !Array.isArray(classIds) || !Array.isArray(subjectIds)) {
      return res.status(400).json({ error: 'teacherId, classIds (array), and subjectIds (array) are required' })
    }
    
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantTeachingAssignments(req.schoolId)
      const newAssignments = []
      
      for (const classId of classIds) {
        for (const subjectId of subjectIds) {
          // Avoid duplicates
          const exists = store.assignments.find(a => 
            a.teacherId === teacherId && 
            a.classId === classId && 
            a.subjectId === subjectId
          )
          if (!exists) {
            const a = { id: randomUUID(), teacherId, classId, subjectId, createdAt: new Date().toISOString() }
            store.assignments.push(a)
            newAssignments.push(a)
          }
        }
      }
      
      writeTenantTeachingAssignments(req.schoolId, store)
      return res.json({ success: true, count: newAssignments.length, assignments: newAssignments })
    }
    res.status(501).json({ error: 'DB implementation pending' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/teaching-assignments/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const store = readTenantTeachingAssignments(req.schoolId)
      store.assignments = store.assignments.filter(a => a.id !== id)
      writeTenantTeachingAssignments(req.schoolId, store)
      return res.json({ success: true })
    }
    res.status(501).json({ error: 'DB implementation pending' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Behavior Tracker ==============
app.get('/api/students/:id/behavior/history', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      let currentSchoolId = req.schoolId || 'local'
      let behaviorStore = readTenantBehaviorLogs(currentSchoolId)
      let studentLogs = (behaviorStore.logs || []).filter(l => l.studentId === id)

      // If no logs found, student might be in a different tenant than what the cookie suggests
      if (studentLogs.length === 0) {
        const schools = schoolsStore.list().filter(sc => sc.id !== currentSchoolId)
        for (const school of schools) {
          try {
            const tempStore = readTenantBehaviorLogs(school.id)
            const logsFound = (tempStore.logs || []).filter(l => l.studentId === id)
            if (logsFound.length > 0) {
              studentLogs = logsFound
              currentSchoolId = school.id
              break
            }
          } catch (e) { }
        }
      }

      return res.json(studentLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }
    const logs = await prisma.behaviorLog.findMany({
      where: { studentId: id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(logs)
  } catch (e) {
    console.error('Behavior history error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/students/:id/behavior', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { type, category, score, reason, authorName } = req.body
    if (!type || !category || score === undefined) {
      return res.status(400).json({ error: 'type, category and score are required' })
    }

    if (req.schoolId && req.schoolId !== 'local') {
      const studentStore = readTenantStudents(req.schoolId)
      const sIdx = studentStore.students.findIndex(s => s.id === id)
      if (sIdx < 0) return res.status(404).json({ error: 'student not found' })

      const student = studentStore.students[sIdx]
      if (student.behaviorPoints === undefined) student.behaviorPoints = 100

      if (type === 'addition') student.behaviorPoints += score
      else if (type === 'deduction') student.behaviorPoints -= score

      writeTenantStudents(req.schoolId, studentStore)

      const logStore = readTenantBehaviorLogs(req.schoolId)
      const newLog = {
        id: randomUUID(),
        studentId: id,
        type,
        category,
        score,
        reason: reason || '',
        authorName: authorName || 'Teacher',
        createdAt: new Date().toISOString()
      }
      logStore.logs.push(newLog)
      writeTenantBehaviorLogs(req.schoolId, logStore)

      return res.json({ behaviorPoints: student.behaviorPoints, log: newLog })
    }

    const student = await prisma.student.findUnique({ where: { id } })
    if (!student) return res.status(404).json({ error: 'student not found' })

    let newPoints = student.behaviorPoints
    if (type === 'addition') newPoints += score
    else if (type === 'deduction') newPoints -= score

    const [updated, log] = await prisma.$transaction([
      prisma.student.update({ where: { id }, data: { behaviorPoints: newPoints } }),
      prisma.behaviorLog.create({
        data: {
          studentId: id,
          type,
          category,
          score,
          reason: reason || '',
          authorName: authorName || 'Teacher'
        }
      })
    ])
    res.json({ behaviorPoints: updated.behaviorPoints, log })
  } catch (e) {
    console.error('Update behavior error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Teachers (Staff)
app.get('/api/teachers', auth, async (req, res) => {
  try {
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
      const q = (req.query.q || '').toString().trim().toLowerCase()
      const store = readTenantTeachers(req.schoolId)
      const all = Array.isArray(store.teachers) ? store.teachers : []
      const filtered = q
        ? all.filter(t =>
          (t.name || '').toLowerCase().includes(q) ||
          (t.email || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q))
        : all
      const total = filtered.length
      const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
      const data = items.map((t, i) => {
        const p = staffStore.get(t.id) || {}
        return {
          id: t.id,
          name: t.name,
          email: t.email,
          subject: t.subject || '',
          profilePicture: p.profilePicture || null,
          index: (page - 1) * pageSize + i + 1,
        }
      })
      return res.json({ total, page, pageSize, data })
    }
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString().trim()
    const where = q
      ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } },
        ],
      }
      : {}
    const [total, items] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        include: { profile: { select: { profilePicture: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
    ])
    const data = items.map((t, i) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      subject: t.subject,
      profilePicture: t.profile?.profilePicture || null,
      index: (page - 1) * pageSize + i + 1,
    }))
    res.json({ total, page, pageSize, data })
  } catch (e) {
    console.error('Teachers error:', e)
    res.status(200).json({ total: 0, page: 1, pageSize: 20, data: [], error: e?.message || 'unknown' })
  }
})

app.get('/api/allocations', auth, async (req, res) => {
  try {
    if (req.schoolId && req.schoolId !== 'local') {
      return res.json({ classes: [], teachers: [], assignments: [] })
    }
    const [classes, teachers] = await Promise.all([
      prisma.class.findMany({ orderBy: [{ grade: 'asc' }, { name: 'asc' }] }),
      prisma.teacher.findMany({ orderBy: { name: 'asc' } })
    ])
    try {
      const assigns = await prisma.teachingAssignment.findMany()
      return res.json({
        classes: classes.map(c => ({ id: c.id, name: c.name, grade: c.grade })),
        teachers: teachers.map(t => ({ id: t.id, name: t.name, email: t.email, subject: t.subject })),
        assignments: assigns.map(a => ({ id: a.id, classId: a.classId, teacherId: a.teacherId, subject: a.subject }))
      })
    } catch (_) {
      const assigns = allocationsStore.list()
      return res.json({
        classes: classes.map(c => ({ id: c.id, name: c.name, grade: c.grade })),
        teachers: teachers.map(t => ({ id: t.id, name: t.name, email: t.email, subject: t.subject })),
        assignments: assigns
      })
    }
  } catch (e) {
    console.error('Allocations fetch error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/allocations', auth, async (req, res) => {
  try {
    const { classId, teacherId, subject } = req.body || {}
    if (!classId || !teacherId || !subject) return res.status(400).json({ error: 'classId, teacherId and subject are required' })
    try {
      const created = await prisma.teachingAssignment.create({ data: { classId, teacherId, subject: String(subject) } })
      return res.status(201).json({ id: created.id })
    } catch (e) {
      try {
        const existing = await prisma.teachingAssignment.findFirst({ where: { classId, teacherId, subject: String(subject) } })
        if (existing) return res.status(200).json({ id: existing.id })
      } catch (_) { }
      const c = allocationsStore.add({ classId, teacherId, subject })
      return res.status(201).json({ id: c.id })
    }
  } catch (e) {
    console.error('Allocation create error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/allocations/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    try {
      await prisma.teachingAssignment.delete({ where: { id } })
      return res.json({ status: 'removed' })
    } catch (_) {
      const removed = allocationsStore.remove(id)
      return res.json({ status: removed > 0 ? 'removed' : 'not_found' })
    }
  } catch (e) {
    console.error('Allocation delete error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/allocations/bulk', auth, async (req, res) => {
  try {
    const { classIds = [], subject, teacherIds = [] } = req.body || {}
    if (!Array.isArray(classIds) || !Array.isArray(teacherIds) || !subject) {
      return res.status(400).json({ error: 'classIds, teacherIds and subject are required' })
    }
    let created = 0
    let skipped = 0
    try {
      for (const classId of classIds) {
        for (const teacherId of teacherIds) {
          try {
            await prisma.teachingAssignment.create({ data: { classId, teacherId, subject: String(subject) } })
            created += 1
          } catch (_) {
            try {
              const ex = await prisma.teachingAssignment.findFirst({ where: { classId, teacherId, subject: String(subject) } })
              if (ex) skipped += 1
              else throw new Error()
            } catch {
              allocationsStore.add({ classId, teacherId, subject })
              created += 1
            }
          }
        }
      }
      return res.json({ created, skipped })
    } catch (_) {
      for (const classId of classIds) {
        for (const teacherId of teacherIds) {
          const a = allocationsStore.add({ classId, teacherId, subject })
          if (a) created += 1
        }
      }
      return res.json({ created, skipped })
    }
  } catch (e) {
    console.error('Allocation bulk error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Calendar Events ==============
app.get('/api/events', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const { events } = readTenantEvents(schoolId)
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/events', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const event = req.body
    if (!event.title || !event.date) return res.status(400).json({ error: 'Title and date are required' })
    
    const store = readTenantEvents(schoolId)
    store.events = Array.isArray(store.events) ? store.events : []
    
    if (!event.id) event.id = Math.random().toString(36).substr(2, 9)
    
    // Remove if exists (for edit)
    store.events = store.events.filter(e => e.id !== event.id)
    store.events.push(event)
    
    writeTenantEvents(schoolId, store)
    res.json(event)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const id = req.params.id
    const store = readTenantEvents(schoolId)
    store.events = (store.events || []).filter(e => e.id !== id)
    writeTenantEvents(schoolId, store)
    res.json({ status: 'deleted' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============== Lesson Plans (Planner) ==============
app.get('/api/lessons', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString().trim()
    const statusFilter = (req.query.status || '').toString().trim().toLowerCase()
    const assignedReviewer = (req.query.reviewer || '').toString().trim().toLowerCase()
    const where = q
      ? { OR: [{ topic: { contains: q, mode: 'insensitive' } }, { content: { contains: q, mode: 'insensitive' } }] }
      : {}
    const [total, items] = await Promise.all([
      prisma.lesson.count({ where }),
      prisma.lesson.findMany({
        where,
        include: { teacher: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      })
    ])
    const mapped = items.map((l, i) => {
      let meta = {}
      try { meta = JSON.parse(l.content || '{}') } catch { }
      const status = (meta.status || 'draft').toString()
      return ({
        id: l.id,
        topic: l.topic,
        content: l.content,
        teacherName: l.teacher?.name || '',
        className: meta.className || '',
        subject: meta.subject || '',
        term: meta.term || '',
        week: meta.week || '',
        assignedReviewer: meta.assignedReviewer || '',
        status,
        createdAt: l.createdAt,
        index: (page - 1) * pageSize + i + 1,
      })
    })
    let filtered = statusFilter ? mapped.filter(m => m.status.toLowerCase() === statusFilter) : mapped
    if (assignedReviewer) filtered = filtered.filter(m => (m.assignedReviewer || '').toLowerCase() === assignedReviewer)
    res.json({
      total, page, pageSize,
      data: filtered
    })
  } catch (e) {
    console.error('Lessons list error:', e)
    res.status(200).json({ total: 0, page: 1, pageSize: 20, data: [], error: e?.message || 'unknown' })
  }
})

// ============== Timetables ==============
function timeToMinutes(str) {
  const [h, m] = str.split(':').map(n => parseInt(n, 10))
  return h * 60 + m
}
function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0')
  const m = (min % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd)
}
function generatePeriods(startTime, endTime, periodMinutes, breaks = []) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const br = breaks.map(b => ({ s: timeToMinutes(b.start), e: timeToMinutes(b.end), name: b.name || 'Break' })).filter(b => b.e > b.s)
  const out = []
  let cursor = start
  let index = 1
  while (cursor + periodMinutes <= end) {
    const slotStart = cursor
    const slotEnd = cursor + periodMinutes
    const blocked = br.some(b => overlaps(slotStart, slotEnd, b.s, b.e))
    if (!blocked) {
      out.push({ index, start: minutesToTime(slotStart), end: minutesToTime(slotEnd) })
      index += 1
    }
    cursor += periodMinutes
  }
  return out
}

app.get('/api/timetables', auth, async (_req, res) => {
  try {
    const items = timetableStore.list()
    res.json(items.map(t => ({ id: t.id, name: t.name, periodMinutes: t.periodMinutes, startTime: t.startTime, endTime: t.endTime, includeSaturday: !!t.includeSaturday, createdAt: t.createdAt })))
  } catch (e) {
    console.error('Timetables error:', e)
    res.status(200).json([])
  }
})

app.post('/api/timetables', auth, async (req, res) => {
  try {
    const { name, startTime, endTime, periodMinutes, includeSaturday = false, breaks = [], classes = [] } = req.body || {}
    if (!name || !startTime || !endTime || !periodMinutes) return res.status(400).json({ error: 'name, startTime, endTime, periodMinutes are required' })
    const periods = generatePeriods(startTime, endTime, parseInt(periodMinutes, 10), breaks)
    const created = timetableStore.create({ name, startTime, endTime, periodMinutes: parseInt(periodMinutes, 10), includeSaturday: !!includeSaturday, breaks, periods, classes })
    res.status(201).json({ id: created.id })
  } catch (e) {
    console.error('Create timetable error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/timetables/:id', auth, async (req, res) => {
  try {
    const t = timetableStore.get(req.params.id)
    if (!t) return res.status(404).json({ error: 'not found' })
    res.json(t)
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/timetables/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { name, startTime, endTime, periodMinutes, includeSaturday, breaks, classes } = req.body || {}
    const patch = {}
    if (name !== undefined) patch.name = name
    if (startTime !== undefined) patch.startTime = startTime
    if (endTime !== undefined) patch.endTime = endTime
    if (periodMinutes !== undefined) patch.periodMinutes = parseInt(periodMinutes, 10)
    if (includeSaturday !== undefined) patch.includeSaturday = !!includeSaturday
    if (breaks !== undefined) patch.breaks = breaks
    if (classes !== undefined) patch.classes = classes
    const needsRecompute = (startTime !== undefined) || (endTime !== undefined) || (periodMinutes !== undefined) || (breaks !== undefined)
    const updated = timetableStore.update(id, patch)
    if (!updated) return res.status(404).json({ error: 'not found' })
    if (needsRecompute) {
      const base = timetableStore.get(id)
      const periods = generatePeriods(base.startTime, base.endTime, base.periodMinutes, base.breaks || [])
      timetableStore.update(id, { periods })
    }
    res.json({ id })
  } catch (e) {
    console.error('Update timetable error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/timetables/:id', auth, async (req, res) => {
  try {
    const removed = timetableStore.remove(req.params.id)
    res.json({ status: removed > 0 ? 'deleted' : 'not_found' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Super Admin: Schools ==============
app.get('/api/admin/schools', auth, async (_req, res) => {
  try {
    const name = process.env.SCHOOL_NAME || 'Skullar Local'
    const admin = process.env.SCHOOL_ADMIN || 'Admin'
    const phone = process.env.SCHOOL_PHONE || ''
    
    let studentsCount = 0
    if (isDBConnected) {
      const [count] = await Promise.all([
        prisma.student.count({ where: { status: { not: 'archived' } } })
      ])
      studentsCount = count
    } else {
      const { students } = readTenantStudents('local')
      studentsCount = students.length
    }

    const local = {
      id: 'local',
      name,
      address: process.env.SCHOOL_ADDRESS || '',
      admin,
      phone,
      plan: process.env.SUBSCRIPTION_PLAN || 'Free',
      status: 'active',
      expiry: 'N/A',
      students: studentsCount
    }
    const others = schoolsStore.list()
    res.json([local, ...others])
  } catch (e) {
    console.error('Admin schools error:', e)
    res.status(200).json([])
  }
})

app.get('/api/admin/dashboard/stats', auth, async (req, res) => {
  try {
    const schools = schoolsStore.list()
    const suspended = schools.filter(s => s.status === 'suspended').length
    
    let studentsCount = 0
    let teachersCount = 0
    if (isDBConnected) {
      studentsCount = await prisma.student.count({ where: { status: { not: 'archived' } } })
      teachersCount = await prisma.teacher.count()
    } else {
      const { students } = readTenantStudents('local')
      const { teachers } = readTenantTeachers('local')
      studentsCount = students.length
      teachersCount = teachers.length
    }

    // Revenue tracking is currently not implemented in the current schema
    const revenue = 0

    // For now, "Active Users" can be estimated or calculated from students + teachers
    const activeUsers = studentsCount + teachersCount

    res.json({
      totalSchools: 1 + schools.length, // local + others
      activeUsers,
      monthlyRevenue: revenue,
      suspendedSchools: suspended,
      planDistribution: {
        Premium: schools.filter(s => s.plan === 'Premium').length + (process.env.SUBSCRIPTION_PLAN === 'Premium' ? 1 : 0),
        Basic: schools.filter(s => s.plan === 'Basic').length + (process.env.SUBSCRIPTION_PLAN === 'Basic' ? 1 : 0),
        Free: schools.filter(s => s.plan === 'Free').length + (process.env.SUBSCRIPTION_PLAN === 'Free' || !process.env.SUBSCRIPTION_PLAN ? 1 : 0),
      }
    })
  } catch (e) {
    console.error('Admin dashboard stats error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/admin/schools', auth, async (req, res) => {
  try {
    const { name, address, adminName, adminPhone, adminTempPassword, plan = 'Basic' } = req.body || {}
    if (!name) return res.status(400).json({ error: 'name is required' })
    const created = (() => {
      const payload = { name, address: address || '', admin: adminName || '', phone: adminPhone || '', plan }
      if (adminTempPassword && adminTempPassword.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(adminTempPassword.trim(), salt, 64).toString('hex')
        payload.adminPassSalt = salt
        payload.adminPassHash = hash
      }
      return schoolsStore.create(payload)
    })()
    res.status(201).json({ id: created.id })
  } catch (e) {
    console.error('Create school error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/admin/schools/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (id === 'local') {
      const name = process.env.SCHOOL_NAME || 'Skullar Local'
      const admin = process.env.SCHOOL_ADMIN || 'Admin'
      const phone = process.env.SCHOOL_PHONE || ''
      const studentsCount = await prisma.student.count({ where: { status: { not: 'archived' } } })
      return res.json({
        id: 'local',
        name,
        address: process.env.SCHOOL_ADDRESS || '',
        admin,
        phone,
        plan: process.env.SUBSCRIPTION_PLAN || 'Free',
        status: 'active',
        expiry: 'N/A',
        students: studentsCount
      })
    }
    const s = schoolsStore.list().find(x => x.id === id)
    if (!s) return res.status(404).json({ error: 'not found' })
    res.json(s)
  } catch (e) {
    console.error('Get school error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/admin/schools/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (id === 'local') return res.status(400).json({ error: 'cannot edit local school' })
    const { name, address, adminName, adminPhone, plan, adminTempPassword } = req.body || {}
    const patch = {}
    if (name !== undefined) patch.name = name
    if (address !== undefined) patch.address = address
    if (adminName !== undefined) patch.admin = adminName
    if (adminPhone !== undefined) patch.phone = adminPhone
    if (plan !== undefined) patch.plan = plan
    if (adminTempPassword && adminTempPassword.trim()) {
      const crypto = require('crypto')
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.scryptSync(adminTempPassword.trim(), salt, 64).toString('hex')
      patch.adminPassSalt = salt
      patch.adminPassHash = hash
    }
    const updated = schoolsStore.update(id, patch)
    if (!updated) return res.status(404).json({ error: 'not found' })
    res.json({ id: updated.id })
  } catch (e) {
    console.error('Update school error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/admin/schools/:id/suspend', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (id === 'local') return res.status(400).json({ error: 'cannot suspend local school' })
    const s = schoolsStore.list().find(x => x.id === id)
    if (!s) return res.status(404).json({ error: 'not found' })
    const next = s.status === 'suspended' ? 'active' : (s.status === 'pending' ? 'active' : 'suspended')
    const updated = schoolsStore.update(id, { status: next })
    res.json({ status: updated.status })
  } catch (e) {
    console.error('Suspend school error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/admin/schools/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (id === 'local') return res.status(400).json({ error: 'cannot delete local school' })
    const removed = schoolsStore.remove(id)
    res.json({ status: removed > 0 ? 'deleted' : 'not_found' })
  } catch (e) {
    console.error('Delete school error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// School admin credential verification (phone + temporary password)
app.post('/api/school-auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {}
    if (!phone || !password) return res.status(400).json({ error: 'phone and password are required' })
    const items = schoolsStore.list()
    const school = items.find(s => (s.phone || '').trim() === phone.trim())
    if (!school || !school.adminPassSalt || !school.adminPassHash) return res.status(401).json({ error: 'invalid credentials' })
    const crypto = require('crypto')
    const hash = crypto.scryptSync(password.trim(), school.adminPassSalt, 64).toString('hex')
    if (hash !== school.adminPassHash) return res.status(401).json({ error: 'invalid credentials' })
    res.json({ schoolId: school.id, name: school.name, plan: school.plan, status: school.status })
  } catch (e) {
    console.error('School auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Student Portal Login
app.post('/api/student-auth/login', async (req, res) => {
  try {
    const { studentId, password } = req.body || {}
    if (!studentId || !password) return res.status(400).json({ error: 'studentId and password are required' })

    const sid = studentId.trim()
    const headerSchoolId = req.headers['x-school-id'] || 'local'

    // Check tenant mode
    let student = null
    let targetSchoolId = headerSchoolId

    if (headerSchoolId && headerSchoolId !== 'local') {
      const store = readTenantStudents(headerSchoolId)
      student = (store.students || []).find(s =>
        (s.wristbandId && s.wristbandId.toUpperCase() === sid.toUpperCase()) ||
        (s.id && s.id.slice(0, 8).toUpperCase() === sid.toUpperCase())
      )
    } else {
      if (isDBConnected) {
        student = await prisma.student.findFirst({
          where: {
            OR: [
              { wristbandId: { equals: sid, mode: 'insensitive' } },
              { id: { startsWith: sid.toLowerCase() } }
            ]
          }
        })
      } else {
        const store = readTenantStudents('local')
        student = (store.students || []).find(s =>
          (s.wristbandId && s.wristbandId.toUpperCase() === sid.toUpperCase()) ||
          (s.id && s.id.slice(0, 8).toUpperCase() === sid.toUpperCase())
        )
      }
    }

    // 2. Global search if not found locally
    if (!student && headerSchoolId === 'local') {
      const schools = schoolsStore.list().filter(s => s.id !== 'local')
      for (const s of schools) {
        try {
          const store = readTenantStudents(s.id)
          const found = (store.students || []).find(x =>
            (x.wristbandId && x.wristbandId.toUpperCase() === sid.toUpperCase()) ||
            (x.id && x.id.slice(0, 8).toUpperCase() === sid.toUpperCase())
          )
          if (found) {
            student = found
            targetSchoolId = s.id
            break
          }
        } catch (e) { }
      }
    }

    if (!student || !student.password) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const parts = student.password.split(':')
    if (parts.length !== 2) return res.status(401).json({ error: 'invalid credentials' })
    const salt = parts[0]
    const hash = parts[1]

    const crypto = require('crypto')
    const attempt = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
    if (attempt !== hash) return res.status(401).json({ error: 'invalid credentials' })

    res.json({
      id: student.id,
      name: student.firstName + ' ' + student.lastName,
      studentId: student.wristbandId || student.id.slice(0, 8).toUpperCase(),
      schoolId: targetSchoolId
    })
  } catch (e) {
    console.error('Student auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Super admin credential verification
app.post('/api/superadmin/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {}
    if (!phone || !password) return res.status(400).json({ error: 'phone and password are required' })
    const superPhone = (process.env.SUPERADMIN_PHONE || '0000000000').trim()
    const superPass = (process.env.SUPERADMIN_PASSWORD || 'super123')
    if (phone.trim() !== superPhone || password !== superPass) {
      return res.status(401).json({ error: 'invalid credentials' })
    }
    res.json({ role: 'superadmin', name: 'Super Admin' })
  } catch (e) {
    console.error('Super admin auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/superadmin/profile', async (_req, res) => {
  try {
    const p = readSuperAdminProfile()
    res.json({ name: p.name || 'Super Admin', phone: p.phone || '', email: p.email || '' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/superadmin/profile', async (req, res) => {
  try {
    const { name, phone, email } = req.body || {}
    const updated = writeSuperAdminProfile({
      name: name !== undefined ? String(name).trim() : undefined,
      phone: phone !== undefined ? String(phone).trim() : undefined,
      email: email !== undefined ? String(email).trim() : undefined,
    })
    res.json({ status: 'ok', profile: updated })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// School admin change password
app.put('/api/school-auth/password', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId || schoolId === 'local') return res.status(400).json({ error: 'not allowed' })
    const { currentPassword, newPassword } = req.body || {}
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'newPassword must be at least 6 characters' })
    }
    const s = schoolsStore.list().find(x => x.id === schoolId)
    if (!s) return res.status(404).json({ error: 'school not found' })
    const crypto = require('crypto')
    if (s.adminPassSalt && s.adminPassHash) {
      if (!currentPassword) return res.status(401).json({ error: 'currentPassword required' })
      const cur = crypto.scryptSync(currentPassword.trim(), s.adminPassSalt, 64).toString('hex')
      if (cur !== s.adminPassHash) return res.status(401).json({ error: 'invalid current password' })
    }
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(newPassword.trim(), salt, 64).toString('hex')
    schoolsStore.update(schoolId, { adminPassSalt: salt, adminPassHash: hash })
    res.json({ status: 'ok' })
  } catch (e) {
    console.error('Change school password error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/school-auth/profile', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId || schoolId === 'local') return res.status(400).json({ error: 'not allowed' })
    const s = schoolsStore.list().find(x => x.id === schoolId)
    if (!s) return res.status(404).json({ error: 'school not found' })
    res.json({
      schoolId: s.id,
      schoolName: s.name || '',
      schoolLogo: s.logo || '',
      adminName: s.admin || '',
      adminPhone: s.phone || '',
      adminEmail: s.adminEmail || '',
      adminProfilePicture: s.adminProfilePicture || ''
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/school-auth/profile', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId
    if (!schoolId || schoolId === 'local') return res.status(400).json({ error: 'not allowed' })
    const { schoolName, adminName, adminPhone, adminEmail, schoolLogo, adminProfilePicture } = req.body || {}
    const patch = {}
    if (schoolName !== undefined) patch.name = String(schoolName).trim()
    if (adminName !== undefined) patch.admin = String(adminName).trim()
    if (adminPhone !== undefined) patch.phone = String(adminPhone).trim()
    if (adminEmail !== undefined) patch.adminEmail = String(adminEmail).trim()
    if (schoolLogo !== undefined) patch.logo = schoolLogo
    if (adminProfilePicture !== undefined) patch.adminProfilePicture = adminProfilePicture
    const updated = schoolsStore.update(schoolId, patch)
    if (!updated) return res.status(404).json({ error: 'school not found' })
    res.json({ status: 'ok' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/lessons', auth, async (req, res) => {
  try {
    const { topic, content, teacherId } = req.body || {}
    if (!topic || !content) return res.status(400).json({ error: 'topic and content are required' })
    const created = await prisma.lesson.create({ data: { topic: topic.trim(), content: String(content), teacherId: teacherId || undefined } })
    res.status(201).json({ id: created.id })
  } catch (e) {
    console.error('Create lesson error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/lessons/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const l = await prisma.lesson.findUnique({ where: { id }, include: { teacher: true } })
    if (!l) return res.status(404).json({ error: 'not found' })
    res.json({ id: l.id, topic: l.topic, content: l.content, teacherName: l.teacher?.name || '', createdAt: l.createdAt })
  } catch (e) {
    console.error('Lesson detail error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/lessons/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { topic, content, teacherId } = req.body || {}
    const updated = await prisma.lesson.update({
      where: { id }, data: {
        topic: topic !== undefined ? topic : undefined,
        content: content !== undefined ? String(content) : undefined,
        teacherId: teacherId !== undefined ? teacherId : undefined,
      }
    })
    res.json({ id: updated.id })
  } catch (e) {
    console.error('Update lesson error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.delete('/api/lessons/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    await prisma.lesson.delete({ where: { id } })
    res.json({ status: 'deleted' })
  } catch (e) {
    console.error('Delete lesson error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/lessons/:id/submit', auth, async (req, res) => {
  try {
    const id = req.params.id
    const l = await prisma.lesson.findUnique({ where: { id } })
    if (!l) return res.status(404).json({ error: 'not found' })
    let meta = {}
    try { meta = JSON.parse(l.content || '{}') } catch { }
    meta.status = 'pending'
    await prisma.lesson.update({ where: { id }, data: { content: JSON.stringify(meta) } })
    res.json({ status: 'pending' })
  } catch (e) {
    console.error('Submit lesson error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/lessons/:id/decision', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { action, reviewer = 'Reviewer', comment = '' } = req.body || {}
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action must be approve or reject' })
    const l = await prisma.lesson.findUnique({ where: { id } })
    if (!l) return res.status(404).json({ error: 'not found' })
    let meta = {}
    try { meta = JSON.parse(l.content || '{}') } catch { }
    meta.status = action === 'approve' ? 'approved' : 'rejected'
    const entry = { reviewer, action, comment, decidedAt: new Date().toISOString() }
    meta.reviews = Array.isArray(meta.reviews) ? meta.reviews : []
    meta.reviews.push(entry)
    await prisma.lesson.update({ where: { id }, data: { content: JSON.stringify(meta) } })
    res.json({ status: meta.status })
  } catch (e) {
    console.error('Decision lesson error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/lessons/:id/assign-reviewer', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { reviewer } = req.body || {}
    if (!reviewer || !reviewer.trim()) return res.status(400).json({ error: 'reviewer is required' })
    const l = await prisma.lesson.findUnique({ where: { id } })
    if (!l) return res.status(404).json({ error: 'not found' })
    let meta = {}
    try { meta = JSON.parse(l.content || '{}') } catch { }
    meta.assignedReviewer = reviewer.trim()
    await prisma.lesson.update({ where: { id }, data: { content: JSON.stringify(meta) } })
    res.json({ assignedReviewer: meta.assignedReviewer })
  } catch (e) {
    console.error('Assign reviewer error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/teachers', auth, async (req, res) => {
  try {
    const { name, email, subject, phone, tempPassword } = req.body || {}
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' })
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantTeachers(req.schoolId)
      const id = randomUUID()
      const obj = { id, name: name.trim(), email: String(email).trim(), subject: subject || '', createdAt: new Date().toISOString() }
      store.teachers = Array.isArray(store.teachers) ? store.teachers : []
      store.teachers.unshift(obj)
      writeTenantTeachers(req.schoolId, store)
      if (phone || tempPassword) {
        const patch = {}
        if (phone) patch.phone = String(phone).trim()
        if (tempPassword && tempPassword.trim()) {
          const crypto = require('crypto')
          const salt = crypto.randomBytes(16).toString('hex')
          const hash = crypto.scryptSync(tempPassword.trim(), salt, 64).toString('hex')
          patch.passSalt = salt
          patch.passHash = hash
        }
        patch.schoolId = req.schoolId
        staffStore.upsert(id, patch)
      }
      return res.status(201).json({ id, name: obj.name, email: obj.email, subject: obj.subject })
    }
    const created = await prisma.teacher.create({ data: { name: name.trim(), email: email.trim(), subject: subject || '' } })
    if (phone || tempPassword) {
      const patch = {}
      if (phone) patch.phone = String(phone).trim()
      if (tempPassword && tempPassword.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(tempPassword.trim(), salt, 64).toString('hex')
        patch.passSalt = salt
        patch.passHash = hash
      }
      patch.schoolId = 'local'
      staffStore.upsert(created.id, patch)
    }
    res.status(201).json({ id: created.id, name: created.name, email: created.email, subject: created.subject })
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Unique constraint failed' })
    console.error('Create teacher error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/teachers/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantTeachers(req.schoolId)
      const t = (store.teachers || []).find(x => x.id === id)
      if (!t) return res.status(404).json({ error: 'not found' })
      const prof = staffStore.get(id) || {}
      return res.json({ id: t.id, name: t.name, email: t.email, subject: t.subject, phone: prof.phone || '' })
    } else {
      const t = await prisma.teacher.findUnique({ where: { id } })
      if (!t) return res.status(404).json({ error: 'not found' })
      const prof = staffStore.get(id) || {}
      return res.json({ id: t.id, name: t.name, email: t.email, subject: t.subject, phone: prof.phone || '' })
    }
  } catch (e) {
    console.error('Teacher detail error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/teachers/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { name, email, subject } = req.body || {}
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantTeachers(req.schoolId)
      const idx = (store.teachers || []).findIndex(t => t.id === id)
      if (idx === -1) return res.status(404).json({ error: 'not found' })
      const prev = store.teachers[idx]
      const next = {
        ...prev,
        name: name !== undefined ? String(name) : prev.name,
        email: email !== undefined ? String(email) : prev.email,
        subject: subject !== undefined ? String(subject) : prev.subject,
        updatedAt: new Date().toISOString()
      }
      store.teachers[idx] = next
      writeTenantTeachers(req.schoolId, store)
      return res.json({ id: next.id, name: next.name, email: next.email, subject: next.subject })
    }
    const data = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (subject !== undefined) data.subject = subject
    const updated = await prisma.teacher.update({ where: { id }, data })
    res.json({ id: updated.id, name: updated.name, email: updated.email, subject: updated.subject })
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Unique constraint failed' })
    console.error('Update teacher error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/teachers/:id/profile', auth, async (req, res) => {
  try {
    const id = req.params.id
    try {
      const prof = await prisma.teacherProfile.findUnique({ where: { teacherId: id } })
      if (!prof) {
        return res.json({
          gender: '', phone: '', staffId: '', dateEmployed: '', ssn: '', nationalId: '', dob: '',
          momoNumber: '', accountNumber: '', bankBranch: '', bankName: '', nextOfKin: '', nextOfKinRelation: '', nextOfKinPhone: '',
          classesTaught: [], subjectsTaught: [], formMaster: ''
        })
      }
      return res.json({
        gender: prof.gender || '',
        phone: prof.phone || '',
        staffId: prof.staffId || '',
        dateEmployed: prof.dateEmployed ? prof.dateEmployed.toISOString().slice(0, 10) : '',
        ssn: prof.ssn || '',
        nationalId: prof.nationalId || '',
        dob: prof.dob ? prof.dob.toISOString().slice(0, 10) : '',
        momoNumber: prof.momoNumber || '',
        accountNumber: prof.accountNumber || '',
        bankBranch: prof.bankBranch || '',
        bankName: prof.bankName || '',
        nextOfKin: prof.nextOfKin || '',
        nextOfKinRelation: prof.nextOfKinRelation || '',
        nextOfKinPhone: prof.nextOfKinPhone || '',
        classesTaught: prof.classesTaught || [],
        subjectsTaught: prof.subjectsTaught || [],
        formMaster: prof.formMaster || '',
      })
    } catch (_) {
      const p = staffStore.get(id) || {}
      return res.json({
        gender: p.gender || '',
        phone: p.phone || '',
        staffId: p.staffId || '',
        dateEmployed: p.dateEmployed || '',
        ssn: p.ssn || '',
        nationalId: p.nationalId || '',
        dob: p.dob || '',
        momoNumber: p.momoNumber || '',
        accountNumber: p.accountNumber || '',
        bankBranch: p.bankBranch || '',
        bankName: p.bankName || '',
        nextOfKin: p.nextOfKin || '',
        nextOfKinRelation: p.nextOfKinRelation || '',
        nextOfKinPhone: p.nextOfKinPhone || '',
        classesTaught: Array.isArray(p.classesTaught) ? p.classesTaught : [],
        subjectsTaught: Array.isArray(p.subjectsTaught) ? p.subjectsTaught : [],
        formMaster: p.formMaster || '',
      })
    }
  } catch (e) {
    console.error('Teacher profile error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Exams & Marks ==============
app.get('/api/exams', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const store = readTenantExams(schoolId)
    res.json(store.exams || [])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/exams', auth, async (req, res) => {
  try {
    const { title, term, year, startDate, endDate } = req.body
    if (!title || !term || !year) return res.status(400).json({ error: 'title, term and year are required' })
    const schoolId = req.schoolId || 'local'
    const store = readTenantExams(schoolId)
    const newExam = {
      id: randomUUID(),
      title,
      term,
      year,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date().toISOString(),
      status: 'Draft',
      createdAt: new Date().toISOString()
    }
    store.exams = Array.isArray(store.exams) ? store.exams : []
    store.exams.unshift(newExam)
    writeTenantExams(schoolId, store)
    res.status(201).json(newExam)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/exams/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    const schoolId = req.schoolId || 'local'
    const store = readTenantExams(schoolId)
    store.exams = (store.exams || []).filter(e => e.id !== id)
    writeTenantExams(schoolId, store)
    res.json({ status: 'deleted' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/exam-settings', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const store = readTenantExamSettings(schoolId)
    res.json(store)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/exam-settings', auth, async (req, res) => {
  try {
    const { systems, scales, assessments, examConfigs, rules, repeatingStudents } = req.body
    const schoolId = req.schoolId || 'local'
    writeTenantExamSettings(schoolId, { systems, scales, assessments, examConfigs, rules, repeatingStudents })
    res.json({ status: 'saved' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/ca-status', auth, async (req, res) => {
  try {
    const { classId, subject } = req.query
    if (!classId || !subject) return res.status(400).json({ error: 'classId and subject are required' })
    
    const schoolId = req.schoolId || 'local'
    const settings = readTenantExamSettings(schoolId)
    const marks = readTenantMarks(schoolId)
    const classesStore = readTenantClasses(schoolId)
    
    // Find the canonical class ID to handle mismatches
    const targetClass = classesStore.classes.find(c => 
      c.id === classId || 
      (c.name || '').toLowerCase().trim() === classId.toLowerCase().trim() ||
      (c.grade || '').toLowerCase().trim() === classId.toLowerCase().trim()
    )
    
    const canonicalClassId = targetClass ? targetClass.id : classId
    
    // Get the active assessment type for this class/subject
    const activeAssessment = settings.assessments.find(a => 
      (a.assignedClasses || []).some(cls => 
        cls === canonicalClassId || 
        (targetClass && (cls === targetClass.name || cls === targetClass.grade))
      ) && a.status === 'active'
    )
    
    if (!activeAssessment) {
      return res.json({ 
        totalElements: 0, 
        completedElements: 0, 
        isComplete: false,
        elements: []
      })
    }
    
    // Check completion status for each CA element
    const elements = activeAssessment.items.map(item => {
      const existingMarks = marks.marks.filter(m => 
        (m.classId === canonicalClassId || (targetClass && (m.classId === targetClass.name || m.classId === targetClass.grade))) && 
        m.subject === subject && 
        m.assessmentType === 'ca' && 
        m.elementName === item.name
      )
      
      return {
        name: item.name,
        totalMarks: item.total,
        completed: existingMarks.length > 0,
        studentCount: existingMarks.length
      }
    })
    
    const totalElements = elements.length
    const completedElements = elements.filter(e => e.completed).length
    
    res.json({
      totalElements,
      completedElements,
      isComplete: completedElements === totalElements,
      elements
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/marks', auth, async (req, res) => {
  try {
    const { examId, classId, subject, entries, assessmentType, elementName } = req.body
    
    const isCa = (assessmentType || '').toLowerCase().includes('ca') || (assessmentType || '').toLowerCase().includes('continuous');
    const effectiveExamId = examId || (isCa ? 'ca-marks' : null);
    
    if (!effectiveExamId || !classId || !subject || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'examId (or CA context), classId, subject and entries are required' })
    }
    
    // Validate pedagogical lock for exam entries
    if (assessmentType === 'exam' || !assessmentType) {
      const schoolId = req.schoolId || 'local'
      const settings = readTenantExamSettings(schoolId)
      const marks = readTenantMarks(schoolId)
      const classesStore = readTenantClasses(schoolId)
      
      // Find the canonical class ID to handle mismatches
      const targetClass = classesStore.classes.find(c => 
        c.id === classId || 
        (c.name || '').toLowerCase().trim() === classId.toLowerCase().trim() ||
        (c.grade || '').toLowerCase().trim() === classId.toLowerCase().trim()
      )
      
      const canonicalClassId = targetClass ? targetClass.id : classId
      
      // Get the active assessment type for this class/subject
      const activeAssessment = settings.assessments.find(a => 
        (a.assignedClasses || []).some(cls => 
          cls === canonicalClassId || 
          (targetClass && (cls === targetClass.name || cls === targetClass.grade))
        ) && a.status === 'active'
      )
      
      if (activeAssessment) {
        // Check if all CA elements are completed
        const incompleteElements = activeAssessment.items.filter(item => {
          const existingMarks = marks.marks.filter(m => 
            (m.classId === canonicalClassId || (targetClass && (m.classId === targetClass.name || m.classId === targetClass.grade))) && 
            m.subject === subject && 
            m.assessmentType === 'ca' && 
            m.elementName === item.name
          )
          return existingMarks.length === 0
        })
        
        if (incompleteElements.length > 0) {
          return res.status(403).json({ 
            error: 'Pedagogical Lock: Cannot enter exam marks until all CA elements are recorded',
            incompleteElements: incompleteElements.map(e => e.name),
            message: `Please complete these CA elements first: ${incompleteElements.map(e => e.name).join(', ')}`
          })
        }
      }
    }
    
    const schoolId = req.schoolId || 'local'
    const store = readTenantMarks(schoolId)
    store.marks = Array.isArray(store.marks) ? store.marks : []
    
    // Remove existing marks for this context
    const filter = { examId, classId, subject }
    if (assessmentType) filter.assessmentType = assessmentType
    if (elementName) filter.elementName = elementName
    
    // Use targetClass for robust filtering if available
    const schoolClasses = readTenantClasses(schoolId).classes
    const tClass = schoolClasses.find(c => 
      c.id === classId || 
      (c.name || '').toLowerCase().trim() === classId.toLowerCase().trim() ||
      (c.grade || '').toLowerCase().trim() === classId.toLowerCase().trim()
    )
    const canonId = tClass ? tClass.id : classId

    store.marks = store.marks.filter(m => {
      const classMatch = m.classId === canonId || (tClass && (m.classId === tClass.name || m.classId === tClass.grade))
      const targetExamId = assessmentType === 'ca' ? 'ca-marks' : examId
      return !(m.examId === targetExamId && classMatch && m.subject === subject &&
              (!assessmentType || m.assessmentType === assessmentType) &&
              (!elementName || m.elementName === elementName))
    })
    
    // Add new marks
    const now = new Date().toISOString()
    const newEntries = entries.map(e => ({
      examId: assessmentType === 'ca' ? 'ca-marks' : examId, // Force correct ID for CA
      classId: canonId, // Save with canonical ID
      subject,
      studentId: e.studentId,
      score: parseFloat(e.score) || 0,
      comment: e.comment || '',
      synopsis: e.synopsis || '',
      assessmentType: assessmentType || 'exam',
      elementName: elementName || null,
      updatedAt: now
    }))
    
    store.marks.push(...newEntries)
    writeTenantMarks(schoolId, store)
    res.json({ status: 'saved', count: newEntries.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/reports/remarks', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const { studentId, examId } = req.query
    const store = readTenantRemarks(schoolId)
    let filtered = store.remarks || []
    if (studentId) filtered = filtered.filter(r => r.studentId === studentId)
    if (examId) filtered = filtered.filter(r => r.examId === examId)
    res.json(filtered)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/reports/remarks', auth, async (req, res) => {
  try {
    const schoolId = req.schoolId || 'local'
    const { studentId, examId, attendance, headRemarks, teacherRemarks } = req.body
    if (!studentId || !examId) return res.status(400).json({ error: 'studentId and examId are required' })
    const store = readTenantRemarks(schoolId)
    store.remarks = Array.isArray(store.remarks) ? store.remarks : []
    
    // Remove existing
    store.remarks = store.remarks.filter(r => !(r.studentId === studentId && r.examId === examId))
    
    store.remarks.push({
      studentId,
      examId,
      attendance,
      headRemarks,
      teacherRemarks,
      updatedAt: new Date().toISOString()
    })
    
    writeTenantRemarks(schoolId, store)
    res.json({ status: 'saved' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/teachers/:id/profile', auth, async (req, res) => {
  try {
    const id = req.params.id
    const {
      gender, phone, staffId, dateEmployed, ssn, nationalId, dob,
      momoNumber, accountNumber, bankBranch, bankName,
      nextOfKin, nextOfKinRelation, nextOfKinPhone,
      classesTaught, subjectsTaught, formMaster, profilePicture
    } = req.body || {}
    const toDate = (v) => v ? new Date(v) : null
    try {
      const data = {
        gender: gender ?? undefined,
        phone: phone ?? undefined,
        staffId: staffId ?? undefined,
        dateEmployed: dateEmployed !== undefined ? toDate(dateEmployed) : undefined,
        ssn: ssn ?? undefined,
        nationalId: nationalId ?? undefined,
        dob: dob !== undefined ? toDate(dob) : undefined,
        momoNumber: momoNumber ?? undefined,
        accountNumber: accountNumber ?? undefined,
        bankBranch: bankBranch ?? undefined,
        bankName: bankName ?? undefined,
        nextOfKin: nextOfKin ?? undefined,
        nextOfKinRelation: nextOfKinRelation ?? undefined,
        nextOfKinPhone: nextOfKinPhone ?? undefined,
        classesTaught: Array.isArray(classesTaught) ? classesTaught : classesTaught === undefined ? undefined : [],
        subjectsTaught: Array.isArray(subjectsTaught) ? subjectsTaught : subjectsTaught === undefined ? undefined : [],
        formMaster: formMaster ?? undefined,
        profilePicture: profilePicture ?? undefined,
      }
      const updated = await prisma.teacherProfile.upsert({
        where: { teacherId: id },
        update: data,
        create: { teacherId: id, ...data, classesTaught: Array.isArray(classesTaught) ? classesTaught : [], subjectsTaught: Array.isArray(subjectsTaught) ? subjectsTaught : [] },
      })
      return res.json(updated)
    } catch (_) {
      const patch = {}
      if (gender !== undefined) patch.gender = gender
      if (phone !== undefined) patch.phone = phone
      if (staffId !== undefined) patch.staffId = staffId
      if (dateEmployed !== undefined) patch.dateEmployed = dateEmployed
      if (ssn !== undefined) patch.ssn = ssn
      if (nationalId !== undefined) patch.nationalId = nationalId
      if (dob !== undefined) patch.dob = dob
      if (momoNumber !== undefined) patch.momoNumber = momoNumber
      if (accountNumber !== undefined) patch.accountNumber = accountNumber
      if (bankBranch !== undefined) patch.bankBranch = bankBranch
      if (bankName !== undefined) patch.bankName = bankName
      if (nextOfKin !== undefined) patch.nextOfKin = nextOfKin
      if (nextOfKinRelation !== undefined) patch.nextOfKinRelation = nextOfKinRelation
      if (nextOfKinPhone !== undefined) patch.nextOfKinPhone = nextOfKinPhone
      if (classesTaught !== undefined) patch.classesTaught = Array.isArray(classesTaught) ? classesTaught : []
      if (subjectsTaught !== undefined) patch.subjectsTaught = Array.isArray(subjectsTaught) ? subjectsTaught : []
      if (formMaster !== undefined) patch.formMaster = formMaster
      if (profilePicture !== undefined) patch.profilePicture = profilePicture
      const updatedFallback = staffStore.upsert(id, patch)
      return res.json(updatedFallback)
    }
  } catch (e) {
    console.error('Update teacher profile error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/admin/migrate-staff-profiles', auth, async (req, res) => {
  try {
    const profiles = staffStore.list()
    const ids = Object.keys(profiles || {})
    if (!ids.length) return res.json({ migrated: 0, skipped: 0, errors: 0 })
    let migrated = 0
    let skipped = 0
    let errors = 0
    for (const teacherId of ids) {
      try {
        const t = await prisma.teacher.findUnique({ where: { id: teacherId } })
        if (!t) { skipped += 1; continue }
        const p = profiles[teacherId] || {}
        const toDate = (v) => v ? new Date(v) : null
        await prisma.teacherProfile.upsert({
          where: { teacherId },
          update: {
            gender: p.gender || null,
            phone: p.phone || null,
            staffId: p.staffId || null,
            dateEmployed: toDate(p.dateEmployed),
            ssn: p.ssn || null,
            nationalId: p.nationalId || null,
            dob: toDate(p.dob),
            momoNumber: p.momoNumber || null,
            accountNumber: p.accountNumber || null,
            bankBranch: p.bankBranch || null,
            bankName: p.bankName || null,
            nextOfKin: p.nextOfKin || null,
            nextOfKinRelation: p.nextOfKinRelation || null,
            nextOfKinPhone: p.nextOfKinPhone || null,
            classesTaught: Array.isArray(p.classesTaught) ? p.classesTaught : [],
            subjectsTaught: Array.isArray(p.subjectsTaught) ? p.subjectsTaught : [],
            formMaster: p.formMaster || null,
          },
          create: {
            teacherId,
            gender: p.gender || null,
            phone: p.phone || null,
            staffId: p.staffId || null,
            dateEmployed: toDate(p.dateEmployed),
            ssn: p.ssn || null,
            nationalId: p.nationalId || null,
            dob: toDate(p.dob),
            momoNumber: p.momoNumber || null,
            accountNumber: p.accountNumber || null,
            bankBranch: p.bankBranch || null,
            bankName: p.bankName || null,
            nextOfKin: p.nextOfKin || null,
            nextOfKinRelation: p.nextOfKinRelation || null,
            nextOfKinPhone: p.nextOfKinPhone || null,
            classesTaught: Array.isArray(p.classesTaught) ? p.classesTaught : [],
            subjectsTaught: Array.isArray(p.subjectsTaught) ? p.subjectsTaught : [],
            formMaster: p.formMaster || null,
          }
        })
        migrated += 1
      } catch (e) {
        errors += 1
      }
    }
    res.json({ migrated, skipped, errors })
  } catch (e) {
    if (e.message && /relation .* teacherprofile/i.test(e.message)) {
      return res.status(503).json({ error: 'TeacherProfile table not available' })
    }
    console.error('Migrate staff profiles error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/students', auth, async (req, res) => {
  try {
    const {
      firstName, lastName, email, grade, classId, wristbandId,
      gender, birthday, admittedAt,
      religion, nationality, hometown, address,
      guardianName, guardianRelationship, guardianContact,
      profilePicture, password, profilePhoto, guardianPhoto,
    } = req.body || {}
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName and email are required' })
    }
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantStudents(req.schoolId)
      const classesStore = readTenantClasses(req.schoolId)
      const exists = (store.students || []).some(s => (s.email || '').toLowerCase() === email.toLowerCase())
      if (exists) return res.status(409).json({ error: `A student with email ${email} already exists.` })

      if (wristbandId) {
        const idExists = (store.students || []).some(s => s.wristbandId === wristbandId)
        if (idExists) return res.status(409).json({ error: `A student with ID ${wristbandId} already exists.` })
      }
      const now = new Date().toISOString()
      let savedPassword = null
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        savedPassword = `${salt}:${hash}`
      }
      const obj = {
        id: randomUUID(),
        firstName, lastName, email,
        grade: grade || '',
        classId: classId || null,
        wristbandId: wristbandId || null,
        gender: gender || null,
        birthday: birthday ? new Date(birthday).toISOString() : null,
        admittedAt: admittedAt ? new Date(admittedAt).toISOString() : now,
        religion: religion || null,
        nationality: nationality || null,
        hometown: hometown || null,
        address: address || null,
        guardianName: guardianName || null,
        guardianRelationship: guardianRelationship || null,
        guardianContact: guardianContact || null,
        profilePicture: profilePicture || null,
        profilePhoto: profilePhoto || null,
        guardianPhoto: guardianPhoto || null,
        password: savedPassword,
        status: 'active',
        createdAt: now,
        updatedAt: now
      }
      store.students = Array.isArray(store.students) ? store.students : []
      store.students.unshift(obj)
      writeTenantStudents(req.schoolId, store)
      const c = classesStore.classes.find(cx => cx.id === obj.classId)
      return res.status(201).json({
        id: obj.id,
        firstName: obj.firstName,
        lastName: obj.lastName,
        email: obj.email,
        className: c?.name || '',
        grade: c?.grade || obj.grade || '',
        studentId: obj.wristbandId || obj.id.slice(0, 8).toUpperCase(),
        createdAt: obj.createdAt
      })
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
        profilePicture: profilePicture || null,
        profilePhoto: profilePhoto || null,
        guardianPhoto: guardianPhoto || null,
        password: (function () {
          if (password && password.trim()) {
            const crypto = require('crypto')
            const salt = crypto.randomBytes(16).toString('hex')
            const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
            return `${salt}:${hash}`
          }
          return null
        })()
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
      const field = (e.meta?.target || []).join(', ')
      return res.status(409).json({ error: `A student with this ${field || 'email or student ID'} already exists.` })
    }
    console.error('Create student error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
});
app.get('/api/students/:id', auth, async (req, res) => {
  try {
    const id = req.params.id
    if (req.schoolId && (req.schoolId !== 'local' || !isDBConnected)) {
      let store = readTenantStudents(req.schoolId || 'local')
      let s = (store.students || []).find(x => x.id === id)
      let currentSchoolId = req.schoolId || 'local'

      // Global search if not found in current school tenant
      if (!s) {
        const schools = schoolsStore.list().filter(sc => sc.id !== req.schoolId)
        for (const school of schools) {
          try {
            const tempStore = readTenantStudents(school.id)
            const found = (tempStore.students || []).find(x => x.id === id)
            if (found) {
              s = found
              store = tempStore
              currentSchoolId = school.id
              break
            }
          } catch (e) { }
        }
      }

      if (!s) return res.status(404).json({ error: 'not found' })
      
      const classesStore = readTenantClasses(currentSchoolId)
      const c = (classesStore.classes || []).find(cx => cx.id === s.classId)
      return res.json({
        ...s,
        className: c?.name || '',
        grade: c?.grade || s.grade || '',
        studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
        profilePicture: s.profilePicture || null,
        profilePhoto: s.profilePhoto || null,
        guardianPhoto: s.guardianPhoto || null,
      })
    }
    const student = await prisma.student.findUnique({
      where: { id },
      include: { class: true }
    })
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({
      ...student,
      className: student.class?.name || '',
      grade: student.class?.grade || student.grade || '',
      studentId: student.wristbandId || student.id.slice(0, 8).toUpperCase(),
      behaviorPoints: student.behaviorPoints !== undefined ? student.behaviorPoints : 100
    })
  } catch (e) {
    console.error('Student detail error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/students/:id/siblings', auth, async (req, res) => {
  try {
    const { id } = req.params
    let student = null
    let currentSchoolId = req.schoolId || 'local'
    let store = null

    if (currentSchoolId !== 'local' || !isDBConnected) {
      store = readTenantStudents(currentSchoolId)
      student = (store.students || []).find(s => s.id === id)

      // Global search if not found in current school tenant
      if (!student) {
        const schools = schoolsStore.list().filter(sc => sc.id !== currentSchoolId)
        for (const school of schools) {
          try {
            const tempStore = readTenantStudents(school.id)
            const found = (tempStore.students || []).find(x => x.id === id)
            if (found) {
              student = found
              store = tempStore
              currentSchoolId = school.id
              break
            }
          } catch (e) { }
        }
      }

      if (!student) return res.status(404).json({ error: 'Student not found' })

      const contact = student.guardianContact
      if (!contact) return res.json([])

      const siblings = (store.students || []).filter(s => s.id !== id && s.guardianContact === contact)
      return res.json(siblings.map(s => ({
        id: s.id,
        name: s.firstName + ' ' + s.lastName,
        studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
        profilePhoto: s.profilePhoto
      })))
    }

    student = await prisma.student.findUnique({ where: { id } })
    if (!student) return res.status(404).json({ error: 'Student not found' })

    const contact = student.guardianContact
    if (!contact) return res.json([])

    const siblings = await prisma.student.findMany({
      where: {
        id: { not: id },
        guardianContact: contact
      }
    })
    res.json(siblings.map(s => ({
      id: s.id,
      name: s.firstName + ' ' + s.lastName,
      studentId: s.wristbandId || s.id.slice(0, 8).toUpperCase(),
      profilePhoto: s.profilePhoto
    })))
  } catch (e) {
    console.error('Fetch siblings error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Teacher Permissions ==============
app.get('/api/teachers/:id/permissions', auth, async (req, res) => {
  try {
    const id = req.params.id
    const p = staffStore.get(id) || {}
    res.json({
      allowedFeatures: Array.isArray(p.allowedFeatures) ? p.allowedFeatures : [],
      allowedActions: Array.isArray(p.allowedActions) ? p.allowedActions : []
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/teachers/:id/permissions', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { allowedFeatures, allowedActions } = req.body || {}
    const patch = {}
    if (allowedFeatures !== undefined) patch.allowedFeatures = Array.isArray(allowedFeatures) ? allowedFeatures : []
    if (allowedActions !== undefined) patch.allowedActions = Array.isArray(allowedActions) ? allowedActions : []
    const updated = staffStore.upsert(id, patch)
    res.json({
      allowedFeatures: Array.isArray(updated.allowedFeatures) ? updated.allowedFeatures : [],
      allowedActions: Array.isArray(updated.allowedActions) ? updated.allowedActions : []
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Teacher Authentication ==============
app.post('/api/teacher-auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {}
    if (!phone || !password) return res.status(400).json({ error: 'phone and password are required' })
    const profiles = staffStore.list()
    const entries = Object.entries(profiles || {})
    const match = entries.find(([_, p]) => (p.phone || '').trim() === phone.trim())
    if (!match) return res.status(401).json({ error: 'invalid credentials' })
    const [teacherId, p] = match
    if (!p.passSalt || !p.passHash) return res.status(401).json({ error: 'invalid credentials' })
    const crypto = require('crypto')
    const hash = crypto.scryptSync(password.trim(), p.passSalt, 64).toString('hex')
    if (hash !== p.passHash) return res.status(401).json({ error: 'invalid credentials' })
    
    let teacherName = p.name || 'Teacher'
    if (isDBConnected) {
      try {
        const t = await prisma.teacher.findUnique({ where: { id: teacherId } })
        if (t) teacherName = t.name
      } catch (e) {
        console.error('Teacher DB lookup failed, falling back to profile name:', e)
      }
    }
    res.json({ teacherId, name: teacherName, schoolId: p.schoolId || 'local' })
  } catch (e) {
    console.error('Teacher auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.get('/api/teacher-auth/profile', auth, async (req, res) => {
  try {
    const teacherId = req.teacherId
    if (!teacherId) return res.status(400).json({ error: 'not logged in as teacher' })
    
    let t = null
    if (isDBConnected) {
      try {
        t = await prisma.teacher.findUnique({ where: { id: teacherId } })
      } catch (e) {
        console.error('Teacher profile DB lookup failed:', e)
      }
    }
    
    const p = staffStore.get(teacherId) || {}
    res.json({
      name: t?.name || p.name || '',
      email: t?.email || p.email || '',
      phone: p.phone || '',
      subject: t?.subject || p.subject || '',
      gender: p.gender || '',
      dob: p.dob || '',
      address: p.address || '',
      profilePicture: p.profilePicture || ''
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/teacher-auth/profile', auth, async (req, res) => {
  try {
    const teacherId = req.teacherId
    if (!teacherId) return res.status(400).json({ error: 'not logged in as teacher' })
    const { name, phone, gender, dob, address, profilePicture } = req.body || {}
    
    if (name && isDBConnected) {
      try {
        await prisma.teacher.update({
          where: { id: teacherId },
          data: { name }
        })
      } catch (e) {
        console.error('Teacher update in DB failed:', e)
      }
    }
    
    const cur = staffStore.get(teacherId) || {}
    staffStore.upsert(teacherId, {
      ...cur,
      phone: phone !== undefined ? phone : cur.phone,
      gender: gender !== undefined ? gender : cur.gender,
      dob: dob !== undefined ? dob : cur.dob,
      address: address !== undefined ? address : cur.address,
      profilePicture: profilePicture !== undefined ? profilePicture : cur.profilePicture
    })
    
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/teacher-auth/password', auth, async (req, res) => {
  try {
    const teacherId = req.teacherId
    const { currentPassword, newPassword } = req.body || {}
    if (!teacherId) return res.status(400).json({ error: 'not logged in as teacher' })
    if (!newPassword || newPassword.trim().length < 6) return res.status(400).json({ error: 'newPassword must be at least 6 characters' })
    const prof = staffStore.get(teacherId)
    if (!prof || !prof.passSalt || !prof.passHash) return res.status(404).json({ error: 'profile not found' })
    const crypto = require('crypto')
    const cur = crypto.scryptSync((currentPassword || '').trim(), prof.passSalt, 64).toString('hex')
    if (cur !== prof.passHash) return res.status(401).json({ error: 'invalid current password' })
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(newPassword.trim(), salt, 64).toString('hex')
    staffStore.upsert(teacherId, { passSalt: salt, passHash: hash })
    res.json({ status: 'ok' })
  } catch (e) {
    console.error('Teacher change password error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})
app.post('/api/students/:id/archive', auth, async (req, res) => {
  try {
    const id = req.params.id
    const { reason } = req.body || {}
    if (!reason) return res.status(400).json({ error: 'reason is required' })

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantStudents(req.schoolId)
      const idx = store.students.findIndex(s => s.id === id)
      if (idx < 0) return res.status(404).json({ error: 'student not found' })

      if (reason === 'Incorrect entry') {
        store.students.splice(idx, 1)
        writeTenantStudents(req.schoolId, store)
        return res.json({ status: 'deleted' })
      } else {
        store.students[idx].status = 'archived'
        store.students[idx].archivedAt = new Date().toISOString()
        store.students[idx].archiveReason = reason
        writeTenantStudents(req.schoolId, store)
        return res.json({ status: 'archived', id, reason })
      }
    }

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

async function queryStudentsForSearch(q, includeArchived = false) {
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

// ============== Admissions APIs ==============
function admissionsWhere(type, q) {
  const search = (q || '').toString().trim()
  const nameFilter = search ? {
    OR: [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ],
  } : {}
  if (type === 'left') {
    return {
      AND: [
        { status: 'archived' },
        { OR: [{ archiveReason: { not: 'Completed school' } }, { archiveReason: null }] },
        nameFilter,
      ],
    }
  }
  if (type === 'completed') {
    return { AND: [{ status: 'archived' }, { archiveReason: 'Completed school' }, nameFilter] }
  }
  // admitted (active)
  return { AND: [{ status: { not: 'archived' } }, nameFilter] }
}

app.get('/api/admissions/list', auth, async (req, res) => {
  try {
    const type = (req.query.type || 'admitted').toString()
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString()
    const where = admissionsWhere(type, q)
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
    console.error('Admissions list error:', e)
    res.status(200).json({ total: 0, page: 1, pageSize: 20, data: [], error: e?.message || 'unknown' })
  }
})

app.get('/api/admissions/stats', auth, async (_req, res) => {
  try {
    const [activeCount, leftCount, completedCount] = await Promise.all([
      prisma.student.count({ where: { status: { not: 'archived' } } }),
      prisma.student.count({ where: { status: 'archived', OR: [{ archiveReason: { not: 'Completed school' } }, { archiveReason: null }] } }),
      prisma.student.count({ where: { status: 'archived', archiveReason: 'Completed school' } }),
    ])
    res.json({ activeCount, leftCount, completedCount })
  } catch (e) {
    console.error('Admissions stats error:', e)
    res.status(200).json({ activeCount: 0, leftCount: 0, completedCount: 0 })
  }
})

app.get('/api/admissions/export.csv', auth, async (req, res) => {
  try {
    const type = (req.query.type || 'admitted').toString()
    const q = (req.query.q || '').toString()
    const where = admissionsWhere(type, q)
    const items = await prisma.student.findMany({ where, include: { class: true }, orderBy: { createdAt: 'desc' } })
    const rows = [
      ['First Name', 'Last Name', 'Email', 'Class', 'Grade', 'Student ID'].join(','),
      ...items.map(s => [
        `"${(s.firstName || '').replace(/"/g, '""')}"`,
        `"${(s.lastName || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.class?.name || '').replace(/"/g, '""')}"`,
        `"${(s.class?.grade || s.grade || '').replace(/"/g, '""')}"`,
        `"${(s.wristbandId || s.id.slice(0, 8).toUpperCase()).replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${type}-admissions.csv"`)
    res.send(rows)
  } catch (e) {
    console.error('Admissions export error:', e)
    res.status(500).send('error')
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
      } catch (_) { }
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
        } catch (_) { }
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
        try { await prisma.studentGroup.create({ data: item }); added += 1 } catch (_) { }
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
      ['First Name', 'Last Name', 'Email', 'Class', 'Grade', 'Student ID'].join(','),
      ...students.map(s => [
        `"${(s.firstName || '').replace(/"/g, '""')}"`,
        `"${(s.lastName || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.class?.name || '').replace(/"/g, '""')}"`,
        `"${(s.class?.grade || s.grade || '').replace(/"/g, '""')}"`,
        `"${(s.wristbandId || s.id.slice(0, 8).toUpperCase()).replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${groupName.replace(/[^a-z0-9_-]/gi, '_')}.csv"`)
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

// ============== Guardians APIs ==============
function aggregateGuardians(students, q) {
  const map = new Map()
  for (const s of students) {
    const name = (s.guardianName || '').trim()
    const contact = (s.guardianContact || '').trim()
    const email = '' // email not available in schema
    if (!name && !contact) continue
    const key = `${name}::${contact}::${email}`
    if (!map.has(key)) {
      map.set(key, { name: name || '—', contact, email, wards: 0 })
    }
    map.get(key).wards += 1
  }
  let arr = Array.from(map.values())
  const search = (q || '').trim().toLowerCase()
  if (search) {
    arr = arr.filter(g =>
      g.name.toLowerCase().includes(search) ||
      g.contact.toLowerCase().includes(search) ||
      g.email.toLowerCase().includes(search)
    )
  }
  arr.sort((a, b) => a.name.localeCompare(b.name))
  return arr
}

app.get('/api/guardians', auth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100)
    const q = (req.query.q || '').toString()
    const students = await prisma.student.findMany({
      where: { status: { not: 'archived' } },
      select: { guardianName: true, guardianContact: true }
    })
    const all = aggregateGuardians(students, q)
    const total = all.length
    const items = all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    res.json({ total, page, pageSize, data: items })
  } catch (e) {
    console.error('Guardians error:', e)
    res.status(200).json({ total: 0, page: 1, pageSize: 20, data: [], error: e?.message || 'unknown' })
  }
})

app.get('/api/guardians/export.csv', auth, async (req, res) => {
  try {
    const q = (req.query.q || '').toString()
    const students = await prisma.student.findMany({
      where: { status: { not: 'archived' } },
      select: { guardianName: true, guardianContact: true }
    })
    const all = aggregateGuardians(students, q)
    const rows = [
      ['Name', 'Contact Number', 'Email', 'Wards'].join(','),
      ...all.map(g => [
        `"${(g.name || '').replace(/"/g, '""')}"`,
        `"${(g.contact || '').replace(/"/g, '""')}"`,
        `"${(g.email || '').replace(/"/g, '""')}"`,
        String(g.wards),
      ].join(','))
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="guardians.csv"')
    res.send(rows)
  } catch (e) {
    console.error('Guardians export error:', e)
    res.status(500).send('error')
  }
})

app.get('/api/attendance/summary', auth, async (req, res) => {
  try {
    if (req.schoolId && req.schoolId !== 'local') {
      const date = (req.query.date || '').toString()
      const page = Math.max(parseInt(req.query.page || '1', 10), 1)
      const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '15', 10), 1), 100)
      return res.json({ date, totals: { totalStudents: 0, present: 0, absent: 0, notMarked: 0 }, page, pageSize, totalClasses: 0, data: [] })
    }
    const date = (req.query.date || '').toString()
    const page = Math.max(parseInt(req.query.page || '1', 10), 1)
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '15', 10), 1), 100)
    const classes = await prisma.class.findMany({ orderBy: [{ grade: 'asc' }, { name: 'asc' }] })
    const classIds = classes.map(c => c.id)
    const students = await prisma.student.findMany({ where: { status: { not: 'archived' }, classId: { in: classIds } } })
    const counts = {}
    for (const c of classes) counts[c.id] = 0
    for (const s of students) { if (s.classId && counts[s.classId] !== undefined) counts[s.classId] += 1 }
    const rowsAll = classes.map((c, i) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      total: counts[c.id] || 0,
      present: 0,
      absent: 0,
      notMarked: counts[c.id] || 0,
      index: i + 1,
    }))
    const totalClasses = rowsAll.length
    const totals = rowsAll.reduce((acc, r) => {
      acc.totalStudents += r.total
      acc.present += r.present
      acc.absent += r.absent
      acc.notMarked += r.notMarked
      return acc
    }, { totalStudents: 0, present: 0, absent: 0, notMarked: 0 })
    const start = (page - 1) * pageSize
    const rows = rowsAll.slice(start, start + pageSize)
    res.json({ date, totals, page, pageSize, totalClasses, data: rows })
  } catch (e) {
    console.error('Attendance summary error:', e)
    res.status(200).json({ date: '', totals: { totalStudents: 0, present: 0, absent: 0, notMarked: 0 }, page: 1, pageSize: 15, totalClasses: 0, data: [] })
  }
})

// ============== Announcements APIs ==============
app.get('/api/announcements', auth, async (req, res) => {
  try {
    const { subjectId, classId } = req.query
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantAnnouncements(req.schoolId)
      let data = store.announcements
      if (subjectId) data = data.filter(a => a.subjectId === subjectId)
      if (classId) data = data.filter(a => a.classId === classId)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return res.json({ announcements: data })
    }
    // Fallback for DB if needed, but using file-based for now as per project pattern
    return res.json({ announcements: [] })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/announcements', auth, async (req, res) => {
  try {
    const { content, subjectId, classId, authorName, authorRole, attachments } = req.body
    if (!content || !subjectId) return res.status(400).json({ error: 'content and subjectId are required' })

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantAnnouncements(req.schoolId)
      const newAnnouncement = {
        id: randomUUID(),
        content,
        subjectId,
        classId: classId || '',
        authorName: authorName || 'Teacher',
        authorRole: authorRole || 'teacher',
        attachments: attachments || [],
        createdAt: new Date().toISOString()
      }
      store.announcements.push(newAnnouncement)
      writeTenantAnnouncements(req.schoolId, store)
      return res.status(201).json(newAnnouncement)
    }
    res.status(501).json({ error: 'Not implemented' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Class Assignments APIs ==============
app.get('/api/class-assignments', auth, async (req, res) => {
  try {
    const { subjectId, classId } = req.query
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantClassAssignments(req.schoolId)
      let data = store.assignments
      if (subjectId) data = data.filter(a => a.subjectId === subjectId)
      if (classId) data = data.filter(a => a.classId === classId)
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return res.json({ assignments: data })
    }
    return res.json({ assignments: [] })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/class-assignments', auth, async (req, res) => {
  try {
    const {
      title, description, dueDate, subjectId, classId, attachments,
      exam, assessmentType, maxScore, startTime, assignTo, options
    } = req.body
    if (!title || !subjectId) return res.status(400).json({ error: 'title and subjectId are required' })

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantClassAssignments(req.schoolId)
      const newAssignment = {
        id: randomUUID(),
        title,
        description: description || '',
        dueDate: dueDate || null,
        subjectId,
        classId: classId || '',
        attachments: attachments || [],
        exam: exam || '',
        assessmentType: assessmentType || '',
        maxScore: maxScore || null,
        startTime: startTime || null,
        assignTo: assignTo || 'all',
        options: options || { recordMarks: true, allowLate: true, allowMultiple: true, autoGrade: false },
        createdAt: new Date().toISOString()
      }
      store.assignments.push(newAssignment)
      writeTenantClassAssignments(req.schoolId, store)
      return res.status(201).json(newAssignment)
    }
    res.status(501).json({ error: 'Not implemented' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Submissions APIs ==============
app.get('/api/submissions', auth, async (req, res) => {
  try {
    const { subjectId, studentId, assignmentId } = req.query
    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantSubmissions(req.schoolId)
      let data = store.submissions
      
      if (studentId) data = data.filter(s => s.studentId === studentId)
      if (assignmentId) data = data.filter(s => s.assignmentId === assignmentId)
      
      // If filtering by subjectId, we need to join with assignments
      if (subjectId) {
        const assignmentsStore = readTenantClassAssignments(req.schoolId)
        const subjectAssignments = assignmentsStore.assignments.filter(a => a.subjectId === subjectId).map(a => a.id)
        data = data.filter(s => subjectAssignments.includes(s.assignmentId))
      }
      
      return res.json(data)
    }
    res.json([])
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.post('/api/submissions', auth, async (req, res) => {
  try {
    const { assignmentId, studentId, fileName, submittedAt, answers, score, status } = req.body
    if (!assignmentId || !studentId) return res.status(400).json({ error: 'assignmentId and studentId are required' })

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantSubmissions(req.schoolId)
      
      const newSubmission = {
        id: randomUUID(),
        assignmentId,
        studentId,
        fileName: fileName || '',
        submittedAt: submittedAt || new Date().toISOString(),
        status: status || 'Submitted',
        answers: answers || {},
        score: score !== undefined ? score : null,
        gradedAt: score !== undefined ? new Date().toISOString() : null,
        feedback: ''
      }
      
      store.submissions.push(newSubmission)
      writeTenantSubmissions(req.schoolId, store)
      return res.status(201).json(newSubmission)
    }
    res.status(501).json({ error: 'Not implemented' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

app.put('/api/submissions/:id/grade', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { score, feedback } = req.body

    if (req.schoolId && req.schoolId !== 'local') {
      const store = readTenantSubmissions(req.schoolId)
      const index = store.submissions.findIndex(s => s.id === id)
      if (index === -1) return res.status(404).json({ error: 'Submission not found' })

      store.submissions[index] = {
        ...store.submissions[index],
        score: score !== '' ? parseFloat(score) : null,
        feedback: feedback || '',
        gradedAt: new Date().toISOString(),
        status: 'Graded'
      }

      writeTenantSubmissions(req.schoolId, store)
      return res.json(store.submissions[index])
    }
    res.status(501).json({ error: 'Not implemented' })
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// ============== Question Paper APIs ==============
app.get('/api/question-papers', auth, (req, res) => {
  try {
    const store = readTenantQuestionPapers(req.schoolId)
    res.json(store.papers)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/question-papers', auth, (req, res) => {
  try {
    const { title } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const store = readTenantQuestionPapers(req.schoolId)
    const newPaper = {
      id: randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      status: 'Draft',
    }
    store.papers.push(newPaper)
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(201).json(newPaper)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/question-papers/:id', auth, (req, res) => {
  try {
    const store = readTenantQuestionPapers(req.schoolId)
    const paper = store.papers.find(p => p.id === req.params.id)
    if (!paper) return res.status(404).json({ error: 'Paper not found' })
    const sections = store.sections.filter(s => s.paperId === req.params.id)
    const sectionIds = sections.map(s => s.id)
    const questions = store.questions.filter(q => sectionIds.includes(q.sectionId))
    res.json({ ...paper, sections, questions })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/question-papers/:id', auth, (req, res) => {
  try {
    const { title, status } = req.body
    const store = readTenantQuestionPapers(req.schoolId)
    const paper = store.papers.find(p => p.id === req.params.id)
    if (!paper) return res.status(404).json({ error: 'Paper not found' })
    if (title !== undefined) paper.title = title
    if (status !== undefined) paper.status = status
    writeTenantQuestionPapers(req.schoolId, store)
    res.json(paper)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/question-papers/:id', auth, (req, res) => {
  try {
    const store = readTenantQuestionPapers(req.schoolId)
    const paperIndex = store.papers.findIndex(p => p.id === req.params.id)
    if (paperIndex === -1) return res.status(404).json({ error: 'Paper not found' })
    store.papers.splice(paperIndex, 1)
    const sections = store.sections.filter(s => s.paperId === req.params.id)
    const sectionIds = sections.map(s => s.id)
    store.sections = store.sections.filter(s => s.paperId !== req.params.id)
    store.questions = store.questions.filter(q => !sectionIds.includes(q.sectionId))
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============== Section & Question APIs ==============
app.post('/api/sections', auth, (req, res) => {
  try {
    const { paperId, title, description } = req.body
    const store = readTenantQuestionPapers(req.schoolId)
    const paper = store.papers.find(p => p.id === paperId)
    if (!paper) return res.status(404).json({ error: 'Paper not found' })
    const newSection = {
      id: randomUUID(),
      paperId,
      title: title || 'Untitled Section',
      description: description || '',
      order: store.sections.filter(s => s.paperId === paperId).length
    }
    store.sections.push(newSection)
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(201).json(newSection)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/sections/:id', auth, (req, res) => {
  try {
    const { title, description, order } = req.body
    const store = readTenantQuestionPapers(req.schoolId)
    const section = store.sections.find(s => s.id === req.params.id)
    if (!section) return res.status(404).json({ error: 'Section not found' })
    if (title !== undefined) section.title = title
    if (description !== undefined) section.description = description
    if (order !== undefined) section.order = order
    writeTenantQuestionPapers(req.schoolId, store)
    res.json(section)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/sections/:id', auth, (req, res) => {
  try {
    const store = readTenantQuestionPapers(req.schoolId)
    const index = store.sections.findIndex(s => s.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Section not found' })
    store.sections.splice(index, 1)
    store.questions = store.questions.filter(q => q.sectionId !== req.params.id)
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/questions', auth, (req, res) => {
  try {
    const { sectionId, text, type, marks, options, correctAnswer } = req.body
    const store = readTenantQuestionPapers(req.schoolId)
    const section = store.sections.find(s => s.id === sectionId)
    if (!section) return res.status(404).json({ error: 'Section not found' })
    const newQuestion = {
      id: randomUUID(),
      sectionId,
      text: text || '',
      type: type || 'Short Answer',
      marks: marks || 0,
      options: options || [],
      correctAnswer: correctAnswer || null,
      order: store.questions.filter(q => q.sectionId === sectionId).length
    }
    store.questions.push(newQuestion)
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(201).json(newQuestion)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/questions/:id', auth, (req, res) => {
  try {
    const { text, type, marks, options, correctAnswer, order } = req.body
    const store = readTenantQuestionPapers(req.schoolId)
    const question = store.questions.find(q => q.id === req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    if (text !== undefined) question.text = text
    if (type !== undefined) question.type = type
    if (marks !== undefined) question.marks = marks
    if (options !== undefined) question.options = options
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer
    if (order !== undefined) question.order = order
    writeTenantQuestionPapers(req.schoolId, store)
    res.json(question)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/questions/:id', auth, (req, res) => {
  try {
    const store = readTenantQuestionPapers(req.schoolId)
    const index = store.questions.findIndex(q => q.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Question not found' })
    store.questions.splice(index, 1)
    writeTenantQuestionPapers(req.schoolId, store)
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============== Course Materials APIs ==============
app.get('/api/course-materials', auth, (req, res) => {
  try {
    const { subjectId } = req.query
    const store = readTenantCourseMaterials(req.schoolId)
    let data = store.materials
    if (subjectId) data = data.filter(m => m.subjectId === subjectId)
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/course-materials', auth, (req, res) => {
  try {
    const { title, type, url, subjectId, description } = req.body
    if (!title || !type || !subjectId) return res.status(400).json({ error: 'title, type, and subjectId are required' })
    const store = readTenantCourseMaterials(req.schoolId)
    const newMaterial = {
      id: randomUUID(),
      title,
      type, // 'file' or 'link'
      url: url || '',
      subjectId,
      description: description || '',
      createdAt: new Date().toISOString(),
    }
    store.materials.push(newMaterial)
    writeTenantCourseMaterials(req.schoolId, store)
    res.status(201).json(newMaterial)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.delete('/api/course-materials/:id', auth, (req, res) => {
  try {
    const store = readTenantCourseMaterials(req.schoolId)
    const index = store.materials.findIndex(m => m.id === req.params.id)
    if (index === -1) return res.status(404).json({ error: 'Material not found' })
    store.materials.splice(index, 1)
    writeTenantCourseMaterials(req.schoolId, store)
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/student/subjects', auth, async (req, res) => {
  try {
    const studentId = req.studentId; // Assuming studentId is set in auth middleware
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.schoolId && req.schoolId !== 'local') {
      const studentsStore = readTenantStudents(req.schoolId);
      const student = studentsStore.students.find(s => s.id === studentId);
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const assignmentsStore = readTenantTeachingAssignments(req.schoolId);
      const subjectsStore = readTenantSubjects(req.schoolId);
      const teachersStore = readTenantTeachers(req.schoolId);

      const studentAssignments = assignmentsStore.assignments.filter(a => a.classId === student.classId);
      const subjects = studentAssignments.map(a => {
        const subject = subjectsStore.subjects.find(s => s.id === a.subjectId);
        const teacher = teachersStore.teachers.find(t => t.id === a.teacherId);
        return {
          ...a,
          subjectName: subject?.name || 'Unknown',
          teacherName: teacher?.name || 'Unassigned',
        };
      });

      return res.json({ subjects });
    }

    res.status(501).json({ error: 'Not implemented for DB mode' });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'unknown' });
  }
});

// AI Routes
app.post('/api/ai/generate-questions', auth, async (req, res) => {
  try {
    const { topic, instructions, count } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    // Try Gemini first
    try {
      console.log(`[AI] Attempting Gemini for topic: ${topic}`);
      const questions = await generateQuestions(topic, instructions, count || 5);
      return res.json(questions);
    } catch (geminiError) {
      console.warn('[AI] Gemini failed, checking DeepSeek fallback...', geminiError.message);
      
      // If Gemini has quota issues (429) and DeepSeek is configured, switch to DeepSeek
      if ((geminiError.message.includes('429') || geminiError.message.includes('limit')) && isDSAvailable) {
        console.log('[AI] Gemini quota exceeded. Using DeepSeek fallback.');
        const questions = await generateQuestionsDS(topic, instructions, count || 5);
        return res.json(questions);
      }
      throw geminiError; // Re-throw if DeepSeek not available or other error
    }
  } catch (e) {
    console.error('[AI] Question Generation Error:', e);
    res.status(500).json({ 
      error: 'Failed to generate questions', 
      details: e.message
    });
  }
});

app.post('/api/ai/evaluate-answer', auth, async (req, res) => {
  try {
    const { question, studentAnswer, maxMarks } = req.body;
    if (!question || !studentAnswer) return res.status(400).json({ error: 'question and studentAnswer are required' });

    // Try Gemini first
    try {
      console.log(`[AI] Attempting Gemini evaluation...`);
      const evaluation = await evaluateShortAnswer(question, studentAnswer, maxMarks || 10);
      return res.json(evaluation);
    } catch (geminiError) {
      console.warn('[AI] Gemini evaluation failed, checking DeepSeek fallback...', geminiError.message);
      
      if ((geminiError.message.includes('429') || geminiError.message.includes('limit')) && isDSAvailable) {
        console.log('[AI] Gemini quota exceeded. Using DeepSeek for evaluation.');
        const evaluation = await evaluateShortAnswerDS(question, studentAnswer, maxMarks || 10);
        return res.json(evaluation);
      }
      throw geminiError;
    }
  } catch (e) {
    console.error('[AI] Evaluation Error:', e);
    res.status(500).json({ 
      error: 'Failed to evaluate answer', 
      details: e.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env. AI features will fail.');
  } else {
    console.log('✅ Gemini AI service initialized.');
  }
});
