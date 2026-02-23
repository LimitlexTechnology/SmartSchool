import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '$0 / month',
        color: 'from-gray-500 to-gray-600',
        features: ['Up to 100 students', 'Basic attendance', 'Student ID', 'Limited reports'],
        schools: 32,
    },
    {
        name: 'Basic',
        price: '$49 / month',
        color: 'from-blue-500 to-blue-600',
        features: ['Up to 500 students', 'Full attendance', 'Finance module', 'AI lesson notes', 'Parent portal'],
        schools: 54,
        popular: false,
    },
    {
        name: 'Premium',
        price: '$99 / month',
        color: 'from-amber-400 to-orange-500',
        features: ['Unlimited students', 'All modules', 'Virtual class', 'Smart ID scanning', 'Priority support', 'Analytics dashboard'],
        schools: 62,
        popular: true,
    },
];

const schoolPlans = [
    { name: 'Greenfield Academy', plan: 'Premium', status: 'active', expiry: '20 May 2026', amount: '$99' },
    { name: 'Mirekua International', plan: 'Premium', status: 'active', expiry: '20 May 2026', amount: '$99' },
    { name: 'Bright Stars School', plan: 'Basic', status: 'active', expiry: '10 Mar 2026', amount: '$49' },
    { name: 'Sunrise Prep School', plan: 'Premium', status: 'active', expiry: '15 Jun 2026', amount: '$99' },
    { name: 'Heritage International', plan: 'Basic', status: 'expired', expiry: '01 Jan 2026', amount: '$49' },
    { name: 'Unity High School', plan: 'Free', status: 'active', expiry: '–', amount: '$0' },
    { name: 'Faith Academy', plan: 'Free', status: 'active', expiry: '–', amount: '$0' },
];

const planBadge = { Premium: 'bg-amber-100 text-amber-700', Basic: 'bg-blue-100 text-blue-700', Free: 'bg-gray-100 text-gray-500' };
const statusIcon = { active: <CheckCircle2 size={14} className="text-emerald-400" />, expired: <XCircle size={14} className="text-rose-400" /> };

const SubscriptionManager = () => {
    const [tab, setTab] = useState('plans');

    return (
        <div className="flex flex-col gap-7">
            <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Subscriptions</h1>
                <p className="text-sm text-gray-400 mt-0.5">Manage platform plans and school billing</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
                {['plans', 'schools'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all
                            ${tab === t ? 'bg-primary-teal text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                        {t === 'plans' ? 'Plan Overview' : 'School Billing'}
                    </button>
                ))}
            </div>

            {tab === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map(({ name, price, color, features, schools, popular }) => (
                        <div key={name} className={`bg-[#0F1A2E] border rounded-2xl overflow-hidden transition hover:border-primary-teal/30 ${popular ? 'border-amber-500/30' : 'border-white/5'}`}>
                            {popular && (
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-center py-1.5 text-[11px] font-black text-white uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div className="p-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br ${color} mb-4`}>
                                    <span className="text-xs font-black text-white">{name}</span>
                                </div>
                                <p className="text-2xl font-black text-white mb-1">{price}</p>
                                <p className="text-xs text-gray-500 mb-5">{schools} schools on this plan</p>
                                <ul className="space-y-2.5 mb-6">
                                    {features.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/5 transition">
                                    Edit Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'schools' && (
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {['School', 'Plan', 'Amount', 'Expiry', 'Status', 'Action'].map(h => (
                                        <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {schoolPlans.map((s, i) => (
                                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                                        <td className="px-6 py-4 text-sm font-bold text-white">{s.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${planBadge[s.plan]}`}>{s.plan}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-300">{s.amount}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{s.expiry}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {statusIcon[s.status]}
                                                <span className={`text-[11px] font-bold capitalize ${s.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>{s.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button className="text-xs font-bold text-primary-teal hover:underline">Upgrade</button>
                                                <span className="text-gray-600">·</span>
                                                <button className="text-xs font-bold text-gray-500 hover:text-white transition">Extend</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManager;
