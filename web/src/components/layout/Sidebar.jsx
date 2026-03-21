import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    UserSquare2,
    ClipboardList,
    Landmark,
    Package,
    Wrench,
    Bus,
    ChevronLeft,
    ChevronRight,
    X,
    GraduationCap,
    Sparkles
} from 'lucide-react';
import SkullarLogo from '../../assets/Skullar Logo.png';

/* ── Single Nav Item ── */
const SidebarItem = ({ icon: Icon, label, to, active = false, collapsed = false, onClick }) => {
    const baseClass = `
        flex flex-col items-center gap-1 py-3 px-2 rounded-xl cursor-pointer transition-all duration-200 no-underline relative group w-full
        ${active ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/25' : 'text-muted-text hover:bg-light-bg hover:text-primary-teal'}
    `;
    if (to === '#' && onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                title={label}
                className={baseClass}
            >
                <Icon size={collapsed ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
                {!collapsed && (
                    <span className={`text-[10px] font-bold text-center leading-tight ${active ? 'text-white' : ''}`}>
                        {label}
                    </span>
                )}
                {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-dark-text text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-xl">
                        {label}
                    </div>
                )}
            </button>
        )
    }
    return (
        <Link
            to={to}
            onClick={onClick}
            title={label}
            className={baseClass}
        >
            <Icon size={collapsed ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
            {!collapsed && (
                <span className={`text-[10px] font-bold text-center leading-tight ${active ? 'text-white' : ''}`}>
                    {label}
                </span>
            )}
            {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-dark-text text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-xl">
                    {label}
                </div>
            )}
        </Link>
    )
};

/* ── Sidebar ── */
const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [showStaff, setShowStaff] = useState(false);
    const [showExams, setShowExams] = useState(false);
    const studentsRef = useRef(null);
    const staffRef = useRef(null);
    const examsRef = useRef(null);
    const submenuRef = useRef(null);
    const staffMenuRef = useRef(null);
    const examsMenuRef = useRef(null);
    const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
    const [staffMenuPos, setStaffMenuPos] = useState({ top: 0, left: 0 });
    const [examsMenuPos, setExamsMenuPos] = useState({ top: 0, left: 0 });
    const [schoolLogo, setSchoolLogo] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);
    const location = useLocation();
    
    useEffect(() => {
        const sid = localStorage.getItem('schoolId') || 'local';
        const logo = localStorage.getItem(`schoolLogo:${sid}`);
        const avatar = localStorage.getItem(`userAvatar:${sid}`);
        if (logo) setSchoolLogo(logo);
        if (avatar) setUserAvatar(avatar);
        
        const handleProfileChange = () => {
            const updatedLogo = localStorage.getItem(`schoolLogo:${sid}`);
            const updatedAvatar = localStorage.getItem(`userAvatar:${sid}`);
            setSchoolLogo(updatedLogo);
            setUserAvatar(updatedAvatar);
        };
        window.addEventListener('adminProfile:change', handleProfileChange);
        return () => window.removeEventListener('adminProfile:change', handleProfileChange);
    }, []);
    const role = (typeof window !== 'undefined' && window.localStorage.getItem('userRole')) || 'admin';
    const teacherId = (typeof window !== 'undefined' && window.localStorage.getItem('teacherId')) || '';
    const [allowedFeatures, setAllowedFeatures] = useState(null);

    // navItems defined later with keys and filtered by permissions

    const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[180px]';

    const sidebarClasses = `
        h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-[100] shadow-soft-sm
        ${sidebarWidth}
        ${isMobileMenuOpen ? 'fixed left-0 top-0 translate-x-0' : 'fixed -translate-x-full md:relative md:translate-x-0'}
    `;

    const studentLinks = [
        { label: 'Student List', to: '/dashboard/students', key: 'students' },
        { label: 'Classroom', to: '/dashboard/classroom', key: 'classroom' },
        { label: 'Student Groups', to: '/dashboard/student-groups', key: 'student_groups' },
        { label: 'Admissions', to: '/dashboard/admissions', key: 'admissions' },
        { label: 'Attendance', to: '/dashboard/attendance', key: 'attendance' },
        { label: 'Guardians', to: '/dashboard/guardians', key: 'guardians' },
    ];
    const staffLinks = [
        { label: 'Staff List', to: '/dashboard/staff', key: 'staff' },
        { label: 'Attendance', to: '/dashboard/staff/attendance', key: 'staff_attendance' },
        { label: 'Course Allocation', to: '/dashboard/staff/course-allocation', key: 'course_allocation' },
        { label: 'Lesson Planner', to: '/dashboard/staff/lesson-planner', key: 'lesson_planner' },
        { label: 'Timetables', to: '/dashboard/staff/timetables', key: 'timetables' },
        { label: 'Online Campus ✨', to: '/dashboard/online-campus', key: 'online_campus' },
        { label: 'Question Bank ✨', to: '/dashboard/question-bank', key: 'question_bank' },
    ];
    const examLinks = [
        { label: 'Reports', to: '/dashboard/exams/reports', key: 'exam_reports' },
        { label: 'Marks', to: '/dashboard/exams/marks', key: 'exam_marks' },
        { label: 'Analytics', to: '/dashboard/exams/analytics', key: 'exam_analytics' },
        { label: 'Exam Configuration', to: '/dashboard/exams/config', key: 'exam_config' },
        { label: 'Exam Settings', to: '/dashboard/exams/settings', key: 'exam_settings' },
    ];

    useEffect(() => {
        const onDocClick = (e) => {
            const el = studentsRef.current;
            const st = staffRef.current;
            const ex = examsRef.current;
            const menu = submenuRef.current;
            const smenu = staffMenuRef.current;
            const emenu = examsMenuRef.current;
            if (!el) return;
            if (el.contains(e.target) || (st && st.contains(e.target)) || (ex && ex.contains(e.target))) return;
            if ((menu && menu.contains(e.target)) || (smenu && smenu.contains(e.target)) || (emenu && emenu.contains(e.target))) return;
            setShowStudents(false);
            setShowStaff(false);
            setShowExams(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);
    useEffect(() => {
        if (role === 'teacher' && teacherId) {
            fetch(`/api/teachers/${teacherId}/permissions`).then(r => r.ok ? r.json() : null).then(j => {
                if (j && Array.isArray(j.allowedFeatures)) setAllowedFeatures(j.allowedFeatures);
            }).catch(() => { });
        }
    }, [role, teacherId]);

    const isAllowed = (key) => {
        if (role !== 'teacher') return true;
        if (!allowedFeatures) return true;
        return allowedFeatures.includes(key);
    };

    const navItems = [
        { icon: Home, label: 'School', to: '/dashboard', key: 'school' },
        { icon: Users, label: 'Students', to: '#', key: 'students' },
        { icon: UserSquare2, label: 'Staff', to: '/dashboard/staff', key: 'staff' },
        { icon: ClipboardList, label: 'Exams', to: '#', key: 'assessments' },
        { icon: Landmark, label: 'Accounts', to: '/dashboard/finance', key: 'finance' },
        { icon: Sparkles, label: 'AI Assistant', to: '/dashboard/ai-assistant', key: 'ai_assistant' },
        { icon: Package, label: 'Inventory', to: '/dashboard/inventory', key: 'inventory' },
        { icon: Wrench, label: 'Services', to: '/dashboard/services', key: 'services' },
        { icon: Bus, label: 'Canteen & Transport', to: '/dashboard/canteen-transport', key: 'canteen_transport' },
    ].filter(item => isAllowed(item.key));

    const toggleStudents = () => {
        const el = studentsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setSubmenuPos({ top: rect.top, left: rect.right + 8 });
        setShowStudents((v) => !v);
        setShowStaff(false);
        setShowExams(false);
    };
    const toggleStaff = () => {
        const el = staffRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setStaffMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowStaff((v) => !v);
        setShowStudents(false);
        setShowExams(false);
    };
    const toggleExams = () => {
        const el = examsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setExamsMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowExams((v) => !v);
        setShowStudents(false);
        setShowStaff(false);
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>

                {/* ── School Logo / Crest ── */}
                <div className="flex flex-col items-center pt-5 pb-3 px-2 border-b border-gray-50">
                    {collapsed ? (
                        <div className="w-10 h-10 rounded-xl bg-primary-teal flex items-center justify-center shadow-lg shadow-primary-teal/20">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                    ) : (
                        <img src={SkullarLogo} alt="Skullar" className="w-[150px] h-auto flex-shrink-0 object-contain" />
                    )}
                    {/* Mobile close btn */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-4 right-2 md:hidden text-muted-text hover:text-dark-text p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Navigation ── */}
                <nav className="flex-1 flex flex-col items-center gap-0.5 px-2 py-4 overflow-y-auto custom-scrollbar">
                    {navItems.map((item, index) => {
                        if (item.label === 'Students') {
                            const isActive = location.pathname.startsWith('/dashboard/student') || location.pathname === '/dashboard/admissions' || location.pathname === '/dashboard/attendance' || location.pathname === '/dashboard/guardians';
                            return (
                                <div key={index} className="relative w-full" ref={studentsRef}>
                                    <SidebarItem
                                        icon={item.icon}
                                        to="#"
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleStudents();
                                        }}
                                    />
                                    {showStudents && createPortal(
                                        <div
                                            ref={submenuRef}
                                            style={{ position: 'fixed', top: submenuPos.top, left: submenuPos.left }}
                                            className="bg-white border border-gray-100 rounded-xl shadow-soft-sm p-2 z-[9999]"
                                        >
                                            <div className="min-w-[180px] flex flex-col">
                                                {studentLinks.filter(l => isAllowed(l.key)).map((l, i) => (
                                                    <Link
                                                        key={i}
                                                        to={l.to}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold no-underline ${location.pathname === l.to ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setShowStudents(false);
                                                        }}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            );
                        }
                        if (item.label === 'Staff') {
                            const isActive = location.pathname.startsWith('/dashboard/staff') || location.pathname.startsWith('/dashboard/question-bank');
                            return (
                                <div key={index} className="relative w-full" ref={staffRef}>
                                    <SidebarItem
                                        icon={item.icon}
                                        to="#"
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleStaff();
                                        }}
                                    />
                                    {showStaff && createPortal(
                                        <div
                                            ref={staffMenuRef}
                                            style={{ position: 'fixed', top: staffMenuPos.top, left: staffMenuPos.left }}
                                            className="bg-white border border-gray-100 rounded-xl shadow-soft-sm p-2 z-[9999]"
                                        >
                                            <div className="min-w-[200px] flex flex-col">
                                                {staffLinks.filter(l => isAllowed(l.key)).map((l, i) => (
                                                    <Link
                                                        key={i}
                                                        to={l.to}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold no-underline ${location.pathname === l.to ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setShowStaff(false);
                                                        }}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            );
                        }
                        if (item.label === 'Exams') {
                            const isActive = location.pathname.startsWith('/dashboard/exams') || location.pathname === '/dashboard/assessments';
                            return (
                                <div key={index} className="relative w-full" ref={examsRef}>
                                    <SidebarItem
                                        icon={item.icon}
                                        to="#"
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleExams();
                                        }}
                                    />
                                    {showExams && createPortal(
                                        <div
                                            ref={examsMenuRef}
                                            style={{ position: 'fixed', top: examsMenuPos.top, left: examsMenuPos.left }}
                                            className="bg-white border border-gray-100 rounded-xl shadow-soft-sm p-2 z-[9999]"
                                        >
                                            <div className="min-w-[200px] flex flex-col">
                                                <div className="px-3 py-2 text-[10px] font-black text-muted-text uppercase tracking-[0.2em] border-b border-gray-50 mb-1 text-center">
                                                    Exams
                                                </div>
                                                {examLinks.filter(l => isAllowed(l.key)).map((l, i) => (
                                                    <Link
                                                        key={i}
                                                        to={l.to}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold no-underline ${location.pathname === l.to ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setShowExams(false);
                                                        }}
                                                    >
                                                        {l.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>,
                                        document.body
                                    )}
                                </div>
                            );
                        }
                        return (
                            <SidebarItem
                                key={index}
                                icon={item.icon}
                                to={item.to}
                                label={item.label}
                                active={location.pathname === item.to}
                                collapsed={collapsed}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        );
                    })}
                </nav>

                {/* ── User Avatar & Settings ── */}
                <div className="p-3 border-t border-gray-50">
                    <Link
                        to="/dashboard/settings"
                        className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-light-bg transition-colors no-underline group"
                        title="Settings"
                    >
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-primary-teal transition-colors flex items-center justify-center bg-gray-50 shrink-0">
                            {userAvatar ? (
                                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                    <Home size={18} />
                                </div>
                            )}
                        </div>
                        {!collapsed && <span className="text-[9px] font-black text-muted-text uppercase tracking-widest group-hover:text-primary-teal transition-colors">Settings</span>}
                    </Link>
                </div>

                {/* ── Collapse Toggle (Desktop only) ── */}
                <div className="p-3 border-t border-gray-50 hidden md:block">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center py-2 h-9 rounded-xl bg-light-bg text-primary-teal hover:bg-primary-teal hover:text-white transition-all duration-300 text-xs font-black"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
