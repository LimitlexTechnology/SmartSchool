import React, { useState } from 'react';
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
    GraduationCap
} from 'lucide-react';

/* ── Single Nav Item ── */
const SidebarItem = ({ icon: Icon, label, to, active = false, collapsed = false, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        title={label}
        className={`
            flex flex-col items-center gap-1 py-3 px-2 rounded-xl cursor-pointer transition-all duration-200 no-underline relative group w-full
            ${active
                ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/25'
                : 'text-muted-text hover:bg-light-bg hover:text-primary-teal'}
        `}
    >
        <Icon size={collapsed ? 22 : 20} strokeWidth={active ? 2.5 : 2} />
        {!collapsed && (
            <span className={`text-[10px] font-bold text-center leading-tight ${active ? 'text-white' : ''}`}>
                {label}
            </span>
        )}

        {/* Tooltip on collapsed */}
        {collapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-dark-text text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-xl">
                {label}
            </div>
        )}
    </Link>
);

/* ── Sidebar ── */
const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'School', to: '/dashboard' },
        { icon: Users, label: 'Students', to: '/dashboard/smart-id' },
        { icon: UserSquare2, label: 'Staff', to: '/dashboard/staff' },
        { icon: ClipboardList, label: 'Exams', to: '/dashboard/assessments' },
        { icon: Landmark, label: 'Accounts', to: '/dashboard/finance' },
        { icon: Package, label: 'Inventory', to: '/dashboard/inventory' },
        { icon: Wrench, label: 'Services', to: '/dashboard/services' },
        { icon: Bus, label: 'Canteen & Transport', to: '/dashboard/canteen-transport' },
    ];

    const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[90px]';

    const sidebarClasses = `
        h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-[100] shadow-soft-sm
        ${sidebarWidth}
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

                {/* ── School Logo / Crest ── */}
                <div className="flex flex-col items-center pt-5 pb-3 px-2 border-b border-gray-50">
                    {/* Logo area – shows the school's crest / logo */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-teal to-secondary-teal flex items-center justify-center shadow-lg shadow-primary-teal/20 flex-shrink-0">
                        <GraduationCap size={24} className="text-white" />
                    </div>
                    {!collapsed && (
                        <p className="text-[9px] font-black text-muted-text uppercase tracking-widest mt-2 text-center leading-tight px-1">
                            School
                        </p>
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
