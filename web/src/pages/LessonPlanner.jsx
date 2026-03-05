import React, { useEffect, useState } from 'react'
import { Plus, RotateCw, Search, X } from 'lucide-react'

const LessonPlanner = () => {
  const [tab, setTab] = useState('plans')
  const [q, setQ] = useState('')
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [status, setStatus] = useState('pending') // pending | approved | draft | rejected
  const [selected, setSelected] = useState({})
  const [form, setForm] = useState({ topic: '', className: '', subject: '', term: 'First Term', week: '1', objectivesHtml: '', activitiesHtml: '', assessmentHtml: '', teacherId: '' })
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignReviewer, setAssignReviewer] = useState('')
  const load = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ q, page: '1', pageSize: '50', status })
      const r = await fetch(`/api/lessons?${p.toString()}`)
      const j = await r.json()
      setData(j)
    } catch { setData({ total: 0, page: 1, pageSize: 20, data: [] }) } finally { setLoading(false) }
  }
  useEffect(() => { load(); fetch('/api/teachers').then(r=>r.json()).then(setTeachers).catch(()=>setTeachers([])) }, []) // eslint-disable-line
  useEffect(() => { load() }, [status]) // eslint-disable-line
  const submitSelected = async () => {
    const ids = Object.entries(selected).filter(([_,v])=>v).map(([id])=>id)
    for (const id of ids) {
      await fetch(`/api/lessons/${id}/submit`, { method: 'POST' })
    }
    setSelected({})
    await load()
  }
  const decide = async (action) => {
    const ids = Object.entries(selected).filter(([_,v])=>v).map(([id])=>id)
    for (const id of ids) {
      await fetch(`/api/lessons/${id}/decision`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action, reviewer: 'Admin', comment: '' }) })
    }
    setSelected({})
    await load()
  }
  const printPlan = async (row) => {
    const w = window.open('', '_blank')
    const meta = (()=>{ try { return JSON.parse(row.content||'{}') } catch { return {} } })()
    const html = `
      <html><head><title>${row.topic}</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px}
        h1{font-size:20px;margin:0 0 8px}
        h2{font-size:14px;margin:16px 0 8px}
        table{width:100%;border-collapse:collapse}
        td,th{border:1px solid #e5e7eb;padding:8px;font-size:12px}
      </style></head>
      <body>
        <h1>Lesson Plan: ${row.topic}</h1>
        <table>
          <tr><th>Teacher</th><td>${row.teacherName||'—'}</td></tr>
          <tr><th>Class</th><td>${meta.className||'—'}</td></tr>
          <tr><th>Subject</th><td>${meta.subject||'—'}</td></tr>
          <tr><th>Term</th><td>${meta.term||'—'}</td></tr>
          <tr><th>Week</th><td>${meta.week||'—'}</td></tr>
          <tr><th>Status</th><td>${row.status||'—'}</td></tr>
        </table>
        <h2>Objectives</h2><div>${meta.objectivesHtml || (meta.objectives||'').replace(/\n/g,'<br/>')}</div>
        <h2>Activities</h2><div>${meta.activitiesHtml || (meta.activities||'').replace(/\n/g,'<br/>')}</div>
        <h2>Assessment</h2><div>${meta.assessmentHtml || (meta.assessment||'').replace(/\n/g,'<br/>')}</div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`
    w.document.write(html)
    w.document.close()
  }
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Lesson Plans</h1>
        <p className="text-xs text-muted-text font-medium">Yearly, termly, and weekly plans</p>
      </div>
      {assignOpen && (
        <div className="fixed inset-0 z-[3400] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setAssignOpen(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-extrabold text-dark-text">Assign Reviewer</div>
              <button onClick={()=>setAssignOpen(false)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-muted-text mb-1">Reviewer Name</div>
                <input value={assignReviewer} onChange={e=>setAssignReviewer(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Head Teacher" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setAssignOpen(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
                <button onClick={async ()=>{
                  const ids = Object.entries(selected).filter(([_,v])=>v).map(([id])=>id)
                  for (const id of ids) {
                    await fetch(`/api/lessons/${id}/assign-reviewer`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reviewer: assignReviewer }) })
                  }
                  setAssignOpen(false); setAssignReviewer(''); setSelected({}); await load()
                }} disabled={!assignReviewer.trim()} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab('plans')} className={`px-3 py-2 rounded-lg text-xs font-bold ${tab==='plans'?'bg-primary-teal text-white':'border border-gray-200 text-dark-text hover:bg-light-bg'}`}>Lesson Plans</button>
        <button disabled className={`px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-muted-text`}>Lesson Plan Templates</button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {['draft','pending','approved','rejected'].map(s=>(
            <button key={s} onClick={()=>setStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-bold ${status===s?'bg-dark-text text-white':'border border-gray-200 text-dark-text hover:bg-light-bg'}`}>{s[0].toUpperCase()+s.slice(1)}</button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search lesson plans" className="w-72 pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm" />
        </div>
        <button onClick={load} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold flex items-center gap-2"><RotateCw size={14}/> Reload</button>
        <button onClick={()=>setShowAdd(true)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold flex items-center gap-2"><Plus size={14}/> Create Lesson Plan</button>
        <button onClick={submitSelected} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold">Submit Approvals</button>
        <button onClick={()=>decide('approve')} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold">Approve</button>
        <button onClick={()=>decide('reject')} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-error">Reject</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4 space-y-3">
        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted-text font-bold">
              <tr>
                <th className="text-left px-4 py-3 w-8"><input type="checkbox" onChange={e=>setSelected(Object.fromEntries((data.data||[]).map(r=>[r.id,e.target.checked])))} /></th>
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Topic</th>
                <th className="text-left px-4 py-3 w-40">Class</th>
                <th className="text-left px-4 py-3 w-40">Subject</th>
                <th className="text-left px-4 py-3 w-28">Status</th>
                <th className="text-left px-4 py-3 w-48">Teacher</th>
                <th className="text-left px-4 py-3 w-40">Created</th>
                <th className="text-left px-4 py-3 w-24">Print</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={4}>Loading…</td></tr>}
              {!loading && data.data.length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={4}>No lesson plan has been created yet</td></tr>}
              {!loading && data.data.map(r => (
                <tr key={r.id} className="border-t border-gray-50">
                  <td className="px-4 py-3"><input type="checkbox" checked={!!selected[r.id]} onChange={e=>setSelected(v=>({ ...v, [r.id]: e.target.checked }))} /></td>
                  <td className="px-4 py-3 text-muted-text">{r.index}</td>
                  <td className="px-4 py-3 font-bold text-dark-text">{r.topic}</td>
                  <td className="px-4 py-3">{r.className || '—'}</td>
                  <td className="px-4 py-3">{r.subject || '—'}</td>
                  <td className="px-4 py-3">{r.status || '—'}</td>
                  <td className="px-4 py-3">{r.teacherName || '—'}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><button onClick={()=>printPlan(r)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold">Print</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAdd && (
        <AddLessonModal onClose={()=>setShowAdd(false)} onSaved={async ()=>{ setShowAdd(false); await load() }} teachers={teachers?.data || teachers} />
      )}
    </div>
  )
}

const Toolbar = ({ cmd }) => (
  <div className="flex items-center gap-2 mb-2">
    {[
      { k: 'bold', label: 'B' },
      { k: 'italic', label: 'I' },
      { k: 'underline', label: 'U' },
      { k: 'insertUnorderedList', label: '• List' },
    ].map(b => (
      <button key={b.k} onClick={()=>cmd(b.k)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold">{b.label}</button>
    ))}
  </div>
)

const RichEditor = ({ value, onChange }) => {
  const ref = React.useRef(null)
  const exec = (command) => document.execCommand(command, false, null)
  useEffect(()=>{ if(ref.current && value!==ref.current.innerHTML){ ref.current.innerHTML = value || '' } }, [value])
  return (
    <div>
      <Toolbar cmd={exec} />
      <div
        ref={ref}
        className="min-h-[100px] px-3 py-2 rounded-xl border border-gray-200 text-sm"
        contentEditable
        onInput={e=>onChange(e.currentTarget.innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  )
}

const AddLessonModal = ({ onClose, onSaved, teachers }) => {
  const [form, setForm] = useState({ topic:'', className:'', subject:'', term:'First Term', week:'1', objectivesHtml:'', activitiesHtml:'', assessmentHtml:'', teacherId:'' })
  const [saving, setSaving] = useState(false)
  const buildContent = () => JSON.stringify({
    className: form.className, subject: form.subject, term: form.term, week: form.week,
    objectivesHtml: form.objectivesHtml, activitiesHtml: form.activitiesHtml, assessmentHtml: form.assessmentHtml
  })
  const valid = form.topic.trim() && form.className.trim() && form.subject.trim() && form.term && form.week
  return (
    <div className="fixed inset-0 z-[3400] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-extrabold text-dark-text">Create Lesson Plan</div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-light-bg"><X size={18}/></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <div className="text-xs font-bold text-muted-text mb-1">Topic</div>
            <input value={form.topic} onChange={e=>setForm({...form, topic:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Parts of a Plant" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Class</div>
            <input value={form.className} onChange={e=>setForm({...form, className:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Grade 3A" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Subject</div>
            <input value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="e.g. Science" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Term</div>
            <select value={form.term} onChange={e=>setForm({...form, term:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Week</div>
            <input type="number" min="1" max="20" value={form.week} onChange={e=>setForm({...form, week:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Teacher</div>
            <select value={form.teacherId} onChange={e=>setForm({...form, teacherId:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
              <option value="">Optional</option>
              {(teachers || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <div className="text-xs font-bold text-muted-text mb-1">Learning Objectives</div>
            <RichEditor value={form.objectivesHtml} onChange={v=>setForm({...form, objectivesHtml:v})} />
          </div>
          <div className="col-span-2">
            <div className="text-xs font-bold text-muted-text mb-1">Activities</div>
            <RichEditor value={form.activitiesHtml} onChange={v=>setForm({...form, activitiesHtml:v})} />
          </div>
          <div className="col-span-2">
            <div className="text-xs font-bold text-muted-text mb-1">Assessment</div>
            <RichEditor value={form.assessmentHtml} onChange={v=>setForm({...form, assessmentHtml:v})} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
            <button disabled={!valid || saving} onClick={async ()=>{
              setSaving(true)
              try{
                const r = await fetch('/api/lessons',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ topic: form.topic.trim(), content: buildContent(), teacherId: form.teacherId || null }) })
                if(!r.ok){ const t = await r.json().catch(()=>({})); throw new Error(t.error || 'Failed') }
                onSaved && onSaved()
              }catch(e){ alert(e.message) }finally{ setSaving(false) }
            }} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50">{saving?'Saving…':'Save Plan'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPlanner
