import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    ShieldCheck,
    Bell,
    MapPin,
    UserPlus,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ChevronRight,
    Search,
    UserCheck,
    Phone,
    ShieldAlert,
    Smartphone,
    Map
} from 'lucide-react';

const Safety = () => {
    const [selectedStudent, setSelectedStudent] = useState('John Doe');

    const safetyStats = [
        { label: 'Students on Campus', value: '412', sub: '94% of Total', icon: UserCheck, color: 'primary' },
        { label: 'Off-Campus (Authorized)', value: '38', sub: 'Field Trips/Permits', icon: MapPin, color: 'soft' },
        { label: 'Active Alerts', value: '2', sub: 'Low Priority', icon: Bell, color: 'error' }
    ];

    const pickUpDelegations = [
        { id: 1, student: 'John Doe', authorizedBy: 'Parent (Jane Doe)', relation: 'Uncle', name: 'Robert Smith', status: 'Verified', time: '03:45 PM' },
        { id: 2, student: 'Sarah Smith', authorizedBy: 'Parent (Mark Smith)', relation: 'Nanny', name: 'Maria Garcia', status: 'Pending', time: '04:00 PM' },
    ];

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Student Safety & Security</h1>
                    <p className="text-muted-text mt-1">Real-time monitoring, encrypted alerts, and authorized pickup management.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-5 border-gray-200">
                        <Map size={18} />
                        Live Campus Map
                    </Button>
                    <Button className="flex items-center gap-2 h-11 px-6 bg-error hover:bg-error/90 shadow-lg shadow-error/20">
                        <AlertTriangle size={18} />
                        Emergency Lockdown
                    </Button>
                </div>
            </div>

            {/* Safety Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {safetyStats.map((stat, i) => (
                    <Card key={i} padding="large">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                                ${stat.color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
                                ${stat.color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
                                ${stat.color === 'error' ? 'bg-error/10 text-error' : ''}
                            `}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">Real-time</span>
                        </div>
                        <h3 className="text-3xl font-black text-[#0F172A] mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{stat.label}</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-text">{stat.sub}</span>
                            <ChevronRight size={14} className="text-primary-teal" />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pickup Management */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white relative">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <UserPlus className="text-primary-teal" /> Authorized Pickup Requests
                            </h3>
                            <div className="absolute top-0 right-0 p-2"><div className="w-1.5 h-1.5 bg-error rounded-full animate-ping" /></div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-light-bg/50">
                                    <tr className="text-[10px] font-black uppercase text-muted-text border-b border-gray-50">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Authorized Pickup</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Est. Time</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pickUpDelegations.map(req => (
                                        <tr key={req.id} className="group hover:bg-light-bg/30 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-dark-text">{req.student}</span>
                                                    <span className="text-[10px] text-muted-text uppercase font-bold">via {req.authorizedBy}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-dark-text">{req.name}</span>
                                                    <span className="text-[10px] text-primary-teal uppercase font-bold">{req.relation}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${req.status === 'Verified' ? 'bg-success/10 text-success border-success/20' : 'bg-soft-teal/10 text-soft-teal border-soft-teal/20'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-muted-text">{req.time}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 bg-success/10 text-success rounded-lg hover:bg-success hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                                    <button className="p-2 bg-light-bg text-muted-text rounded-lg hover:text-primary-teal transition-all"><ChevronRight size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Live Alerts & Monitoring */}
                <div className="flex flex-col gap-6">
                    <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-error/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10 text-error">
                            <ShieldAlert size={24} className="animate-pulse" /> Critical Alerts
                        </h3>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="bg-error/10 border border-error/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-error text-white flex items-center justify-center font-black text-xs">!</div>
                                    <h4 className="font-bold text-sm">Gate 2 Intrusion Attempt</h4>
                                </div>
                                <p className="text-[11px] text-white/60 mb-3">Unauthorized wristband detected at perimeter G2. System blocked access.</p>
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-all">Dismiss</button>
                                    <button className="px-4 py-1.5 bg-error text-white rounded-lg text-[10px] font-bold uppercase transition-all">Dispatch Patrol</button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card padding="large" className="bg-gradient-to-br from-primary-teal/5 to-white border-primary-teal/10">
                        <h4 className="font-extrabold text-[#0F172A] mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Smartphone className="text-primary-teal" size={16} /> Device Management
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-teal/10 text-primary-teal flex items-center justify-center"><CheckCircle2 size={20} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-text">Wristband 88-X2</p>
                                        <p className="text-[10px] text-muted-text font-medium uppercase">Active • Battery 94%</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-success rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50 opcaity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-muted-text flex items-center justify-center"><AlertTriangle size={20} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-muted-text">Wristband 45-Y1</p>
                                        <p className="text-[10px] text-muted-text font-medium uppercase">Lost Report • Deactivated</p>
                                    </div>
                                </div>
                            </div>
                            <Button fullWidth variant="outline" className="h-12 rounded-2xl border-gray-200 text-xs font-black uppercase tracking-widest">
                                Manage All Devices
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Safety;
