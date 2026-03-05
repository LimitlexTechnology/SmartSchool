const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const DATA_DIR = path.join(__dirname, '..', 'data')
const FILE_PATH = path.join(DATA_DIR, 'groups.json')

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({ groups: [] }, null, 2))
}

function read() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try { return JSON.parse(raw) } catch { return { groups: [] } }
}

function write(data) {
  ensureFile()
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

function list() {
  return read().groups
}

function get(id) {
  return read().groups.find(g => g.id === id) || null
}

function create({ name, description, scholarship = false, debtor = false, billingTag = '' }) {
  const store = read()
  if (store.groups.some(g => g.name.toLowerCase() === name.toLowerCase())) {
    const err = new Error('Group name already exists')
    err.code = 'EEXISTS'
    throw err
  }
  const g = { id: randomUUID(), name, description: description || '', members: [], createdAt: new Date().toISOString(), scholarship: !!scholarship, debtor: !!debtor, billingTag: billingTag || '' }
  store.groups.push(g)
  write(store)
  return g
}

function update(id, data) {
  const store = read()
  const g = store.groups.find(x => x.id === id)
  if (!g) { const e = new Error('not found'); e.code='ENOENT'; throw e }
  if (data.name !== undefined && data.name.trim()) g.name = data.name.trim()
  if (data.description !== undefined) g.description = data.description || ''
  if (data.scholarship !== undefined) g.scholarship = !!data.scholarship
  if (data.debtor !== undefined) g.debtor = !!data.debtor
  if (data.billingTag !== undefined) g.billingTag = data.billingTag || ''
  write(store)
  return g
}

function addMembers(id, studentIds) {
  const store = read()
  const g = store.groups.find(x => x.id === id)
  if (!g) { const e = new Error('not found'); e.code='ENOENT'; throw e }
  const set = new Set(g.members)
  studentIds.forEach(sid => set.add(sid))
  g.members = Array.from(set)
  write(store)
  return g
}

function removeMember(id, studentId) {
  const store = read()
  const g = store.groups.find(x => x.id === id)
  if (!g) { const e = new Error('not found'); e.code='ENOENT'; throw e }
  g.members = g.members.filter(m => m !== studentId)
  write(store)
  return g
}

module.exports = { list, get, create, addMembers, removeMember, update }

