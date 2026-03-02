import React from 'react';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import YearTermPicker from './YearTermPicker';
import ProfileMenu from './ProfileMenu';

const Navbar = ({ onOpenMobileMenu }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear login data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userPhone');
        // Redirect to home page
        navigate('/');
    };
    return (
        <header className="h-[70px] bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[40]">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenMobileMenu}
                    className="p-2 -ml-2 text-muted-text hover:text-primary-teal md:hidden"
                >
                    <Menu size={24} />
                </button>
                <h2 className="text-xl font-bold text-dark-text hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text group-focus-within:text-primary-teal transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 pl-10 pr-4 w-[300px] rounded-button bg-light-bg border-transparent focus:bg-white focus:border-primary-teal focus:ring-1 focus:ring-primary-teal transition-all outline-none text-sm"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-button bg-light-bg text-dark-text hover:text-primary-teal transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                </button>

                {/* Academic Period */}
                <YearTermPicker />

                <ProfileMenu onLogout={handleLogout} />

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-button bg-light-bg text-muted-text hover:text-error hover:bg-error/10 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
