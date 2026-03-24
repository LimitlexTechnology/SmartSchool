import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Building2, CreditCard, Users,
    BarChart3, ScrollText, Settings, Shield
} from 'lucide-react';
import SkullarLogo from '../../assets/SkullarLogo.png';

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/superadmin' },
    { icon: Building2, label: 'Schools', to: '/superadmin/schools' },
    { icon: CreditCard, label: 'Subscriptions', to: '/superadmin/subscriptions' },
    { icon: Users, label: 'All Users', to: '/superadmin/users' },
    { icon: BarChart3, label: 'Analytics', to: '/superadmin/analytics' },
    { icon: ScrollText, label: 'Audit Logs', to: '/superadmin/audit-logs' },
    { icon: Settings, label: 'Settings', to: '/superadmin/settings' },
];

const NavItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline group relative
            ${active
                ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />}
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
        <span className="text-sm font-semibold">{label}</span>
    </Link>
);

const SuperAdminSidebar = () => {
    const location = useLocation();
    const isActive = (to) =>
        to === '/superadmin' ? location.pathname === '/superadmin' : location.pathname.startsWith(to);

    return (
        <aside className="w-[200px] h-screen bg-[#0F1A2E] border-r border-white/5 flex flex-col flex-shrink-0 sticky top-0">
            {/* Branding */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <img src={SkullarLogo} alt="Skullar" className="w-[150px] h-auto object-contain" />
                    <div>
                        <p className="text-[10px] font-bold text-primary-teal uppercase tracking-widest">Super Admin</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-4 mb-3">Control Room</p>
                {navItems.map((item) => (
                    <NavItem key={item.to} {...item} active={isActive(item.to)} />
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-gray-400">All systems operational</span>
                </div>
            </div>
        </aside>
    );
};

export default SuperAdminSidebar;
