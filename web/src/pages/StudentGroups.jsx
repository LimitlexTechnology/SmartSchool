import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Users, Search, X, Trash2 } from 'lucide-react'

const EmptyState = ({ onCreate }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-12 flex flex-col items-center justify-center">
    <img alt="" src="/vite.svg" className="w-28 mb-4 opacity-90" />
    <div className="text-sm font-extrabold text-dark-text">Create a Student Group to see here</div>
    <button onClick={onCreate} className="mt-4 px-4 py-2 rounded-lg bg-primary-teal text-white font-bold text-sm">
      Create New Group
    </button>
  </div>
)

const CreateGroupModal = ({ open, onClose, onCreate }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const presets = ['Prefects', 'Debate Club', 'Scholarship Students', 'Football Team', 'Science Club', 'Remedial Classes']
  useEffect(() => { if (!open) { setName(''); setDescription('') } }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[4000] bg-black/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-extrabold text-dark-text">Create Group</div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-50"><X size={18}/></button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Group Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Debate Club" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map(p => (
                <button key={p} type="button" onClick={()=>setName(p)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50">{p}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-muted-text mb-1">Description (optional)</div>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" rows={3}/>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
            <button onClick={() => onCreate({ name: name.trim(), description: description.trim() })} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold" disabled={!name.trim()}>Create</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AddMembersDrawer = ({ open, onClose, onAdd, onBulk, groupName }) => {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState({})
  useEffect(() => { if (open) { setQ(''); setItems([]); setSelected({}) } }, [open])

  useEffect(() => {
    let active = true
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/students?q=${encodeURIComponent(q)}&pageSize=50`)
        const data = await res.json()
        if (!active) return
        setItems(data.data || [])
      } catch { if (active) setItems([]) } finally { if (active) setLoading(false) }
    }
    run()
    return () => { active = false }
  }, [q])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[4100] bg-black/20 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-extrabold text-dark-text">Add Members to {groupName}</div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-50"><X size={18}/></button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="px-2 py-2 rounded-lg border border-gray-200"><Search size={16}/></div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search students by name or email" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" />
        </div>
        <div className="max-h-[50vh] overflow-auto divide-y divide-gray-50">
          {loading && <div className="p-4 text-sm text-muted-text font-bold">Loading…</div>}
          {!loading && items.map(s => (
            <label key={s.id} className="flex items-center justify-between px-2 py-3 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-light-bg flex items-center justify-center text-xs font-extrabold text-primary-teal">{(s.firstName?.[0]||'') + (s.lastName?.[0]||'')}</div>
                <div>
                  <div className="text-sm font-extrabold text-dark-text">{s.firstName} {s.lastName}</div>
                  <div className="text-xs text-muted-text font-bold">{s.className || s.grade || '—'}</div>
                </div>
              </div>
              <input type="checkbox" checked={!!selected[s.id]} onChange={e => setSelected(v => ({ ...v, [s.id]: e.target.checked }))} />
            </label>
          ))}
          {!loading && items.length === 0 && <div className="p-4 text-sm text-muted-text font-bold">No results</div>}
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Cancel</button>
          <button onClick={() => onBulk(q)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Add All Results</button>
          <button onClick={() => onAdd(Object.entries(selected).filter(([_, v])=>v).map(([id])=>id))} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold" disabled={!Object.values(selected).some(Boolean)}>Add Selected</button>
        </div>
      </div>
    </div>
  )
}

const StudentGroups = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const active = useMemo(() => groups.find(g => g.id === activeId) || null, [groups, activeId])

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/groups')
      if (!res.ok) throw new Error('Failed to load groups')
      const data = await res.json()
      setGroups(data)
      if (data[0]) setActiveId(prev => prev || data[0].id)
    } catch (e) {
      setError(e.message || 'Failed to load')
      setGroups([])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async ({ name, description }) => {
    try {
      const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) })
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j.error || 'Failed to create') }
      setModal(false)
      await load()
    } catch (e) { alert(e.message) }
  }

  const openAddMembers = () => setDrawer(true)
  const addMembers = async (ids) => {
    try {
      const res = await fetch(`/api/groups/${activeId}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentIds: ids }) })
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j.error || 'Failed to add members') }
      setDrawer(false)
      // refresh group detail
      await view(activeId)
      // also refresh list counts
      await load()
    } catch (e) { alert(e.message) }
  }
  const bulkAdd = async (q) => {
    try {
      const res = await fetch(`/api/groups/${activeId}/members/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q }) })
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j.error || 'Failed to add members') }
      setDrawer(false)
      await view(activeId)
      await load()
    } catch (e) { alert(e.message) }
  }

  const [flags, setFlags] = useState({ scholarship: false, debtor: false, billingTag: '' })
  useEffect(() => {
    if (active?.detail) {
      setFlags({
        scholarship: !!active.detail.scholarship,
        debtor: !!active.detail.debtor,
        billingTag: active.detail.billingTag || ''
      })
    }
  }, [active?.detail?.id])

  const saveFlags = async () => {
    try {
      const res = await fetch(`/api/groups/${activeId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(flags) })
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j.error || 'Failed to save') }
      await view(activeId)
      alert('Saved')
    } catch (e) { alert(e.message) }
  }

  const exportCSV = () => {
    window.open(`/api/groups/${activeId}/export.csv`, '_blank')
  }

  const view = async (id) => {
    try {
      const res = await fetch(`/api/groups/${id}`)
      if (!res.ok) throw new Error('Failed to load group')
      const detail = await res.json()
      setGroups(gs => gs.map(g => g.id === id ? { ...g, detail } : g))
      setActiveId(id)
    } catch (e) { alert(e.message) }
  }

  const removeMember = async (memberId) => {
    if (!confirm('Remove this student from the group?')) return
    try {
      const res = await fetch(`/api/groups/${activeId}/members/${memberId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      await view(activeId)
      await load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary-teal rounded-full" />
          <h2 className="text-lg font-extrabold text-dark-text">Student Groups</h2>
        </div>
        <button onClick={()=>setModal(true)} className="px-3 py-2 rounded-lg bg-primary-teal text-white text-sm font-bold flex items-center gap-2"><Plus size={16}/> Create New Group</button>
      </div>

      {loading && <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6 text-sm text-muted-text font-bold">Loading groups…</div>}
      {!loading && groups.length === 0 && <EmptyState onCreate={()=>setModal(true)} />}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-3">
            <div className="text-xs font-extrabold text-muted-text mb-2">All Groups</div>
            <div className="space-y-1">
              {groups.map(g => (
                <button key={g.id} onClick={()=>view(g.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${activeId===g.id ? 'border-primary-teal bg-light-bg' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-light-bg text-primary-teal"><Users size={14}/></div>
                    <div className="text-sm font-extrabold text-dark-text">{g.name}</div>
                  </div>
                  <div className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 font-bold">{g.membersCount}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4">
            {!active && <div className="text-sm text-muted-text font-bold">Select a group to view details</div>}
            {active && (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-dark-text">{active.detail?.name || active.name}</div>
                    <div className="text-xs text-muted-text font-bold">{active.detail?.description || active.description || ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Export CSV</button>
                    <button onClick={openAddMembers} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Add Members</button>
                  </div>
                </div>
                <div className="mt-4">
              <div className="mb-4 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-xs font-extrabold text-muted-text mb-2">Billing & Scholarship Flags</div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={flags.scholarship} onChange={e=>setFlags(v=>({...v, scholarship: e.target.checked}))}/> Scholarship Group</label>
                  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={flags.debtor} onChange={e=>setFlags(v=>({...v, debtor: e.target.checked}))}/> Debtors Group</label>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-muted-text">Billing Tag</div>
                    <input value={flags.billingTag} onChange={e=>setFlags(v=>({...v, billingTag: e.target.value}))} placeholder="e.g. fee-waiver-50" className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"/>
                  </div>
                  <button onClick={saveFlags} className="ml-auto px-3 py-1.5 rounded-lg bg-primary-teal text-white text-sm font-bold">Save</button>
                </div>
              </div>
                  <div className="text-xs font-extrabold text-muted-text mb-2">Members</div>
                  <div className="divide-y divide-gray-50">
                    {(active.detail?.members || []).map(m => (
                      <div key={m.memberId} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-light-bg flex items-center justify-center text-xs font-extrabold text-primary-teal">{(m.firstName?.[0]||'')+(m.lastName?.[0]||'')}</div>
                          <div>
                            <div className="text-sm font-extrabold text-dark-text">{m.firstName} {m.lastName}</div>
                            <div className="text-xs text-muted-text font-bold">{m.className || m.grade || '—'}</div>
                          </div>
                        </div>
                        <button onClick={()=>removeMember(m.memberId)} className="p-2 rounded-lg border border-gray-200 text-error hover:bg-red-50" title="Remove"><Trash2 size={16}/></button>
                      </div>
                    ))}
                    {(!active.detail || (active.detail.members || []).length === 0) && (
                      <div className="py-6 text-sm text-muted-text font-bold">No members yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {error && <div className="text-error text-sm font-bold mt-2">{error}</div>}
      <CreateGroupModal open={modal} onClose={()=>setModal(false)} onCreate={create} />
      <AddMembersDrawer open={drawer} onClose={()=>setDrawer(false)} onAdd={addMembers} onBulk={bulkAdd} groupName={active?.name || ''} />
    </div>
  )
}

export default StudentGroups
