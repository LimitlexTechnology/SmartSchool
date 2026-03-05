import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Download, FileDown, X } from 'lucide-react'

const Avatar = ({ name }) => {
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

const StaffList = () => {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '' })
  const [saving, setSaving] = useState(false)

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

  useEffect(() => { load({ page: 1 }) }, []) // eslint-disable-line

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
                <label className="text-xs font-bold text-muted-text">Full Name</label>
                <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Email</label>
                <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-text">Subject</label>
                <input value={form.subject} onChange={e=>setForm({...form, subject: e.target.value})} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
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
                      body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim() })
                    }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed') } return r.json() })
                    setShowAdd(false)
                    setForm({ name:'', email:'', subject:'' })
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
                <th className="text-left px-4 py-3 w-40">Subject</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={4}>Loading…</td></tr>}
              {!loading && data.data.length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={4}>No staff found</td></tr>}
              {!loading && data.data.map((t) => (
                <tr key={t.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-muted-text">{t.index}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>openDrawer(t)} className="flex items-center gap-3">
                      <Avatar name={t.name} />
                      <span className="font-bold text-dark-text hover:underline">{t.name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">{t.email}</td>
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
      {drawerId && <TeacherDrawer id={drawerId} initial={drawerInitial} onClose={()=>{ setDrawerId(null); setDrawerInitial(null); }} onSaved={()=>load({ page })} />}
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

const TeacherDrawer = ({ id, onClose, initial }) => {
  const [detail, setDetail] = useState(initial || null)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initial ? { name: initial.name || '', email: initial.email || '', subject: initial.subject || '' } : null)
  const [profile, setProfile] = useState({
    gender: '', phone: '', staffId: '', dateEmployed: '', ssn: '', nationalId: '', dob: '',
    momoNumber: '', accountNumber: '', bankBranch: '', bankName: '', nextOfKin: '', nextOfKinRelation: '', nextOfKinPhone: '',
    classesTaught: [], subjectsTaught: [], formMaster: ''
  })
  const [profileForm, setProfileForm] = useState(null)
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
        setForm({ name: d.name || '', email: d.email || '', subject: d.subject || '' })
        const p = await fetch(`/api/teachers/${id}/profile`).then(r=>r.json()).catch(()=>({}))
        if (!mounted) return
        setProfile({
          gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
          nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
          bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
          nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || ''
        })
        setProfileForm({
          gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
          nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
          bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
          nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || ''
        })
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
            <Avatar name={name || 'U'} />
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
                      await fetch(`/api/teachers/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      const payloadProfile = { ...profileForm, classesTaught: profileForm.classesTaught, subjectsTaught: profileForm.subjectsTaught }
                      await fetch(`/api/teachers/${id}/profile`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payloadProfile) }).then(async r=>{ if(!r.ok){ const t=await r.json().catch(()=>({})); throw new Error(t.error || 'Failed')} return r.json() })
                      const d = await fetch(`/api/teachers/${id}`).then(r=>r.json())
                      const p = await fetch(`/api/teachers/${id}/profile`).then(r=>r.json())
                      setDetail(d)
                      setProfile({
                        gender: p.gender || '', phone: p.phone || '', staffId: p.staffId || '', dateEmployed: p.dateEmployed || '', ssn: p.ssn || '',
                        nationalId: p.nationalId || '', dob: p.dob || '', momoNumber: p.momoNumber || '', accountNumber: p.accountNumber || '',
                        bankBranch: p.bankBranch || '', bankName: p.bankName || '', nextOfKin: p.nextOfKin || '', nextOfKinRelation: p.nextOfKinRelation || '',
                        nextOfKinPhone: p.nextOfKinPhone || '', classesTaught: Array.isArray(p.classesTaught)?p.classesTaught:[], subjectsTaught: Array.isArray(p.subjectsTaught)?p.subjectsTaught:[], formMaster: p.formMaster || ''
                      })
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
              <Field label="Classes Taught" value={(profile.classesTaught || []).join(', ') || '—'} />
              <Field label="Subjects Taught" value={(profile.subjectsTaught || []).join(', ') || '—'} />
              <Field label="Form Master" value={profile.formMaster || '—'} />
            </Section>
          </div>
        )}
        {!loading && detail && edit && form && (
          <div className="space-y-4">
            <Section title="Basic Info">
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
              <EditField label="Subject" value={form.subject} onChange={v=>setForm({...form, subject:v})} />
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
              <EditField label="Classes Taught (comma-separated)" value={(profileForm.classesTaught||[]).join(', ')} onChange={v=>setProfileForm({...profileForm, classesTaught: v.split(',').map(s=>s.trim()).filter(Boolean)})} />
              <EditField label="Subjects Taught (comma-separated)" value={(profileForm.subjectsTaught||[]).join(', ')} onChange={v=>setProfileForm({...profileForm, subjectsTaught: v.split(',').map(s=>s.trim()).filter(Boolean)})} />
              <EditField label="Form Master" value={profileForm.formMaster} onChange={v=>setProfileForm({...profileForm, formMaster:v})} />
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffList
