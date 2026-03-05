import React, { useEffect, useMemo, useState } from 'react'
import { Download, FileDown, Clock, ClipboardList, Search } from 'lucide-react'

const StatRing = ({ value, total, label }) => {
  const pct = total ? Math.round((value / total) * 100) : 0
  const bg = `conic-gradient(#0ea5b7 ${pct}%, #e5e7eb ${pct}% 100%)`
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: bg }}>
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-lg font-extrabold text-dark-text">{value}</div>
      </div>
      <div className="text-xs font-extrabold text-muted-text">
        <div className="text-dark-text text-sm">{label}</div>
        <div>{pct}% of total</div>
      </div>
    </div>
  )
}

const Admissions = () => {
  const [tab, setTab] = useState('admitted') // admitted | left | completed
  const [stats, setStats] = useState({ activeCount: 0, leftCount: 0, completedCount: 0 })
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [loading, setLoading] = useState(false)

  const total = useMemo(() => stats.activeCount + stats.leftCount + stats.completedCount, [stats])

  const loadStats = async () => {
    try {
      const r = await fetch('/api/admissions/stats')
      const j = await r.json()
      setStats(j)
    } catch { setStats({ activeCount: 0, leftCount: 0, completedCount: 0 }) }
  }
  const loadList = async (opts = {}) => {
    const p = opts.page ?? page
    const params = new URLSearchParams({ type: tab, page: String(p), pageSize: String(pageSize), q })
    setLoading(true)
    try {
      const r = await fetch(`/api/admissions/list?${params.toString()}`)
      const j = await r.json()
      setData(j)
      setPage(j.page)
    } finally { setLoading(false) }
  }
  useEffect(() => { loadStats() }, [])
  useEffect(() => { loadList({ page: 1 }) }, [tab]) // eslint-disable-line

  const exportCSV = () => {
    const params = new URLSearchParams({ type: tab, q })
    window.open(`/api/admissions/export.csv?${params.toString()}`, '_blank')
  }

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Admissions</h1>
        <p className="text-xs text-muted-text font-medium">View admissions stats</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={()=>setTab('admitted')} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${tab==='admitted'?'bg-primary-teal text-white':'border border-gray-200 text-dark-text hover:bg-light-bg'}`}>Admissions</button>
        <button onClick={()=>setTab('pending')} disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text flex items-center gap-2"><Clock size={14}/> Pending Admissions</button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
            <Download size={14}/> Export csv
          </button>
          <button disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text flex items-center gap-2">
            <ClipboardList size={14}/> Guide Notes
          </button>
          <button disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text">Terms & Conditions</button>
          <button disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text">Custom Fields</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatRing value={stats.activeCount} total={total || 1} label="Active Students" />
          <StatRing value={stats.leftCount} total={total || 1} label="Left Students" />
          <StatRing value={stats.completedCount} total={total || 1} label="Completed Students" />
          <div className="flex items-center">
            <div>
              <div className="text-3xl font-extrabold text-dark-text">{total}</div>
              <div className="text-xs text-muted-text font-bold">Total Students</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {['admitted','left','completed'].map(t => (
              <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded-lg text-xs font-bold ${tab===t?'bg-primary-teal text-white':'border border-gray-200 text-dark-text hover:bg-light-bg'}`}>
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadList({ page: 1 })}
              placeholder="Search"
              className="w-64 pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-dark-text placeholder-muted-text outline-none focus:ring-2 focus:ring-primary-teal/30"
            />
          </div>
        </div>

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
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>Loading…</td></tr>}
              {!loading && data.data.length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>No students found</td></tr>}
              {!loading && data.data.map(s => {
                const name = `${s.firstName} ${s.lastName}`
                return (
                  <tr key={s.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 text-muted-text">{s.index}</td>
                    <td className="px-4 py-3 font-bold text-dark-text">{name}</td>
                    <td className="px-4 py-3">{s.gender || '—'}</td>
                    <td className="px-4 py-3">{s.studentId}</td>
                    <td className="px-4 py-3">{s.className || s.grade || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-text font-bold">Page {page} of {totalPages} • {data.total} students</div>
          <div className="flex items-center gap-2">
            <button onClick={() => page > 1 && loadList({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page<=1}>Prev</button>
            <button onClick={() => page < totalPages && loadList({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page>=totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admissions
