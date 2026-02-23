import React, { useState } from 'react';
import { TrendingUp, Users, Building2, CreditCard } from 'lucide-react';

/* ── Simple SVG Bar Chart ── */
const BarChart = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{ height: `${(d.value / max) * 100}%`, background: color, opacity: 0.85 }}
                        title={`${d.label}: ${d.value}`}
                    />
                    <span className="text-[9px] text-gray-500 font-bold">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Simple SVG Line Chart ── */
const LineChart = ({ data, color }) => {
    const W = 500, H = 120, PAD = { t: 10, r: 10, b: 30, l: 30 };
    const max = Math.max(...data.map(d => d.value), 1);
    const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;
    const tx = i => PAD.l + (i / (data.length - 1)) * cW;
    const ty = v => PAD.t + cH - (v / max) * cH;
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${tx(i)} ${ty(d.value)}`).join(' ');
    const area = [...data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${tx(i)} ${ty(d.value)}`), `L ${tx(data.length - 1)} ${PAD.t + cH} L ${PAD.l} ${PAD.t + cH} Z`].join(' ');
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#areaGrad)" />
            <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
            {data.map((d, i) => <circle key={i} cx={tx(i)} cy={ty(d.value)} r="3.5" fill={color} stroke="#0F1A2E" strokeWidth="2" />)}
            {data.map((d, i) => <text key={i} x={tx(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#6B7280">{d.label}</text>)}
        </svg>
    );
};

/* ── Donut ── */
const Donut = ({ segments, size = 100, stroke = 12 }) => {
    const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
    let offset = 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map(({ pct, color }, i) => {
                const dash = (pct / 100) * circ;
                const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} strokeLinecap="butt"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
                offset += dash;
                return el;
            })}
        </svg>
    );
};

const schoolGrowth = [
    { label: 'Sep', value: 80 }, { label: 'Oct', value: 95 }, { label: 'Nov', value: 102 },
    { label: 'Dec', value: 110 }, { label: 'Jan', value: 128 }, { label: 'Feb', value: 148 },
];
const revenueData = [
    { label: 'Sep', value: 7200 }, { label: 'Oct', value: 9100 }, { label: 'Nov', value: 10500 },
    { label: 'Dec', value: 12000 }, { label: 'Jan', value: 15800 }, { label: 'Feb', value: 18240 },
];
const activeUsers = [
    { label: 'Sep', value: 8100 }, { label: 'Oct', value: 10300 }, { label: 'Nov', value: 13200 },
    { label: 'Dec', value: 16100 }, { label: 'Jan', value: 20400 }, { label: 'Feb', value: 24391 },
];

const PlatformAnalytics = () => (
    <div className="flex flex-col gap-7">
        <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Growth, revenue and engagement across all schools</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* School Growth */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-primary-teal" />
                        <h3 className="text-base font-bold text-white">School Registrations</h3>
                    </div>
                    <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
                <p className="text-3xl font-black text-white mb-1">148</p>
                <p className="text-[11px] text-emerald-400 font-bold mb-5">↑ +24 schools since Sep 2025</p>
                <LineChart data={schoolGrowth} color="#09637E" />
            </div>

            {/* Revenue */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-amber-400" />
                        <h3 className="text-base font-bold text-white">Monthly Revenue (MRR)</h3>
                    </div>
                    <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
                <p className="text-3xl font-black text-white mb-1">$18,240</p>
                <p className="text-[11px] text-emerald-400 font-bold mb-5">↑ +15.4% vs last month</p>
                <BarChart data={revenueData.map(d => ({ ...d, value: d.value / 100 }))} color="#F59E0B" />
            </div>

            {/* Active Users */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-blue-400" />
                        <h3 className="text-base font-bold text-white">Active Users</h3>
                    </div>
                    <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
                <p className="text-3xl font-black text-white mb-1">24,391</p>
                <p className="text-[11px] text-emerald-400 font-bold mb-5">↑ +3,991 users this month</p>
                <LineChart data={activeUsers.map(d => ({ ...d, value: d.value / 100 }))} color="#3B82F6" />
            </div>

            {/* Plan Distribution */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp size={18} className="text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Plan Distribution</h3>
                </div>
                <div className="flex items-center gap-8">
                    <Donut size={120} stroke={18} segments={[
                        { pct: 42, color: '#F59E0B' },
                        { pct: 36, color: '#3B82F6' },
                        { pct: 22, color: '#6B7280' },
                    ]} />
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Premium', count: 62, pct: 42, color: '#F59E0B' },
                            { label: 'Basic', count: 54, pct: 36, color: '#3B82F6' },
                            { label: 'Free', count: 32, pct: 22, color: '#6B7280' },
                        ].map(({ label, count, pct, color }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-sm text-gray-300 font-bold w-16">{label}</span>
                                <span className="text-sm text-white font-black">{count}</span>
                                <span className="text-xs text-gray-500">{pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PlatformAnalytics;
