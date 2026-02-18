import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import MobileNav from '../components/layout/MobileNav';

const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-light-bg font-inter">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
                <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="max-w-[1240px] mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>

            <MobileNav />
        </div>
    );
};

export default DashboardLayout;
