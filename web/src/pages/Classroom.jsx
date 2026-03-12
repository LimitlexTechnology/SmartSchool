import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, X, Trash2, LayoutGrid, GraduationCap } from 'lucide-react';

const Classroom = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', grade: '' });
    const [saving, setSaving] = useState(false);

    const loadClasses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/classes');
            const data = await res.json();
            setClasses(data);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const handleCreate = async () => {
        if (!form.grade) return;
        setSaving(true);
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, name: form.name.trim() || '' })
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ name: '', grade: '' });
                loadClasses();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to create class');
            }
        } catch (error) {
            alert('Failed to create class');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadClasses();
            }
        } catch (error) {
            alert('Failed to delete class');
        }
    };

    const filteredClasses = classes.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.grade.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-dark-text">Classroom Management</h1>
                    <p className="text-sm text-muted-text font-bold">Manage your school classes and student distribution</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-teal text-white text-sm font-bold rounded-xl hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
                >
                    <Plus size={16} /> Create Class
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                        <LayoutGrid size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-dark-text">{classes.length}</div>
                        <div className="text-xs font-bold text-muted-text">Total Classes</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-dark-text">
                            {classes.reduce((acc, curr) => acc + (curr.studentCount || 0), 0)}
                        </div>
                        <div className="text-xs font-bold text-muted-text">Total Students</div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-dark-text">
                            {[...new Set(classes.map(c => c.grade))].length}
                        </div>
                        <div className="text-xs font-bold text-muted-text">Active Grades</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search classes or grades..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-soft-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                />
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-muted-text font-bold italic">Loading classes...</div>
                ) : filteredClasses.length > 0 ? (
                    filteredClasses.map((c) => (
                        <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft-sm group hover:border-primary-teal/30 transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-light-bg flex items-center justify-center text-primary-teal font-black text-sm">
                                        {c.grade}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-dark-text">{c.name || `Grade ${c.grade}`}</h3>
                                        <p className="text-[11px] font-bold text-muted-text uppercase tracking-wider">{c.name ? `Grade ${c.grade}` : 'No Section'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-text">
                                    <Users size={14} />
                                    <span>{c.studentCount || 0} Students</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/dashboard/classroom/${c.id}`)}
                                    className="text-xs font-black text-primary-teal hover:underline decoration-2 underline-offset-4"
                                >
                                    View Class
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-light-bg flex items-center justify-center text-gray-300 mb-4">
                            <LayoutGrid size={32} />
                        </div>
                        <h3 className="text-sm font-extrabold text-dark-text">No Classes Found</h3>
                        <p className="text-xs text-muted-text font-bold mt-1 max-w-[200px]">Create your first class to start managing student distribution.</p>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="mt-4 text-xs font-black text-primary-teal hover:underline"
                        >
                            Create Class Now
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-extrabold text-dark-text">Create New Class</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-light-bg text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Grade Level</label>
                                <input 
                                    type="text"
                                    value={form.grade}
                                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                                    placeholder="e.g. 10, JSS1, Grade 1"
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Class Name / Section (Optional)</label>
                                <input 
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. A, Science, Blue House"
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                                />
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-black text-muted-text hover:bg-light-bg transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreate}
                                    disabled={saving || !form.grade}
                                    className="flex-1 py-3 rounded-2xl bg-primary-teal text-white text-sm font-black hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Create Class'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classroom;
