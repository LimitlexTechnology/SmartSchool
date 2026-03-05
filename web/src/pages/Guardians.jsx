import React, { useEffect, useMemo, useState } from 'react'
import { Filter, Plus, Download, FileDown, Search } from 'lucide-react'

const Avatar = ({ name }) => {
  const letter = useMemo(()=> (name?.trim()?.[0] || '?').toUpperCase(), [name])
  const colors = ['#0ea5b7', '#ef4444', '#f59e0b', '#10b981', '#6366f1']
  const bg = colors[(name?.length || 1) % colors.length]
  return <div className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{backgroundColor:bg}}>{letter}</div>
}

const Guardians = () => {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [data, setData] = useState({ total: 0, page: 1, pageSize: 20, data: [] })
  const [loading, setLoading] = useState(false)

  const load = async (opts = {}) => {
    const p = opts.page ?? page
    const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize), q })
    setLoading(true)
    try {
      const r = await fetch(`/api/guardians?${params.toString()}`)
      const j = await r.json()
      setData(j)
      setPage(j.page)
    } finally { setLoading(false) }
  }
  useEffect(() => { load({ page: 1 }) }, []) // eslint-disable-line

  const exportCSV = () => {
    const params = new URLSearchParams({ q })
    window.open(`/api/guardians/export.csv?${params.toString()}`, '_blank')
  }

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Guardians</h1>
        <p className="text-xs text-muted-text font-medium">View/edit guardian information</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <Filter size={14} /> Filter
        </button>
        <button disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text flex items-center gap-2">
          <Plus size={14} /> Add New Guardian
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2" onClick={()=>window.print()}>
          <FileDown size={14} /> Export pdf
        </button>
        <button className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2" onClick={exportCSV}>
          <Download size={14} /> Export excel
        </button>
      </div>

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

        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted-text font-bold">
              <tr>
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3 w-48">Contact Number</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3 w-20">Wards</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>Loading…</td></tr>}
              {!loading && data.data.length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>No guardians found</td></tr>}
              {!loading && data.data.map((g, i) => (
                <tr key={`${g.name}-${g.contact}-${i}`} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-muted-text">{(page-1)*pageSize + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={g.name} />
                      <span className="font-bold text-dark-text">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{g.contact || '—'}</td>
                  <td className="px-4 py-3">{g.email || '—'}</td>
                  <td className="px-4 py-3">{g.wards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-text font-bold">Page {page} of {totalPages} • {data.total} guardians</div>
          <div className="flex items-center gap-2">
            <button onClick={() => page > 1 && load({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page<=1}>Prev</button>
            <button onClick={() => page < totalPages && load({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page>=totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Guardians
