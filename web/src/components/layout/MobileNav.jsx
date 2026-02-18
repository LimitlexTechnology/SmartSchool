import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Calendar,
    Wallet,
    User
} from 'lucide-react';

const MobileNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', to: '/dashboard' },
        { icon: FileText, label: 'Assess', to: '/assessments' },
        { icon: Calendar, label: 'Diary', to: '/diary' },
        { icon: Wallet, label: 'Wallet', to: '/smart-id' },
        { icon: User, label: 'Profile', to: '/settings' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-50">
            {navItems.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                    <Link
                        key={index}
                        to={item.to}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary-teal' : 'text-muted-text'}`}
                    >
                        <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-teal/10' : ''}`}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileNav;
