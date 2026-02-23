import React, { useState } from 'react';
import { Search } from 'lucide-react';

const logs = [
    { id: 1, time: '2026-02-23 17:42', actor: 'SuperAdmin', action: 'Created school', details: 'Greenfield Academy', type: 'create' },
    { id: 2, time: '2026-02-23 17:10', actor: 'SuperAdmin', action: 'Plan upgraded', details: 'Mirekua → Premium', type: 'update' },
    { id: 3, time: '2026-02-23 16:55', actor: 'Mr. Kwarteng', action: 'Login', details: 'Greenfield admin login', type: 'auth' },
    { id: 4, time: '2026-02-23 14:30', actor: 'SuperAdmin', action: 'Suspended school', details: 'Heritage International', type: 'danger' },
    { id: 5, time: '2026-02-22 18:15', actor: 'SuperAdmin', action: 'Created school', details: 'Bright Stars School', type: 'create' },
    { id: 6, time: '2026-02-22 15:40', actor: 'SuperAdmin', action: 'Platform settings', details: 'AI features toggled ON', type: 'update' },
    { id: 7, time: '2026-02-21 09:00', actor: 'SuperAdmin', action: 'Deleted school', details: 'Removed test school', type: 'danger' },
    { id: 8, time: '2026-02-20 11:30', actor: 'Mr. Mensah', action: 'Login', details: 'Bright Stars admin', type: 'auth' },
    { id: 9, time: '2026-02-19 16:00', actor: 'SuperAdmin', action: 'Plan downgraded', details: 'Heritage → Basic', type: 'update' },
    { id: 10, time: '2026-02-18 10:15', actor: 'Mrs. Asante', action: 'Login', details: 'Mirekua admin login', type: 'auth' },
];

const typeMeta = {
    create: { label: 'Create', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    update: { label: 'Update', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    auth: { label: 'Auth', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    danger: { label: 'Danger', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

const AuditLogs = () => {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filtered = logs.filter(l =>
        (l.actor + l.action + l.details).toLowerCase().includes(search.toLowerCase()) &&
        (filterType === 'all' || l.type === filterType)
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-extrabold text-white">Audit Logs</h1>
                <p className="text-sm text-gray-400 mt-0.5">Full event history across the platform</p>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#0F1A2E] border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary-teal/50 transition"
                        placeholder="Search logs..." />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="px-4 py-2.5 bg-[#0F1A2E] border border-white/10 rounded-xl text-sm text-gray-300 outline-none cursor-pointer">
                    <option value="all">All Types</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="auth">Auth</option>
                    <option value="danger">Danger</option>
                </select>
            </div>

            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/5">
                            {['Time', 'Actor', 'Action', 'Details', 'Type'].map(h => (
                                <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(log => {
                            const m = typeMeta[log.type];
                            return (
                                <tr key={log.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{log.time}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{log.actor}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{log.action}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${m.cls}`}>{m.label}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm">No logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
