import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Wallet,
    FileCheck,
    TrendingUp,
    Package,
    Plus,
    Filter,
    Download,
    ChevronRight,
    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Receipt,
    AlertCircle
} from 'lucide-react';

const Finance = () => {
    const [filter, setFilter] = useState('all');

    const stats = [
        { label: 'Total Fees Collected', value: '$84,200', trend: '+12.5%', isUp: true, icon: Wallet, color: 'primary' },
        { label: 'Pending Invoices', value: '24', trend: '-2.4%', isUp: false, icon: FileCheck, color: 'secondary' },
        { label: 'Monthly Revenue', value: '$22,450', trend: '+5.2%', isUp: true, icon: TrendingUp, color: 'soft' },
        { label: 'Inventory Value', value: '$12,800', trend: '+1.1%', isUp: true, icon: Package, color: 'success' }
    ];

    const recentTransactions = [
        { id: 'INV-001', student: 'John Doe', amount: '$1,200', status: 'Paid', date: 'Oct 15, 2026', method: 'Smart Wallet' },
        { id: 'INV-002', student: 'Sarah Smith', amount: '$850', status: 'Pending', date: 'Oct 14, 2026', method: 'Bank Transfer' },
        { id: 'INV-003', student: 'Mike Johnson', amount: '$1,200', status: 'Overdue', date: 'Oct 10, 2026', method: 'Direct Deposit' },
        { id: 'INV-004', student: 'Emily Brown', amount: '$600', status: 'Paid', date: 'Oct 08, 2026', method: 'Smart Wallet' },
    ];

    const inventoryItems = [
        { name: 'Student Blazers', stock: 45, status: 'In Stock', color: 'success' },
        { name: 'Chemistry Kits', stock: 12, status: 'Low Stock', color: 'error' },
        { name: 'Sports Jerseys', stock: 28, status: 'In Stock', color: 'primary' },
        { name: 'AI Lab Pass', stock: 150, status: 'In Stock', color: 'soft' }
    ];

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Finance & Reporting</h1>
                    <p className="text-muted-text mt-1">Manage invoices, fees, and school inventory.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-5 border-gray-200">
                        <Download size={18} />
                        Export Report
                    </Button>
                    <Button className="flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary-teal/20">
                        <Plus size={18} />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} padding="large" className="group hover:border-primary-teal transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                ${stat.color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
                ${stat.color === 'secondary' ? 'bg-secondary-teal/10 text-secondary-teal' : ''}
                ${stat.color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
                ${stat.color === 'success' ? 'bg-success/10 text-success' : ''}
              `}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${stat.isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#0F172A] mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{stat.label}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Transactions Section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card padding="large">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <Receipt className="text-primary-teal" size={24} />
                                <h3 className="text-xl font-bold">Latest Invoices</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text group-hover:text-primary-teal" size={16} />
                                    <input
                                        placeholder="Search invoices..."
                                        className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 text-sm font-bold bg-light-bg focus:ring-1 focus:ring-primary-teal outline-none w-48 md:w-64"
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="h-[42px] px-4"><Filter size={18} /></Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[10px] font-black text-muted-text uppercase tracking-widest text-left italic">
                                        <th className="pb-4 pt-0">Invoice ID</th>
                                        <th className="pb-4 pt-0">Student</th>
                                        <th className="pb-4 pt-0">Amount</th>
                                        <th className="pb-4 pt-0">Status</th>
                                        <th className="pb-4 pt-0">Method</th>
                                        <th className="pb-4 pt-0 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentTransactions.map((tx, i) => (
                                        <tr key={i} className="group hover:bg-light-bg/50 transition-colors">
                                            <td className="py-4 font-mono font-bold text-primary-teal text-sm">{tx.id}</td>
                                            <td className="py-4 font-bold text-dark-text">{tx.student}</td>
                                            <td className="py-4 font-black text-[#0F172A]">{tx.amount}</td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                          ${tx.status === 'Paid' ? 'bg-success text-white' : tx.status === 'Pending' ? 'bg-secondary-teal text-white' : 'bg-error text-white'}
                        `}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-xs font-bold text-muted-text">{tx.method}</td>
                                            <td className="py-4 text-right">
                                                <button className="p-2 text-muted-text hover:text-primary-teal transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card padding="large" className="bg-gradient-to-br from-white to-soft-teal/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="text-soft-teal" /> Revenue Analysis
                            </h3>
                            <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary-teal rounded-full"></div> Collected</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200 rounded-full"></div> Outstanding</div>
                            </div>
                        </div>

                        {/* Mock Chart Visualization */}
                        <div className="h-64 flex items-end justify-between gap-4 px-4">
                            {[45, 60, 35, 80, 55, 90, 75].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex flex-col justify-end gap-1 h-full">
                                        <div
                                            style={{ height: `${h}%` }}
                                            className="w-full bg-primary-teal rounded-t-lg transition-all group-hover:scale-y-105 group-hover:shadow-lg group-hover:shadow-primary-teal/20"
                                        ></div>
                                        <div
                                            style={{ height: `${20}%` }}
                                            className="w-full bg-gray-100 rounded-b-lg"
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-text uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Inventory Sidebar Item */}
                <div className="flex flex-col gap-6">
                    <Card padding="large">
                        <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                            Inventory <Package className="text-primary-teal" />
                        </h3>
                        <div className="flex flex-col gap-5">
                            {inventoryItems.map((item, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-dark-text">{item.name}</span>
                                        <span className="text-muted-text font-medium">{item.stock} left</span>
                                    </div>
                                    <div className="w-full h-2 bg-light-bg rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${(item.stock / 200) * 100}%` }}
                                            className={`h-full rounded-full ${item.status === 'Low Stock' ? 'bg-error' : 'bg-primary-teal'}`}
                                        ></div>
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'Low Stock' ? 'text-error animate-pulse' : 'text-success'}`}>
                                        {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button fullWidth variant="ghost" className="mt-8 text-primary-teal font-black flex items-center gap-2">
                            View All Supplies <ChevronRight size={18} />
                        </Button>
                    </Card>

                    <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <AlertCircle size={24} className="text-error" /> Financial Alerts
                        </h3>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                                <p className="text-sm font-bold text-error mb-2">Unpaid Rent: Service Block</p>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">Payment for the main laboratory block is 5 days overdue.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                                <p className="text-sm font-bold text-soft-teal mb-2">Scholarship Review</p>
                                <p className="text-xs text-white/50 leading-relaxed font-medium">12 applications pending review for the 2026 academic term.</p>
                            </div>
                        </div>
                        <Button fullWidth className="mt-8 bg-white text-dark-text border-none hover:bg-soft-teal">Manage Alerts</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Finance;
