import React, { useEffect, useRef, useState } from 'react';
import {
    Users, UserCheck, BookOpen, LayoutGrid,
    Search, Bell, RefreshCw, TrendingUp,
    ChevronRight, Calendar, ArrowUpRight, ArrowDownRight,
    GraduationCap, Shield, Plus, MoreHorizontal
} from 'lucide-react';

/* ─────────────── helpers ─────────────── */
const clx = (...c) => c.filter(Boolean).join(' ');

/* ─────── Donut Chart ─────── */
const Donut = ({ present, absent, color = '#09637E', size = 80, stroke = 10 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const presentDash = (present / 100) * circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5F3F6" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${presentDash} ${circ - presentDash}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                fontSize="14" fontWeight="700" fill="#0F172A">
                {present}%
            </text>
        </svg>
    );
};

/* ─────── Admissions Line Chart ─────── */
const AdmissionsChart = ({ admitted, left, labels }) => {
    const W = 600, H = 220, PAD = { t: 20, r: 20, b: 40, l: 40 };
    const chartW = W - PAD.l - PAD.r;
    const chartH = H - PAD.t - PAD.b;
    const allVals = [...admitted, ...left];
    const maxVal = Math.max(...allVals, 1);

    const toX = (i) => PAD.l + (i / (admitted.length - 1)) * chartW;
    const toY = (v) => PAD.t + chartH - (v / maxVal) * chartH;

    const pathFor = (data) =>
        data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');

    // y axis grid lines
    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) =>
        Math.round(maxVal * (gridCount - i) / gridCount)
    );

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            {gridLines.map((val, i) => {
                const y = toY(val);
                return (
                    <g key={i}>
                        <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#E5F3F6" strokeWidth="1" />
                        <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#6B7280">{val}</text>
                    </g>
                );
            })}
            {/* X labels */}
            {labels.map((label, i) => (
                <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#6B7280">{label}</text>
            ))}
            {/* Admitted line */}
            <path d={pathFor(admitted)} fill="none" stroke="#09637E" strokeWidth="2.5" strokeLinejoin="round" />
            {admitted.map((v, i) => (
                <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill="#09637E" stroke="white" strokeWidth="2" />
            ))}
            {/* Left line */}
            <path d={pathFor(left)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinejoin="round" />
            {left.map((v, i) => (
                <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill="#F59E0B" stroke="white" strokeWidth="2" />
            ))}
        </svg>
    );
};

/* ─────── Mini Stat ─────── */
const MiniStat = ({ label, male, female, icon: Icon, accent, wide, birthday }) => (
    <div className={clx(
        'bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-5 flex flex-col gap-3',
        wide && 'col-span-1 md:col-span-1',
        birthday && 'bg-gradient-to-br from-pink-400 to-rose-500 border-none text-white',
        accent && !birthday && 'bg-gradient-to-br from-primary-teal to-secondary-teal border-none text-white'
    )}>
        <div className="flex items-center justify-between">
            <div className={clx('w-10 h-10 rounded-xl flex items-center justify-center',
                birthday ? 'bg-white/20' : accent ? 'bg-white/20' : 'bg-primary-teal/10 text-primary-teal'
            )}>
                <Icon size={20} className={birthday || accent ? 'text-white' : ''} />
            </div>
            {birthday && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Today!</span>
            )}
        </div>

        {birthday ? (
            <div>
                <p className="text-5xl font-black leading-none">2</p>
                <p className="text-xs font-bold mt-1 opacity-90">Birthdays Today 🎉</p>
                <p className="text-[10px] mt-2 opacity-75">Time to celebrate!</p>
            </div>
        ) : (
            <div>
                <p className={clx('text-3xl font-black leading-none', accent ? 'text-white' : 'text-dark-text')}>
                    {wide}
                </p>
                <p className={clx('text-xs font-bold uppercase tracking-wide mt-1', accent ? 'text-white/80' : 'text-muted-text')}>
                    {label}
                </p>
                {(male !== undefined || female !== undefined) && (
                    <div className="flex gap-3 mt-3">
                        {male !== undefined && (
                            <span className={clx('text-[11px] font-bold px-2 py-0.5 rounded-lg',
                                accent ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                            )}>{male} M</span>
                        )}
                        {female !== undefined && (
                            <span className={clx('text-[11px] font-bold px-2 py-0.5 rounded-lg',
                                accent ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-600'
                            )}>{female} F</span>
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
);

/* ═══════════════ DASHBOARD ═══════════════ */
const Dashboard = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const admittedData = [20, 60, 280, 140, 20];
    const leftData = [5, 8, 3, 6, 2];
    const [stats, setStats] = useState({
        totalStudents: null,
        totalClasses: null,
        totalStaff: null,
        totalGuardians: null,
        revenue: null,
        status: null
    });
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/dashboard/stats');
                const data = await res.json();
                setStats(data);
            } catch {
                setStats(s => ({ ...s, status: 'degraded' }));
            }
        };
        load();
    }, []);
    const termLabels = ['2024 2nd term', '2024 3rd term', '2025 1st term', '2025/2026 2nd Term'];

    return (
        <div className="flex flex-col gap-6 pb-20 font-inter">

            {/* ── Top Greeting Bar ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-dark-text tracking-tight">
                        Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},
                        <span className="text-primary-teal"> Mr. Admin</span>
                    </h1>
                    <p className="text-sm text-muted-text mt-0.5">What would you like to do today?</p>
                </div>

                {/* Search + actions */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-72">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" />
                        <input
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-soft-sm text-sm text-dark-text placeholder-muted-text outline-none focus:ring-2 focus:ring-primary-teal/30 transition"
                            placeholder="Find action e.g. Add Student"
                        />
                    </div>
                    <button className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-soft-sm text-muted-text hover:text-primary-teal transition">
                        <RefreshCw size={18} />
                    </button>
                    <button className="relative p-2.5 bg-white rounded-xl border border-gray-100 shadow-soft-sm text-muted-text hover:text-primary-teal transition">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    </button>
                </div>
            </div>

            {/* ── School Banner Card ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Logo */}
                <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-gradient-to-br from-primary-teal to-secondary-teal flex items-center justify-center shadow-lg">
                    <GraduationCap size={36} className="text-white" />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-dark-text">SmartSchool International</h2>
                    <p className="text-sm text-muted-text font-medium">3rd Term, 2025/2026</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        <span className="text-[11px] font-bold bg-primary-teal/10 text-primary-teal px-3 py-1 rounded-full">Active Academic Year</span>
                        <span className="text-[11px] font-bold bg-success/10 text-success px-3 py-1 rounded-full">All Systems Online</span>
                    </div>
                </div>

                {/* Premium Badge */}
                <div className="md:text-right flex-shrink-0">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl shadow-md">
                        <Shield size={16} />
                        <div>
                            <p className="text-xs font-black">Premium Subscription</p>
                            <p className="text-[10px] opacity-80">Expires on 20th May 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Total Students */}
                <MiniStat icon={Users} wide={
                    stats.totalStudents !== null ? String(stats.totalStudents) : '—'
                } label="Total students" />

                {/* Birthdays – Pink gradient */}
                <MiniStat icon={Calendar} birthday={true} />

                {/* Total Staff – teal gradient */}
                <MiniStat icon={GraduationCap} wide={
                    stats.totalStaff !== null ? String(stats.totalStaff) : '—'
                } label="Total staff" accent />

                {/* Guardians */}
                <MiniStat icon={UserCheck} wide={
                    stats.totalGuardians !== null ? String(stats.totalGuardians) : '—'
                } label="Total guardians" />

                {/* Classes */}
                <MiniStat icon={LayoutGrid} wide={
                    stats.totalClasses !== null ? String(stats.totalClasses) : '—'
                } label="Total classes" />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Admissions Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-primary-teal rounded-full" />
                            <h3 className="text-base font-bold text-dark-text">Admissions Overview</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-primary-teal inline-block" />
                                <span className="text-muted-text">Admitted</span>
                                <span className="text-primary-teal font-black">27 Students</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                                <span className="text-muted-text">Left</span>
                                <span className="text-amber-500 font-black">4 Students</span>
                            </span>
                        </div>
                    </div>
                    <AdmissionsChart admitted={admittedData} left={leftData} labels={['2024 2nd term', '2024 3rd term', '2025 1st term', '2025/2026 2nd Term']} />
                </div>

                {/* Attendance Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-secondary-teal rounded-full" />
                        <h3 className="text-base font-bold text-dark-text">Attendance</h3>
                    </div>

                    {/* Student Attendance */}
                    <div className="flex items-center gap-5">
                        <Donut present={83} absent={17} color="#09637E" />
                        <div>
                            <p className="text-sm font-bold text-dark-text mb-2">Student Attendance</p>
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2 text-xs font-bold text-muted-text">
                                    <span className="w-3 h-3 rounded-full bg-primary-teal inline-block" /> Present <span className="text-dark-text">83%</span>
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold text-muted-text">
                                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Absent <span className="text-dark-text">17%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-50" />

                    {/* Staff Attendance */}
                    <div className="flex items-center gap-5">
                        <Donut present={73} absent={27} color="#088395" />
                        <div>
                            <p className="text-sm font-bold text-dark-text mb-2">Staff Attendance</p>
                            <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2 text-xs font-bold text-muted-text">
                                    <span className="w-3 h-3 rounded-full bg-secondary-teal inline-block" /> Present <span className="text-dark-text">73%</span>
                                </span>
                                <span className="flex items-center gap-2 text-xs font-bold text-muted-text">
                                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Absent <span className="text-dark-text">27%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <button className="mt-auto w-full py-3 bg-primary-teal text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-secondary-teal transition-colors flex items-center justify-center gap-2">
                        View Attendance <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* ── Quick Actions / Staff Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Staff on Duty */}
                <div className="bg-gradient-to-br from-primary-teal to-[#065A72] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold">Staff On Duty</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full">Active Now</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[['SW', 'Sarah'], ['MJ', 'Mike'], ['EB', 'Emily'], ['LW', 'Leo'], ['PK', 'Paul'], ['AR', 'Alex']].map(([init, name], i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/15 ring-2 ring-white/20 flex items-center justify-center font-bold text-xs hover:ring-white transition-all cursor-pointer">
                                        {init}
                                    </div>
                                    <span className="text-[9px] font-bold text-white/60 uppercase">{name}</span>
                                </div>
                            ))}
                            <div className="flex flex-col items-center gap-1.5">
                                <button className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                                    <Plus size={18} />
                                </button>
                                <span className="text-[9px] font-bold text-white/60 uppercase">Add</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-dark-text">Quick Actions</h3>
                        <button className="text-muted-text hover:text-primary-teal transition p-1">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Add Student', icon: Users, color: 'primary-teal' },
                            { label: 'Record Fee', icon: TrendingUp, color: 'success' },
                            { label: 'Mark Attendance', icon: UserCheck, color: 'secondary-teal' },
                            { label: 'Schedule Class', icon: Calendar, color: 'warning' },
                        ].map(({ label, icon: Icon, color }, i) => (
                            <button key={i} className={clx(
                                'flex items-center gap-3 p-3 rounded-xl border text-sm font-bold transition-all hover:scale-[1.02] group',
                                color === 'primary-teal' && 'border-primary-teal/20 text-primary-teal hover:bg-primary-teal hover:text-white',
                                color === 'success' && 'border-success/20 text-success hover:bg-success hover:text-white',
                                color === 'secondary-teal' && 'border-secondary-teal/20 text-secondary-teal hover:bg-secondary-teal hover:text-white',
                                color === 'warning' && 'border-warning/20 text-warning hover:bg-warning hover:text-white',
                            )}>
                                <div className={clx(
                                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                    color === 'primary-teal' && 'bg-primary-teal/10 group-hover:bg-white/20',
                                    color === 'success' && 'bg-success/10 group-hover:bg-white/20',
                                    color === 'secondary-teal' && 'bg-secondary-teal/10 group-hover:bg-white/20',
                                    color === 'warning' && 'bg-warning/10 group-hover:bg-white/20',
                                )}>
                                    <Icon size={16} />
                                </div>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
