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
    Megaphone,
    Sparkles,
    Settings
} from 'lucide-react';
import SkullarLogo from '../../assets/SkullarLogo.png';
import { hasPermission, getPermissions } from '../../utils/permissionUtils';

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
    const [showSchool, setShowSchool] = useState(false);
    const [showStudents, setShowStudents] = useState(false);
    const [showStaff, setShowStaff] = useState(false);
    const [showExams, setShowExams] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const schoolRef = useRef(null);
    const studentsRef = useRef(null);
    const staffRef = useRef(null);
    const examsRef = useRef(null);
    const servicesRef = useRef(null);
    const schoolMenuRef = useRef(null);
    const submenuRef = useRef(null);
    const staffMenuRef = useRef(null);
    const examsMenuRef = useRef(null);
    const servicesMenuRef = useRef(null);
    const [schoolMenuPos, setSchoolMenuPos] = useState({ top: 0, left: 0 });
    const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
    const [staffMenuPos, setStaffMenuPos] = useState({ top: 0, left: 0 });
    const [examsMenuPos, setExamsMenuPos] = useState({ top: 0, left: 0 });
    const [servicesMenuPos, setServicesMenuPos] = useState({ top: 0, left: 0 });
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


    useEffect(() => {
        const onDocClick = (e) => {
            const sc = schoolRef.current;
            const el = studentsRef.current;
            const st = staffRef.current;
            const ex = examsRef.current;
            const sv = servicesRef.current;
            const smenu = schoolMenuRef.current;
            const menu = submenuRef.current;
            const stmenu = staffMenuRef.current;
            const emenu = examsMenuRef.current;
            const svmenu = servicesMenuRef.current;

            // Check if click was inside any toggle item
            const clickedToggle = (sc && sc.contains(e.target)) ||
                                (el && el.contains(e.target)) || 
                                (st && st.contains(e.target)) || 
                                (ex && ex.contains(e.target)) || 
                                (sv && sv.contains(e.target));
            
            // Check if click was inside any portal menu
            const clickedMenu = (smenu && smenu.contains(e.target)) ||
                              (menu && menu.contains(e.target)) || 
                              (stmenu && stmenu.contains(e.target)) || 
                              (emenu && emenu.contains(e.target)) || 
                              (svmenu && svmenu.contains(e.target));

            if (clickedToggle || clickedMenu) return;

            setShowSchool(false);
            setShowStudents(false);
            setShowStaff(false);
            setShowExams(false);
            setShowServices(false);
        };
        document.addEventListener('mousedown', onDocClick);
        
        const handlePermissionsUpdate = () => {
            // Force re-render when permissions change
            setAllowedFeatures(getPermissions());
        };
        window.addEventListener('admin:permissions:update', handlePermissionsUpdate);

        return () => {
            document.removeEventListener('mousedown', onDocClick);
            window.removeEventListener('admin:permissions:update', handlePermissionsUpdate);
        };
    }, []);

    const isAllowed = (key) => {
        // Handle categories and specific keys
        if (key === 'school') return true; // School is usually always visible
        if (key === 'students') return hasPermission('view_students');
        if (key === 'staff') return hasPermission('manage_staff');
        if (key === 'assessments') return hasPermission('enter_marks');
        if (key === 'finance') return hasPermission('fee_management');
        if (key === 'ai_assistant') return true; // AI is common
        if (key === 'inventory') return hasPermission('inventory_tracking');
        if (key === 'services') return hasPermission('id_management');
        return true;
    };

    const navItems = [
        { icon: Home, label: 'School', to: '#', key: 'school' },
        { icon: Users, label: 'Students', to: '#', key: 'students' },
        { icon: UserSquare2, label: 'Staff', to: '/dashboard/staff', key: 'staff' },
        { icon: ClipboardList, label: 'Exams', to: '#', key: 'assessments' },
        { icon: Landmark, label: 'Accounts', to: '/dashboard/finance', key: 'finance' },
        { icon: Sparkles, label: 'AI Assistant', to: '/dashboard/ai-assistant', key: 'ai_assistant' },
        { icon: Package, label: 'Inventory', to: '/dashboard/inventory', key: 'inventory' },
        { icon: Wrench, label: 'Services', to: '#', key: 'services' },
    ].filter(item => isAllowed(item.key));

    const schoolLinks = [
        { label: 'Dashboard', to: '/dashboard', key: 'school_dashboard', perm: 'view_all_courses' },
        { label: 'Admin Panel', to: '/dashboard/admin-settings', key: 'admin_panel', perm: 'super_admin' },
        { label: 'Classes & Subjects', to: '/dashboard/staff/timetables', key: 'classes_subjects', perm: 'manage_classes' },
        { label: 'App Preferences', to: '/dashboard/admin-settings?tab=preferences', key: 'app_preferences', perm: '*' },
    ].filter(l => l.perm === '*' || hasPermission(l.perm));

    const studentLinks = [
        { label: 'Student List', to: '/dashboard/students', key: 'student_list', perm: 'view_students' },
        { label: 'Classroom', to: '/dashboard/classroom', key: 'classroom', perm: 'view_all_courses' },
        { label: 'Groups', to: '/dashboard/students/groups', key: 'student_groups', perm: 'manage_groups' },
        { label: 'Admissions', to: '/dashboard/students/admissions', key: 'admissions', perm: 'manage_admissions' },
        { label: 'Attendance', to: '/dashboard/attendance', key: 'attendance', perm: 'student_attendance' },
        { label: 'Guardians', to: '/dashboard/guardians', key: 'guardians', perm: 'guardians_info' },
    ].filter(l => l.perm === '*' || hasPermission(l.perm));

    const staffLinks = [
        { label: 'Staff List', to: '/dashboard/staff', key: 'staff_list', perm: 'manage_staff' },
        { label: 'Allocations', to: '/dashboard/staff/allocations', key: 'allocations', perm: 'course_allocation' },
        { label: 'Attendance', to: '/dashboard/staff/attendance', key: 'staff_attendance', perm: 'staff_attendance' },
        { label: 'Lesson Planner', to: '/dashboard/staff/lesson-planner', key: 'lesson_planner', perm: 'edit_planner' },
        { label: 'Timetables', to: '/dashboard/staff/timetables', key: 'timetables', perm: 'edit_schedules' },
        { label: 'Online Campus ✨', to: '/dashboard/online-campus', key: 'online_campus', perm: '*' },
        { label: 'Question Bank ✨', to: '/dashboard/question-bank', key: 'question_bank', perm: '*' },
    ].filter(l => l.perm === '*' || hasPermission(l.perm));

    const examLinks = [
        { label: 'Marks Entry', to: '/dashboard/exams/marks', key: 'marks_entry', perm: 'enter_marks' },
        { label: 'Reports', to: '/dashboard/exams/reports', key: 'exam_reports', perm: 'publish_reports' },
        { label: 'Settings', to: '/dashboard/exams/config', key: 'exam_config', perm: 'exam_config' },
        { label: 'Analytics', to: '/dashboard/exams/analytics', key: 'exam_analytics', perm: 'publish_reports' },
    ].filter(l => l.perm === '*' || hasPermission(l.perm));

    const serviceLinks = [
        { label: 'ID Cards', to: '/dashboard/smart-id', key: 'id_cards', perm: 'id_management' },
        { label: 'Canteen', to: '#', key: 'canteen', perm: 'canteen_collection' },
        { label: 'Clinic', to: '/dashboard/safety', key: 'clinic', perm: 'health_records' },
        { label: 'Calendar', to: '/dashboard/calendar', key: 'calendar', perm: '*' },
        { label: 'Messages', to: '/dashboard/messages', key: 'messages', perm: 'view_messages' },
        { label: 'Skullar Connect', to: '/dashboard/skullar-connect', key: 'skullar_connect', perm: '*' },
        { label: 'Front desk', to: '/dashboard/front-desk', key: 'front_desk', perm: 'security_logs' },
    ].filter(l => l.perm === '*' || hasPermission(l.perm));

    const toggleSchool = () => {
        const el = schoolRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setSchoolMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowSchool((v) => !v);
        setShowStudents(false);
        setShowStaff(false);
        setShowExams(false);
        setShowServices(false);
    };
    const toggleStudents = () => {
        const el = studentsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setSubmenuPos({ top: rect.top, left: rect.right + 8 });
        setShowStudents((v) => !v);
        setShowStaff(false);
        setShowExams(false);
        setShowServices(false);
    };
    const toggleStaff = () => {
        const el = staffRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setStaffMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowStaff((v) => !v);
        setShowStudents(false);
        setShowExams(false);
        setShowServices(false);
    };
    const toggleExams = () => {
        const el = examsRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setExamsMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowExams((v) => !v);
        setShowStudents(false);
        setShowStaff(false);
        setShowServices(false);
    };
    const toggleServices = () => {
        const el = servicesRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setServicesMenuPos({ top: rect.top, left: rect.right + 8 });
        setShowServices((v) => !v);
        setShowStudents(false);
        setShowStaff(false);
        setShowExams(false);
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
                        <div onClick={() => window.location.reload()} className="w-10 h-10 rounded-xl bg-primary-teal flex items-center justify-center shadow-lg shadow-primary-teal/20 cursor-pointer">
                            {schoolLogo ? (
                                <img src={schoolLogo} alt="School Logo" className="w-full h-full object-contain p-1.5" />
                            ) : (
                                <GraduationCap size={22} className="text-white" />
                            )}
                        </div>
                    ) : (
                        <img src={schoolLogo || SkullarLogo} alt="School Logo" onClick={() => window.location.reload()} className="w-[150px] max-h-[60px] flex-shrink-0 object-contain cursor-pointer" />
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
                        if (item.label === 'School') {
                            const isActive = location.pathname === '/dashboard' || location.pathname === '/dashboard/admin-settings' || location.pathname === '/dashboard/settings';
                            return (
                                <div key={index} className="relative w-full" ref={schoolRef}>
                                    <SidebarItem
                                        icon={item.icon}
                                        to="#"
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSchool();
                                        }}
                                    />
                                    {showSchool && createPortal(
                                        <div
                                            ref={schoolMenuRef}
                                            style={{ position: 'fixed', top: schoolMenuPos.top, left: schoolMenuPos.left }}
                                            className="bg-white border border-gray-100 rounded-xl shadow-soft-sm p-2 z-[9999]"
                                        >
                                            <div className="min-w-[180px] flex flex-col">
                                                <div className="px-3 py-2 text-[10px] font-black text-muted-text uppercase tracking-[0.2em] border-b border-gray-50 mb-1 text-center">
                                                    School
                                                </div>
                                                {schoolLinks.map((l, i) => (
                                                    <Link
                                                        key={i}
                                                        to={l.to}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold no-underline ${location.pathname === l.to ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setShowSchool(false);
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
                        if (item.label === 'Services') {
                            const isActive = location.pathname.startsWith('/dashboard/services') || 
                                           ['/dashboard/calendar', '/dashboard/messages', '/dashboard/diary', '/dashboard/front-desk'].includes(location.pathname);
                            return (
                                <div key={index} className="relative w-full" ref={servicesRef}>
                                    <SidebarItem
                                        icon={item.icon}
                                        to="#"
                                        label={item.label}
                                        active={isActive}
                                        collapsed={collapsed}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleServices();
                                        }}
                                    />
                                    {showServices && createPortal(
                                        <div
                                            ref={servicesMenuRef}
                                            style={{ position: 'fixed', top: servicesMenuPos.top, left: servicesMenuPos.left }}
                                            className="bg-white border border-gray-100 rounded-xl shadow-soft-sm p-2 z-[9999]"
                                        >
                                            <div className="min-w-[180px] flex flex-col">
                                                <div className="px-3 py-2 text-[10px] font-black text-muted-text uppercase tracking-[0.2em] border-b border-gray-50 mb-1 text-center">
                                                    Services
                                                </div>
                                                {serviceLinks.filter(l => isAllowed(l.key)).map((l, i) => (
                                                    <Link
                                                        key={i}
                                                        to={l.to}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold no-underline ${location.pathname === l.to ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(false);
                                                            setShowServices(false);
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
                        <div className="w-10 h-10 rounded-xl border-2 border-gray-100 group-hover:border-primary-teal group-hover:bg-primary-teal/5 transition-all flex items-center justify-center text-gray-400 group-hover:text-primary-teal shrink-0">
                            <Settings size={20} />
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
