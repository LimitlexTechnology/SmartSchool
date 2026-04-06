import { useEffect, useState } from 'react';

const planBadge = { Premium: 'bg-amber-100 text-amber-700', Basic: 'bg-blue-100 text-blue-700', Free: 'bg-gray-100 text-gray-500' };

const SubscriptionManager = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/admin/schools');
            const j = await r.json();
            setSchools(j || []);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        const onUpdate = () => load();
        window.addEventListener('superadmin:schools:update', onUpdate);
        return () => window.removeEventListener('superadmin:schools:update', onUpdate);
    }, []);

    return (
        <div className="flex flex-col gap-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Subscriptions</h1>
                    <p className="text-sm text-gray-400 mt-0.5">School plans</p>
                </div>
                <button onClick={load} disabled={loading} className="px-4 py-2 bg-primary-teal text-white rounded-xl text-sm font-bold hover:bg-secondary-teal transition disabled:opacity-50">
                    Refresh
                </button>
            </div>

            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['School', 'Admin', 'Plan', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((s) => (
                                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4 text-sm font-bold text-white">{s.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{s.admin || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${planBadge[s.plan] || 'bg-gray-100 text-gray-500'}`}>{s.plan || 'Free'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status || 'active'}</span>
                                    </td>
                                </tr>
                            ))}
                            {schools.length === 0 && (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">No schools found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManager;
