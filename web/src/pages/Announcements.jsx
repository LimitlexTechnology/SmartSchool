import React, { useState, useEffect } from 'react';
import { 
    Megaphone, Plus, Trash2, Calendar, 
    User, Target, ChevronRight, X,
    AlertCircle, CheckCircle2, Loader2, Send,
    BookOpen, Users
} from 'lucide-react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        targetGroup: 'all',
        priority: 'Medium'
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const userRole = localStorage.getItem('userRole') || 'admin';
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const schoolId = localStorage.getItem('schoolId') || 'local';
            const res = await fetch('/api/announcements', {
                headers: { 'x-school-id': schoolId }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Publishing announcement...' });
        try {
            const schoolId = localStorage.getItem('schoolId') || 'local';
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-school-id': schoolId
                },
                body: JSON.stringify(newAnnouncement)
            });
            if (res.ok) {
                setStatus({ type: 'success', message: 'Announcement published successfully!' });
                setNewAnnouncement({ title: '', content: '', targetGroup: 'all', priority: 'Medium' });
                setIsModalOpen(false);
                fetchAnnouncements();
            } else {
                setStatus({ type: 'error', message: 'Failed to publish announcement.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An error occurred.' });
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-dark-text tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                            <Megaphone size={28} />
                        </div>
                        Announcements
                    </h1>
                    <p className="text-muted-text mt-2 font-medium">Broadcast messages to your school community</p>
                </div>
                
                {isAdmin && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-primary-teal text-white rounded-2xl font-bold shadow-lg shadow-primary-teal/20 hover:bg-secondary-teal transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus size={20} /> Create Announcement
                    </button>
                )}
            </div>

            {/* Quick Stats / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Megaphone size={22} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-dark-text">{announcements.length}</p>
                        <p className="text-xs font-bold text-muted-text uppercase tracking-widest">Total Broadcasts</p>
                    </div>
                </div>
                {/* More stats if needed */}
            </div>

            {/* Announcements List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 size={40} className="text-primary-teal animate-spin" />
                        <p className="text-muted-text font-bold animate-pulse">Fetching latest updates...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((ann, idx) => (
                        <div 
                            key={ann.id} 
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className="bg-white group rounded-3xl border border-gray-100 shadow-soft-sm p-6 hover:border-primary-teal/30 transition-all animate-in slide-in-from-bottom-5 duration-500 fill-mode-both"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                            ann.type === 'global' 
                                            ? 'bg-amber-100 text-amber-700' 
                                            : 'bg-primary-teal/10 text-primary-teal'
                                        }`}>
                                            {ann.type === 'global' ? 'Platform Wide' : 'School Official'}
                                        </span>
                                        <span className="text-[11px] font-bold text-muted-text flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(ann.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-dark-text mb-2 group-hover:text-primary-teal transition-colors">
                                        {ann.title}
                                    </h3>
                                    <p className="text-muted-text leading-relaxed whitespace-pre-wrap">
                                        {ann.content}
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 text-[11px] font-bold text-muted-text">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <User size={12} /> {ann.author}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                                            <Target size={12} /> Target: <span className="text-primary-teal uppercase">{ann.targetGroup}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isAdmin && ann.type !== 'global' && (
                                        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Megaphone size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-dark-text mb-2">No announcements yet</h3>
                        <p className="text-muted-text max-w-sm mx-auto">Create your first broadcast to keep your school community informed and engaged.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-4xl p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Send className="w-6 h-6 text-dark-text" />
                                <h2 className="text-xl font-bold text-dark-text tracking-tight">Compose Announcement</h2>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-muted-text"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 border-b border-gray-50 pb-6">Send important messages to students and staff members</p>

                        <form onSubmit={handleCreate} className="flex flex-col gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-dark-text">Title <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    value={newAnnouncement.title}
                                    onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                                    placeholder="Enter announcement title"
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FB] border-none focus:ring-2 focus:ring-primary-teal outline-none transition text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-dark-text">Recipients <span className="text-red-500">*</span></label>
                                <div className="flex items-center gap-6">
                                    {[
                                        { id: 'students', label: 'Students', icon: <BookOpen className="w-4 h-4 ml-1.5" /> },
                                        { id: 'staff', label: 'Staff', icon: <User className="w-4 h-4 ml-1.5" /> },
                                        { id: 'all', label: 'All', icon: <Users className="w-4 h-4 ml-1.5" /> }
                                    ].map(group => (
                                        <button 
                                            key={group.id} 
                                            type="button"
                                            onClick={() => setNewAnnouncement({...newAnnouncement, targetGroup: group.id})}
                                            className="flex items-center gap-2 cursor-pointer group"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                newAnnouncement.targetGroup === group.id 
                                                ? 'bg-[#0f172a] border-[#0f172a]' 
                                                : 'border-gray-300 group-hover:border-gray-400'
                                            }`}>
                                                {newAnnouncement.targetGroup === group.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="flex items-center gap-1.5 text-sm font-medium text-dark-text">
                                                {group.icon}
                                                {group.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-dark-text">Priority Level</label>
                                <select 
                                    value={newAnnouncement.priority || 'Medium'}
                                    onChange={e => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FB] border-none focus:ring-2 focus:ring-primary-teal outline-none transition text-sm text-dark-text cursor-pointer appearance-none"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-dark-text">Message <span className="text-red-500">*</span></label>
                                <textarea 
                                    required
                                    rows={5}
                                    value={newAnnouncement.content}
                                    onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                                    placeholder="Type your announcement message here..."
                                    className="w-full px-4 py-3 rounded-xl bg-[#F8F9FB] border-none focus:ring-2 focus:ring-primary-teal outline-none transition text-sm resize-none"
                                />
                                <p className="text-xs text-gray-400 font-medium">{newAnnouncement.content.length} characters</p>
                            </div>

                            {status.message && (
                                <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold ${
                                    status.type === 'error' ? 'bg-rose-50 text-rose-600' : 
                                    status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                                    'bg-blue-50 text-blue-600'
                                } animate-in slide-in-from-top-2`}>
                                    {status.type === 'error' ? <AlertCircle size={18} /> : 
                                     status.type === 'success' ? <CheckCircle2 size={18} /> : 
                                     <Loader2 size={18} className="animate-spin" />}
                                    {status.message}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setNewAnnouncement({ title: '', content: '', targetGroup: 'all', priority: 'Medium' })}
                                    className="px-8 py-2.5 rounded-xl font-bold border border-gray-200 text-dark-text hover:bg-gray-50 transition text-sm"
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    disabled={status.type === 'loading'}
                                    className="px-8 py-2.5 bg-[#0f172a] text-white rounded-xl font-bold hover:bg-[#1e293b] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Send size={16} className="-rotate-45 -mt-0.5" /> Send Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
