import React, { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

const computePreview = (startTime, endTime, periodMinutes, breaks=[]) => {
  const toMin = (s) => { const [h,m]=s.split(':').map(n=>parseInt(n,10)); return h*60+m }
  const toTime = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`
  const ov = (a,b,c,d)=>Math.max(a,c)<Math.min(b,d)
  const start = toMin(startTime), end = toMin(endTime), L = parseInt(periodMinutes,10)
  const br = breaks.map(b=>({s:toMin(b.start), e:toMin(b.end)})).filter(b=>b.e>b.s)
  const out = []; let t=start; let i=1
  while(t+L<=end){ const s=t, e=t+L; if(!br.some(b=>ov(s,e,b.s,b.e))) out.push({index:i++, start:toTime(s), end:toTime(e)}); t+=L }
  return out
}

const Timetables = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [wizard, setWizard] = useState(false)
  const [step, setStep] = useState(1)
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    name: '', startTime: '07:30', endTime: '15:15', periodMinutes: 40, includeSaturday: false,
    breaks: [], classes: []
  })
  const preview = useMemo(()=> computePreview(form.startTime, form.endTime, form.periodMinutes, form.breaks), [form])
  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/timetables')
      const j = await r.json()
      setItems(j || [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load(); fetch('/api/classes').then(r=>r.json()).then(setClasses).catch(()=>setClasses([])) }, []) // eslint-disable-line

  const save = async () => {
    const r = await fetch('/api/timetables', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (!r.ok) { const t = await r.json().catch(()=>({})); alert(t.error || 'Failed to create'); return }
    setWizard(false); setStep(1); setForm({ name:'', startTime:'07:30', endTime:'15:15', periodMinutes:40, includeSaturday:false, breaks:[], classes:[] }); await load()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text">Timetables</h1>
        </div>
        <button onClick={()=>{ setWizard(true); setStep(1) }} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold flex items-center gap-2"><Plus size={14}/> Create Timetable</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6">
        {loading && <div className="text-sm text-muted-text">Loading…</div>}
        {!loading && items.length===0 && (
          <div className="flex items-center justify-center py-20 text-center">
            <div>
              <img alt="" src="/vite.svg" className="w-16 opacity-70 mx-auto mb-3" />
              <div className="text-sm font-extrabold text-dark-text">No timetables found</div>
              <div className="text-xs text-muted-text font-bold">Create your first timetable to get started</div>
            </div>
          </div>
        )}
        {!loading && items.length>0 && (
          <div className="space-y-3">
            {items.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-dark-text">{t.name}</div>
                    <div className="text-xs text-muted-text font-bold">{t.startTime} – {t.endTime} • {t.periodMinutes} mins • {t.includeSaturday?'Mon–Sat':'Mon–Fri'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {wizard && (
        <div className="fixed inset-0 z-[3600] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setWizard(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-soft-sm w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-extrabold text-dark-text">Create Timetable</div>
              <button onClick={()=>setWizard(false)} className="p-1 rounded-lg hover:bg-light-bg"><X size={18}/></button>
            </div>

            {step===1 && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-muted-text mb-1">Timetable Name</div>
                  <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Primary Morning Shift" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold text-muted-text mb-1">School Start Time</div>
                    <input type="time" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-text mb-1">School End Time</div>
                    <input type="time" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold text-muted-text mb-1">Period Length</div>
                    <select value={form.periodMinutes} onChange={e=>setForm({...form, periodMinutes:parseInt(e.target.value,10)})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                      {[30,35,40,45,50,60].map(n=><option key={n} value={n}>{n} minutes</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-muted-text">Include Saturday</label>
                    <input type="checkbox" checked={form.includeSaturday} onChange={e=>setForm({...form, includeSaturday:e.target.checked})}/>
                  </div>
                </div>
                <div className="flex justify-end"><button onClick={()=>setStep(2)} disabled={!form.name || !form.startTime || !form.endTime || !form.periodMinutes} className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold disabled:opacity-50">Continue</button></div>
              </div>
            )}

            {step===2 && (
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-muted-text">Breaks</div>
                <BreaksEditor value={form.breaks} onChange={b=>setForm({...form, breaks:b})}/>
                <div className="flex justify-between">
                  <button onClick={()=>setStep(1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Back</button>
                  <button onClick={()=>setStep(3)} className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold">Continue</button>
                </div>
              </div>
            )}

            {step===3 && (
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-muted-text">Preview Periods</div>
                <div className="overflow-hidden border border-gray-100 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-muted-text font-bold">
                      <tr><th className="text-left px-4 py-3 w-12">#</th><th className="text-left px-4 py-3">Start</th><th className="text-left px-4 py-3">End</th></tr>
                    </thead>
                    <tbody>
                      {preview.map(p=>(
                        <tr key={p.index} className="border-t border-gray-50"><td className="px-4 py-2">{p.index}</td><td className="px-4 py-2">{p.start}</td><td className="px-4 py-2">{p.end}</td></tr>
                      ))}
                      {preview.length===0 && <tr><td colSpan={3} className="px-4 py-4 text-muted-text text-sm">No teaching periods available within the selected window</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between">
                  <button onClick={()=>setStep(2)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Back</button>
                  <button onClick={()=>setStep(4)} className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold">Continue</button>
                </div>
              </div>
            )}

            {step===4 && (
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-muted-text">Assign Classes</div>
                <div className="max-h-64 overflow-auto border border-gray-200 rounded-xl p-2">
                  {classes.map(c=>(
                    <label key={c.id} className="flex items-center gap-2 px-2 py-1">
                      <input type="checkbox" checked={(form.classes||[]).includes(c.id)} onChange={e=>{
                        const set = new Set(form.classes || [])
                        if (e.target.checked) set.add(c.id); else set.delete(c.id)
                        setForm({...form, classes: Array.from(set)})
                      }}/>
                      <span className="text-sm font-bold text-dark-text">{c.grade ? `${c.grade} • ${c.name}` : c.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button onClick={()=>setStep(3)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold">Back</button>
                  <button onClick={save} className="px-4 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold">Save Timetable</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const BreaksEditor = ({ value, onChange }) => {
  const [items, setItems] = useState(value || [])
  useEffect(()=>{ setItems(value || []) }, [value])
  const add = () => { const next = [...items, { name: 'Break', start: '10:30', end: '11:00' }]; setItems(next); onChange(next) }
  const update = (i, patch) => { const next = items.map((it, idx)=> idx===i ? { ...it, ...patch } : it ); setItems(next); onChange(next) }
  const remove = (i) => { const next = items.filter((_, idx)=> idx!==i); setItems(next); onChange(next) }
  return (
    <div className="space-y-2">
      {items.map((b,i)=>(
        <div key={i} className="grid grid-cols-5 gap-2 items-end">
          <div className="col-span-2">
            <div className="text-xs font-bold text-muted-text mb-1">Name</div>
            <input value={b.name} onChange={e=>update(i,{name:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Start</div>
            <input type="time" value={b.start} onChange={e=>update(i,{start:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">End</div>
            <input type="time" value={b.end} onChange={e=>update(i,{end:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"/>
          </div>
          <div>
            <button onClick={()=>remove(i)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold">Remove</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold">Add Break</button>
    </div>
  )
}

export default Timetables

