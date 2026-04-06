import { useEffect, useState } from 'react';
import { Plus, Search, Building2, Eye, EyeOff, Ban, Trash2, X, Pencil, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const planBadge = { Premium: 'bg-amber-100 text-amber-700', Basic: 'bg-blue-100 text-blue-700', Free: 'bg-gray-100 text-gray-500' };
const statusBadge = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-yellow-100 text-yellow-700', suspended: 'bg-rose-100 text-rose-700' };

const PLANS = ['Free', 'Basic', 'Premium'];

const SchoolsManager = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', address: '', adminName: '', adminPhone: '', adminTempPassword: '', plan: 'Basic' });
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', address: '', adminName: '', adminPhone: '', adminTempPassword: '', plan: 'Basic' });
    const [editingId, setEditingId] = useState('');
    const [showCreds, setShowCreds] = useState(false);
    const [createdCreds, setCreatedCreds] = useState({ name: '', phone: '', temp: '' });
    const [showEditPass, setShowEditPass] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Auto-lookup name for Creation Form
    useEffect(() => {
        const phone = (form.adminPhone || '').trim();
        if (phone.length >= 10) {
            const timer = setTimeout(async () => {
                setFetching(true);
                try {
                    const r = await fetch(`/api/admin/lookup-enrollment?phone=${phone}`);
                    if (r.ok) {
                        const j = await r.json();
                        if (j.name && !form.adminName) { // Only fill if currently empty to avoid overwriting deliberate entries
                            setForm(prev => ({ ...prev, adminName: j.name }));
                        }
                    }
                } catch (e) {} finally { setFetching(false); }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [form.adminPhone]);

    // Auto-lookup name for Edit Form
    useEffect(() => {
        const phone = (editForm.adminPhone || '').trim();
        if (phone.length >= 10) {
            const timer = setTimeout(async () => {
                setFetching(true);
                try {
                    const r = await fetch(`/api/admin/lookup-enrollment?phone=${phone}`);
                    if (r.ok) {
                        const j = await r.json();
                        if (j.name && (!editForm.adminName || editForm.adminName === '—')) {
                            setEditForm(prev => ({ ...prev, adminName: j.name }));
                        }
                    }
                } catch (e) {} finally { setFetching(false); }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [editForm.adminPhone]);

    const load = async () => {
        setLoading(true)
        try {
            const r = await fetch('/api/admin/schools')
            const j = await r.json()
            setSchools(j || [])
        } finally { setLoading(false) }
    }
    useEffect(() => { load() }, [])

    const filtered = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterStatus === 'all' || s.status === filterStatus)
    );

    const handleCreate = async () => {
        if (!form.name) return;
        const temp = form.adminTempPassword
        const phone = form.adminPhone
        const name = form.name
        const r = await fetch('/api/admin/schools', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
        if (!r.ok) { const t = await r.json().catch(()=>({})); alert(t.error || 'Failed'); return }
        setShowModal(false);
        setCreatedCreds({ name, phone, temp });
        setShowCreds(true);
        setForm({ name: '', address: '', adminName: '', adminPhone: '', adminTempPassword: '', plan: 'Basic' });
        await load()
        window.dispatchEvent(new CustomEvent('superadmin:schools:update'))
    };

    const handleSuspend = async (id) => {
        const r = await fetch(`/api/admin/schools/${id}/suspend`, { method:'PUT' })
        if (!r.ok) { const t=await r.json().catch(()=>({})); alert(t.error||'Failed'); return }
        await load()
        window.dispatchEvent(new CustomEvent('superadmin:schools:update'))
    }
    const handleDelete = async (id) => {
        const r = await fetch(`/api/admin/schools/${id}`, { method:'DELETE' })
        if (!r.ok) { const t=await r.json().catch(()=>({})); alert(t.error||'Failed'); return }
        await load()
        window.dispatchEvent(new CustomEvent('superadmin:schools:update'))
    }

    const handleImpersonate = async (schoolId) => {
        try {
            const r = await fetch(`/api/superadmin/impersonate/${schoolId}`, { method: 'POST' });
            const d = await r.json();
            if (d.status === 'ok') {
                  localStorage.setItem('isLoggedIn', 'true');
                  localStorage.setItem('userRole', d.role);
                  localStorage.setItem('schoolId', d.schoolId);
                  localStorage.setItem('teacherId', d.teacherId);
                  localStorage.setItem('adminName', d.name);
                  localStorage.setItem(`adminName:${d.schoolId}`, d.name);
                  
                  // Set cookies manually for backend auth
                  document.cookie = `schoolId=${d.schoolId}; path=/`;
                  document.cookie = `teacherId=${d.teacherId}; path=/`;

                  window.dispatchEvent(new CustomEvent('auth:login'));
                  window.dispatchEvent(new CustomEvent('adminProfile:change'));
                  navigate('/dashboard');
             } else {
                alert('Failed to impersonate: ' + (d.error || 'unknown error'));
            }
        } catch (e) {
            console.error('Impersonate error:', e);
            alert('An error occurred during impersonation');
        }
    };

    const openEdit = (s) => {
        setEditingId(s.id)
        setEditForm({
            name: s.name || '',
            address: s.address || '',
            adminName: s.admin || '',
            adminPhone: s.phone || '',
            adminTempPassword: '',
            plan: s.plan || 'Basic'
        })
        setShowEdit(true)
    }

    const handleUpdate = async () => {
        if (!editingId) return
        const payload = {
            name: editForm.name,
            address: editForm.address,
            adminName: editForm.adminName,
            adminPhone: editForm.adminPhone,
            plan: editForm.plan
        }
        if (editForm.adminTempPassword && editForm.adminTempPassword.trim()) {
            payload.adminTempPassword = editForm.adminTempPassword.trim()
        }
        const r = await fetch(`/api/admin/schools/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        if (!r.ok) { const t=await r.json().catch(()=>({})); alert(t.error||'Failed'); return }
        setShowEdit(false)
        setEditingId('')
        await load()
        window.dispatchEvent(new CustomEvent('superadmin:schools:update'))
    }

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
                                                <p className="text-[11px] text-gray-500">{s.address || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm text-gray-300">{s.admin || '—'}</p>
                                        <p className="text-[11px] text-gray-500">{s.phone || '—'}</p>
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
                                            {s.id !== 'local' && (
                                              <button title="Login as Admin" onClick={() => handleImpersonate(s.id)} className="p-1.5 text-gray-400 hover:text-primary-teal transition"><LogIn size={16} /></button>
                                            )}
                                            <button title="Edit" onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-400 transition"><Pencil size={16} /></button>
                                            {s.id !== 'local' && (
                                              <>
                                                <button title={s.status === 'suspended' ? 'Reactivate' : 'Suspend'} onClick={() => handleSuspend(s.id)} className="p-1.5 text-gray-400 hover:text-amber-400 transition"><Ban size={16} /></button>
                                                <button title="Delete" onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-rose-400 transition"><Trash2 size={16} /></button>
                                              </>
                                            )}
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
                                { label: 'Admin Temporary Password', key: 'adminTempPassword', placeholder: 'e.g. Temp@1234' },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-bold text-gray-400">{label}</label>
                                        {key === 'adminName' && fetching && <span className="text-[10px] text-primary-teal animate-pulse font-bold">Checking enrollment...</span>}
                                        {key === 'adminName' && form.adminName && !fetching && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">Found from Enrollment</span>}
                                    </div>
                                    <input type={key === 'adminTempPassword' ? 'password' : 'text'} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-primary-teal/50 transition" />
                                    {key === 'adminTempPassword' && (
                                      <p className="text-[10px] text-gray-500 mt-1 font-bold">Keep this safe. It will be shown once after creation.</p>
                                    )}
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
            {showCreds && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[350] flex items-center justify-center p-4">
                    <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-extrabold text-white">Admin Credentials (One-time)</h3>
                            <button onClick={() => setShowCreds(false)} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-3">
                            <div>
                                <div className="text-xs font-bold text-gray-400">School</div>
                                <div className="text-sm font-bold text-white">{createdCreds.name || '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400">Admin Phone</div>
                                <div className="text-sm font-bold text-white">{createdCreds.phone || '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400">Temporary Password</div>
                                <div className="text-sm font-bold text-white">{createdCreds.temp ? '•'.repeat(Math.max(createdCreds.temp.length, 8)) : '—'}</div>
                                <div className="text-[10px] text-amber-400 mt-1 font-bold">Copy the temp password you entered. It isn’t stored in plain text and cannot be viewed later.</div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-white/5">
                            <button onClick={() => setShowCreds(false)} className="flex-1 py-3 rounded-xl bg-primary-teal text-white text-sm font-bold hover:bg-secondary-teal transition">I Understand</button>
                        </div>
                    </div>
                </div>
            )}
            {showEdit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-lg font-extrabold text-white">Edit School</h3>
                            <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-white transition"><X size={20} /></button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            {[
                                { label: 'School Name', key: 'name', placeholder: 'e.g. Greenfield Academy' },
                                { label: 'Address', key: 'address', placeholder: 'City, Country' },
                                { label: 'Admin Full Name', key: 'adminName', placeholder: 'e.g. Mr. John Doe' },
                                { label: 'Admin Phone', key: 'adminPhone', placeholder: 'e.g. 0201234567' },
                                { label: 'Reset Temporary Password', key: 'adminTempPassword', placeholder: 'Leave blank to keep' },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-xs font-bold text-gray-400">{label}</label>
                                        {key === 'adminName' && fetching && <span className="text-[10px] text-primary-teal animate-pulse font-bold">Checking enrollment...</span>}
                                        {key === 'adminName' && editForm.adminName && editForm.adminName !== '—' && !fetching && <span className="text-[10px] text-emerald-400 font-bold">Found from Enrollment</span>}
                                    </div>
                                    {key === 'adminTempPassword' ? (
                                      <div className="relative">
                                        <input
                                          type={showEditPass ? 'text' : 'password'}
                                          value={editForm[key]}
                                          onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                                          placeholder={placeholder}
                                          className="w-full pr-11 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-primary-teal/50 transition"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setShowEditPass(v => !v)}
                                          title={showEditPass ? 'Hide password' : 'Show password'}
                                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white transition"
                                        >
                                          {showEditPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                      </div>
                                    ) : (
                                      <input
                                        type="text"
                                        value={editForm[key]}
                                        onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-primary-teal/50 transition"
                                      />
                                    )}
                                    {key === 'adminTempPassword' && (
                                      <p className="text-[10px] text-gray-500 mt-1 font-bold">For security, we cannot show previous passwords. Enter a new temp password to reset.</p>
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Subscription Plan</label>
                                <select value={editForm.plan} onChange={e => setEditForm(p => ({ ...p, plan: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-primary-teal/50 transition cursor-pointer">
                                    {PLANS.map(p => <option key={p} value={p} className="bg-[#0F1A2E]">{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-white/5">
                            <button onClick={() => setShowEdit(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition">Cancel</button>
                            <button onClick={handleUpdate} className="flex-1 py-3 rounded-xl bg-primary-teal text-white text-sm font-bold hover:bg-secondary-teal transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolsManager;
