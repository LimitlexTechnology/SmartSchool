import os
import re

app_path = os.path.join(os.path.dirname(__file__), 'server', 'src', 'app.js')
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. POST /api/students destructuring
content = re.sub(
    r'guardianName, guardianRelationship, guardianContact,\n    } = req\.body \|\| \{\}',
    r'guardianName, guardianRelationship, guardianContact, password,\n    } = req.body || {}',
    content
)

# 2. POST tenant pass
tenant_post = """const now = new Date().toISOString()
      let savedPassword = null
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        savedPassword = `${salt}:${hash}`
      }
      const obj = {
        password: savedPassword,
        id: randomUUID(),"""
content = re.sub(
    r'const now = new Date\(\)\.toISOString\(\)\n      const obj = \{\n        id: randomUUID\(\),',
    tenant_post.replace('\\', '\\\\'),
    content
)

# 3. POST prisma pass
prisma_post = """guardianContact: guardianContact || null,
        password: (function(){
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
    })"""
content = re.sub(
    r'guardianContact: guardianContact \|\| null,\n      \},\n      include: \{ class: true \},\n    \}\)',
    prisma_post.replace('\\', '\\\\'),
    content
)

# 4. PUT tenant pass
put_tenant = """if (guardianContact !== undefined) s.guardianContact = guardianContact
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        s.password = `${salt}:${hash}`
      }
      s.updatedAt = new Date().toISOString()"""
content = re.sub(
    r'if \(guardianContact !== undefined\) s\.guardianContact = guardianContact\n      s\.updatedAt = new Date\(\)\.toISOString\(\)',
    put_tenant.replace('\\', '\\\\'),
    content
)

# 5. PUT prisma pass
put_prisma = """if (guardianContact !== undefined) data.guardianContact = guardianContact
    if (password && password.trim()) {
      const crypto = require('crypto')
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
      data.password = `${salt}:${hash}`
    }

    if (req.schoolId && req.schoolId !== 'local') {"""
content = re.sub(
    r'if \(guardianContact !== undefined\) data\.guardianContact = guardianContact\n\n    if \(req\.schoolId && req\.schoolId !== \'local\'\) \{',
    put_prisma.replace('\\', '\\\\'),
    content
)

# 6. Auth endpoint
login_endpoint = """
// Student Portal Login
app.post('/api/student-auth/login', async (req, res) => {
  try {
    const { studentId, password } = req.body || {}
    if (!studentId || !password) return res.status(400).json({ error: 'studentId and password are required' })
    
    // Check tenant mode
    let student = null
    const schoolId = req.headers['x-school-id'] || 'local'
    if (schoolId && schoolId !== 'local') {
      const store = readTenantStudents(schoolId)
      student = (store.students || []).find(s => s.wristbandId === studentId || (s.id && s.id.slice(0, 8).toUpperCase() === studentId.toUpperCase()))
    } else {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { wristbandId: studentId },
            { id: { startsWith: studentId.toLowerCase() } }
          ]
        }
      })
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
    
    res.json({ id: student.id, name: student.firstName + ' ' + student.lastName, studentId: student.wristbandId || student.id.slice(0, 8).toUpperCase() })
  } catch (e) {
    console.error('Student auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})

// Super admin credential verification
app.post('/api/superadmin/login'"""

content = re.sub(
    r'// Super admin credential verification\napp\.post\(\'/api/superadmin/login\'',
    login_endpoint.replace('\\', '\\\\'),
    content
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python patch applied!")
