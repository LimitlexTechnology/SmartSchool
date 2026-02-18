import React from 'react';
import Card from '../components/ui/Card';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    MoreVertical,
    Calendar,
    Clock,
    Plus
} from 'lucide-react';

const StatCard = ({ title, value, trend, isUp, icon: Icon, color }) => (
    <Card padding="large" className="hover:border-primary-teal transition-all group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 transition-all duration-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20
      ${color === 'primary' ? 'bg-primary-teal' : ''}
      ${color === 'secondary' ? 'bg-secondary-teal' : ''}
      ${color === 'soft' ? 'bg-soft-teal' : ''}
      ${color === 'success' ? 'bg-success' : ''}
    `}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5
        ${color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
        ${color === 'secondary' ? 'bg-secondary-teal/10 text-secondary-teal' : ''}
        ${color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
        ${color === 'success' ? 'bg-success/10 text-success' : ''}
      `}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <div className="relative z-10">
            <h3 className="text-3xl font-black text-[#0F172A] tracking-tighter mb-1">{value}</h3>
            <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{title}</p>
        </div>
    </Card>
);

const Dashboard = () => {
    const stats = [
        { title: 'Total Students', value: '1,248', trend: '+12.5%', isUp: true, icon: Users, color: 'primary' },
        { title: 'Total Teachers', value: '86', trend: '+2.4%', isUp: true, icon: GraduationCap, color: 'secondary' },
        { title: 'Active Classes', value: '42', trend: '0%', isUp: true, icon: BookOpen, color: 'soft' },
        { title: 'Revenue (MTD)', value: '$24.5k', trend: '+5.2%', isUp: true, icon: TrendingUp, color: 'success' }
    ];

    const recentActivity = [
        { id: 1, type: 'Assessment', title: 'Algebra Quiz Graded', time: '2 mins ago', info: 'Grade 10B • Average 84%', status: 'success' },
        { id: 2, type: 'Finance', title: 'Invoice Paid #INV-452', time: '15 mins ago', info: 'John Doe • Tuition Fee', status: 'primary' },
        { id: 3, type: 'Diary', title: 'New Class Memory Added', time: '1 hour ago', info: 'Science Lab • Ms. Sarah', status: 'soft' },
        { id: 4, type: 'Safety', title: 'Check-in Alert', time: '2 hours ago', info: 'Late arrival • Marcus G.', status: 'error' }
    ];

    const attendanceDate = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const attendanceData = [95, 92, 98, 94, 91];

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Main Dashboard</h1>
                    <p className="text-muted-text mt-1 font-medium italic">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col text-right pr-4 border-r border-gray-100">
                        <p className="text-xs font-black text-dark-text tracking-widest uppercase">Oct 18, 2026</p>
                        <p className="text-[10px] font-bold text-muted-text">09:45 AM GMT</p>
                    </div>
                    <div className="w-10 h-10 bg-primary-teal/10 text-primary-teal rounded-xl flex items-center justify-center">
                        <Calendar size={20} />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Chart Placeholder */}
                <Card padding="large" className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-primary-teal" />
                            <h3 className="text-xl font-bold">School Performance Trends</h3>
                        </div>
                        <select className="bg-light-bg border-none rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-widest outline-none cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>

                    <div className="h-[300px] flex items-end justify-between gap-6 px-4 mb-4">
                        {attendanceData.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full h-full flex flex-col justify-end gap-1">
                                    <div
                                        style={{ height: `${val}%` }}
                                        className="w-full bg-primary-teal rounded-t-2xl shadow-lg shadow-primary-teal/10 transition-all group-hover:bg-soft-teal group-hover:scale-y-105"
                                    ></div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-black text-[#0F172A]">{val}%</span>
                                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{attendanceDate[i]}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-50 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-3 h-3 bg-primary-teal rounded-full shadow-sm"></div>
                            <span className="text-xs font-bold text-muted-text">Attendance</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-3 h-3 bg-soft-teal rounded-full shadow-sm"></div>
                            <span className="text-xs font-bold text-muted-text">Avg. Assessment Score</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <div className="w-3 h-3 bg-secondary-teal rounded-full shadow-sm"></div>
                            <span className="text-xs font-bold text-muted-text">Quiz Participation</span>
                        </div>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card padding="large">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Live Activity</h3>
                        <button className="text-primary-teal hover:bg-primary-teal/5 p-2 rounded-xl transition-all">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-5">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-4 group cursor-pointer">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-md
                    ${activity.status === 'success' ? 'bg-success text-white' : ''}
                    ${activity.status === 'primary' ? 'bg-primary-teal text-white' : ''}
                    ${activity.status === 'soft' ? 'bg-soft-teal text-white' : ''}
                    ${activity.status === 'error' ? 'bg-error text-white' : ''}
                  `}>
                                        <Clock size={18} />
                                    </div>
                                    <div className="flex-1 w-0.5 bg-gray-100 my-1"></div>
                                </div>
                                <div className="pb-4">
                                    <h4 className="font-bold text-dark-text text-sm group-hover:text-primary-teal transition-colors">{activity.title}</h4>
                                    <p className="text-xs font-bold text-muted-text italic my-0.5">{activity.info}</p>
                                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 py-3 rounded-xl bg-light-bg text-dark-text font-black text-xs uppercase tracking-widest hover:bg-primary-teal hover:text-white transition-all flex items-center justify-center gap-2">
                        View All Activity <ChevronRight size={16} />
                    </button>
                </Card>
            </div>

            {/* Quick Glance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xl font-bold">Staff On Duty</h3>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Active Now</span>
                    </div>
                    <div className="flex flex-wrap gap-4 relative z-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 ring-2 ring-white/10 flex items-center justify-center font-bold text-xs text-soft-teal hover:ring-primary-teal transition-all cursor-pointer">
                                    {['SW', 'MJ', 'EB', 'LW', 'PK', 'AR'][i]}
                                </div>
                                <span className="text-[8px] font-bold text-white/50 uppercase">T. {['Sarah', 'Mike', 'Emily', 'Leo', 'Paul', 'Alex'][i]}</span>
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-2xl bg-primary-teal flex items-center justify-center text-white cursor-pointer hover:bg-soft-teal transition-colors">
                            <Plus size={20} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
