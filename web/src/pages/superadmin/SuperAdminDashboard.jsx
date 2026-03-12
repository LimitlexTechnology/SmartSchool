import React from 'react';
import { Building2, Users, CreditCard, TrendingUp, ShieldAlert, ArrowUpRight, ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const kpis = [
    { label: 'Total Schools', value: '148', sub: '+12 this month', icon: Building2, color: 'teal', up: true },
    { label: 'Active Users', value: '24,391', sub: 'Across all schools', icon: Users, color: 'blue', up: true },
    { label: 'Monthly Revenue', value: '$18,240', sub: '+8.4% vs last month', icon: CreditCard, color: 'emerald', up: true },
    { label: 'Suspended Schools', value: '3', sub: 'Needs attention', icon: ShieldAlert, color: 'rose', up: false },
];

const recentSchools = [
    { name: 'Greenfield Academy', plan: 'Premium', admin: 'Mr. Kwarteng', joined: '22 Feb 2026', status: 'active' },
    { name: 'Mirekua International', plan: 'Premium', admin: 'Mrs. Asante', joined: '20 Feb 2026', status: 'active' },
    { name: 'Bright Stars School', plan: 'Basic', admin: 'Mr. Mensah', joined: '18 Feb 2026', status: 'pending' },
    { name: 'Faith Academy', plan: 'Free', admin: 'Sister Grace', joined: '15 Feb 2026', status: 'active' },
    { name: 'Heritage International', plan: 'Basic', admin: 'Mr. Osei', joined: '12 Feb 2026', status: 'suspended' },
];

const planBadge = { Premium: 'bg-amber-100 text-amber-700', Basic: 'bg-blue-100 text-blue-700', Free: 'bg-gray-100 text-gray-500' };
const statusBadge = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-rose-100 text-rose-700' };
const colorMap = { teal: 'from-primary-teal to-secondary-teal', blue: 'from-blue-500 to-blue-600', emerald: 'from-emerald-500 to-emerald-600', rose: 'from-rose-500 to-rose-600' };

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = React.useState({
        totalSchools: '...',
        activeUsers: '...',
        monthlyRevenue: '...',
        suspendedSchools: '...',
        planDistribution: { Premium: 0, Basic: 0, Free: 0 }
    });
    const [recentSchools, setRecentSchools] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, schoolsRes] = await Promise.all([
                fetch('/api/admin/dashboard/stats'),
                fetch('/api/admin/schools')
            ]);

            if (statsRes.ok) {
                const s = await statsRes.json();
                setStats(s);
            }

            if (schoolsRes.ok) {
                const schools = await schoolsRes.json();
                // Take 5 most recent
                setRecentSchools(schools.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const dynamicKpis = [
        { label: 'Total Schools', value: stats.totalSchools, sub: 'Registered on platform', icon: Building2, color: 'teal', up: true },
        { label: 'Platform Users', value: stats.activeUsers.toLocaleString(), sub: 'Across all schools', icon: Users, color: 'blue', up: true },
        { label: 'Total Revenue', value: `GHS ${stats.monthlyRevenue.toLocaleString()}`, sub: 'All time collection', icon: CreditCard, color: 'emerald', up: true },
        { label: 'Suspended Schools', value: stats.suspendedSchools, sub: 'Needs attention', icon: ShieldAlert, color: 'rose', up: false },
    ];

    const totalSchoolsCount = Number(stats.totalSchools) || 1;
    const distribution = [
        { plan: 'Premium', count: stats.planDistribution.Premium, color: 'from-amber-400 to-orange-500', pct: Math.round((stats.planDistribution.Premium / totalSchoolsCount) * 100) },
        { plan: 'Basic', count: stats.planDistribution.Basic, color: 'from-blue-400 to-blue-600', pct: Math.round((stats.planDistribution.Basic / totalSchoolsCount) * 100) },
        { plan: 'Free', count: stats.planDistribution.Free, color: 'from-gray-500 to-gray-600', pct: Math.round((stats.planDistribution.Free / totalSchoolsCount) * 100) },
    ];

    return (
        <div className="flex flex-col gap-7">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Overview</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} — All systems operational</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/superadmin/schools')} className="flex items-center gap-2 px-4 py-2.5 bg-primary-teal text-white text-sm font-bold rounded-xl hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20">
                        <Plus size={16} /> Add School
                    </button>
                    <button onClick={loadData} disabled={loading} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition disabled:opacity-50">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {dynamicKpis.map(({ label, value, sub, icon: Icon, color, up }) => (
                    <div key={label} className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5 hover:border-primary-teal/30 transition group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                <ArrowUpRight size={12} className={!up ? 'rotate-180' : ''} />
                            </span>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</p>
                        <p className="text-[11px] text-gray-500 mt-2">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Plan Distribution */}
            <div className="grid grid-cols-3 gap-4">
                {distribution.map(({ plan, count, color, pct }) => (
                    <div key={plan} className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br ${color} mb-3`}>
                            <span className="text-xs font-black text-white">{plan}</span>
                        </div>
                        <p className="text-3xl font-black text-white">{count} <span className="text-sm text-gray-500 font-normal">schools</span></p>
                        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1.5">{pct}% of platform</p>
                    </div>
                ))}
            </div>

            {/* Recent Schools */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-base font-bold text-white">Recently Onboarded Schools</h3>
                    <button onClick={() => navigate('/superadmin/schools')} className="flex items-center gap-1.5 text-xs font-bold text-primary-teal hover:text-secondary-teal transition">
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-3 text-left">School</th>
                                <th className="px-6 py-3 text-left">Admin</th>
                                <th className="px-6 py-3 text-left">Plan</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSchools.map((s) => (
                                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                                    <td className="px-6 py-4 text-sm font-bold text-white">{s.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{s.admin}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${planBadge[s.plan]}`}>{s.plan}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[s.status]}`}>{s.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => navigate('/superadmin/schools')} className="text-xs font-bold text-primary-teal hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                            {recentSchools.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 text-sm italic">
                                        No recent schools found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
