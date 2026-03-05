const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const FILE_PATH = path.join(DATA_DIR, 'staff-profiles.json')

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ profiles: {} }, null, 2))
}

function read() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try { return JSON.parse(raw) } catch { return { profiles: {} } }
}

function write(data) {
  ensureFile()
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

function get(id) {
  const store = read()
  return store.profiles[id] || null
}

function list() {
  const store = read()
  return store.profiles || {}
}

function upsert(id, patch) {
  const store = read()
  const prev = store.profiles[id] || {}
  store.profiles[id] = { ...prev, ...patch }
  write(store)
  return store.profiles[id]
}

module.exports = { get, upsert, list }
