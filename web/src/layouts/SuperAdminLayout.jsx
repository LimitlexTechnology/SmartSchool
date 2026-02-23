import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../components/layout/SuperAdminSidebar';
import {
    Bell, Search, ChevronDown, LogOut, Shield
} from 'lucide-react';

const SuperAdminLayout = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-[#0B1120] font-inter">
            <SuperAdminSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="h-16 bg-[#0F1A2E] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                            <Search size={15} className="text-gray-400" />
                            <input
                                className="bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none w-48"
                                placeholder="Search schools, users..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] font-bold text-emerald-400">Platform Online</span>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-teal to-secondary-teal flex items-center justify-center">
                                    <Shield size={16} className="text-white" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-xs font-bold text-white">Super Admin</p>
                                    <p className="text-[10px] text-gray-400">Platform Owner</p>
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-44 bg-[#1A2540] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
