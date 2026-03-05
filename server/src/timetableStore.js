const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DATA_DIR = path.join(__dirname, '..', 'data')
const FILE_PATH = path.join(DATA_DIR, 'timetables.json')

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ timetables: [] }, null, 2))
}

function read() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try { return JSON.parse(raw) } catch { return { timetables: [] } }
}

function write(data) {
  ensureFile()
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

function list() {
  return read().timetables
}

function get(id) {
  return read().timetables.find(t => t.id === id) || null
}

function create(data) {
  const store = read()
  const obj = { id: randomUUID(), createdAt: new Date().toISOString(), ...data }
  store.timetables.push(obj)
  write(store)
  return obj
}

function update(id, patch) {
  const store = read()
  const idx = store.timetables.findIndex(t => t.id === id)
  if (idx === -1) return null
  store.timetables[idx] = { ...store.timetables[idx], ...patch, updatedAt: new Date().toISOString() }
  write(store)
  return store.timetables[idx]
}

function remove(id) {
  const store = read()
  const before = store.timetables.length
  store.timetables = store.timetables.filter(t => t.id !== id)
  write(store)
  return before - store.timetables.length
}

module.exports = { list, get, create, update, remove }

