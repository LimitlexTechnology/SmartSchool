import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, RotateCw } from 'lucide-react';

const Ring = ({ present, absent, notMarked }) => {
  const total = Math.max(1, present + absent + notMarked);
  const presentPct = Math.round((present / total) * 100);
  const absentPct = Math.round((absent / total) * 100);
  const bg = `conic-gradient(#14b8a6 0 ${presentPct}%, #ef4444 ${presentPct}% ${presentPct + absentPct}%, #e5e7eb ${presentPct + absentPct}% 100%)`;
  return (
    <div className="flex items-center gap-8">
      <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: bg }}>
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-lg font-extrabold text-dark-text">{present}</div>
      </div>
      <div className="space-y-1 text-xs font-extrabold">
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-primary-teal" /> {present} Students Present</div>
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-error" /> {absent} Students Absent</div>
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-gray-300" /> {notMarked} Students Attendance not marked</div>
      </div>
    </div>
  );
};

const Attendance = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [data, setData] = useState({ date: '', totals: { present: 0, absent: 0, notMarked: 0, totalStudents: 0 }, page: 1, pageSize: 15, totalClasses: 0, data: [] });
  const [loading, setLoading] = useState(false);

  const load = async (opts = {}) => {
    const p = opts.page ?? page;
    const params = new URLSearchParams({ date, page: String(p), pageSize: String(pageSize) });
    setLoading(true);
    try {
      const r = await fetch(`/api/attendance/summary?${params.toString()}`);
      const j = await r.json();
      setData(j);
      setPage(j.page);
    } finally { setLoading(false) }
  };
  useEffect(() => { load({ page: 1 }) }, [date]);

  const totalPages = Math.max(1, Math.ceil((data.totalClasses || 0) / pageSize));

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-dark-text">Student Attendance</h1>
        <p className="text-xs text-muted-text font-medium">View all student attendance</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text">
          <Calendar size={14} />
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="outline-none" />
        </label>
        <button onClick={() => load({ page: 1 })} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-dark-text hover:bg-light-bg flex items-center gap-2">
          <RotateCw size={14} /> Reload
        </button>
        <button disabled className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-muted-text">Export excel</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6">
        <Ring present={data.totals.present || 0} absent={data.totals.absent || 0} notMarked={data.totals.notMarked || 0} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-4 space-y-3">
        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted-text font-bold">
              <tr>
                <th className="text-left px-4 py-3 w-12">#</th>
                <th className="text-left px-4 py-3">Class</th>
                <th className="text-left px-4 py-3 w-32">Total Students</th>
                <th className="text-left px-4 py-3 w-40">Absent Students</th>
                <th className="text-left px-4 py-3 w-40">Present Students</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>Loading…</td></tr>}
              {!loading && (data.data || []).length === 0 && <tr><td className="px-4 py-6 text-muted-text" colSpan={5}>No classes</td></tr>}
              {!loading && (data.data || []).map((c, i) => (
                <tr key={c.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-muted-text">{(page-1)*pageSize + i + 1}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.total}</td>
                  <td className="px-4 py-3">{c.absent || '-'}</td>
                  <td className="px-4 py-3 text-error">{c.present > 0 || c.absent > 0 ? c.present : 'Not Marked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-text font-bold">Page {page} of {totalPages} • {data.totalClasses} classes</div>
          <div className="flex items-center gap-2">
            <button onClick={() => page > 1 && load({ page: page - 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page<=1}>Prev</button>
            <button onClick={() => page < totalPages && load({ page: page + 1 })} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold" disabled={page>=totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
