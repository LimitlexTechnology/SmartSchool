import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Lock,
    Users,
    Key,
    Eye,
    EyeOff,
    ShieldCheck,
    Database,
    FileText,
    Settings,
    ChevronRight,
    Search,
    UserCircle,
    Check,
    X,
    MoreVertical,
    Activity,
    Clock,
    Shield
} from 'lucide-react';

const Security = () => {
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [changing, setChanging] = useState(false);

    const roles = [
        { name: 'Admin', count: 4, desc: 'Full institutional control', color: 'primary' },
        { name: 'Teacher', count: 42, desc: 'Classroom & Assessment management', color: 'soft' },
        { name: 'Staff', count: 18, desc: 'Finance & Logistics access', color: 'secondary' },
        { name: 'Parent', count: 850, desc: 'Limited student-only data access', color: 'success' }
    ];

    const auditLogs = [
        { id: 1, user: 'Admin (Kobby)', action: 'Modified Finance Permissions', time: '10m ago', status: 'Success' },
        { id: 2, user: 'Staff (Maria)', action: 'Accessed Attendance Records', time: '45m ago', status: 'Success' },
        { id: 3, user: 'Unknown IP', action: 'Failed Login Attempt', time: '2h ago', status: 'Blocked' },
    ];

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }
        const role = localStorage.getItem('userRole') || 'admin';
        let url = '';
        if (role === 'teacher') {
            url = '/api/teacher-auth/password';
        } else if (role === 'admin') {
            url = '/api/school-auth/password';
        } else {
            alert('Super admin password is managed by platform settings.');
            return;
        }
        setChanging(true);
        try {
            const r = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (r.ok) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert('Password updated successfully');
            } else {
                const t = await r.json().catch(() => ({}));
                alert(t.error || 'Failed to update password');
            }
        } catch {
            alert('Network error while updating password');
        } finally {
            setChanging(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Security & Permissions</h1>
                    <p className="text-muted-text mt-1">Institutional role management and advanced data protection protocols.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-5 border-gray-200">
                        <Database size={18} />
                        Data Backups
                    </Button>
                    <Button className="flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary-teal/20">
                        <Lock size={18} />
                        Security Audit
                    </Button>
                </div>
            </div>

            {/* Change Password */}
            <Card padding="large" className="border-2 border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Lock className="text-primary-teal" /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <label className="block text-sm font-bold text-muted-text mb-2">Current Password</label>
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-teal"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(v => !v)}
                            className="absolute right-3 top-[38px] text-gray-500 hover:text-primary-teal"
                            title={showCurrent ? 'Hide' : 'Show'}
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-bold text-muted-text mb-2">New Password</label>
                        <input
                            type={showNew ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-teal"
                            placeholder="At least 6 characters"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(v => !v)}
                            className="absolute right-3 top-[38px] text-gray-500 hover:text-primary-teal"
                            title={showNew ? 'Hide' : 'Show'}
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-bold text-muted-text mb-2">Confirm New Password</label>
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl bg-white text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-teal"
                            placeholder="Re-enter new password"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(v => !v)}
                            className="absolute right-3 top-[38px] text-gray-500 hover:text-primary-teal"
                            title={showConfirm ? 'Hide' : 'Show'}
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
                <div className="mt-6">
                    <Button onClick={handleChangePassword} disabled={changing} className="h-11 px-6">
                        {changing ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </Card>

            {/* Role Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roles.map((role, i) => (
                    <Card
                        key={i}
                        padding="large"
                        onClick={() => setSelectedRole(role.name)}
                        className={`cursor-pointer transition-all border-2 ${selectedRole === role.name ? 'border-primary-teal bg-primary-teal/5' : 'hover:border-gray-200'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center 
                                ${role.color === 'primary' ? 'bg-primary-teal/10 text-primary-teal' : ''}
                                ${role.color === 'soft' ? 'bg-soft-teal/10 text-soft-teal' : ''}
                                ${role.color === 'secondary' ? 'bg-secondary-teal/10 text-secondary-teal' : ''}
                                ${role.color === 'success' ? 'bg-success/10 text-success' : ''}
                            `}>
                                <UserCircle size={24} />
                            </div>
                            <span className="text-xs font-black text-muted-text">{role.count}</span>
                        </div>
                        <h3 className="text-xl font-black text-[#0F172A] mb-1">{role.name}</h3>
                        <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{role.desc}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Permissions Management */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white relative">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Key className="text-primary-teal" /> {selectedRole} Permissions
                            </h3>
                            <Button variant="outline" className="h-9 px-4 text-xs font-black uppercase">Clone Role</Button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Dashboard Analytics', level: 'Full Access', status: true },
                                { title: 'Finance & Payments', level: 'View Only', status: true },
                                { title: 'Student Safety Alerts', level: 'Admin Required', status: false },
                                { title: 'AI Lesson Generation', level: 'Full Access', status: true },
                                { title: 'User Account Creation', level: 'No Access', status: false },
                                { title: 'System Configurations', level: 'No Access', status: false },
                            ].map((perm, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-light-bg/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                                    <div>
                                        <p className="text-sm font-bold text-dark-text">{perm.title}</p>
                                        <p className="text-[10px] text-muted-text font-medium uppercase">{perm.level}</p>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-all ${perm.status ? 'bg-primary-teal' : 'bg-gray-300'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${perm.status ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-light-bg/30 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-muted-text uppercase tracking-widest">
                            <span>Last updated 2 days ago</span>
                            <Button className="h-10 px-6">Save Permissions</Button>
                        </div>
                    </Card>
                </div>

                {/* Audit Logs */}
                <div className="flex flex-col gap-6">
                    <Card padding="large">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="text-primary-teal" /> Security Logs
                        </h3>
                        <div className="space-y-4">
                            {auditLogs.map(log => (
                                <div key={log.id} className="p-4 rounded-[24px] border border-gray-100 hover:border-primary-teal/30 hover:bg-light-bg/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-dark-text">{log.user}</h4>
                                        <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded-lg ${log.status === 'Success' ? 'text-success border-success/20' : 'text-error border-error/20 bg-error/5'}`}>
                                            {log.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-text mb-2">{log.action}</p>
                                    <div className="flex items-center justify-between text-[10px] font-black text-muted-text uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {log.time}</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button fullWidth variant="outline" className="mt-6 h-12 rounded-2xl border-gray-200 text-xs font-black uppercase tracking-widest">
                            Full Audit History
                        </Button>
                    </Card>

                    <Card className="bg-[#0F172A] p-8 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-soft-teal/20 rounded-full blur-3xl -mr-24 -mt-24" />
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                                <ShieldCheck size={32} className="text-soft-teal" />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Data Protection</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Your school&apos;s data is secured with AES-256 institutional encryption. Compliance: GDPR & Student privacy Act.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black text-success">
                                <Check size={16} /> Encryption Active
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Security;
