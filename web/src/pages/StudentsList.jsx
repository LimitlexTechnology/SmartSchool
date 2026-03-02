import React, { useEffect, useMemo, useState } from 'react'
import { Search, Filter, ListFilter, Plus, RotateCw, Download, FileDown, X } from 'lucide-react'

const Avatar = ({ name }) => {
  const initials = useMemo(() => {
    const parts = name.trim().split(' ')
    return (parts[0]?.[0] || '').toUpperCase()
  }, [name])
  const colors = ['#0ea5b7', '#ef4444', '#f59e0b', '#10b981', '#6366f1']
  const bg = colors[(name.length + initials.charCodeAt(0)) % colors.length]
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: bg }}>
      {initials || '?'}
    </div>
  )
}

const StudentsList = () => {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [showAdd, setShowAdd] = useState(false)
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', grade: '', classId: '', wristbandId: '',
    gender: '', birthday: '', admittedAt: '',
    religion: '', nationality: '', hometown: '', address: '',
    guardianName: '', guardianRelationship: '', guardianContact: '',
  })
  const [saving, setSaving] = useState(false)
  const [grid, setGrid] = useState(false)

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
    fetch('/api/classes').then(r=>r.json()).then(setClasses).catch(()=>setClasses([]))
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
        <button onClick={() => setGrid(v=>!v)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-text">First Name</label>
                <input value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Last Name</label>
                <input value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Email</label>
                <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Gender</label>
                <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Birthday</label>
                <input type="date" value={form.birthday} onChange={e=>setForm({...form, birthday:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Class</label>
                <select value={form.classId} onChange={e=>setForm({...form, classId:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">Select class</option>
                  {classes.map(c=>(
                    <option key={c.id} value={c.id}>{c.grade} • {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Grade</label>
                <input value={form.grade} onChange={e=>setForm({...form, grade:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Date Admitted</label>
                <input type="date" value={form.admittedAt} onChange={e=>setForm({...form, admittedAt:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Student ID</label>
                <input value={form.wristbandId} onChange={e=>setForm({...form, wristbandId:e.target.value})} placeholder="Optional" className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Religion</label>
                <input value={form.religion} onChange={e=>setForm({...form, religion:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Nationality</label>
                <input value={form.nationality} onChange={e=>setForm({...form, nationality:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Hometown</label>
                <input value={form.hometown} onChange={e=>setForm({...form, hometown:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Address</label>
                <input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2 mt-2 text-xs font-extrabold text-dark-text">Guardian</div>
              <div>
                <label className="text-xs font-bold text-muted-text">Name</label>
                <input value={form.guardianName} onChange={e=>setForm({...form, guardianName:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-text">Relationship</label>
                <input value={form.guardianRelationship} onChange={e=>setForm({...form, guardianRelationship:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Contact Number</label>
                <input value={form.guardianContact} onChange={e=>setForm({...form, guardianContact:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
              <button
                disabled={saving || !form.firstName || !form.lastName || !form.email}
                onClick={async ()=>{
                  setSaving(true)
                  try{
                    await fetch('/api/students',{
                      method:'POST',
                      headers:{'Content-Type':'application/json'},
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
                      })
                    }).then(async r=>{
                      if(!r.ok){
                        const t = await r.json().catch(()=>({}))
                        throw new Error(t.error || 'Failed')
                      }
                      return r.json()
                    })
                    setShowAdd(false)
                    setForm({
                      firstName:'', lastName:'', email:'', grade:'', classId:'', wristbandId:'',
                      gender:'', birthday:'', admittedAt:'',
                      religion:'', nationality:'', hometown:'', address:'',
                      guardianName:'', guardianRelationship:'', guardianContact:''
                    })
                    await load({ page: 1 })
                  }catch(e){
                    alert(e.message)
                  }finally{
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
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-4 py-6 text-muted-text" colSpan={5}>Loading…</td>
                  </tr>
                )}
                {!loading && data.data.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-text" colSpan={5}>No students found</td>
                  </tr>
                )}
                {!loading && data.data.map((s) => {
                  const name = `${s.firstName} ${s.lastName}`
                  return (
                    <tr key={s.id} className="border-t border-gray-50">
                      <td className="px-4 py-3 text-muted-text">{s.index}</td>
                      <td className="px-4 py-3">
                        <StudentName name={name} id={s.id} initial={s} />
                      </td>
                      <td className="px-4 py-3">{s.gender || '—'}</td>
                      <td className="px-4 py-3">{s.studentId}</td>
                      <td className="px-4 py-3">{s.className || s.grade || '—'}</td>
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
                    <StudentTile key={s.id} name={name} id={s.id} subtitle={s.className || s.grade || '—'} initial={s} />
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
    </div>
  )
}

const StudentsDrawer = ({ id, onClose, initial }) => {
  const [detail, setDetail] = useState(initial || null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initial ? {
    firstName: initial.firstName || '', lastName: initial.lastName || '', email: initial.email || '',
    className: initial.className || '', grade: initial.grade || '',
    gender: initial.gender || '', birthday: initial.birthday ? String(initial.birthday).split('T')[0] : '',
    admittedAt: initial.admittedAt ? String(initial.admittedAt).split('T')[0] : '',
    religion: initial.religion || '', nationality: initial.nationality || '', hometown: initial.hometown || '', address: initial.address || '',
    guardianName: initial.guardianName || '', guardianRelationship: initial.guardianRelationship || '', guardianContact: initial.guardianContact || '',
  } : null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/students/${id}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        if (!mounted) return
        setDetail(d)
        setForm({
          firstName: d.firstName || '', lastName: d.lastName || '', email: d.email || '',
          className: d.className || '', grade: d.grade || '',
          gender: d.gender || '', birthday: d.birthday ? d.birthday.split('T')[0] : '',
          admittedAt: d.admittedAt ? d.admittedAt.split('T')[0] : '',
          religion: d.religion || '', nationality: d.nationality || '', hometown: d.hometown || '', address: d.address || '',
          guardianName: d.guardianName || '', guardianRelationship: d.guardianRelationship || '', guardianContact: d.guardianContact || '',
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
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])
  const name = detail ? `${detail.firstName} ${detail.lastName}` : ''
  return (
    <div className="fixed inset-0 z-[3000]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-100 shadow-soft-sm p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={name || 'U'} />
            <div>
              <div className="font-extrabold text-dark-text">{name || '—'}</div>
              <div className="text-xs text-muted-text font-bold">{detail?.studentId || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArchiveButton id={id} onAfter={() => { setEdit(false); onClose(); window.dispatchEvent(new CustomEvent('students:refresh')) }} />
            {!edit && <button onClick={()=>setEdit(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Edit</button>}
            {edit && (
              <>
                <button
                  disabled={saving}
                  onClick={async ()=>{
                    setSaving(true)
                    try{
                      const payload = {
                        firstName: form.firstName, lastName: form.lastName, email: form.email,
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
                      }
                      await fetch(`/api/students/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
                        .then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      const d = await fetch(`/api/students/${id}`).then(r=>r.json())
                      setDetail(d)
                      setEdit(false)
                      window.dispatchEvent(new CustomEvent('students:refresh'))
                    }catch(e){
                      alert(e.message)
                    }finally{
                      setSaving(false)
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-bold disabled:opacity-50"
                >{saving?'Saving…':'Save'}</button>
                <button onClick={()=>{ setEdit(false); setForm({
                  firstName: detail.firstName || '', lastName: detail.lastName || '', email: detail.email || '',
                  className: detail.className || '', grade: detail.grade || '',
                  gender: detail.gender || '', birthday: detail.birthday ? detail.birthday.split('T')[0] : '',
                  admittedAt: detail.admittedAt ? detail.admittedAt.split('T')[0] : '',
                  religion: detail.religion || '', nationality: detail.nationality || '', hometown: detail.hometown || '', address: detail.address || '',
                  guardianName: detail.guardianName || '', guardianRelationship: detail.guardianRelationship || '', guardianContact: detail.guardianContact || '',
                }) }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Cancel</button>
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
            <Section title="Basic Info">
              <EditField label="First Name" value={form.firstName} onChange={v=>setForm({...form, firstName:v})} />
              <EditField label="Last Name" value={form.lastName} onChange={v=>setForm({...form, lastName:v})} />
              <EditField label="Email" value={form.email} onChange={v=>setForm({...form, email:v})} />
              <div className="grid grid-cols-3 items-center">
                <div className="text-xs font-bold text-muted-text">Gender</div>
                <div className="col-span-2">
                  <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <EditField type="date" label="Birthday" value={form.birthday} onChange={v=>setForm({...form, birthday:v})} />
              <EditField type="date" label="Date Admitted" value={form.admittedAt} onChange={v=>setForm({...form, admittedAt:v})} />
            </Section>
            <Section title="Academics">
              <EditField label="Grade" value={form.grade} onChange={v=>setForm({...form, grade:v})} />
            </Section>
            <Section title="Personal Info">
              <EditField label="Religion" value={form.religion} onChange={v=>setForm({...form, religion:v})} />
              <EditField label="Nationality" value={form.nationality} onChange={v=>setForm({...form, nationality:v})} />
              <EditField label="Hometown" value={form.hometown} onChange={v=>setForm({...form, hometown:v})} />
              <EditField label="Postal Address" value={form.address} onChange={v=>setForm({...form, address:v})} />
            </Section>
            <Section title="Guardian">
              <EditField label="Name" value={form.guardianName} onChange={v=>setForm({...form, guardianName:v})} />
              <EditField label="Relationship" value={form.guardianRelationship} onChange={v=>setForm({...form, guardianRelationship:v})} />
              <EditField label="Contact Number" value={form.guardianContact} onChange={v=>setForm({...form, guardianContact:v})} />
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

const EditField = ({ label, value, onChange, type='text' }) => (
  <div className="grid grid-cols-3 items-center">
    <div className="text-xs font-bold text-muted-text">{label}</div>
    <div className="col-span-2">
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full" />
    </div>
  </div>
)

const StudentName = ({ name, id, initial }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-3">
        <Avatar name={name} />
        <span className="font-bold text-dark-text hover:underline">{name}</span>
      </button>
      {open && <StudentsDrawer id={id} initial={initial} onClose={() => setOpen(false)} />}
    </>
  )
}

const StudentTile = ({ name, subtitle, id, initial }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={()=>setOpen(true)} className="flex flex-col items-center gap-3 focus:outline-none">
        <div className="w-24 h-24 rounded-full bg-light-bg flex items-center justify-center shadow-sm">
          <Avatar name={name} />
        </div>
        <div className="text-center">
          <div className="text-sm font-extrabold text-dark-text leading-tight">{name}</div>
          <div className="text-xs font-bold text-muted-text leading-tight">{subtitle}</div>
        </div>
      </button>
      {open && <StudentsDrawer id={id} initial={initial} onClose={()=>setOpen(false)} />}
    </>
  )
}

const ArchiveButton = ({ id, onAfter }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('Left school')
  const [saving, setSaving] = useState(false)
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-error">Archive</button>
      {open && (
        <div className="fixed inset-0 z-[3500] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-lg p-6">
            <div className="text-lg font-bold text-dark-text mb-3">Confirm Archive</div>
            <div className="text-xs font-bold text-muted-text mb-2">Provide a reason for archive</div>
            <select value={reason} onChange={e=>setReason(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option>Left school</option>
              <option>Completed school</option>
              <option>Expelled</option>
              <option>Incorrect entry</option>
            </select>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
              <button
                disabled={saving}
                onClick={async ()=>{
                  setSaving(true)
                  try{
                    await fetch(`/api/students/${id}/archive`, {
                      method:'POST',
                      headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ reason })
                    }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed') } })
                    setOpen(false)
                    onAfter && onAfter()
                  }catch(e){
                    alert(e.message)
                  }finally{
                    setSaving(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-error text-white text-sm font-bold"
              >{saving?'Archiving…':'Archive'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentsList
