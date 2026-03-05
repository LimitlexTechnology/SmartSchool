const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DATA_DIR = path.join(__dirname, '..', 'data')
const FILE_PATH = path.join(DATA_DIR, 'teaching-assignments.json')

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ assignments: [] }, null, 2))
}

function read() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try { return JSON.parse(raw) } catch { return { assignments: [] } }
}

function write(data) {
  ensureFile()
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

function list() {
  return read().assignments
}

function add({ classId, teacherId, subject }) {
  const store = read()
  const exists = store.assignments.find(a => a.classId === classId && a.teacherId === teacherId && a.subject.toLowerCase() === String(subject).toLowerCase())
  if (exists) return exists
  const a = { id: randomUUID(), classId, teacherId, subject: String(subject), createdAt: new Date().toISOString() }
  store.assignments.push(a)
  write(store)
  return a
}

function remove(id) {
  const store = read()
  const before = store.assignments.length
  store.assignments = store.assignments.filter(a => a.id !== id)
  write(store)
  return before - store.assignments.length
}

module.exports = { list, add, remove }

