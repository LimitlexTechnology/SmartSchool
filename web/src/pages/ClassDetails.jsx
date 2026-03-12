import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, GraduationCap, Mail, Phone, Calendar, Search, Filter, Plus, X } from 'lucide-react';

const Avatar = ({ name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500'];
    const color = colors[name.length % colors.length];
    return (
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white text-xs font-black`}>
            {initials}
        </div>
    );
};

const ClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState(null);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', gender: '', classId: id });

    const loadData = async () => {
        setLoading(true);
        try {
            const classRes = await fetch('/api/classes');
            const classesData = await classRes.json();
            setClasses(classesData);
            const currentClass = classesData.find(c => c.id === id);
            setClassInfo(currentClass);

            const studentRes = await fetch(`/api/students?classId=${id}&pageSize=100`);
            const studentData = await studentRes.json();
            setStudents(studentData.data || []);
        } catch (error) {
            console.error('Error loading class details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        setForm(f => ({ ...f, classId: id }));
    }, [id]);

    const handleAddStudent = async () => {
        if (!form.firstName || !form.lastName || !form.email || !form.classId) return;
        setSaving(true);
        try {
            const selectedClass = classes.find(c => c.id === form.classId);
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    grade: selectedClass ? selectedClass.grade : ''
                })
            });
            if (res.ok) {
                setShowAddModal(false);
                setForm({ firstName: '', lastName: '', email: '', gender: '', classId: id });
                loadData();
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to add student');
            }
        } catch (error) {
            alert('Failed to add student');
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s => 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.studentId || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="p-8 text-center text-muted-text font-bold italic">Loading class details...</div>
    );

    if (!classInfo) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-black text-dark-text">Class Not Found</h2>
            <button onClick={() => navigate('/dashboard/classroom')} className="mt-4 text-primary-teal font-bold hover:underline">
                Back to Classrooms
            </button>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/classroom')}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-light-bg transition shadow-soft-sm text-gray-400 hover:text-dark-text"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-dark-text">
                            {classInfo.name || `Grade ${classInfo.grade}`}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-muted-text uppercase tracking-wider">Grade {classInfo.grade}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-xs font-bold text-primary-teal">{students.length} Students Enrolled</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2.5 rounded-xl border border-gray-100 bg-white text-sm font-bold text-dark-text hover:bg-light-bg transition shadow-soft-sm flex items-center gap-2">
                        <Calendar size={16} /> Timetable
                    </button>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-primary-teal text-white text-sm font-bold hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Student
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Student List */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Search & Filter */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search students in this class..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-soft-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                            />
                        </div>
                        <button className="p-3 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary-teal transition shadow-soft-sm">
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Students Table/Grid */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-soft-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50 text-[10px] font-black text-muted-text uppercase tracking-widest text-left italic">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Student ID</th>
                                        <th className="px-6 py-4">Gender</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((s) => (
                                            <tr key={s.id} className="group hover:bg-light-bg/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={`${s.firstName} ${s.lastName}`} />
                                                        <div>
                                                            <div className="text-sm font-extrabold text-dark-text leading-none">{s.firstName} {s.lastName}</div>
                                                            <div className="text-[11px] font-bold text-muted-text mt-1 flex items-center gap-1.5">
                                                                <Mail size={10} /> {s.email || 'no-email@smart.edu'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-black text-dark-text font-mono bg-light-bg px-2 py-1 rounded-lg">
                                                        {s.studentId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${s.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                        {s.gender || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[11px] font-bold text-dark-text">Active</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/students?id=${s.id}`)}
                                                        className="text-xs font-black text-primary-teal hover:underline decoration-2 underline-offset-4"
                                                    >
                                                        Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Users size={32} className="text-gray-200 mb-3" />
                                                    <p className="text-sm font-bold text-muted-text">No students found in this class</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Stats & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-soft-sm">
                        <h3 className="text-xs font-black text-muted-text uppercase tracking-widest mb-4">Class Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-muted-text">Attendance</div>
                                <div className="text-xs font-black text-emerald-500">94.2%</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-muted-text">Avg. Grade</div>
                                <div className="text-xs font-black text-blue-500">B+ (78.5)</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-muted-text">Assigned Teacher</div>
                                <div className="text-xs font-black text-dark-text">Unassigned</div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 rounded-2xl bg-light-bg text-xs font-black text-primary-teal hover:bg-primary-teal/10 transition">
                            View Performance Report
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-primary-teal to-secondary-teal p-6 rounded-3xl shadow-lg shadow-primary-teal/20 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black mb-1">Add Student</h3>
                            <p className="text-[11px] font-bold text-white/70 mb-4">Enroll a new student directly into this class.</p>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="w-full py-2.5 bg-white text-primary-teal rounded-xl text-xs font-black hover:bg-light-bg transition"
                            >
                                Enroll Now
                            </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Users size={120} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-extrabold text-dark-text">Enroll New Student</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-light-bg text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                                    <input 
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                                    <input 
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <input 
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Class</label>
                                <select 
                                    value={form.classId}
                                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition appearance-none"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.grade} • {c.name || 'No Section'}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                                <select 
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition appearance-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-black text-muted-text hover:bg-light-bg transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddStudent}
                                    disabled={saving || !form.firstName || !form.lastName || !form.email}
                                    className="flex-1 py-3 rounded-2xl bg-primary-teal text-white text-sm font-black hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50"
                                >
                                    {saving ? 'Enrolling...' : 'Enroll Student'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassDetails;
