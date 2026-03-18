import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Scan,
    Wallet,
    Clock,
    Library,
    Bus,
    History,
    Plus,
    ArrowUpRight,
    ShieldCheck,
    CreditCard,
    Utensils,
    MapPin,
    ChevronRight,
    Receipt,
    Check
} from 'lucide-react';
import SkullarLogo from '../assets/Skullar Logo.png';

const SmartID = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const transactions = [
        { id: 1, type: 'Transport', amount: -2.00, title: 'School Bus Access - Route B', date: 'Oct 17, 2026 • 03:45 PM', icon: Bus, color: 'primary' },
        { id: 2, type: 'Canteen', amount: -8.50, title: 'Canteen Payment - Lunch Special', date: 'Oct 17, 2026 • 12:45 PM', icon: Utensils, color: 'secondary' },
        { id: 3, type: 'Library', amount: 0, title: 'Library Entry - Main Block', date: 'Oct 17, 2026 • 11:20 AM', icon: Library, color: 'soft' },
        { id: 4, type: 'Top-up', amount: 50.00, title: 'Wallet Top-up - Mobile Pay', date: 'Oct 16, 2026 • 09:15 AM', icon: Wallet, color: 'success' },
    ];

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Smart ID & Wallet</h1>
                    <p className="text-muted-text mt-1">Digital identification and cashless campus services.</p>
                </div>
                <Button className="flex items-center gap-3 px-8 h-12 rounded-2xl shadow-xl shadow-primary-teal/20">
                    <Scan size={20} />
                    Scan Wristband
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card padding="none" className="overflow-hidden bg-[#0F172A] text-white relative min-h-[550px] group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-teal/20 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary-teal/30 transition-all"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-soft-teal/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                        <div className="p-8 h-full flex flex-col justify-between relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={SkullarLogo} alt="Skullar" className="w-[150px] h-auto object-contain" />
                                    <div>
                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Academic Year 2026</span>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-primary-teal text-[10px] font-black rounded-full flex items-center gap-1">
                                    <ShieldCheck size={12} /> AUTHENTICATED
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6 my-10">
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-[40px] bg-white/10 p-3 ring-4 ring-white/10 overflow-hidden">
                                        <div className="w-full h-full rounded-[28px] bg-white overflow-hidden flex items-center justify-center text-primary-teal text-5xl font-black">
                                            JD
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success border-4 border-[#0F172A] rounded-full flex items-center justify-center text-white">
                                        <Check size={20} strokeWidth={4} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-white cursor-default">John Doe</h2>
                                    <p className="text-white/50 text-sm font-bold mt-1 inline-flex items-center gap-2 uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/10">
                                        Grade 10-B Student
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="bg-white/5 rounded-[24px] p-5 flex justify-between items-center backdrop-blur-md border border-white/10">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Access ID Number</p>
                                        <p className="font-mono text-xl font-black tracking-tighter text-soft-teal">SS-2026-67894</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                                        <div className="w-10 h-10 grid grid-cols-4 gap-0.5">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className={`bg-primary-teal ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-10'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button fullWidth size="sm" className="bg-white text-dark-text border-none hover:bg-soft-teal">Digital Copy</Button>
                                    <Button fullWidth size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">Lock Card</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card padding="large" className="bg-gradient-to-br from-white to-primary-teal/5 border-primary-teal/10 flex flex-col justify-between h-[220px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-teal/10 text-primary-teal rounded-xl flex items-center justify-center">
                                        <Wallet size={20} />
                                    </div>
                                    <span className="text-sm font-black text-muted-text uppercase tracking-widest">Campus Wallet</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-muted-text uppercase tracking-widest mb-1">Available Balance</p>
                                <div className="flex items-end gap-3">
                                    <h2 className="text-5xl font-black text-[#0F172A]">$125.50</h2>
                                    <span className="text-success text-sm font-black mb-2 flex items-center bg-success/10 px-2 py-1 rounded-lg">
                                        <ArrowUpRight size={14} /> +12%
                                    </span>
                                </div>
                            </div>
                            <Button fullWidth className="bg-[#0F172A] border-none text-white h-12 shadow-lg shadow-[#0F172A]/20">Quick Top Up</Button>
                        </Card>

                        <Card padding="large" className="bg-gradient-to-br from-white to-soft-teal/5 border-soft-teal/10 flex flex-col justify-between h-[220px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-dark-text">
                                    <div className="w-10 h-10 bg-soft-teal/10 text-soft-teal rounded-xl flex items-center justify-center">
                                        <CreditCard size={20} />
                                    </div>
                                    <span className="text-sm font-black text-muted-text uppercase tracking-widest">Daily Limit</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-sm font-black text-[#0F172A] uppercase tracking-widest font-mono">$45.00 <span className="text-muted-text text-xs italic">/ $50.00</span></p>
                                    <span className="text-[10px] font-bold text-muted-text">90% CONSUMED</span>
                                </div>
                                <div className="w-full h-3 bg-light-bg rounded-full overflow-hidden p-0.5 border border-gray-100">
                                    <div className="w-[90%] h-full bg-primary-teal rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-text italic text-center font-medium">Auto-refills every morning at 06:00 AM</p>
                        </Card>
                    </div>

                    <Card padding="large" className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <Receipt className="text-primary-teal" size={24} />
                                <h3 className="text-2xl font-black text-[#0F172A]">Real-time Activity</h3>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[24px] group hover:border-primary-teal hover:shadow-xl hover:shadow-primary-teal/5 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                      ${tx.color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
                      ${tx.color === 'secondary' ? 'bg-secondary-teal/10 text-secondary-teal' : ''}
                      ${tx.color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
                      ${tx.color === 'success' ? 'bg-success/10 text-success' : ''}
                    `}>
                                            <tx.icon size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#0F172A] group-hover:text-primary-teal transition-colors">{tx.title}</h4>
                                            <p className="text-xs text-muted-text mt-1 font-medium">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${tx.amount < 0 ? 'text-[#0F172A]' : tx.amount > 0 ? 'text-success' : 'text-primary-teal'}`}>
                                                {tx.amount === 0 ? 'ACCESS' : (tx.amount < 0 ? '' : '+') + '$' + Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                            <span className="text-[10px] text-muted-text uppercase font-black tracking-widest">{tx.type}</span>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-200 group-hover:text-primary-teal group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="ghost" className="w-full mt-8 h-14 rounded-2xl border-2 border-dashed border-gray-100 text-muted-text font-bold hover:border-primary-teal hover:text-primary-teal hover:bg-primary-teal/5 flex items-center justify-center gap-2 group">
                            <History size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                            Load Extended Session History
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SmartID;
