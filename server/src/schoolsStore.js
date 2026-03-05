const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DATA_DIR = path.join(__dirname, '..', 'data')
const FILE_PATH = path.join(DATA_DIR, 'schools.json')

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ schools: [] }, null, 2))
}
function read() { ensure(); try { return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')) } catch { return { schools: [] } } }
function write(d) { ensure(); fs.writeFileSync(FILE_PATH, JSON.stringify(d, null, 2)) }

function list() { return read().schools }
function create(data) {
  const store = read()
  const obj = { id: randomUUID(), status: 'active', plan: 'Basic', students: 0, expiry: 'N/A', ...data, createdAt: new Date().toISOString() }
  store.schools.push(obj); write(store); return obj
}
function update(id, patch) {
  const store = read()
  const idx = store.schools.findIndex(s => s.id === id)
  if (idx === -1) return null
  store.schools[idx] = { ...store.schools[idx], ...patch }
  write(store)
  return store.schools[idx]
}
function remove(id) {
  const store = read()
  const before = store.schools.length
  store.schools = store.schools.filter(s => s.id !== id)
  write(store); return before - store.schools.length
}

module.exports = { list, create, update, remove }
