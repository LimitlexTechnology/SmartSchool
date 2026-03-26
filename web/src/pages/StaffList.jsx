import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Download, FileDown, X, Camera, User, Eye, EyeOff } from 'lucide-react'

const Avatar = ({ name, src }) => {
  if (src) return (
    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 bg-white">
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  )
  const initials = useMemo(() => {
    const parts = (name || '').trim().split(' ')
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }, [name])
  const colors = ['#0ea5b7', '#ef4444', '#f59e0b', '#10b981', '#6366f1']
  const bg = colors[(name.length + initials.charCodeAt(0)) % colors.length]
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: bg }}>
      {initials || '?'}
    </div>
  )
}

const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
  })
}

const StaffList = () => {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', type: 'teaching', phone: '', tempPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState([])

  const load = async (opts = {}) => {
    const p = opts.page ?? page
    const query = new URLSearchParams({ page: String(p), pageSize: String(pageSize), q })
    setLoading(true)
    try {
      const res = await fetch(`/api/teachers?${query.toString()}`)
      const json = await res.json()
      setData(json)
      setPage(json.page)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load({ page: 1 })
    fetch('/api/classes').then(r=>r.json()).then(setClasses).catch(()=>setClasses([]))
  }, []) // eslint-disable-line

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))

  const exportCSV = () => {
    const header = ['Name','Email','Subject']
    const rows = (data.data || []).map(t => [t.name, t.email, t.subject])
    const csv = [header.join(','), ...rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'staff.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const [drawerId, setDrawerId] = useState(null)
  const [drawerInitial, setDrawerInitial] = useState(null)
  const openDrawer = (t) => { setDrawerId(t.id); setDrawerInitial(t) }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Staff</h1>
        <p className="text-xs text-muted-text font-medium">View all your staff members</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <Plus size={14} /> Add Staff Member
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2" onClick={()=>window.print()}>
          <FileDown size={14} /> Export pdf
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2" onClick={exportCSV}>
          <Download size={14} /> Export excel
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-2xl shadow-soft-sm border border-gray-100 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-text">Add Staff Member</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Staff Type</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="staffType" 
                      checked={form.type === 'teaching'} 
                      onChange={() => setForm({...form, type: 'teaching'})} 
                      className="accent-primary-teal"
                    />
                    <span className="text-sm font-medium text-dark-text">Teaching</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="staffType" 
                      checked={form.type === 'non-teaching'} 
                      onChange={() => setForm({...form, type: 'non-teaching', subject: ''})} 
                      className="accent-primary-teal"
                    />
                    <span className="text-sm font-medium text-dark-text">Non-teaching</span>
                  </label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Full Name</label>
                <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Email</label>
                <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-text">Phone</label>
                  <input value={form.phone || ''} onChange={e=>setForm({...form, phone: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-text">Temporary Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.tempPassword || ''}
                      onChange={e=>setForm({...form, tempPassword: e.target.value})}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-gray-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-teal"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              {form.type === 'teaching' && (
                <div className="col-span-2">
                  <label className="text-xs font-bold text-muted-text">Subject</label>
                  <input value={form.subject} onChange={e=>setForm({...form, subject: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Mathematics" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
              <button
                disabled={saving || !form.name || !form.email}
                onClick={async ()=>{
                  setSaving(true)
                  try{
                    await fetch('/api/teachers',{
                      method:'POST',
                      headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ 
                        name: form.name.trim(), 
                        email: form.email.trim(), 
                        subject: form.type === 'teaching' ? form.subject.trim() : '', 
                        type: form.type,
                        phone: (form.phone||'').trim(), 
                        tempPassword: (form.tempPassword||'').trim() 
                      })
                    }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed') } return r.json() })
                    setShowAdd(false)
                    setForm({ name:'', email:'', subject:'', phone:'', tempPassword:'', type: 'teaching' })
                    await load({ page: 1 })
                  }catch(e){ alert(e.message) }finally{ setSaving(false) }
                }}
                className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load({ page: 1 })}
            placeholder="Search staff"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-dark-text placeholder-muted-text outline-none focus:ring-2 focus:ring-primary-teal/30"
          />
        </div>

        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted-text font-bold">
              <tr>
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3 w-64">Email</th>
                <th className="text-left px-4 py-3 w-32">Type</th>
                <th className="text-left px-4 py-3 w-40">Subject</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>Loading…</td></tr>}
              {!loading && data.data.length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>No staff found</td></tr>}
              {!loading && data.data.map((t) => (
                <tr key={t.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-muted-text">{t.index}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>openDrawer(t)} className="flex items-center gap-3">
                      <Avatar name={t.name} src={t.profilePicture} />
                      <span className="font-bold text-dark-text hover:underline">{t.name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">{t.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${t.type === 'teaching' ? 'bg-primary-teal/10 text-primary-teal' : 'bg-orange-100 text-orange-600'}`}>
                      {t.type || 'teaching'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.subject || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-text font-bold">
            Page {page} of {totalPages} • {data.total} staff
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => page > 1 && load({ page: page - 1 })}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg disabled:opacity-50"
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              onClick={() => page < totalPages && load({ page: page + 1 })}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg disabled:opacity-50"
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {drawerId && <TeacherDrawer id={drawerId} initial={drawerInitial} onClose={()=>{ setDrawerId(null); setDrawerInitial(null); }} onSaved={()=>load({ page })} classes={classes} />}
    </div>
  )
}

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100">
    <div className="px-4 py-2.5 border-b border-gray-50 text-xs font-extrabold text-dark-text">{title}</div>
    <div className="p-4 grid grid-cols-1 gap-3">{children}</div>
  </div>
)

const Field = ({ label, value }) => (
  <div className="grid grid-cols-3 items-center">
    <div className="text-xs font-bold text-muted-text">{label}</div>
    <div className="col-span-2 text-sm font-bold text-dark-text">{value || '—'}</div>
  </div>
)

const EditField = ({ label, value, onChange, type='text' }) => (
  <div className="grid grid-cols-3 items-center">
    <div className="text-xs font-bold text-muted-text">{label}</div>
    <div className="col-span-2">
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full" />
    </div>
  </div>
)

const TeacherDrawer = ({ id, onClose, initial, classes = [] }) => {
  const [detail, setDetail] = useState(initial || null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initial ? { name: initial.name || '', email: initial.email || '', subject: initial.subject || '', type: initial.type || 'teaching', tempPassword: '' } : null)
  const [showPass, setShowPass] = useState(false)
  const [profile, setProfile] = useState({
    gender: '', phone: '', staffId: '', dateEmployed: '', ssn: '', nationalId: '', dob: '',
    momoNumber: '', accountNumber: '', bankBranch: '', bankName: '', nextOfKin: '', nextOfKinRelation: '', nextOfKinPhone: '',
    classesTaught: [], subjectsTaught: [], formMaster: '', profilePicture: null
  })
  const [profileForm, setProfileForm] = useState(null)
  const featureOptions = [
    { key: 'students', label: 'Students Module' },
    { key: 'student_groups', label: 'Student Groups' },
    { key: 'admissions', label: 'Admissions' },
    { key: 'attendance', label: 'Student Attendance' },
    { key: 'guardians', label: 'Guardians' },
    { key: 'staff', label: 'Staff Module' },
    { key: 'staff_attendance', label: 'Staff Attendance' },
    { key: 'course_allocation', label: 'Course Allocation' },
    { key: 'lesson_planner', label: 'Lesson Planner' },
    { key: 'timetables', label: 'Timetables' },
    { key: 'classroom', label: 'Classroom' },
    { key: 'assessments', label: 'Exams/Assessments' },
    { key: 'finance', label: 'Accounts' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'services', label: 'Services' },
    { key: 'canteen_transport', label: 'Canteen & Transport' },
  ]
  const [permissionsForm, setPermissionsForm] = useState({ allowedFeatures: [], allowedActions: [] })
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/teachers/${id}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        if (!mounted) return
        setDetail(d)
        setForm({ name: d.name || '', email: d.email || '', subject: d.subject || '', type: d.type || 'teaching' })
        const p = await fetch(`/api/teachers/${id}/profile`).then(r=>r.json()).catch(()=>({}))
        if (!mounted) return
        setProfile({
          gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
          nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
          bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
          nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || '', profilePicture: p.profilePicture || null
        })
        setProfileForm({
          gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
          nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
          bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
          nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || '', profilePicture: p.profilePicture || null
        })
        const perms = await fetch(`/api/teachers/${id}/permissions`).then(r=>r.json()).catch(()=>({ allowedFeatures:[], allowedActions:[] }))
        setPermissionsForm({ allowedFeatures: Array.isArray(perms.allowedFeatures)?perms.allowedFeatures:[], allowedActions: Array.isArray(perms.allowedActions)?perms.allowedActions:[] })
      } catch {
        if (mounted && !detail) {
          setDetail({})
          setForm({ name: '', email: '', subject: '' })
          setProfileForm({
            gender: '', phone: '', staffId: '', dateEmployed: '', ssn: '', nationalId: '', dob: '',
            momoNumber: '', accountNumber: '', bankBranch: '', bankName: '', nextOfKin: '', nextOfKinRelation: '', nextOfKinPhone: '',
            classesTaught: [], subjectsTaught: [], formMaster: ''
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])
  const name = detail ? detail.name : ''
  return (
    <div className="fixed inset-0 z-[3200]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-100 shadow-soft-sm p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={name || 'U'} src={profile.profilePicture} />
            <div>
              <div className="font-extrabold text-dark-text">{name || '—'}</div>
              <div className="text-xs text-muted-text font-bold">{detail?.email || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!edit && <button onClick={()=>setEdit(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Edit</button>}
            {edit && (
              <>
                <button
                  disabled={saving}
                  onClick={async ()=>{
                    setSaving(true)
                    try{
                      const body = {
                        name: form.name.trim(),
                        email: form.email.trim(),
                        subject: form.type === 'teaching' ? form.subject.trim() : '',
                        type: form.type,
                        tempPassword: (form.tempPassword || '').trim()
                      }
                      await fetch(`/api/teachers/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      const payloadProfile = { ...profileForm, classesTaught: profileForm.classesTaught, subjectsTaught: profileForm.subjectsTaught }
                      await fetch(`/api/teachers/${id}/profile`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadProfile) }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      await fetch(`/api/teachers/${id}/permissions`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(permissionsForm) }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      const d = await fetch(`/api/teachers/${id}`).then(r=>r.json())
                      const p = await fetch(`/api/teachers/${id}/profile`).then(r=>r.json())
                      const pr = await fetch(`/api/teachers/${id}/permissions`).then(r=>r.json())
                      setDetail(d)
                      setProfile({
                        gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
                        nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
                        bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
                        nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || ''
                      })
                      setPermissionsForm({ allowedFeatures: Array.isArray(pr.allowedFeatures)?pr.allowedFeatures:[], allowedActions: Array.isArray(pr.allowedActions)?pr.allowedActions:[] })
                      setEdit(false)
                    }catch(e){ alert(e.message) }finally{ setSaving(false) }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-bold disabled:opacity-50"
                >{saving?'Saving…':'Save'}</button>
                <button onClick={()=>{ setEdit(false); setForm({ name: detail.name || '', email: detail.email || '', subject: detail.subject || '' }); setProfileForm(profile) }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Cancel</button>
              </>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Close</button>
          </div>
        </div>
        {loading && <div className="text-muted-text text-sm">Loading…</div>}
        {!loading && detail && !edit && (
          <div className="space-y-4">
            <Section title="Basic Info">
              <Field label="Full Name" value={detail.name || '—'} />
              <Field label="Gender" value={profile.gender || '—'} />
              <Field label="Phone" value={profile.phone || '—'} />
              <Field label="Email" value={detail.email || '—'} />
              <Field label="Subject" value={detail.subject || '—'} />
            </Section>
            <Section title="Private Information">
              <Field label="Staff ID" value={profile.staffId || '—'} />
              <Field label="Date Employed" value={profile.dateEmployed || '—'} />
              <Field label="Social Security Number" value={profile.ssn || '—'} />
              <Field label="National ID Number" value={profile.nationalId || '—'} />
              <Field label="Date of Birth" value={profile.dob || '—'} />
            </Section>
            <Section title="Banking Information">
              <Field label="Mobile Money Number" value={profile.momoNumber || '—'} />
              <Field label="Account Number" value={profile.accountNumber || '—'} />
              <Field label="Bank Branch" value={profile.bankBranch || '—'} />
              <Field label="Bank Name" value={profile.bankName || '—'} />
              <Field label="Next of Kin" value={profile.nextOfKin || '—'} />
              <Field label="Relation" value={profile.nextOfKinRelation || '—'} />
              <Field label="Next Of Kin Number" value={profile.nextOfKinPhone || '—'} />
            </Section>
            <Section title="Academic Information">
              <Field label="Classes Taught" value={(profile.classesTaught || []).map(cid => {
                const c = classes.find(cx => cx.id === cid)
                return c ? `${c.grade} ${c.name || ''}`.trim() : cid
              }).join(', ') || '—'} />
              <Field label="Subjects Taught" value={(profile.subjectsTaught || []).join(', ') || '—'} />
              <Field label="Form Master" value={(() => {
                const c = classes.find(cx => cx.id === profile.formMaster)
                return c ? `${c.grade} ${c.name || ''}`.trim() : profile.formMaster || '—'
              })()} />
            </Section>
          </div>
        )}
        {!loading && detail && edit && form && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-light-bg border border-gray-100 flex items-center justify-center overflow-hidden">
                  {profileForm.profilePicture ? (
                    <img src={profileForm.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-300" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = async () => {
                        const compressed = await compressImage(reader.result, 300, 300)
                        setProfileForm({ ...profileForm, profilePicture: compressed })
                      }
                      reader.readAsDataURL(file)
                    }
                  }} />
                </label>
              </div>
              <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mt-2">Profile Picture</div>
            </div>
            <Section title="Basic Info">
              <div className="col-span-2 mb-2">
                <label className="text-[10px] font-black text-muted-text uppercase tracking-widest px-1">Staff Type</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editStaffType" 
                      checked={form.type === 'teaching'} 
                      onChange={() => setForm({...form, type: 'teaching'})} 
                      className="accent-primary-teal"
                    />
                    <span className="text-xs font-bold text-dark-text">Teaching</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="editStaffType" 
                      checked={form.type === 'non-teaching'} 
                      onChange={() => setForm({...form, type: 'non-teaching', subject: ''})} 
                      className="accent-primary-teal"
                    />
                    <span className="text-xs font-bold text-dark-text">Non-teaching</span>
                  </label>
                </div>
              </div>
              <EditField label="Full Name" value={form.name} onChange={v=>setForm({...form, name:v})} />
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Gender</div>
                <div className="col-span-2">
                  <select value={profileForm.gender} onChange={e=>setProfileForm({...profileForm, gender:e.target.value})} className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <EditField label="Phone" value={profileForm.phone} onChange={v=>setProfileForm({...profileForm, phone:v})} />
              <EditField label="Email" value={form.email} onChange={v=>setForm({...form, email:v})} />
              {form.type === 'teaching' && (
                <EditField label="Subject" value={form.subject} onChange={v=>setForm({...form, subject:v})} />
              )}
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Reset Password</div>
                <div className="col-span-2 relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.tempPassword || ''}
                    onChange={e=>setForm({...form, tempPassword: e.target.value})}
                    placeholder="Enter new password"
                    className="px-3 py-2 pr-10 rounded-xl border border-gray-200 text-sm w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-teal"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </Section>
            <Section title="Private Information">
              <EditField label="Staff ID" value={profileForm.staffId} onChange={v=>setProfileForm({...profileForm, staffId:v})} />
              <EditField type="date" label="Date Employed" value={profileForm.dateEmployed} onChange={v=>setProfileForm({...profileForm, dateEmployed:v})} />
              <EditField label="Social Security Number" value={profileForm.ssn} onChange={v=>setProfileForm({...profileForm, ssn:v})} />
              <EditField label="National ID Number" value={profileForm.nationalId} onChange={v=>setProfileForm({...profileForm, nationalId:v})} />
              <EditField type="date" label="Date of Birth" value={profileForm.dob} onChange={v=>setProfileForm({...profileForm, dob:v})} />
            </Section>
            <Section title="Banking Information">
              <EditField label="Mobile Money Number" value={profileForm.momoNumber} onChange={v=>setProfileForm({...profileForm, momoNumber:v})} />
              <EditField label="Account Number" value={profileForm.accountNumber} onChange={v=>setProfileForm({...profileForm, accountNumber:v})} />
              <EditField label="Bank Branch" value={profileForm.bankBranch} onChange={v=>setProfileForm({...profileForm, bankBranch:v})} />
              <EditField label="Bank Name" value={profileForm.bankName} onChange={v=>setProfileForm({...profileForm, bankName:v})} />
              <EditField label="Next of Kin" value={profileForm.nextOfKin} onChange={v=>setProfileForm({...profileForm, nextOfKin:v})} />
              <EditField label="Relation" value={profileForm.nextOfKinRelation} onChange={v=>setProfileForm({...profileForm, nextOfKinRelation:v})} />
              <EditField label="Next Of Kin Number" value={profileForm.nextOfKinPhone} onChange={v=>setProfileForm({...profileForm, nextOfKinPhone:v})} />
            </Section>
            <Section title="Academic Information">
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-text">Classes Taught</div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                  {classes.map(c => {
                    const label = `${c.grade} ${c.name || ''}`.trim()
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs font-bold text-dark-text cursor-pointer hover:text-primary-teal">
                        <input
                          type="checkbox"
                          checked={(profileForm.classesTaught || []).includes(c.id)}
                          onChange={(e) => {
                            const cur = new Set(profileForm.classesTaught || [])
                            if (e.target.checked) cur.add(c.id); else cur.delete(c.id)
                            setProfileForm(p => ({ ...p, classesTaught: Array.from(cur) }))
                          }}
                        />
                        {label}
                      </label>
                    )
                  })}
                  {classes.length === 0 && <div className="text-xs text-muted-text italic">No classes found</div>}
                </div>
              </div>
              <EditField label="Subjects Taught (comma-separated)" value={(profileForm.subjectsTaught||[]).join(', ')} onChange={v=>setProfileForm({...profileForm, subjectsTaught: v.split(',').map(s=>s.trim()).filter(Boolean)})} />
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Form Master</div>
                <div className="col-span-2">
                  <select 
                    value={profileForm.formMaster} 
                    onChange={e=>setProfileForm({...profileForm, formMaster:e.target.value})} 
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full"
                  >
                    <option value="">None</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.grade} {c.name || ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>
            <Section title="Permissions">
              <div className="space-y-2">
                <div className="text-xs font-bold text-muted-text">Allowed Features</div>
                <div className="grid grid-cols-2 gap-2">
                  {featureOptions.map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 text-xs font-bold text-dark-text">
                      <input
                        type="checkbox"
                        checked={(permissionsForm.allowedFeatures || []).includes(opt.key)}
                        onChange={(e) => {
                          const cur = new Set(permissionsForm.allowedFeatures || [])
                          if (e.target.checked) cur.add(opt.key); else cur.delete(opt.key)
                          setPermissionsForm(p => ({ ...p, allowedFeatures: Array.from(cur) }))
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffList
