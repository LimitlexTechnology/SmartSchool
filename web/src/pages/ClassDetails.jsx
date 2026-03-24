import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, GraduationCap, Mail, Phone, Calendar, Search, Filter, Plus, X, Heart, History, TrendingDown, TrendingUp, MapPin, Flag, User, ShieldCheck, Table, AlertCircle, Download, FileText } from 'lucide-react';
import StudentProfileModal from '../components/StudentProfileModal';

const Avatar = ({ name, src }) => {
    if (src) return (
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100">
            <img src={src} alt={name} className="w-full h-full object-cover" />
        </div>
    );
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
    const [teachers, setTeachers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', gender: '', classId: id });
    const [showBehaviorModal, setShowBehaviorModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [behaviorHistory, setBehaviorHistory] = useState([]);
    const [behaviorSaving, setBehaviorSaving] = useState(false);
    const [behaviorForm, setBehaviorForm] = useState({ type: 'deduction', category: '', score: 0, reason: '' });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileStudent, setProfileStudent] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('students');

    const tabs = [
        { id: 'students', label: 'Students', icon: Users, subtitle: 'Class List' },
        { id: 'broadsheet', label: 'Broadsheet', icon: Table, subtitle: 'Marks Overview' },
        { id: 'issue-finder', label: 'Issue Finder', icon: AlertCircle, subtitle: 'Data Validation' },
    ];

    const behaviorCategories = {
        deduction: [
            { label: 'Inappropriate Dress Code', score: 5 },
            { label: 'Eating in Class', score: 5 },
            { label: 'Talking back or Interrupting teachers', score: 5 },
            { label: 'Loitering around', score: 5 },
            { label: 'Littering the environment', score: 5 },
            { label: 'Incomplete Homework', score: 10 },
            { label: 'Disrespecting Staff', score: 10 },
            { label: 'Cheating in Exams', score: 10 },
            { label: 'Fighting', score: 10 },
            { label: 'Bullying or intimidation', score: 10 },
            { label: 'Vandalism', score: 10 },
            { label: 'Theft', score: 10 }
        ],
        addition: [
            { label: 'Good', score: 5 },
            { label: 'Very Good', score: 10 },
            { label: 'Great', score: 15 },
            { label: 'Excellent', score: 20 }
        ]
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const classRes = await fetch('/api/classes');
            const classesData = await classRes.json();
            setClasses(classesData);
            const currentClass = classesData.find(c => c.id === id);
            setClassInfo(currentClass);

            const teacherRes = await fetch('/api/teachers?pageSize=100');
            const teacherData = await teacherRes.json();
            setTeachers(teacherData.data || []);

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

    useEffect(() => {
        const handler = () => loadData();
        window.addEventListener('students:refresh', handler);
        return () => window.removeEventListener('students:refresh', handler);
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
                window.dispatchEvent(new CustomEvent('students:refresh'));
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

    const loadBehaviorHistory = async (studentId) => {
        try {
            const res = await fetch(`/api/students/${studentId}/behavior/history`);
            const data = await res.json();
            setBehaviorHistory(data);
        } catch (error) {
            console.error('Error loading behavior history:', error);
        }
    };

    const handleUpdateBehavior = async () => {
        if (!selectedStudent || !behaviorForm.category) return;
        setBehaviorSaving(true);
        try {
            const authorName = localStorage.getItem('schoolName') || localStorage.getItem('teacherName') || 'Teacher';
            const res = await fetch(`/api/students/${selectedStudent.id}/behavior`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...behaviorForm, authorName })
            });
            if (res.ok) {
                setShowBehaviorModal(false);
                setBehaviorForm({ type: 'deduction', category: '', score: 0, reason: '' });
                loadData();
                window.dispatchEvent(new CustomEvent('students:refresh'));
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to update behavior');
            }
        } catch (error) {
            alert('Failed to update behavior');
        } finally {
            setBehaviorSaving(false);
        }
    };

    const loadProfile = async (studentId) => {
        setProfileLoading(true);
        setShowProfileModal(true);
        try {
            const res = await fetch(`/api/students/${studentId}`);
            const data = await res.json();
            setProfileStudent(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setProfileLoading(false);
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

            {/* Tab System */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all text-left group ${
                                isActive 
                                    ? 'bg-white border-primary-teal shadow-soft-xl' 
                                    : 'bg-white border-transparent hover:border-gray-100 shadow-soft-sm'
                            }`}
                        >
                            <div className="space-y-1">
                                <h3 className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-dark-text' : 'text-muted-text'}`}>
                                    {tab.label}
                                </h3>
                                <p className="text-[9px] font-bold text-muted-text uppercase tracking-widest opacity-60">
                                    {tab.subtitle}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                isActive ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                            }`}>
                                <Icon size={20} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {activeTab === 'students' ? (
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
                                        <th className="px-6 py-4">Behavior Points</th>
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
                                                        <Avatar name={`${s.firstName} ${s.lastName}`} src={s.profilePicture} />
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
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${s.behaviorPoints >= 100 ? 'bg-emerald-50 text-emerald-600' : s.behaviorPoints >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {s.behaviorPoints || 100}
                                                        </span>
                                                        <button
                                                            onClick={() => { setSelectedStudent(s); setShowBehaviorModal(true); }}
                                                            className="p-1.5 text-gray-400 hover:text-primary-teal hover:bg-light-bg transition rounded-lg"
                                                            title="Update Behavior"
                                                        >
                                                            <Heart size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedStudent(s); setShowHistoryModal(true); loadBehaviorHistory(s.id); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-light-bg transition rounded-lg"
                                                            title="Behavior History"
                                                        >
                                                            <History size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[11px] font-bold text-dark-text">Active</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => loadProfile(s.id)}
                                                        className="text-xs font-black text-primary-teal hover:underline decoration-2 underline-offset-4"
                                                    >
                                                        Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="hover:bg-light-bg/50 transition">
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-text font-bold italic">No students found in this class.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'broadsheet' ? (
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-dark-text uppercase tracking-tight">Broadsheet - {classInfo.name}</h3>
                                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mt-1">2025/2026 Academic Year • First Term</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-light-bg rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-text hover:text-primary-teal transition">
                                    <Filter size={14} /> Filter Subjects
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20">
                                    <Download size={14} /> Export PDF
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-muted-text uppercase tracking-widest sticky left-0 bg-gray-50/50 z-10">Student</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Mathematics</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">English</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Science</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">Social</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-muted-text uppercase tracking-widest">ICT</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-dark-text uppercase tracking-widest bg-primary-teal/5">Total</th>
                                        <th className="px-4 py-4 text-center text-[10px] font-black text-dark-text uppercase tracking-widest bg-primary-teal/5">Avg</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-muted-text uppercase tracking-widest">Pos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map((s, idx) => {
                                        const seed = s.firstName.length + s.lastName.length;
                                        const m = (seed * 7) % 30 + 65;
                                        const e = (seed * 9) % 25 + 70;
                                        const sc = (seed * 11) % 35 + 60;
                                        const so = (seed * 13) % 20 + 75;
                                        const ic = (seed * 17) % 15 + 85;
                                        const total = m + e + sc + so + ic;
                                        const avg = (total / 5).toFixed(1);
                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="px-8 py-4 text-xs font-black text-dark-text uppercase tracking-tight sticky left-0 bg-white group-hover:bg-gray-50/30 z-10 border-r border-gray-50">
                                                    {s.firstName} {s.lastName}
                                                </td>
                                                <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{m}</td>
                                                <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{e}</td>
                                                <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{sc}</td>
                                                <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{so}</td>
                                                <td className="px-4 py-4 text-center text-xs font-bold text-muted-text">{ic}</td>
                                                <td className="px-4 py-4 text-center text-xs font-black text-primary-teal bg-primary-teal/5">{total}</td>
                                                <td className="px-4 py-4 text-center text-xs font-black text-dark-text bg-primary-teal/5">{avg}%</td>
                                                <td className="px-8 py-4 text-right">
                                                    <span className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black text-dark-text uppercase">{idx + 1}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'issue-finder' ? (
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-xl p-12">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-lg font-black text-dark-text uppercase tracking-tight">Issue Finder</h3>
                                <p className="text-xs font-bold text-muted-text mt-1 uppercase tracking-widest opacity-60">Automated Error Detection for {classInfo.name}</p>
                            </div>
                            <span className="px-6 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100/50">
                                2 Issues Detected
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { type: 'Missing Mark', student: students[0] ? `${students[0].firstName} ${students[0].lastName}` : 'Sarah Johnson', subject: 'Mathematics', severity: 'high', detail: 'No mark found for First Term Mid-Term' },
                                { type: 'Suspicious Mark', student: students[1] ? `${students[1].firstName} ${students[1].lastName}` : 'Mohammed Ali', subject: 'Integrated Science', detail: 'Score (105) exceeds maximum possible (100)', severity: 'medium' },
                            ].map((issue, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:border-rose-100 transition-all">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${issue.severity === 'high' ? 'bg-rose-100 text-rose-500' : 'bg-amber-100 text-amber-500'}`}>
                                        <AlertCircle size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-sm font-black text-dark-text uppercase tracking-tight">{issue.type}</p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${issue.severity === 'high' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{issue.student} • {issue.subject}</p>
                                        <p className="text-[10px] font-bold text-rose-400 mt-2 italic">{issue.detail}</p>
                                    </div>
                                    <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-teal hover:bg-primary-teal hover:text-white transition shadow-soft-sm">
                                        Fix Now
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-8 bg-primary-teal/5 rounded-[2.5rem] border border-primary-teal/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-teal shadow-soft-sm">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-dark-text uppercase tracking-tight">Run Full Validation Scan</p>
                                    <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Check for consistency, missing marks, and duplicates</p>
                                </div>
                            </div>
                            <button className="px-8 py-3 bg-white border border-primary-teal/20 text-primary-teal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal hover:text-white transition shadow-soft-sm">
                                Scan Now
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Right: Quick Stats & Actions */}
            {activeTab === 'students' && (
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
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={classInfo.teacherId || ''} 
                                        onChange={async (e) => {
                                            const tid = e.target.value
                                            const res = await fetch(`/api/classes/${id}/assign-teacher`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ teacherId: tid })
                                            })
                                            if (res.ok) loadData()
                                        }}
                                        className="text-xs font-black text-dark-text bg-light-bg border-none rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary-teal"
                                    >
                                        <option value="">Unassigned</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
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
            )}
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

            {/* Behavior Management Modal */}
            {showBehaviorModal && selectedStudent && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBehaviorModal(false)} />
                    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-extrabold text-dark-text">Update Behavior Points</h3>
                                <p className="text-xs font-bold text-muted-text mt-1">Student: {selectedStudent.firstName} {selectedStudent.lastName}</p>
                            </div>
                            <button onClick={() => setShowBehaviorModal(false)} className="p-2 rounded-xl hover:bg-light-bg text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-light-bg rounded-2xl">
                                <button
                                    onClick={() => setBehaviorForm({ ...behaviorForm, type: 'deduction', category: '', score: 0 })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition ${behaviorForm.type === 'deduction' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-muted-text hover:text-rose-500'}`}
                                >
                                    <TrendingDown size={14} /> Deduct Points
                                </button>
                                <button
                                    onClick={() => setBehaviorForm({ ...behaviorForm, type: 'addition', category: '', score: 0 })}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition ${behaviorForm.type === 'addition' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-text hover:text-emerald-500'}`}
                                >
                                    <TrendingUp size={14} /> Award Points
                                </button>
                            </div>

                            {/* Category Selection Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {behaviorCategories[behaviorForm.type].map((cat) => (
                                    <button
                                        key={cat.label}
                                        onClick={() => setBehaviorForm({ ...behaviorForm, category: cat.label, score: cat.score })}
                                        className={`p-3 rounded-2xl border text-left transition ${behaviorForm.category === cat.label ? 'border-primary-teal bg-primary-teal/5 ring-2 ring-primary-teal/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                    >
                                        <div className="text-[11px] font-black text-dark-text leading-tight">{cat.label}</div>
                                        <div className={`text-[10px] font-bold mt-1 ${behaviorForm.type === 'addition' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {behaviorForm.type === 'addition' ? '+' : '-'}{cat.score} Points
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Reason */}
                            <div>
                                <label className="block text-xs font-black text-muted-text uppercase tracking-widest mb-1.5 ml-1">Optional Comment / Note</label>
                                <textarea
                                    value={behaviorForm.reason}
                                    onChange={(e) => setBehaviorForm({ ...behaviorForm, reason: e.target.value })}
                                    placeholder="Add details about the behavior..."
                                    className="w-full px-4 py-3 bg-light-bg border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-teal/20 transition min-h-[80px]"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    onClick={() => setShowBehaviorModal(false)}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-black text-muted-text hover:bg-light-bg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateBehavior}
                                    disabled={behaviorSaving || !behaviorForm.category}
                                    className={`flex-1 py-3 rounded-2xl text-white text-sm font-black transition shadow-lg disabled:opacity-50 ${behaviorForm.type === 'addition' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
                                >
                                    {behaviorSaving ? 'Processing...' : behaviorForm.type === 'addition' ? 'Award Points' : 'Deduct Points'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Behavior History Modal */}
            {showHistoryModal && selectedStudent && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
                    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <div>
                                <h3 className="text-xl font-extrabold text-dark-text">Behavior History</h3>
                                <p className="text-xs font-bold text-muted-text mt-1">Student: {selectedStudent.firstName} {selectedStudent.lastName}</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2 rounded-xl hover:bg-light-bg text-gray-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto pr-2 space-y-4">
                            {behaviorHistory.length > 0 ? (
                                behaviorHistory.map((log) => (
                                    <div key={log.id} className="p-4 rounded-2xl border border-gray-100 bg-light-bg/30 flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.type === 'addition' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {log.type === 'addition' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-dark-text leading-none">{log.category}</div>
                                                <div className="text-[11px] font-bold text-muted-text mt-1">{log.reason || 'No additional notes provided.'}</div>
                                                <div className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1.5 italic">
                                                    By {log.authorName} • {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-black shrink-0 ${log.type === 'addition' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {log.type === 'addition' ? '+' : '-'}{log.score}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-muted-text font-bold italic">No behavior logs found for this student.</div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 shrink-0">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="w-full py-3 rounded-2xl bg-light-bg text-sm font-black text-muted-text hover:bg-gray-200 transition"
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Profile Modal */}
            {showProfileModal && selectedStudent && (
                <StudentProfileModal 
                    studentId={selectedStudent.id} 
                    onClose={() => setShowProfileModal(false)} 
                />
            )}
        </div>
    );
};

export default ClassDetails;
