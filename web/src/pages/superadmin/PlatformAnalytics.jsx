import { useEffect, useState } from 'react';

const PlatformAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const r = await fetch('/api/admin/dashboard/stats');
            if (!r.ok) throw new Error('failed');
            const j = await r.json();
            setStats(j);
        } catch {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    return (
        <div className="flex flex-col gap-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Analytics</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Live platform totals</p>
                </div>
                <button onClick={load} disabled={loading} className="px-4 py-2 bg-primary-teal text-white rounded-xl text-sm font-bold hover:bg-secondary-teal transition disabled:opacity-50">
                    Refresh
                </button>
            </div>

            {error && <div className="text-sm text-rose-400">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Schools</p>
                    <p className="text-3xl font-black text-white mt-1">{stats ? stats.totalSchools : '—'}</p>
                </div>
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold">Active Users</p>
                    <p className="text-3xl font-black text-white mt-1">{stats ? stats.activeUsers : '—'}</p>
                </div>
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold">Revenue</p>
                    <p className="text-3xl font-black text-white mt-1">{stats ? stats.monthlyRevenue : 0}</p>
                </div>
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase font-bold">Suspended Schools</p>
                    <p className="text-3xl font-black text-white mt-1">{stats ? stats.suspendedSchools : 0}</p>
                </div>
            </div>

            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4">Plan Distribution</h3>
                {!stats ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['Premium', 'Basic', 'Free'].map(p => (
                            <div key={p} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-xs text-gray-500 uppercase font-bold">{p}</p>
                                <p className="text-2xl font-black text-white mt-1">{stats.planDistribution[p]}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlatformAnalytics;
