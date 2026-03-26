import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    Search, 
    Megaphone, 
    Trash2, 
    Users, 
    Calendar, 
    Clock, 
    Plus, 
    X, 
    Send, 
    CheckCircle2, 
    AlertCircle, 
    Loader2,
    User,
    Mail,
    RefreshCw,
    GraduationCap,
    Bell
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const clx = (...c) => c.filter(Boolean).join(' ');

const Messages = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [readMessages, setReadMessages] = useState(() => {
        const saved = localStorage.getItem('readAnnouncements');
        return new Set(saved ? JSON.parse(saved) : []);
    });
    
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        targetGroup: ['all'],
        priority: 'Medium',
        scheduledAt: '',
        deliveryChannels: ['system']
    });
    const [isScheduling, setIsScheduling] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'scheduled'
    const [status, setStatus] = useState({ type: '', message: '' });
    
    // Academic & Profile State
    const [profile, setProfile] = useState({ name: '', role: '', profilePicture: null, schoolName: '', schoolLogo: null });
    const [academicYear, setAcademicYear] = useState(() => localStorage.getItem('academicYearLabel') || '2025/2026');
    const [academicTerm, setAcademicTerm] = useState(() => localStorage.getItem('academicTermLabel') || 'Second Term');

    const userRole = localStorage.getItem('userRole') || 'admin';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    const canBroadcast = isAdmin || userRole === 'teacher';

    const fetchAnnouncements = async (selectFirst = false) => {
        setLoading(true);
        try {
            const schoolId = localStorage.getItem('schoolId') || 'local';
            console.log('Messages Page: Fetching for schoolId:', schoolId);
            const endpoint = activeTab === 'scheduled' ? '/api/announcements?scheduled=true' : '/api/announcements';
            
            // Fetch announcements
            const res = await fetch(endpoint, {
                headers: { 'x-school-id': schoolId }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAnnouncements(data);
                if (data.length > 0 && (selectFirst || !selectedMessage)) {
                    setSelectedMessage(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching announcements or dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const role = localStorage.getItem('userRole') || 'admin';
            let endpoint = '/api/school-auth/profile';
            if (role === 'superadmin') endpoint = '/api/superadmin-auth/profile';
            
            const profRes = await fetch(endpoint).then(r => r.ok ? r.json() : null).catch(() => null);
            if (profRes) {
                setProfile({
                    name: profRes.adminName || profRes.name || 'Admin',
                    role: role === 'admin' ? 'School Admin' : (profRes.role || 'Super Admin'),
                    profilePicture: profRes.adminProfilePicture || profRes.profilePicture || null,
                    schoolName: profRes.schoolName || 'SmartSchool',
                    schoolLogo: profRes.schoolLogo || null
                });
            }
        } catch (err) {
            console.error('Profile fetch failed:', err);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchAnnouncements();
            fetchProfile();
            // Deep linking support
            const params = new URLSearchParams(window.location.search);
            const msgId = params.get('id');
            if (msgId) {
                const found = announcements.find(m => m.id === msgId);
                if (found) setSelectedMessage(found);
            }
        };
        load();

        // Auto-refresh every 2 minutes
        const interval = setInterval(() => {
            fetchAnnouncements(false);
        }, 120000);
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        const handlePeriodChange = (e) => {
            if (e.detail) {
                setAcademicYear(e.detail.year);
                setAcademicTerm(e.detail.term);
            }
        };
        window.addEventListener('academicPeriod:change', handlePeriodChange);
        return () => window.removeEventListener('academicPeriod:change', handlePeriodChange);
    }, []);

    // Enhanced deep-linking: Watch announcements for changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const msgId = params.get('id');
        if (msgId && announcements.length > 0) {
            const found = announcements.find(m => m.id === msgId);
            if (found) {
                setSelectedMessage(found);
                markAsRead(found.id);
            }
        }
    }, [announcements]);

    const markAsRead = (id) => {
        setReadMessages(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('readAnnouncements', JSON.stringify([...next]));
            return next;
        });
    };

    const handleSelectMessage = (msg) => {
        setSelectedMessage(msg);
        markAsRead(msg.id);
    };

    const unreadMessages = announcements.filter(m => !readMessages.has(m.id));
    const unreadCount = unreadMessages.length;

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Broadcasting...' });
        try {
            const schoolId = localStorage.getItem('schoolId') || 'local';

            // Append signature
            const signature = `\n\nBest Regards,\n${profile.name || 'School Admin'} - SmartSchool`;
            const finalContent = newAnnouncement.content + signature;

            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-school-id': schoolId
                },
                body: JSON.stringify({
                    ...newAnnouncement,
                    content: finalContent,
                    targetGroup: newAnnouncement.targetGroup.join(','),
                    authorName: profile.name,
                    authorRole: profile.role
                })
            });

            if (res.ok) {
                setStatus({ type: 'success', message: isScheduling ? 'Announcement scheduled successfully!' : 'Announcement published successfully!' });
                setNewAnnouncement({ title: '', content: '', targetGroup: ['all'], priority: 'Medium', scheduledAt: '', deliveryChannels: ['system'] });
                setIsScheduling(false);
                setTimeout(() => {
                    setIsBroadcastModalOpen(false);
                    setStatus({ type: '', message: '' });
                }, 1500);
                
                if (isScheduling) {
                    setActiveTab('scheduled');
                } else {
                    setActiveTab('inbox');
                    fetchAnnouncements(true);
                }
            } else {
                const err = await res.json();
                setStatus({ type: 'error', message: err.error || 'Failed to publish announcement.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred.' });
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const schoolId = localStorage.getItem('schoolId') || 'local';
            const res = await fetch(`/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'x-school-id': schoolId }
            });
            if (res.ok) {
                if (selectedMessage?.id === id) setSelectedMessage(null);
                fetchAnnouncements();
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };
    
    const getTargetLabel = (target) => {
        if (!target) return 'All Staff & Students';
        const parts = target.split(',').map(t => t.trim().toLowerCase());
        if (parts.includes('all')) return 'All Staff & Students';
        const roles = [];
        if (parts.includes('students')) roles.push('Students');
        if (parts.includes('staff')) roles.push('Staff');
        
        if (roles.length === 2) return 'All Staff & Students';
        if (roles.length === 1) return roles[0] + ' Only';
        return 'Targeted Group';
    };

    const filteredMessages = announcements.filter(msg => {
        const search = searchQuery.toLowerCase();
        return (
            (msg.title || '').toLowerCase().includes(search) ||
            (msg.content || '').toLowerCase().includes(search) ||
            (msg.author || '').toLowerCase().includes(search)
        );
    });

    const getPriorityStyles = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-error text-white';
            case 'medium': return 'bg-dark-text text-white';
            case 'low': return 'bg-gray-100 text-dark-text';
            default: return 'bg-gray-100 text-dark-text';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] font-inter overflow-hidden">
            {/* ── NEW PREMIUM HEADER ── */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Send Messages</h1>
                        <p className="text-sm text-gray-500 font-medium">Create and manage your school announcements</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Actions */}
                        <div className="flex items-center gap-2 relative">
                            {isAdmin && (
                                <button 
                                    onClick={() => {
                                        setNewAnnouncement({ title: '', content: '', targetGroup: ['all'], priority: 'Medium', scheduledAt: '', deliveryChannels: ['system'] });
                                        setIsScheduling(false);
                                        setIsBroadcastModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 bg-primary-teal text-white px-4 py-2 rounded-xl text-sm font-bold shadow-soft-xl hover:bg-opacity-90 transition active:scale-95 mr-2"
                                >
                                    <Plus size={18} />
                                    <span>New Message</span>
                                </button>
                            )}

                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setIsNotificationOpen(!isNotificationOpen);
                                        if (unreadCount > 0 && isNotificationOpen) {
                                            // Handle closing logic if needed
                                        }
                                    }}
                                    title="Notifications"
                                    className={clx(
                                        "p-2.5 rounded-xl transition-all relative active:scale-95",
                                        isNotificationOpen ? "bg-primary-teal text-white" : "bg-gray-50 text-gray-500 hover:text-primary-teal"
                                    )}
                                >
                                    <Bell size={20} className={clx(loading && 'animate-pulse')} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce-short">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[80]" onClick={() => setIsNotificationOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 z-[90] overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                                <h3 className="text-sm font-black text-dark-text tracking-tight uppercase">Notifications</h3>
                                                <button 
                                                    onClick={() => {
                                                        announcements.forEach(m => markAsRead(m.id));
                                                        setIsNotificationOpen(false);
                                                    }}
                                                    className="text-[10px] font-black text-primary-teal hover:underline uppercase tracking-widest"
                                                >
                                                    Mark All Read
                                                </button>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                                {unreadMessages.length === 0 ? (
                                                    <div className="px-8 py-12 text-center opacity-40">
                                                        <CheckCircle2 size={32} className="mx-auto mb-3 text-success" />
                                                        <p className="text-xs font-bold text-dark-text tracking-tight uppercase">All caught up!</p>
                                                    </div>
                                                ) : (
                                                    unreadMessages.map(msg => (
                                                        <div 
                                                            key={msg.id}
                                                            onClick={() => {
                                                                handleSelectMessage(msg);
                                                                setIsNotificationOpen(false);
                                                            }}
                                                            className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                                                        >
                                                            <div className="flex items-center justify-between gap-3 mb-1">
                                                                <h4 className="text-xs font-black text-dark-text line-clamp-1 group-hover:text-primary-teal">{msg.title}</h4>
                                                                <span className={clx(
                                                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                                                                    msg.priority === 'High' ? 'bg-error/10 text-error' : 'bg-gray-100 text-dark-text'
                                                                )}>
                                                                    {msg.priority}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-muted-text line-clamp-2 leading-relaxed opacity-70 mb-2">
                                                                {msg.content}
                                                            </p>
                                                            <span className="text-[9px] font-bold text-gray-400">
                                                                {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                <button 
                                                    onClick={() => {
                                                        setActiveTab('inbox');
                                                        setIsNotificationOpen(false);
                                                    }}
                                                    className="w-full py-2 bg-white rounded-xl text-[10px] font-black text-dark-text shadow-sm hover:shadow-md transition-all uppercase tracking-widest"
                                                >
                                                    View All Inbox
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card-based Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={clx(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left group",
                            activeTab === 'inbox' 
                                ? "bg-white border-primary-teal shadow-soft-xl" 
                                : "bg-gray-50 border-transparent hover:border-gray-200"
                        )}
                    >
                        <div className={clx(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            activeTab === 'inbox' ? "bg-primary-teal text-white" : "bg-white text-gray-400 group-hover:text-primary-teal"
                        )}>
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className={clx(
                                "text-sm font-black uppercase tracking-widest",
                                activeTab === 'inbox' ? "text-primary-teal" : "text-gray-400"
                            )}>Send Messages</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-[#0F172A]">{activeTab === 'inbox' ? announcements.length : '...'}</p>
                                <p className="text-[10px] font-bold text-gray-400">Total Sent</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('scheduled')}
                        className={clx(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left group",
                            activeTab === 'scheduled' 
                                ? "bg-white border-orange-500 shadow-soft-xl" 
                                : "bg-gray-50 border-transparent hover:border-gray-200"
                        )}
                    >
                        <div className={clx(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            activeTab === 'scheduled' ? "bg-orange-500 text-white" : "bg-white text-gray-400 group-hover:text-orange-500"
                        )}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className={clx(
                                "text-sm font-black uppercase tracking-widest",
                                activeTab === 'scheduled' ? "text-orange-500" : "text-gray-400"
                            )}>Scheduled Messages</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-[#0F172A]">{activeTab === 'scheduled' ? announcements.length : '...'}</p>
                                <p className="text-[10px] font-bold text-gray-400">Pending</p>
                            </div>
                        </div>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* ─── Sidebar: Message List ─── */}
                <div className="w-[380px] border-r border-gray-100 bg-white flex flex-col">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-dark-text">Inbox</h2>
                                <p className="text-xs text-muted-text">{announcements.length} messages</p>
                            </div>
                            <button onClick={() => fetchAnnouncements()} className="p-2 text-muted-text hover:text-primary-teal transition-colors" title="Sync Inbox">
                                <RefreshCw size={16} className={clx(loading && 'animate-spin text-primary-teal')} />
                            </button>
                        </div>
                        
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-teal transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="Search announcements..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none text-sm font-medium focus:ring-2 focus:ring-primary-teal/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 custom-scrollbar">
                        {loading && announcements.length === 0 ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-gray-50 animate-pulse border border-gray-100" />
                            ))
                        ) : filteredMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <MessageSquare size={48} strokeWidth={1} />
                                <p className="text-sm font-bold mt-4">No messages found</p>
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={clx(
                                        "p-5 rounded-2xl border-2 transition-all cursor-pointer relative group",
                                        selectedMessage?.id === msg.id 
                                            ? 'border-dark-text bg-white shadow-xl shadow-gray-200/50' 
                                            : 'border-gray-100 hover:border-gray-300 bg-white'
                                    )}
                                >
                                    {!readMessages.has(msg.id) && (
                                        <div className="absolute top-4 -left-1 w-2.5 h-2.5 bg-primary-teal rounded-full shadow-lg shadow-primary-teal/40" />
                                    )}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className={`text-sm font-bold leading-tight ${selectedMessage?.id === msg.id ? 'text-dark-text' : 'text-gray-700'}`}>
                                            {msg.title}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${getPriorityStyles(msg.priority)}`}>
                                            {msg.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-text line-clamp-2 leading-relaxed mb-4">
                                        {msg.content}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <div className="flex items-center gap-1.5 text-muted-text group-hover:text-primary-teal transition-colors">
                                            <Users size={12} />
                                            <span>{getTargetLabel(msg.targetGroup)}</span>
                                        </div>
                                        <span className="text-gray-400">
                                            {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Reading Pane ─── */}
                <div className="flex-1 bg-white overflow-hidden flex flex-col">
                    {selectedMessage ? (
                        <div className="h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Message Heading */}
                            <div className="p-12 pb-8">
                                <h1 className="text-3xl font-black text-dark-text mb-6 leading-tight tracking-tight">
                                    {selectedMessage.title}
                                </h1>
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getPriorityStyles(selectedMessage.priority)}`}>
                                        {selectedMessage.priority} priority
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-dark-text text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} /> {getTargetLabel(selectedMessage.targetGroup)}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-100 w-full mb-8" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-dark-text">{selectedMessage.authorName || 'School Administration'}</div>
                                            <div className="text-xs font-bold text-muted-text">{selectedMessage.authorRole || 'Principal'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-dark-text flex items-center justify-end gap-2">
                                            <Calendar size={14} className="text-muted-text" />
                                            {new Date(selectedMessage.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-xs font-black text-muted-text uppercase tracking-widest mt-1 flex items-center justify-end gap-2">
                                            <Clock size={14} />
                                            {new Date(selectedMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full mt-8" />
                            </div>

                            {/* Content body */}
                            <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar">
                                <div className="max-w-[800px] text-lg text-dark-text leading-[1.8] font-medium opacity-90 whitespace-pre-wrap">
                                    {selectedMessage.content}
                                </div>

                                {isAdmin && (
                                    <div className="mt-16 pt-8 border-t border-gray-100 flex items-center gap-4">
                                        <button 
                                            onClick={() => handleDeleteAnnouncement(selectedMessage.id)}
                                            className="px-6 py-3 rounded-xl border border-error/20 text-error hover:bg-error/5 text-sm font-bold transition-all flex items-center gap-2"
                                        >
                                            <Trash2 size={18} /> Delete Announcement
                                        </button>
                                        <p className="text-xs font-bold text-muted-text italic">Only administrators can delete school announcements.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50 bg-gray-50/30">
                            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-primary-teal mb-8">
                                <Mail size={40} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-black text-dark-text mb-2">No Message Selected</h2>
                            <p className="max-w-xs text-sm font-bold text-muted-text leading-relaxed">
                                Select an announcement from the list to view its contents and recipient details.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Broadcast Modal */}
            {isBroadcastModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark-text/40 backdrop-blur-md" onClick={() => setIsBroadcastModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-10 pt-10 pb-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-teal text-white flex items-center justify-center shadow-lg shadow-primary-teal/20">
                                        <Megaphone size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-dark-text tracking-tight">Create Announcement</h2>
                                        <p className="text-xs font-bold text-muted-text">Broadcast a message to your school community</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsBroadcastModalOpen(false)} className="p-3 rounded-2xl hover:bg-gray-100 text-muted-text transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-dark-text">Announcement Title *</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="e.g. End of Term Examination Schedule"
                                        value={newAnnouncement.title}
                                        onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-teal/20 focus:bg-white outline-none text-sm font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-dark-text">Target Recipients *</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'all', label: 'All Staff & Students', icon: <Megaphone size={14} /> },
                                            { id: 'students', label: 'Students Only', icon: <GraduationCap size={14} /> },
                                            { id: 'staff', label: 'Staff Only', icon: <Users size={14} /> }
                                        ].map(group => (
                                            <label 
                                                key={group.id}
                                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer border-2 transition-all ${
                                                    newAnnouncement.targetGroup.includes(group.id)
                                                    ? 'bg-primary-teal border-primary-teal text-white shadow-lg shadow-primary-teal/20'
                                                    : 'bg-gray-50 border-transparent text-muted-text hover:bg-gray-100'
                                                }`}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={newAnnouncement.targetGroup.includes(group.id)}
                                                    onChange={() => {
                                                        const current = newAnnouncement.targetGroup;
                                                        let next;
                                                        if (group.id === 'all') next = ['all'];
                                                        else {
                                                            const filtered = current.filter(id => id !== 'all');
                                                            next = current.includes(group.id) ? filtered.filter(id => id !== group.id) : [...filtered, group.id];
                                                            if (next.length === 0) next = ['all'];
                                                        }
                                                        setNewAnnouncement({...newAnnouncement, targetGroup: next});
                                                    }}
                                                />
                                                {group.icon}
                                                <span className="text-xs font-bold leading-none">{group.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-dark-text">Priority Level</label>
                                        <select 
                                            value={newAnnouncement.priority}
                                            onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-teal/20 outline-none text-sm font-bold"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-dark-text flex items-center justify-between">
                                            Scheduling
                                            <button type="button" onClick={() => setIsScheduling(!isScheduling)} className={`text-[10px] font-black uppercase tracking-widest ${isScheduling ? 'text-primary-teal' : 'text-muted-text'}`}>
                                                {isScheduling ? 'Cancel' : 'Set Time'}
                                            </button>
                                        </label>
                                        {isScheduling ? (
                                            <input 
                                                type="datetime-local"
                                                value={newAnnouncement.scheduledAt}
                                                onChange={(e) => setNewAnnouncement({...newAnnouncement, scheduledAt: e.target.value})}
                                                className="w-full px-6 py-4 bg-light-bg rounded-2xl border-2 border-primary-teal/20 outline-none text-sm font-bold animate-in slide-in-from-top-2"
                                            />
                                        ) : (
                                            <div className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-center text-[10px] font-black text-muted-text uppercase tracking-widest opacity-60">
                                                Publishing Instantly
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-dark-text">Delivery Method</label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'system', label: 'System', icon: <Megaphone size={14} /> },
                                            { id: 'sms', label: 'SMS', icon: <MessageSquare size={14} /> },
                                            { id: 'email', label: 'Email', icon: <Mail size={14} /> }
                                        ].map(ch => (
                                            <label 
                                                key={ch.id}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl cursor-pointer border-2 transition-all ${
                                                    newAnnouncement.deliveryChannels?.includes(ch.id)
                                                    ? 'bg-primary-teal border-primary-teal text-white shadow-lg shadow-primary-teal/20'
                                                    : 'bg-gray-50 border-transparent text-muted-text hover:bg-gray-100'
                                                }`}
                                            >
                                                <input 
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={newAnnouncement.deliveryChannels?.includes(ch.id)}
                                                    onChange={() => {
                                                        const current = newAnnouncement.deliveryChannels || ['system'];
                                                        const next = current.includes(ch.id) 
                                                            ? current.filter(id => id !== ch.id) 
                                                            : [...current, ch.id];
                                                        setNewAnnouncement({...newAnnouncement, deliveryChannels: next.length ? next : ['system']});
                                                    }}
                                                />
                                                {ch.icon}
                                                <span className="text-xs font-black uppercase tracking-tight">{ch.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-dark-text">Message Content *</label>
                                    <textarea 
                                        required
                                        value={newAnnouncement.content}
                                        onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                                        className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary-teal/20 focus:bg-white outline-none transition-all text-sm font-medium h-40 resize-none leading-relaxed"
                                        placeholder="Dear community..."
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 pb-10">
                                    <div className="flex-1">
                                        {status.message && (
                                            <div className={`flex items-center gap-2 text-xs font-bold ${status.type === 'error' ? 'text-error' : 'text-success'}`}>
                                                {status.type === 'loading' ? <Loader2 className="animate-spin" size={16} /> : status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                {status.message}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={status.type === 'loading'}
                                        className="bg-primary-teal text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-teal/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {isScheduling ? 'Schedule Post' : 'Post Broadcast'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messages;
