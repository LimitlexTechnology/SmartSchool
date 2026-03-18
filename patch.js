const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'server', 'src', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add 'password' to POST /api/students destructuring
content = content.replace(
    /guardianName, guardianRelationship, guardianContact,\n    } = req.body \|\| \{\}/g,
    `guardianName, guardianRelationship, guardianContact, password,\n    } = req.body || {}`
);

// 2. Add password hashing block for POST tenant
content = content.replace(
    /const now = new Date\(\)\.toISOString\(\)\n      const obj = \{\n        id: randomUUID\(\),/,
    `const now = new Date().toISOString()
      let savedPassword = null
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        savedPassword = \`\${salt}:\${hash}\`
      }
      const obj = {
        password: savedPassword,
        id: randomUUID(),`
);

// 3. Add password to POST prisma
content = content.replace(
    /guardianContact: guardianContact \|\| null,\n      \},\n      include: \{ class: true \},\n    \}\)/g,
    `guardianContact: guardianContact || null,
        password: (function(){
          if (password && password.trim()) {
            const crypto = require('crypto')
            const salt = crypto.randomBytes(16).toString('hex')
            const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
            return \`\${salt}:\${hash}\`
          }
          return null
        })()
      },
      include: { class: true },
    })`
);

// 4. PUT /api/students/:id tenant
content = content.replace(
    /if \(guardianContact !== undefined\) s.guardianContact = guardianContact\n      s.updatedAt = new Date\(\)\.toISOString\(\)/g,
    `if (guardianContact !== undefined) s.guardianContact = guardianContact
      if (password && password.trim()) {
        const crypto = require('crypto')
        const salt = crypto.randomBytes(16).toString('hex')
        const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
        s.password = \`\${salt}:\${hash}\`
      }
      s.updatedAt = new Date().toISOString()`
);

// 5. PUT /api/students/:id general
content = content.replace(
    /if \(guardianContact !== undefined\) data.guardianContact = guardianContact\n\n    if \(req\.schoolId && req\.schoolId !== 'local'\) \{/g,
    `if (guardianContact !== undefined) data.guardianContact = guardianContact
    if (password && password.trim()) {
      const crypto = require('crypto')
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
      data.password = \`\${salt}:\${hash}\`
    }

    if (req.schoolId && req.schoolId !== 'local') {`
);

// 6. Add POST /api/student-auth/login
const authLoginEndpoint = `
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
      student = (store.students || []).find(s => s.wristbandId === studentId || s.id.slice(0, 8).toUpperCase() === studentId.toUpperCase())
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
    
    const [salt, hash] = student.password.split(':')
    if (!salt || !hash) return res.status(401).json({ error: 'invalid credentials' })
    
    const crypto = require('crypto')
    const attempt = crypto.scryptSync(password.trim(), salt, 64).toString('hex')
    if (attempt !== hash) return res.status(401).json({ error: 'invalid credentials' })
    
    res.json({ id: student.id, name: student.firstName + ' ' + student.lastName, studentId: student.wristbandId || student.id.slice(0, 8).toUpperCase() })
  } catch (e) {
    console.error('Student auth error:', e)
    res.status(500).json({ error: e?.message || 'unknown' })
  }
})
`;

content = content.replace(
    /(\/\/ Super admin credential verification\napp\.post\('\/api\/superadmin\/login')/,
    authLoginEndpoint + '\\n$1'
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Successfully patched app.js');
