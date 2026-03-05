import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'

const CourseAllocation = () => {
  const [q, setQ] = useState('')
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingClassId, setEditingClassId] = useState(null)
  const [subject, setSubject] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkClasses, setBulkClasses] = useState({})
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkTeacherIds, setBulkTeacherIds] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/allocations')
      let j = {}
      try {
        j = await r.json()
      } catch {
        j = {}
      }
      if (!r.ok) {
        throw new Error(j.error || 'Failed to load allocations')
      }
      setClasses(j.classes || [])
      setTeachers(j.teachers || [])
      setAssignments(j.assignments || [])
    } catch (e) {
      console.error(e)
      setClasses([])
      setTeachers([])
      setAssignments([])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const byClass = useMemo(() => {
    const map = {}
    for (const c of classes) map[c.id] = { ...c, rows: [] }
    for (const a of assignments) {
      if (!map[a.classId]) continue
      const t = teachers.find(x => x.id === a.teacherId)
      map[a.classId].rows.push({ id: a.id, subject: a.subject, teacher: t })
    }
    return Object.values(map)
      .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a,b) => (a.grade||'').localeCompare(b.grade||'') || a.name.localeCompare(b.name))
  }, [classes, assignments, teachers, q])

  const saveAllocation = async () => {
    if (!editingClassId || !teacherId || !subject.trim()) return
    const res = await fetch('/api/allocations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ classId: editingClassId, teacherId, subject: subject.trim() }) })
    if (!res.ok) {
      let err = {}
      try { err = await res.json() } catch { err = {} }
      alert(err.error || 'Failed to save allocation')
      return
    }
    setSubject('')
    setTeacherId('')
    setEditingClassId(null)
    await load()
  }

  const removeAllocation = async (id) => {
    await fetch(`/api/allocations/${id}`, { method:'DELETE' })
    await load()
  }

  const selectedClass = classes.find(c => c.id === editingClassId)
  const [suggestions, setSuggestions] = useState([])
  useEffect(() => {
    const grade = selectedClass?.grade || ''
    fetch(`/api/subjects?grade=${encodeURIComponent(grade)}`).then(r=>r.json()).then(j=>setSuggestions(j.subjects||[])).catch(()=>setSuggestions([]))
  }, [editingClassId])

  const openBulk = () => {
    const m = {}
    byClass.forEach(c => { m[c.id] = false })
    setBulkClasses(m)
    setBulkSubject('')
    setBulkTeacherIds({})
    setBulkOpen(true)
  }

  const saveBulk = async () => {
    const classIds = Object.entries(bulkClasses).filter(([id, v]) => v).map(([id]) => id)
    const teacherIds = Object.entries(bulkTeacherIds).filter(([id, v]) => v).map(([id]) => id)
    if (!classIds.length || !teacherIds.length || !bulkSubject.trim()) return
    const res = await fetch('/api/allocations/bulk', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ classIds, teacherIds, subject: bulkSubject.trim() }) })
    if (!res.ok) {
      let err = {}; try { err = await res.json() } catch {}
      alert(err.error || 'Failed to apply bulk allocations')
      return
    }
    setBulkOpen(false)
    await load()
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Course Allocation</h1>
        <p className="text-xs text-muted-text font-medium">Pair teachers, subjects and classes</p>
      </div>

      <div className="relative flex items-center gap-2">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search classes"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-dark-text placeholder-muted-text outline-none focus:ring-2 focus:ring-primary-teal/30"
        />
        <button onClick={openBulk} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg">Bulk Assign</button>
      </div>

      {loading && <div className="text-muted-text text-sm">Loading…</div>}
      {!loading && byClass.map(c => (
        <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-dark-text">{c.grade ? `${c.grade} • ${c.name}` : c.name}</div>
            <button onClick={()=>{ setEditingClassId(c.id); setSubject(''); setTeacherId('') }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold flex items-center gap-1"><Plus size={14}/> Edit</button>
          </div>
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-muted-text font-bold">
                <tr>
                  <th className="text-left px-4 py-3">Course</th>
                  <th className="text-left px-4 py-3 w-96">Teachers</th>
                  <th className="text-left px-4 py-3 w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.length === 0 && <tr><td className="px-4 py-3 text-muted-text" colSpan={3}>No allocations</td></tr>}
                {c.rows.map(r => (
                  <tr key={r.id} className="border-t border-gray-50">
                    <td className="px-4 py-3">{r.subject}</td>
                    <td className="px-4 py-3">{r.teacher ? r.teacher.name : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>removeAllocation(r.id)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold text-error">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {editingClassId && (
        <div className="fixed inset-0 z-[3300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setEditingClassId(null)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-extrabold text-dark-text">Assign Teacher</div>
              <button onClick={()=>setEditingClassId(null)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-muted-text mb-1">Class</div>
                <select value={editingClassId} onChange={e=>setEditingClassId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.grade ? `${c.grade} • ${c.name}` : c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-text mb-1">Subject</div>
                <input list="subjectlist" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Type or choose a subject" />
                <datalist id="subjectlist">
                  {(suggestions.length? suggestions : ['Computing','Numeracy','Language and Literacy','Phonics','Pre-writing','Geography','Creative Arts','Science','Mathematics','English','History','Religious Moral Education','Social Studies']).map(s=>(
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <div className="text-xs font-bold text-muted-text mb-1">Teachers</div>
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-xl p-2">
                  {teachers.map(t => (
                    <label key={t.id} className="flex items-center gap-2 px-2 py-1">
                      <input type="checkbox" checked={Array.isArray(teacherId) ? teacherId.includes(t.id) : false} onChange={e=>{
                        const set = new Set(Array.isArray(teacherId)?teacherId:[])
                        if (e.target.checked) set.add(t.id); else set.delete(t.id)
                        setTeacherId(Array.from(set))
                      }} />
                      <span className="text-sm font-bold text-dark-text">{t.name} • {t.subject || '—'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setEditingClassId(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
                <button onClick={async ()=>{
                  if (!Array.isArray(teacherId) || teacherId.length===0) return
                  const res = await fetch('/api/allocations/bulk', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ classIds: [editingClassId], subject: subject.trim(), teacherIds: teacherId }) })
                  if (!res.ok) { let err={}; try{ err=await res.json() }catch{}; alert(err.error || 'Failed'); return }
                  setSubject(''); setTeacherId([]); setEditingClassId(null); await load()
                }} disabled={!subject.trim() || !(Array.isArray(teacherId) && teacherId.length>0)} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 z-[3300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setBulkOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-extrabold text-dark-text">Bulk Assign</div>
              <button onClick={()=>setBulkOpen(false)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-muted-text mb-1">Classes</div>
                <div className="max-h-64 overflow-auto border border-gray-200 rounded-xl p-2">
                  {byClass.map(c => (
                    <label key={c.id} className="flex items-center gap-2 px-2 py-1">
                      <input type="checkbox" checked={!!bulkClasses[c.id]} onChange={e=>setBulkClasses(v=>({ ...v, [c.id]: e.target.checked }))} />
                      <span className="text-sm font-bold text-dark-text">{c.grade ? `${c.grade} • ${c.name}` : c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-muted-text mb-1">Subject</div>
                  <input value={bulkSubject} onChange={e=>setBulkSubject(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-text mb-1">Teachers</div>
                  <div className="max-h-64 overflow-auto border border-gray-200 rounded-xl p-2">
                    {teachers.map(t => (
                      <label key={t.id} className="flex items-center gap-2 px-2 py-1">
                        <input type="checkbox" checked={!!bulkTeacherIds[t.id]} onChange={e=>setBulkTeacherIds(v=>({ ...v, [t.id]: e.target.checked }))} />
                        <span className="text-sm font-bold text-dark-text">{t.name} • {t.subject || '—'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={()=>setBulkOpen(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
                  <button onClick={saveBulk} disabled={!bulkSubject.trim() || !Object.values(bulkClasses).some(Boolean) || !Object.values(bulkTeacherIds).some(Boolean)} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseAllocation
