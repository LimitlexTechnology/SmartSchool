import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    ChevronRight,
    Search,
    Filter,
    BarChart3,
    ArrowUpRight,
    Bell,
    UserMinus,
    Check
} from 'lucide-react';

const Attendance = () => {
    const [selectedClass, setSelectedClass] = useState('10B');
    const [date, setDate] = useState('Oct 18, 2026');

    const stats = [
        { label: 'Present Today', value: '94%', sub: '420 Students', icon: CheckCircle2, color: 'primary' },
        { label: 'Late Arrival', value: '4%', sub: '18 Students', icon: Clock, color: 'soft' },
        { label: 'Absent', value: '2%', sub: '9 Students', icon: XCircle, color: 'error' }
    ];

    const studentList = [
        { id: 1, name: 'John Doe', status: 'Present', time: '07:45 AM', streak: '12 days', avatar: 'JD' },
        { id: 2, name: 'Sarah Smith', status: 'Late', time: '08:15 AM', streak: '3 days', avatar: 'SS' },
        { id: 3, name: 'Mike Johnson', status: 'Absent', time: '-', streak: '0 days', avatar: 'MJ' },
        { id: 4, name: 'Emily Brown', status: 'Present', time: '07:50 AM', streak: '5 days', avatar: 'EB' },
        { id: 5, name: 'Oliver Twist', status: 'Present', time: '07:30 AM', streak: '20 days', avatar: 'OT' },
    ];

    const StatusBadge = ({ status }) => {
        const styles = {
            Present: 'bg-success/10 text-success border-success/20',
            Late: 'bg-soft-teal/10 text-soft-teal border-soft-teal/20',
            Absent: 'bg-error/10 text-error border-error/20',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Attendance Tracking</h1>
                    <p className="text-muted-text mt-1">Real-time attendance insights via Smart Wristbands.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {['10A', '10B', '10C'].map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedClass(c)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${selectedClass === c ? 'bg-[#0F172A] text-white shadow-md' : 'text-muted-text hover:text-primary-teal'}`}
                            >
                                Class {c}
                            </button>
                        ))}
                    </div>
                    <Button className="flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary-teal/20">
                        <Calendar size={18} />
                        {date}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} padding="large" className="group hover:border-primary-teal transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                                ${stat.color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
                                ${stat.color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
                                ${stat.color === 'error' ? 'bg-error/10 text-error' : ''}
                            `}>
                                <stat.icon size={24} />
                            </div>
                            <div className="p-2 bg-light-bg rounded-lg">
                                <ArrowUpRight size={16} className="text-success" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-[#0F172A] mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{stat.label}: <span className="text-dark-text">{stat.sub}</span></p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roll Call List */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-primary-teal" /> Class Roll Call
                            </h3>
                            <div className="relative group w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text group-hover:text-primary-teal transition-all" size={16} />
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-light-bg border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-teal/20 transition-all font-medium"
                                    placeholder="Search student..."
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-light-bg/50">
                                    <tr className="text-[10px] font-black uppercase text-muted-text border-b border-gray-50">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Check-in Time</th>
                                        <th className="px-6 py-4">Streak</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {studentList.map(student => (
                                        <tr key={student.id} className="group hover:bg-light-bg/30 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary-teal font-bold text-xs shadow-sm">
                                                        {student.avatar}
                                                    </div>
                                                    <span className="font-bold text-dark-text">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={student.status} /></td>
                                            <td className="px-6 py-4 text-sm font-medium text-muted-text">{student.time}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary-teal">
                                                    <BarChart3 size={14} /> {student.streak}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 text-muted-text hover:text-primary-teal hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-light-bg/30 border-t border-gray-50 flex justify-center">
                            <Button variant="outline" className="text-xs uppercase tracking-widest font-black h-10 px-8">Load More Records</Button>
                        </div>
                    </Card>
                </div>

                {/* Notifications & Settings */}
                <div className="flex flex-col gap-6">
                    <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Bell size={24} className="text-soft-teal" /> Absence Alerts
                        </h3>
                        <div className="flex flex-col gap-4 relative z-10">
                            {[
                                { name: 'Mike Johnson', time: '08:30 AM', msg: 'Parent notified via SMS' },
                                { name: 'Sarah Smith', time: '08:35 AM', msg: 'Late arrival recorded' }
                            ].map((alert, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm">{alert.name}</h4>
                                        <span className="text-[10px] font-black text-white/40 uppercase uppercase">{alert.time}</span>
                                    </div>
                                    <p className="text-xs text-white/60 flex items-center gap-1">
                                        <Check size={12} className="text-success" /> {alert.msg}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-6 w-full bg-white/10 hover:bg-white/20 border-white/20 h-12 rounded-2xl">
                            View All Alerts
                        </Button>
                    </Card>

                    <Card padding="large">
                        <h4 className="font-extrabold text-[#0F172A] mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Settings className="text-primary-teal" size={16} /> Quick Policy
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-dark-text">Auto-SMS for Absents</p>
                                    <p className="text-[10px] text-muted-text font-medium uppercase uppercase">Enabled at 08:30 AM</p>
                                </div>
                                <div className="w-10 h-5 bg-primary-teal rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-dark-text">Late Marks Grace Period</p>
                                    <p className="text-[10px] text-muted-text font-medium uppercase uppercase">15 Minutes Allowed</p>
                                </div>
                                <span className="text-xs font-bold text-primary-teal">Edit</span>
                            </div>
                            <Button fullWidth variant="outline" className="border-error/20 text-error hover:bg-error/5 flex items-center gap-2 h-11">
                                <UserMinus size={16} /> Report Emergency
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
