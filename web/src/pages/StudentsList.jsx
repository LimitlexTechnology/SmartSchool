import React, { useEffect, useMemo, useState } from 'react'
import { Search, Filter, ListFilter, Plus, RotateCw, Download, FileDown, X, Camera, User, Archive, Trash2, Mail, Edit2, Eye, EyeOff } from 'lucide-react'
import StudentProfileModal from '../components/StudentProfileModal'

const Avatar = ({ name, src, size = 'w-8 h-8' }) => {
  if (src) return (
    <div className={`${size} rounded-full overflow-hidden border border-gray-100 bg-white`}>
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  )
  const initials = useMemo(() => {
    const parts = name.trim().split(' ')
    return (parts[0]?.[0] || '').toUpperCase()
  }, [name])
  const colors = ['#0ea5b7', '#ef4444', '#f59e0b', '#10b981', '#6366f1']
  const bg = colors[(name.length + initials.charCodeAt(0)) % colors.length]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${size} rounded-full object-cover border border-gray-100`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
    )
  }

  return (
    <div className={`${size} rounded-full flex items-center justify-center text-white text-xs font-bold`} style={{ backgroundColor: bg }}>
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

const StudentsList = () => {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [showAdd, setShowAdd] = useState(false)
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', grade: '', classId: '', wristbandId: '',
    gender: '', birthday: '', admittedAt: '',
    religion: '', nationality: '', hometown: '', address: '',
    guardianName: '', guardianRelationship: '', guardianContact: '',
    profilePicture: null, password: '',
  })
  const [saving, setSaving] = useState(false)
  const [grid, setGrid] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleFileChange = (e, callback) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result, 300, 300)
      callback(compressed)
    }
    reader.readAsDataURL(file)
  }

  const load = async (opts = {}) => {
    const p = opts.page ?? page
    const query = new URLSearchParams({ page: String(p), pageSize: String(pageSize), q })
    setLoading(true)
    try {
      const res = await fetch(`/api/students?${query.toString()}`)
      const json = await res.json()
      setData(json)
      setPage(json.page)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({ page: 1 })
    fetch('/api/classes').then(r => r.json()).then(setClasses).catch(() => setClasses([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const handler = () => load({ page: 1 })
    window.addEventListener('students:refresh', handler)
    return () => window.removeEventListener('students:refresh', handler)
  }, [])

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Students</h1>
        <p className="text-xs text-muted-text font-medium">Student list by academic period</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <Filter size={14} /> Filter
        </button>
        <button onClick={() => setGrid(v => !v)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <ListFilter size={14} /> Toggle View
        </button>
        <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <Plus size={14} /> Add New Student
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <RotateCw size={14} /> Restore Student
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <FileDown size={14} /> Export pdf
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <Download size={14} /> Export excel
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-2xl shadow-soft-sm border border-gray-100 w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-text">Add New Student</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18} /></button>
            </div>

            <div className="mb-6 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-light-bg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-300" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, (res) => setForm({ ...form, profilePicture: res }))} />
                </label>
              </div>
              <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mt-2">Student Photo</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-text">First Name</label>
                <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Last Name</label>
                <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Birthday</label>
                <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Class</label>
                <select
                  value={form.classId}
                  onChange={e => {
                    const cid = e.target.value
                    const c = classes.find(cx => cx.id === cid)
                    setForm({ ...form, classId: cid, grade: c ? c.grade : form.grade })
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="">Select class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade} • {c.name || 'No Section'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Grade</label>
                <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Date Admitted</label>
                <input type="date" value={form.admittedAt} onChange={e => setForm({ ...form, admittedAt: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Student ID</label>
                <input value={form.wristbandId} onChange={e => setForm({ ...form, wristbandId: e.target.value })} placeholder="Optional" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Religion</label>
                <input value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Nationality</label>
                <input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Hometown</label>
                <input value={form.hometown} onChange={e => setForm({ ...form, hometown: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2 mt-2 text-xs font-extrabold text-dark-text">Guardian</div>
              <div>
                <label className="text-xs font-bold text-muted-text">Name</label>
                <input value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Relationship</label>
                <input value={form.guardianRelationship} onChange={e => setForm({ ...form, guardianRelationship: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Contact Number</label>
                <input value={form.guardianContact} onChange={e => setForm({ ...form, guardianContact: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2 mt-4">
                <label className="text-xs font-bold text-muted-text">Initial Student Portal Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a temporary password"
                    className="mt-1 w-full pl-3 pr-10 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-dark-text pt-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-text mt-1 font-medium italic">Student will use this to login to their portal.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
              <button
                disabled={saving || !form.firstName || !form.lastName || !form.email}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await fetch('/api/students', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        firstName: form.firstName.trim(),
                        lastName: form.lastName.trim(),
                        email: form.email.trim(),
                        grade: form.grade.trim(),
                        classId: form.classId || null,
                        wristbandId: form.wristbandId.trim() || null,
                        gender: form.gender || null,
                        birthday: form.birthday || null,
                        admittedAt: form.admittedAt || null,
                        religion: form.religion || null,
                        nationality: form.nationality || null,
                        hometown: form.hometown || null,
                        address: form.address || null,
                        guardianName: form.guardianName || null,
                        guardianRelationship: form.guardianRelationship || null,
                        guardianContact: form.guardianContact || null,
                        profilePicture: form.profilePicture || null,
                        password: form.password || null,
                      })
                    }).then(async r => {
                      if (!r.ok) {
                        const t = await r.json().catch(() => ({}))
                        throw new Error(t.error || 'Failed')
                      }
                      return r.json()
                    })
                    setShowAdd(false)
                    setForm({
                      firstName: '', lastName: '', email: '', grade: '', classId: '', wristbandId: '',
                      gender: '', birthday: '', admittedAt: '',
                      religion: '', nationality: '', hometown: '', address: '',
                      guardianName: '', guardianRelationship: '', guardianContact: '',
                      password: ''
                    })
                    load()
                    window.dispatchEvent(new CustomEvent('students:refresh'))
                  } catch (e) {
                    alert(e.message)
                  } finally {
                    setSaving(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Student'}
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
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-dark-text placeholder-muted-text outline-none focus:ring-2 focus:ring-primary-teal/30"
          />
        </div>

        {!grid && (
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-muted-text font-bold">
                <tr>
                  <th className="text-left px-4 py-3 w-12">#</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3 w-32">Gender</th>
                  <th className="text-left px-4 py-3 w-40">Student ID</th>
                  <th className="text-left px-4 py-3 w-40">Class</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-4 py-6 text-muted-text" colSpan={6}>Loading…</td>
                  </tr>
                )}
                {!loading && data.data.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-text" colSpan={6}>No students found</td>
                  </tr>
                )}
                {!loading && data.data.map((s) => {
                  const name = `${s.firstName} ${s.lastName}`
                  return (
                    <tr key={s.id} className="border-t border-gray-50 group hover:bg-light-bg/50 transition">
                      <td className="px-4 py-3 text-muted-text">{s.index}</td>
                      <td className="px-4 py-3">
                        <StudentName name={name} id={s.id} initial={s} classes={classes} src={s.profilePicture} />
                      </td>
                      <td className="px-4 py-3">{s.gender || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black text-dark-text font-mono bg-light-bg px-2 py-1 rounded-lg">
                          {s.studentId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-muted-text">
                          {s.className || s.grade || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => { setSelectedProfileId(s.id); setShowProfile(true); }}
                          className="text-xs font-black text-primary-teal hover:underline decoration-2 underline-offset-4"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {grid && (
          <div className="border border-gray-100 rounded-xl p-6">
            {loading && <div className="text-muted-text text-sm">Loading…</div>}
            {!loading && data.data.length === 0 && <div className="text-muted-text text-sm">No students found</div>}
            {!loading && data.data.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {data.data.map((s) => {
                  const name = `${s.firstName} ${s.lastName}`
                  return (
                    <StudentTile key={s.id} name={name} id={s.id} subtitle={s.className || s.grade || '—'} initial={s} classes={classes} src={s.profilePicture} />
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-text font-bold">
            Page {page} of {totalPages} • {data.total} students
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
      
      {showProfile && selectedProfileId && (
        <StudentProfileModal 
          studentId={selectedProfileId} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  )
}

const StudentsDrawer = ({ id, onClose, initial, classes = [] }) => {
  const [detail, setDetail] = useState(initial || null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initial ? {
    firstName: initial.firstName || '', lastName: initial.lastName || '', email: initial.email || '',
    classId: initial.classId || '', className: initial.className || '', grade: initial.grade || '',
    gender: initial.gender || '', birthday: initial.birthday ? String(initial.birthday).split('T')[0] : '',
    admittedAt: initial.admittedAt ? String(initial.admittedAt).split('T')[0] : '',
    religion: initial.religion || '', nationality: initial.nationality || '', hometown: initial.hometown || '', address: initial.address || '',
    guardianName: initial.guardianName || '', guardianRelationship: initial.guardianRelationship || '', guardianContact: initial.guardianContact || '',
    profilePicture: initial.profilePicture || null,
    password: '', profilePhoto: initial.profilePhoto || null,
  } : null)
  useEffect(() => {
    let mounted = true
      ; (async () => {
        setLoading(true)
        try {
          const r = await fetch(`/api/students/${id}`)
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const d = await r.json()
          if (!mounted) return
          setDetail(d)
          setForm({
            firstName: d.firstName || '', lastName: d.lastName || '', email: d.email || '',
            classId: d.classId || '', className: d.className || '', grade: d.grade || '',
            gender: d.gender || '', birthday: d.birthday ? d.birthday.split('T')[0] : '',
            admittedAt: d.admittedAt ? d.admittedAt.split('T')[0] : '',
            religion: d.religion || '', nationality: d.nationality || '', hometown: d.hometown || '', address: d.address || '',
            guardianName: d.guardianName || '', guardianRelationship: d.guardianRelationship || '', guardianContact: d.guardianContact || '',
            password: '', profilePhoto: d.profilePhoto || null,
          })
        } catch (e) {
          if (!mounted) return
          if (!detail) {
            setDetail({})
            setForm({
              firstName: '', lastName: '', email: '',
              className: '', grade: '',
              gender: '', birthday: '', admittedAt: '',
              religion: '', nationality: '', hometown: '', address: '',
              guardianName: '', guardianRelationship: '', guardianContact: '',
              profilePhoto: null,
            })
          }
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [id])
  const name = detail ? `${detail.firstName} ${detail.lastName}` : ''

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Max 2MB.")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, profilePhoto: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[3000]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-100 shadow-soft-sm p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar name={name || 'U'} src={form?.profilePhoto || detail?.profilePhoto} size="w-12 h-12" />
              {edit && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            <div>
              <div className="font-extrabold text-dark-text">{name || '—'}</div>
              <div className="text-xs text-muted-text font-bold">{detail?.studentId || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArchiveButton id={id} onAfter={() => { setEdit(false); onClose(); window.dispatchEvent(new CustomEvent('students:refresh')) }} />
            {!edit && <button onClick={() => setEdit(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Edit</button>}
            {edit && (
              <>
                <button
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true)
                    try {
                      const payload = {
                        firstName: form.firstName, lastName: form.lastName, email: form.email,
                        grade: form.grade, classId: form.classId || null,
                        gender: form.gender || null,
                        birthday: form.birthday || null,
                        admittedAt: form.admittedAt || null,
                        religion: form.religion || null,
                        nationality: form.nationality || null,
                        hometown: form.hometown || null,
                        address: form.address || null,
                        guardianName: form.guardianName || null,
                        guardianRelationship: form.guardianRelationship || null,
                        guardianContact: form.guardianContact || null,
                        profilePicture: form.profilePicture || null,
                        password: form.password || null,
                        profilePhoto: form.profilePhoto || null,
                      }
                      await fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                        .then(async r => { if (!r.ok) { const t = await r.json().catch(() => ({})); throw new Error(t.error || 'Failed') } return r.json() })
                      const d = await fetch(`/api/students/${id}`).then(r => r.json())
                      setDetail(d)
                      setEdit(false)
                      window.dispatchEvent(new CustomEvent('students:refresh'))
                    } catch (e) {
                      alert(e.message)
                    } finally {
                      setSaving(false)
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-bold disabled:opacity-50"
                >{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => {
                  setEdit(false); setForm({
                    firstName: detail.firstName || '', lastName: detail.lastName || '', email: detail.email || '',
                    className: detail.className || '', grade: detail.grade || '',
                    gender: detail.gender || '', birthday: detail.birthday ? detail.birthday.split('T')[0] : '',
                    admittedAt: detail.admittedAt ? detail.admittedAt.split('T')[0] : '',
                    religion: detail.religion || '', nationality: detail.nationality || '', hometown: detail.hometown || '', address: detail.address || '',
                    guardianName: detail.guardianName || '', guardianRelationship: detail.guardianRelationship || '', guardianContact: detail.guardianContact || '',
                  })
                }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Cancel</button>
              </>
            )}
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Close</button>
          </div>
        </div>
        {loading && <div className="text-muted-text text-sm">Loading…</div>}
        {!loading && detail && !edit && (
          <div className="space-y-4">
            <Section title="Basic Info">
              <Field label="Full Name" value={name} />
              <Field label="Gender" value={detail.gender || '—'} />
              <Field label="Email" value={detail.email || '—'} />
              <Field label="Birthday" value={detail.birthday ? new Date(detail.birthday).toLocaleDateString() : '—'} />
              <Field label="Date Admitted" value={(detail.admittedAt ? new Date(detail.admittedAt) : new Date(detail.createdAt)).toLocaleDateString()} />
              <div className="mt-2 flex gap-2 flex-wrap"></div>
            </Section>
            <Section title="Academics">
              <Field label="Class" value={detail.className || '—'} />
              <Field label="Grade" value={detail.grade || '—'} />
            </Section>
            <Section title="Personal Info">
              <Field label="Religion" value={detail.religion || '—'} />
              <Field label="Nationality" value={detail.nationality || '—'} />
              <Field label="Hometown" value={detail.hometown || '—'} />
              <Field label="Postal Address" value={detail.address || '—'} />
            </Section>
            <Section title="Guardian">
              <Field label="Name" value={detail.guardianName || '—'} />
              <Field label="Relationship" value={detail.guardianRelationship || '—'} />
              <Field label="Contact Number" value={detail.guardianContact || '—'} />
            </Section>
          </div>
        )}
        {!loading && detail && edit && form && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-light-bg border border-gray-100 flex items-center justify-center overflow-hidden">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-300" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = async () => {
                        const compressed = await compressImage(reader.result, 300, 300)
                        setForm({ ...form, profilePicture: compressed })
                      }
                      reader.readAsDataURL(file)
                    }
                  }} />
                </label>
              </div>
              <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mt-2">Change Photo</div>
            </div>
            <Section title="Basic Info">
              <EditField label="First Name" value={form.firstName} onChange={v => setForm({ ...form, firstName: v })} />
              <EditField label="Last Name" value={form.lastName} onChange={v => setForm({ ...form, lastName: v })} />
              <EditField label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Gender</div>
                <div className="col-span-2">
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <EditField type="date" label="Birthday" value={form.birthday} onChange={v => setForm({ ...form, birthday: v })} />
              <EditField type="date" label="Date Admitted" value={form.admittedAt} onChange={v => setForm({ ...form, admittedAt: v })} />
            </Section>
            <Section title="Academics">
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Class</div>
                <div className="col-span-2">
                  <select
                    value={form.classId}
                    onChange={e => {
                      const cid = e.target.value
                      const c = classes.find(cx => cx.id === cid)
                      setForm({ ...form, classId: cid, grade: c ? c.grade : form.grade })
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full"
                  >
                    <option value="">Select class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.grade} • {c.name || 'No Section'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <EditField label="Grade" value={form.grade} onChange={v => setForm({ ...form, grade: v })} />
            </Section>
            <Section title="Personal Info">
              <EditField label="Religion" value={form.religion} onChange={v => setForm({ ...form, religion: v })} />
              <EditField label="Nationality" value={form.nationality} onChange={v => setForm({ ...form, nationality: v })} />
              <EditField label="Hometown" value={form.hometown} onChange={v => setForm({ ...form, hometown: v })} />
              <EditField label="Postal Address" value={form.address} onChange={v => setForm({ ...form, address: v })} />
            </Section>
            <Section title="Guardian">
              <EditField label="Name" value={form.guardianName} onChange={v => setForm({ ...form, guardianName: v })} />
              <EditField label="Relationship" value={form.guardianRelationship} onChange={v => setForm({ ...form, guardianRelationship: v })} />
              <EditField label="Contact Number" value={form.guardianContact} onChange={v => setForm({ ...form, guardianContact: v })} />
            </Section>
            <Section title="Student Portal Access">
              <EditField type="password" label="Reset Password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
              <p className="text-[10px] text-muted-text px-4 pb-4 font-medium italic">Leave blank to keep existing password.</p>
            </Section>
          </div>
        )}
      </div>
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

const EditField = ({ label, value, onChange, type = 'text' }) => {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'

  return (
    <div className="grid grid-cols-3 items-center">
      <div className="text-xs font-bold text-muted-text">{label}</div>
      <div className="col-span-2 relative">
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`px-3 py-2 rounded-xl border border-gray-200 text-sm w-full ${isPass ? 'pr-10' : ''}`}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-dark-text"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

const StudentName = ({ name, id, initial, classes = [], src }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-3 text-left">
        <Avatar name={name} src={src || initial?.profilePhoto} />
        <span className="font-bold text-dark-text hover:underline text-xs sm:text-base">{name}</span>
      </button>
      {open && <StudentsDrawer id={id} initial={initial} onClose={() => setOpen(false)} classes={classes} />}
    </>
  )
}

const StudentTile = ({ name, subtitle, id, initial, classes = [], src }) => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  return (
    <>
      <div className="flex flex-col items-center gap-3 group relative">
        <button onClick={() => setOpenProfile(true)} className="w-24 h-24 rounded-3xl bg-light-bg flex items-center justify-center shadow-soft-sm overflow-hidden border-2 border-transparent hover:border-primary-teal transition duration-300">
          <Avatar name={name} src={src || initial?.profilePhoto} size="w-24 h-24" />
        </button>
        <div className="text-center">
          <button onClick={() => setOpenProfile(true)} className="text-sm font-extrabold text-dark-text leading-tight hover:text-primary-teal transition">{name}</button>
          <div className="text-[10px] font-bold text-muted-text uppercase tracking-widest mt-1">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => setOpenDrawer(true)} className="p-2 rounded-xl bg-white border border-gray-100 text-muted-text hover:text-primary-teal shadow-sm transition">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setOpenProfile(true)} className="p-2 rounded-xl bg-white border border-gray-100 text-muted-text hover:text-primary-teal shadow-sm transition">
            <User size={14} />
          </button>
        </div>
      </div>
      {openDrawer && <StudentsDrawer id={id} initial={initial} onClose={() => setOpenDrawer(false)} classes={classes} />}
      {openProfile && <StudentProfileModal studentId={id} onClose={() => setOpenProfile(false)} />}
    </>
  )
}

const ArchiveButton = ({ id, onAfter }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('Left school')
  const [saving, setSaving] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-error">Archive</button>
      {open && (
        <div className="fixed inset-0 z-[3500] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-lg p-6">
            <div className="text-lg font-bold text-dark-text mb-3">Confirm Archive</div>
            <div className="text-xs font-bold text-muted-text mb-2">Provide a reason for archive</div>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option>Left school</option>
              <option>Completed school</option>
              <option>Expelled</option>
              <option>Incorrect entry</option>
            </select>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await fetch(`/api/students/${id}/archive`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason })
                    }).then(async r => { if (!r.ok) { const t = await r.json().catch(() => ({})); throw new Error(t.error || 'Failed') } })
                    setOpen(false)
                    onAfter && onAfter()
                  } catch (e) {
                    alert(e.message)
                  } finally {
                    setSaving(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-error text-white text-sm font-bold"
              >{saving ? 'Archiving…' : 'Archive'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentsList
