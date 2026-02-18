import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    BookOpen,
    GraduationCap,
    ClipboardCheck,
    FileText,
    Wallet,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    BrainCircuit,
    Calendar,
    Menu,
    X,
    Video,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active = false, collapsed = false, onClick }) => (
    <Link to={to} onClick={onClick} className={`
    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 no-underline relative group
    ${active
            ? 'bg-primary-teal/10 text-primary-teal'
            : 'text-muted-text hover:bg-light-bg hover:text-primary-teal'}
  `}>
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-teal rounded-r-full" />
        )}
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {!collapsed && <span className={`font-semibold ${active ? 'text-primary-teal' : ''}`}>{label}</span>}
        {collapsed && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-dark-text text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                {label}
            </div>
        )}
    </Link>
);

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Calendar, label: 'Diary', to: '/diary' },
        { icon: Video, label: 'Virtual Class', to: '/virtual-class' },
        { icon: Users, label: 'Students', to: '/smart-id' },
        { icon: FileText, label: 'Assessments', to: '/assessments' },
        { icon: BrainCircuit, label: 'AI Lesson Notes', to: '/ai-lesson-notes' },
        { icon: ClipboardCheck, label: 'Attendance', to: '/attendance' },
        { icon: ShieldAlert, label: 'Safety', to: '/safety' },
        { icon: Wallet, label: 'Finance', to: '/finance' },
        { icon: ShieldCheck, label: 'Security', to: '/security' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    const sidebarClasses = `
    h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-[100]
    ${collapsed ? 'w-20' : 'w-[260px]'}
    ${isMobileMenuOpen ? 'fixed left-0 top-0 translate-x-0' : 'fixed -translate-x-full md:relative md:translate-x-0'}
  `;

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
                {/* Logo */}
                <div className="p-6 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-teal rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 animate-pulse-slow shadow-lg shadow-primary-teal/20">
                            S
                        </div>
                        {!collapsed && (
                            <span className="text-xl font-extrabold text-[#0F172A] tracking-tighter whitespace-nowrap overflow-hidden">
                                Smart School
                            </span>
                        )}
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-muted-text hover:text-dark-text p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    <p className={`px-4 mb-2 text-[10px] font-bold text-muted-text uppercase tracking-widest ${collapsed ? 'text-center' : ''}`}>
                        {collapsed ? '—' : 'Main Menu'}
                    </p>
                    {navItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            to={item.to}
                            label={item.label}
                            active={location.pathname === item.to}
                            collapsed={collapsed}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    ))}
                </nav>

                {/* Collapse Toggle (Desktop only) */}
                <div className="p-4 border-t border-gray-50 hidden md:block">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center py-2 h-10 rounded-xl bg-light-bg text-primary-teal hover:bg-primary-teal hover:text-white transition-all duration-300"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><ChevronLeft size={16} /> Minimize</div>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
