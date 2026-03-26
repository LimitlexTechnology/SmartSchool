import React, { useState, useEffect } from 'react';
import {
    Heart, MessageSquare, Share2, Image as ImageIcon,
    Video, Smile, MapPin, Send, Trash2, Globe,
    Users, Lock, ChevronDown, Loader2, RefreshCw,
    CheckCircle2, Bell, Bookmark, Calendar, TrendingUp,
    Award, MoreHorizontal, Plus, Search, UserPlus
} from 'lucide-react';

const clx = (...c) => c.filter(Boolean).join(' ');

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const AVATAR_GRADIENTS = [
    'from-violet-500 to-purple-700',
    'from-pink-400 to-rose-600',
    'from-emerald-400 to-teal-600',
    'from-blue-400 to-indigo-600',
    'from-amber-400 to-orange-600',
    'from-fuchsia-400 to-pink-600',
];
const getGradient = (name = '') =>
    AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

const Avatar = ({ name = 'A', size = 10 }) => (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br ${getGradient(name)} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
        {name[0]?.toUpperCase()}
    </div>
);

const RoleBadge = ({ role }) => {
    const styles = {
        admin: 'bg-violet-100 text-violet-700',
        teacher: 'bg-amber-100 text-amber-700',
        student: 'bg-emerald-100 text-emerald-700',
    };
    const key = (role || '').toLowerCase().includes('admin') ? 'admin'
              : (role || '').toLowerCase().includes('teacher') ? 'teacher' : 'student';
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles[key]}`}>
            {key}
        </span>
    );
};

const NAV_ITEMS = [
    { icon: Globe, label: 'Feed', badge: null },
    { icon: Users, label: 'My Network', badge: null },
    { icon: Bell, label: 'Notifications', badge: 12 },
    { icon: MessageSquare, label: 'Messages', badge: 5 },
    { icon: Bookmark, label: 'Saved Posts', badge: null },
    { icon: Calendar, label: 'Events', badge: null },
    { icon: TrendingUp, label: 'Trending', badge: null },
    { icon: Award, label: 'Achievements', badge: null },
];

const TRENDING = [
    { tag: '#SpringBreak2026', posts: '2.4k', color: 'bg-violet-500' },
    { tag: '#ScienceFair', posts: '1.5k', color: 'bg-emerald-500' },
    { tag: '#SchoolPride', posts: '3.2k', color: 'bg-rose-500' },
    { tag: '#Basketball', posts: '1.5k', color: 'bg-amber-500' },
    { tag: '#ArtShow', posts: '852', color: 'bg-blue-500' },
];

const SUGGESTED = [
    { name: 'Mr. David Chen', handle: '@mrchen', role: 'Teacher' },
    { name: 'Sarah Johnson', handle: '@sarahj', role: 'Student' },
    { name: 'Ms. Rodriguez', handle: '@mrods', role: 'Teacher' },
    { name: 'Alex Kumar', handle: '@alexk', role: 'Student' },
];

export default function SkullarConnect() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [draftContent, setDraftContent] = useState('');
    const [draftImageUrl, setDraftImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [commentInput, setCommentInput] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [activeNav, setActiveNav] = useState('Feed');

    const schoolId = localStorage.getItem('schoolId') || 'local';
    const userRole = localStorage.getItem('userRole') || 'admin';
    const schoolName = localStorage.getItem('schoolName') || 'SmartSchool';
    const userName = localStorage.getItem('schoolName') || localStorage.getItem('teacherName') || 'Admin';
    const userId = localStorage.getItem('userPhone') || localStorage.getItem('teacherId') || 'user';
    const displayRole = userRole === 'admin' ? 'School Admin'
                      : userRole === 'teacher' ? 'Teacher' : 'Member';

    const fetchPosts = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res = await fetch('/api/connect/posts', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setPosts(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchPosts();
        const iv = setInterval(() => fetchPosts(false), 60000);
        return () => clearInterval(iv);
    }, []);

    const handlePost = async () => {
        if (!draftContent.trim()) return;
        setPosting(true);
        try {
            const res = await fetch('/api/connect/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({
                    authorName: userName,
                    role: displayRole,
                    content: draftContent,
                    imageUrl: draftImageUrl || null,
                    visibility: 'all',
                })
            });
            if (res.ok) {
                const created = await res.json();
                setPosts(p => [created, ...p]);
                setDraftContent('');
                setDraftImageUrl('');
                setShowImageInput(false);
            }
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const handleLike = async (postId) => {
        setPosts(p => p.map(post =>
            post.id === postId
                ? { ...post, likes: post.likes.includes(userId) ? post.likes.filter(l => l !== userId) : [...post.likes, userId] }
                : post
        ));
        try {
            await fetch(`/api/connect/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ userId })
            });
        } catch { fetchPosts(false); }
    };

    const handleComment = async (postId) => {
        const text = (commentInput[postId] || '').trim();
        if (!text) return;
        try {
            const res = await fetch(`/api/connect/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ authorName: userName, text })
            });
            if (res.ok) {
                const comment = await res.json();
                setPosts(p => p.map(post =>
                    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
                ));
                setCommentInput(c => ({ ...c, [postId]: '' }));
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        setPosts(p => p.filter(post => post.id !== postId));
        try {
            await fetch(`/api/connect/posts/${postId}`, { method: 'DELETE', headers: { 'x-school-id': schoolId } });
        } catch { fetchPosts(false); }
    };

    return (
        <div className="min-h-screen -m-6 bg-[#FAF5FF] font-inter">
            {/* ── Top Navbar ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-black text-base shadow-lg shadow-violet-500/25">S</div>
                        <div>
                            <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-800 leading-none">SchoolConnect</p>
                            <p className="text-[9px] font-bold text-purple-400 leading-none">Stay Connected</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-xs">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                            <input
                                type="text"
                                placeholder="Search students, teachers, posts..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full bg-purple-50 border border-purple-100 focus:outline-none focus:border-violet-300 placeholder:text-purple-300 text-dark-text"
                            />
                        </div>
                    </div>

                    {/* Right: Notification icons + user */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button className="relative p-2 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-100 transition">
                            <Bell size={16} />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">5</span>
                        </button>
                        <button className="relative p-2 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-100 transition">
                            <MessageSquare size={16} />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">3</span>
                        </button>
                        <div className="flex items-center gap-2.5 pl-3 border-l border-purple-100">
                            <div className="text-right">
                                <p className="text-xs font-black text-dark-text leading-none">{userName}</p>
                                <p className="text-[10px] text-purple-400 font-bold">{displayRole}</p>
                            </div>
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(userName)} text-white flex items-center justify-center font-black text-sm shadow-md`}>
                                {userName[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-[220px_1fr_260px] gap-5">

                {/* ── Left Sidebar ── */}
                <aside className="sticky top-20 self-start space-y-1">
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden p-2">
                        {NAV_ITEMS.map(({ icon: Icon, label, badge }) => (
                            <button
                                key={label}
                                onClick={() => setActiveNav(label)}
                                className={clx(
                                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group',
                                    activeNav === label
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                                        : 'text-gray-600 hover:bg-purple-50 hover:text-violet-600'
                                )}
                            >
                                <Icon size={17} className={activeNav === label ? 'text-white' : 'text-purple-400 group-hover:text-violet-500'} />
                                <span className="flex-1 text-left text-[13px]">{label}</span>
                                {badge && (
                                    <span className={clx(
                                        'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center',
                                        activeNav === label ? 'bg-white text-violet-700' : 'bg-violet-100 text-violet-600'
                                    )}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* ── Main Feed ── */}
                <main className="space-y-4 min-w-0">

                    {/* Story Row */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <div className="flex items-center gap-4 overflow-x-auto pb-1 custom-scrollbar">
                            {/* Add Story */}
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 border-2 border-dashed border-violet-300 flex items-center justify-center cursor-pointer hover:from-violet-200 transition">
                                    <Plus size={22} className="text-violet-500" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-500">Add Story</p>
                            </div>
                            {/* Story avatars */}
                            {SUGGESTED.map((u, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradient(u.name)} text-white flex items-center justify-center font-black text-xl border-3 border-white shadow-md ring-2 ring-violet-400 cursor-pointer`}>
                                        {u.name[0]}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">{u.name.split(' ')[0]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compose */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(userName)} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md`}>
                                {userName[0]?.toUpperCase()}
                            </div>
                            <input
                                type="text"
                                value={draftContent}
                                onChange={e => setDraftContent(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
                                placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                                className="flex-1 bg-purple-50 rounded-full px-5 py-2.5 text-sm font-medium text-dark-text placeholder:text-purple-300 border border-transparent focus:border-violet-300 focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {showImageInput && (
                            <div className="mb-3 mx-1">
                                <input
                                    type="url"
                                    value={draftImageUrl}
                                    onChange={e => setDraftImageUrl(e.target.value)}
                                    placeholder="Paste an image URL..."
                                    className="w-full bg-purple-50 rounded-xl px-4 py-2 text-xs font-medium text-dark-text placeholder:text-purple-300 border border-purple-100 focus:border-violet-300 outline-none"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-purple-50 pt-3">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowImageInput(v => !v)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition"
                                >
                                    <ImageIcon size={15} /> Photo
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-500 hover:bg-violet-50 transition">
                                    <Video size={15} /> Video
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-500 hover:bg-amber-50 transition">
                                    <Smile size={15} /> Feeling
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 transition">
                                    <MapPin size={15} /> Location
                                </button>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={posting || !draftContent.trim()}
                                className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg shadow-violet-500/20 hover:opacity-90 transition active:scale-95 disabled:opacity-40"
                            >
                                {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                Post
                            </button>
                        </div>
                    </div>

                    {/* Feed Posts */}
                    {loading && posts.length === 0 ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-purple-100 h-48 animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-purple-100 p-16 text-center shadow-sm">
                            <div className="w-14 h-14 mx-auto bg-violet-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={24} className="text-violet-300" />
                            </div>
                            <p className="text-sm font-black text-dark-text">No posts yet</p>
                            <p className="text-xs text-muted-text mt-1">Be the first to share something!</p>
                        </div>
                    ) : (
                        posts.map(post => {
                            const liked = post.likes.includes(userId);
                            const showComments = expandedComments[post.id];
                            const canDelete = userRole === 'admin' || post.authorName === userName;

                            return (
                                <div key={post.id} className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                                    {/* Post Header */}
                                    <div className="flex items-start justify-between px-5 pt-4 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getGradient(post.authorName)} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md`}>
                                                {post.authorName[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-dark-text">{post.authorName}</p>
                                                    <RoleBadge role={post.role} />
                                                </div>
                                                <p className="text-[11px] text-purple-400 font-medium">
                                                    @{post.authorName.toLowerCase().replace(/\s+/g, '_')} · {timeAgo(post.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 transition">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-5 pb-3">
                                        <p className="text-sm text-dark-text leading-relaxed font-medium whitespace-pre-wrap">
                                            {post.content.split(/(#\w+)/g).map((part, i) =>
                                                part.startsWith('#')
                                                    ? <span key={i} className="text-violet-500 font-bold">{part}</span>
                                                    : part
                                            )}
                                        </p>
                                    </div>

                                    {/* Image */}
                                    {post.imageUrl && (
                                        <div className="mx-4 mb-3 rounded-xl overflow-hidden bg-purple-50">
                                            <img
                                                src={post.imageUrl}
                                                alt=""
                                                className="w-full object-cover max-h-[420px]"
                                                onError={e => e.target.parentElement.style.display = 'none'}
                                            />
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between px-5 py-2 border-t border-purple-50 text-[11px] text-muted-text font-bold">
                                        <div className="flex items-center gap-1">
                                            <span className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                                                <Heart size={9} className="text-white fill-white" />
                                            </span>
                                            <span>{post.likes.length}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span>{post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center border-t border-purple-50 px-2">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={clx(
                                                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all',
                                                liked ? 'text-rose-500' : 'text-muted-text hover:bg-purple-50 hover:text-violet-600'
                                            )}
                                        >
                                            <Heart size={16} className={clx(liked && 'fill-rose-500')} />
                                            Like
                                        </button>
                                        <button
                                            onClick={() => setExpandedComments(p => ({ ...p, [post.id]: !p[post.id] }))}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-muted-text hover:bg-purple-50 hover:text-violet-600 transition-all"
                                        >
                                            <MessageSquare size={16} />
                                            Comment
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-muted-text hover:bg-purple-50 hover:text-violet-600 transition-all">
                                            <Share2 size={16} />
                                            Share
                                        </button>
                                    </div>

                                    {/* Comments */}
                                    {showComments && (
                                        <div className="border-t border-purple-50 bg-purple-50/40 px-5 py-4 space-y-3">
                                            {post.comments.map(c => (
                                                <div key={c.id} className="flex items-start gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(c.authorName)} text-white flex items-center justify-center text-xs font-black shrink-0`}>
                                                        {c.authorName[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 bg-white rounded-2xl px-4 py-2 border border-purple-100">
                                                        <p className="text-[11px] font-black text-dark-text">{c.authorName}</p>
                                                        <p className="text-xs text-dark-text/80 font-medium mt-0.5">{c.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-2.5 pt-1">
                                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getGradient(userName)} text-white flex items-center justify-center text-xs font-black shrink-0`}>
                                                    {userName[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 flex items-center gap-2 bg-white rounded-full border border-purple-100 pr-2 pl-4 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={commentInput[post.id] || ''}
                                                        onChange={e => setCommentInput(p => ({ ...p, [post.id]: e.target.value }))}
                                                        onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 bg-transparent outline-none text-xs font-medium placeholder:text-purple-300 text-dark-text"
                                                    />
                                                    <button
                                                        onClick={() => handleComment(post.id)}
                                                        className="p-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full hover:opacity-90 transition active:scale-95"
                                                    >
                                                        <Send size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </main>

                {/* ── Right Sidebar ── */}
                <aside className="sticky top-20 self-start space-y-4">
                    {/* Suggested Connections */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <h3 className="text-sm font-black text-dark-text mb-3">Suggested Connections</h3>
                        <div className="space-y-3">
                            {SUGGESTED.map((u, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(u.name)} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                                        {u.name[0]}{u.name.split(' ')[1]?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-dark-text truncate">{u.name}</p>
                                        <p className="text-[10px] text-purple-400 font-medium">{u.role}</p>
                                    </div>
                                    <button className="p-1.5 rounded-lg bg-violet-50 text-violet-500 hover:bg-violet-100 transition">
                                        <UserPlus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trending Topics */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <h3 className="text-sm font-black text-dark-text mb-3">Trending Topics</h3>
                        <div className="space-y-2">
                            {TRENDING.map((t, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-purple-50 cursor-pointer transition group">
                                    <div>
                                        <p className="text-xs font-black text-dark-text group-hover:text-violet-600">{t.tag}</p>
                                        <p className="text-[10px] text-muted-text font-medium">{t.posts} posts</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${t.color}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* School Badge */}
                    <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Community</p>
                        <p className="text-sm font-black">{schoolName}</p>
                        <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1"><Lock size={10} />Intra-school only</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
