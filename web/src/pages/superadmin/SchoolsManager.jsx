import React, { useState } from 'react';
import { Plus, Search, Building2, Eye, Ban, Trash2, X, ChevronDown } from 'lucide-react';

const mockSchools = [
    { id: 1, name: 'Greenfield Academy', address: 'Accra, Ghana', admin: 'Mr. Kwarteng', phone: '0201234567', plan: 'Premium', status: 'active', expiry: '20 May 2026', students: 1248 },
    { id: 2, name: 'Mirekua International', address: 'Kumasi, Ghana', admin: 'Mrs. Asante', phone: '0551234567', plan: 'Premium', status: 'active', expiry: '20 May 2026', students: 820 },
    { id: 3, name: 'Bright Stars School', address: 'Takoradi, Ghana', admin: 'Mr. Mensah', phone: '0241234567', plan: 'Basic', status: 'pending', expiry: '10 Mar 2026', students: 310 },
    { id: 4, name: 'Faith Academy', address: 'Tamale, Ghana', admin: 'Sister Grace', phone: '0261234567', plan: 'Free', status: 'active', expiry: 'N/A', students: 195 },
    { id: 5, name: 'Heritage International', address: 'Cape Coast, Ghana', admin: 'Mr. Osei', phone: '0271234567', plan: 'Basic', status: 'suspended', expiry: '01 Jan 2026', students: 460 },
    { id: 6, name: 'Sunrise Prep School', address: 'Tema, Ghana', admin: 'Mrs. Offei', phone: '0231234567', plan: 'Premium', status: 'active', expiry: '15 Jun 2026', students: 570 },
    { id: 7, name: 'Unity High School', address: 'Sunyani, Ghana', admin: 'Mr. Boateng', phone: '0291234567', plan: 'Free', status: 'active', expiry: 'N/A', students: 228 },
];

const planBadge = { Premium: 'bg-amber-100 text-amber-700', Basic: 'bg-blue-100 text-blue-700', Free: 'bg-gray-100 text-gray-500' };
const statusBadge = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-rose-100 text-rose-700' };

const PLANS = ['Free', 'Basic', 'Premium'];

const SchoolsManager = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [schools, setSchools] = useState(mockSchools);
    const [form, setForm] = useState({ name: '', address: '', adminName: '', adminPhone: '', plan: 'Basic' });

    const filtered = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterStatus === 'all' || s.status === filterStatus)
    );

    const handleCreate = () => {
        if (!form.name || !form.adminPhone) return;
        setSchools(prev => [...prev, {
            id: prev.length + 1, name: form.name, address: form.address,
            admin: form.adminName, phone: form.adminPhone,
            plan: form.plan, status: 'pending', expiry: 'N/A', students: 0
        }]);
        setShowModal(false);
        setForm({ name: '', address: '', adminName: '', adminPhone: '', plan: 'Basic' });
    };

    const handleSuspend = (id) => setSchools(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'suspended' ? 'active' : 'suspended' } : s));
    const handleDelete = (id) => setSchools(prev => prev.filter(s => s.id !== id));

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">Schools</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{schools.length} schools registered on the platform</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-teal text-white text-sm font-bold rounded-xl hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20">
                    <Plus size={16} /> Create School
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#0F1A2E] border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-primary-teal/50 transition"
                        placeholder="Search schools..." />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 bg-[#0F1A2E] border border-white/10 rounded-xl text-sm text-gray-300 outline-none focus:border-primary-teal/50 transition cursor-pointer">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['School', 'Admin', 'Plan', 'Students', 'Expiry', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02] transition group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-teal to-secondary-teal flex items-center justify-center flex-shrink-0">
                                                <Building2 size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{s.name}</p>
                                                <p className="text-[11px] text-gray-500">{s.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-gray-300">{s.admin}</p>
                                        <p className="text-[11px] text-gray-500">{s.phone}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${planBadge[s.plan]}`}>{s.plan}</span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-300 font-bold">{s.students.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-xs text-gray-500">{s.expiry}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusBadge[s.status]}`}>{s.status}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <button title="View" className="p-1.5 text-gray-400 hover:text-primary-teal transition"><Eye size={16} /></button>
                                            <button title={s.status === 'suspended' ? 'Reactivate' : 'Suspend'} onClick={() => handleSuspend(s.id)} className="p-1.5 text-gray-400 hover:text-amber-400 transition"><Ban size={16} /></button>
                                            <button title="Delete" onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-rose-400 transition"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-500 text-sm">No schools match your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create School Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-extrabold text-white">Create New School</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {[
                                { label: 'School Name', key: 'name', placeholder: 'e.g. Greenfield Academy' },
                                { label: 'Address', key: 'address', placeholder: 'City, Country' },
                                { label: 'Admin Full Name', key: 'adminName', placeholder: 'e.g. Mr. John Doe' },
                                { label: 'Admin Phone', key: 'adminPhone', placeholder: 'e.g. 0201234567' },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5">{label}</label>
                                    <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-primary-teal/50 transition" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Subscription Plan</label>
                                <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary-teal/50 transition cursor-pointer">
                                    {PLANS.map(p => <option key={p} value={p} className="bg-[#0F1A2E]">{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-white/5">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-primary-teal text-white text-sm font-bold hover:bg-secondary-teal transition">Create School</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolsManager;
