import React, { useState, useEffect } from 'react';
import {
    Heart, MessageSquare, Share2, Image as ImageIcon,
    Video, Smile, MapPin, Send, Trash2, Globe,
    Users, Lock, ChevronDown, Loader2, RefreshCw,
    Bell, Bookmark, Calendar, TrendingUp,
    Award, MoreHorizontal, Plus, Search, UserPlus,
    Clock, Activity, Menu, X
} from 'lucide-react';
import SkullarLogo from '../assets/SkullarLogo.png';

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
const getGradient = (name = 'fullname') => {
    const raw = name || 'fullname';
    return AVATAR_GRADIENTS[raw.charCodeAt(0) % AVATAR_GRADIENTS.length];
};

const getInitials = (name = 'fullname') => {
    const parts = (name || 'fullname').trim().split(' ').filter(Boolean);
    if(parts.length > 1) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return name[0]?.toUpperCase() || 'F';
};

const Avatar = ({ name = 'fullname', photo, size = 10, className = "" }) => {
    if (photo) {
        return <img src={photo} alt={name} className={clx(`w-${size} h-${size} rounded-full object-cover shrink-0 shadow-md border-2 border-white/90`, className)} />;
    }
    return (
        <div className={clx(`w-${size} h-${size} rounded-full bg-gradient-to-br ${getGradient(name)} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md border-2 border-white/90`, className)}>
            {getInitials(name)}
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const styles = {
        admin: 'bg-violet-100 text-violet-700',
        moderator: 'bg-amber-100 text-amber-700',
        student: 'bg-emerald-100 text-emerald-700',
    };
    const key = (role || '').toLowerCase().includes('admin') ? 'admin'
              : ((role || '').toLowerCase().includes('teacher') || (role || '').toLowerCase().includes('moderator')) ? 'moderator' : 'student';
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles[key]}`}>
            {key}
        </span>
    );
};

// NAV_ITEMS will be defined inside the component to catch dynamic counts

const TRENDING = [
    { tag: '#SpringBreak2026', posts: '2.4k', color: 'bg-violet-500' },
    { tag: '#ScienceFair', posts: '1.5k', color: 'bg-emerald-500' },
    { tag: '#SchoolPride', posts: '3.2k', color: 'bg-rose-500' },
    { tag: '#Basketball', posts: '1.5k', color: 'bg-amber-500' },
    { tag: '#ArtShow', posts: '852', color: 'bg-blue-500' },
];

const ACADEMIC_THEMES = [
    { 
        id: 'science', label: 'Science', 
        bg: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900', 
        text: 'text-cyan-100', 
        pattern: 'opacity-[0.05]',
        patternSvg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="2" fill="currentColor"/><circle cx="80" cy="80" r="3" fill="currentColor"/><path d="M20 20 L80 80" stroke="currentColor" stroke-width="0.5" fill="none"/><circle cx="50" cy="50" r="5" fill="none" stroke="currentColor" stroke-width="0.5"/><path d="M10 50 Q 50 10 90 50 T 10 50" fill="none" stroke="currentColor" stroke-width="0.2" opacity="0.3"/></svg>`
    },
    { 
        id: 'history', label: 'History', 
        bg: 'bg-gradient-to-br from-[#4a3728] to-[#2c1e12]', 
        text: 'text-amber-50', 
        pattern: 'opacity-[0.1]',
        patternSvg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M20 20 H100 V100 H20 Z" fill="none" stroke="currentColor" stroke-width="1"/><path d="M30 40 H90 M30 60 H90 M30 80 H60" stroke="currentColor" stroke-width="1"/><path d="M10 10 Q 60 5 110 10" fill="none" stroke="currentColor" stroke-width="0.5"/></svg>`
    },
    { 
        id: 'sports', label: 'Sports', 
        bg: 'bg-gradient-to-br from-rose-700 via-orange-600 to-amber-500', 
        text: 'text-white', 
        pattern: 'opacity-[0.08]',
        patternSvg: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="1"/><path d="M15 25 Q 40 40 65 25 M15 55 Q 40 40 65 55" fill="none" stroke="currentColor" stroke-width="1"/></svg>`
    },
    { 
        id: 'art', label: 'Art', 
        bg: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600', 
        text: 'text-white', 
        pattern: 'opacity-[0.1]',
        patternSvg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="10" fill="currentColor" opacity="0.3"/><circle cx="70" cy="40" r="15" fill="currentColor" opacity="0.2"/><circle cx="40" cy="70" r="12" fill="currentColor" opacity="0.4"/></svg>`
    },
    { 
        id: 'math', label: 'Mathematics', 
        bg: 'bg-gradient-to-br from-emerald-800 to-teal-900', 
        text: 'text-emerald-50', 
        pattern: 'opacity-[0.05]',
        patternSvg: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30" font-family="serif" font-size="20" fill="currentColor">π</text><text x="60" y="80" font-family="serif" font-size="24" fill="currentColor">∑</text><text x="70" y="30" font-family="serif" font-size="18" fill="currentColor">√</text><path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" stroke-width="0.1"/></svg>`
    },
];

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-dark-text mb-2">{title}</h3>
                    <p className="text-sm text-purple-400 font-medium leading-relaxed">{message}</p>
                </div>
                <div className="flex border-t border-purple-50">
                    <button onClick={onCancel} className="flex-1 py-4 text-sm font-black text-purple-400 hover:bg-purple-50 transition">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-4 text-sm font-black text-rose-500 hover:bg-rose-50 border-l border-purple-50 transition">Delete</button>
                </div>
            </div>
        </div>
    );
};

const ReshareModal = ({ isOpen, post, onReshare, onCancel }) => {
    const [commentary, setCommentary] = useState('');
    if (!isOpen || !post) return null;
    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-purple-50 flex justify-between items-center bg-purple-50/20">
                    <div className="flex items-center gap-2">
                        <Share2 size={18} className="text-violet-600" />
                        <h3 className="font-black text-dark-text tracking-tight uppercase text-xs">Share this Post</h3>
                    </div>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full text-purple-300 hover:text-rose-500 hover:bg-rose-50 transition">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <textarea
                        value={commentary}
                        onChange={e => setCommentary(e.target.value)}
                        placeholder={`What's on your mind about ${post.authorName.split(' ')[0]}'s post?`}
                        className="w-full bg-purple-50 rounded-2xl px-5 py-4 text-sm text-dark-text font-medium placeholder:text-purple-300 border border-purple-100 focus:border-violet-300 focus:bg-white outline-none min-h-[120px] resize-none transition-all"
                    />
                    
                    {/* Compact Preview of original post */}
                    <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100/50 border-dashed group transition-colors hover:bg-purple-50">
                        <div className="flex items-center gap-2 mb-2">
                             <Avatar name={post.authorName} photo={post.authorPhoto} size={6} />
                             <div>
                                <p className="text-[10px] font-black text-dark-text leading-tight">{post.authorName}</p>
                                <p className="text-[8px] text-purple-400 font-bold uppercase tracking-wider">{post.role}</p>
                             </div>
                        </div>
                        <p className="text-xs text-dark-text/70 line-clamp-2 font-medium leading-relaxed">
                            {post.content}
                        </p>
                        {post.imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden h-20 opacity-80">
                                <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 pt-0 flex gap-3">
                    <button 
                        onClick={() => { onReshare(post.id, ''); setCommentary(''); }} 
                        className="flex-1 py-3.5 bg-white text-violet-600 border border-violet-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-50 transition active:scale-95 shadow-sm"
                    >
                        Simple Share
                    </button>
                    <button 
                        onClick={() => { onReshare(post.id, commentary); setCommentary(''); }} 
                        className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:opacity-90 transition active:scale-95"
                    >
                        Share with Quote
                    </button>
                </div>
            </div>
        </div>
    );
};

// Dynamic users loaded via state
const PostItem = ({ post, userId, userName, userProfilePhoto, onLike, onComment, onShare, onDelete, onSave, isSaved, canDelete, onUpdate, onCommentAction }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');

    const liked = (post.likes || []).includes(userId);
    const isShort = post.content.length < 200 && !post.imageUrl;

    const handleComment = () => {
        if(!commentText.trim()) return;
        onComment(post.id, commentText);
        setCommentText('');
    };

    const handleUpdate = () => {
        onUpdate(post.id, editContent);
        setIsEditing(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/dashboard/skullar-connect?post=${post.id}`);
        setShowMenu(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Post Header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                    <Avatar name={post.authorName} photo={post.authorPhoto} size={10} />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-dark-text">{post.authorName}</p>
                            {(post.feeling || post.location) && (
                                <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                                    {post.feeling && <span>is feeling {post.feeling}</span>}
                                    {post.location && <span>at {post.location}</span>}
                                </span>
                            )}
                            <RoleBadge role={post.role} />
                        </div>
                        <p className="text-[11px] text-purple-400 font-medium">
                            @{post.authorName.toLowerCase().replace(/\s+/g, '_')} · {timeAgo(post.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-purple-200 hover:text-violet-500 hover:bg-purple-50 rounded-full transition"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-50 py-2 z-20 animate-in zoom-in-95 duration-100 origin-top-right">
                                {canDelete && (
                                    <>
                                        <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-dark-text hover:bg-purple-50 transition">
                                            <Send size={14} className="text-violet-500" /> Edit Post
                                        </button>
                                        <button onClick={() => { onDelete(post.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition">
                                            <Trash2 size={14} /> Delete Post
                                        </button>
                                        <div className="h-[1px] bg-purple-50 my-1 mx-2" />
                                    </>
                                )}
                                <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-dark-text hover:bg-purple-50 transition">
                                    <Share2 size={14} className="text-purple-400" /> Copy Link
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-dark-text hover:bg-purple-50 transition">
                                    <Bell size={14} className="text-purple-400" /> Turn on Notifications
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Segment */}
            <div className={clx(
                "px-5 pb-4", 
                post.style ? `py-12 text-center rounded-2xl mx-2 mb-2 shadow-2xl relative overflow-hidden group ${post.style.bg}` : ""
            )}>
                {post.style && (
                    <div 
                        className={clx("absolute inset-0 pointer-events-none", post.style.pattern)}
                        style={post.style.patternSvg ? {
                            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(post.style.patternSvg)}")`,
                            backgroundSize: '150px 150px'
                        } : { 
                            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', 
                            backgroundSize: '24px 24px' 
                        }}
                    />
                )}
                
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full p-4 rounded-xl border border-violet-200 text-sm font-medium focus:ring-2 focus:ring-violet-100 outline-none min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-xs font-black text-purple-400 hover:bg-purple-50 rounded-lg transition">Cancel</button>
                            <button onClick={handleUpdate} className="px-4 py-1.5 text-xs font-black bg-violet-600 text-white rounded-lg shadow-md hover:bg-violet-700 transition">Save Changes</button>
                        </div>
                    </div>
                ) : (
                    <p className={clx(
                        "leading-relaxed whitespace-pre-wrap relative z-10",
                        post.style ? `text-2xl font-black italic tracking-tight ${post.style.text}` : isShort ? "text-lg font-black text-dark-text italic" : "text-sm text-dark-text font-medium"
                    )}>
                        {post.content}
                    </p>
                )}
            </div>

            {/* Shared Content (if any) */}
            {/* Shared Content (Nested Mini-Post) */}
            {post.sharedPost && (
                <div className="mx-5 mb-4 p-4 rounded-2xl bg-purple-50/30 border border-purple-100 hover:bg-purple-50 transition-colors group/shared cursor-pointer">
                    <div className="flex items-center gap-2 mb-2.5">
                        <Avatar name={post.sharedPost.authorName} size={7} />
                        <div>
                            <p className="text-[10px] font-black text-dark-text leading-tight">{post.sharedPost.authorName}</p>
                            <p className="text-[8px] text-purple-400 font-bold uppercase tracking-wider">Original Author</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[13px] text-dark-text/80 font-medium leading-relaxed line-clamp-4">
                            {post.sharedPost.content}
                        </p>
                        {post.sharedPost.imageUrl && (
                            <div className="rounded-xl overflow-hidden h-32 border border-purple-50 shadow-sm">
                                <img src={post.sharedPost.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/shared:scale-105" alt="" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Post Media */}
            {post.imageUrl && !isEditing && (
                <div className="px-2 pb-2">
                    <div className="rounded-xl overflow-hidden border border-purple-50 shadow-sm bg-purple-50/50 relative group">
                        <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="w-full h-auto max-h-[600px] object-contain block mx-auto transition-transform duration-700 group-hover:scale-[1.02]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Interactive Section */}
            <div className="px-5 py-2.5 flex items-center justify-between border-t border-purple-50/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-1.5">
                        {(post.likes?.length || 0) > 0 && <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center border-2 border-white shadow-sm z-10"><Heart size={10} className="fill-white text-white" /></div>}
                        {(post.comments?.length || 0) > 0 && <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center border-2 border-white shadow-sm z-0"><MessageSquare size={10} className="text-white" /></div>}
                    </div>
                    <p className="text-[11px] text-purple-400 font-bold">
                        {(post.likes?.length || 0)} Likes · {(post.comments?.length || 0)} Comments
                    </p>
                </div>
                <div className="flex items-center gap-2">
                     <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">{(post.shares?.length || 0)} Shares</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center border-t border-purple-50 px-2 bg-white/50">
                <button
                    onClick={() => onLike(post.id)}
                    className={clx(
                        'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all',
                        liked ? 'text-rose-500 bg-rose-50/50' : 'text-muted-text hover:bg-purple-50 hover:text-violet-600'
                    )}
                >
                    <Heart size={18} className={clx(liked && 'fill-rose-500 animate-bounce-short')} />
                    <span>Like</span>
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className={clx(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                        showComments ? "text-violet-600 bg-violet-50" : "text-muted-text hover:bg-purple-50 hover:text-violet-600"
                    )}
                >
                    <MessageSquare size={18} />
                    <span>Comment</span>
                </button>
                <button onClick={() => onShare(post)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-muted-text hover:bg-purple-50 hover:text-violet-600 transition-all">
                    <Share2 size={18} />
                    <span>Share</span>
                </button>
                <button onClick={() => onSave(post)} className={clx("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all", isSaved ? "text-emerald-500 bg-emerald-50/50" : "text-muted-text hover:bg-purple-50 hover:text-violet-600")}>
                    <Bookmark size={18} className={clx(isSaved && "fill-emerald-500")} />
                    <span>Save</span>
                </button>
            </div>

            {/* Comments List */}
            {showComments && (
                <div className="border-t border-purple-50 bg-gradient-to-b from-purple-50/40 to-white px-5 py-4 space-y-4">
                    {(post.comments || []).map(c => {
                        const isCMe = c.fromId === userId;
                        const cLiked = (c.likes || []).includes(userId);
                        return (
                            <div key={c.id} className="group/item">
                                <div className="flex items-start gap-2.5">
                                    <Avatar name={c.authorName} photo={c.authorPhoto} size={8} className="mt-1" />
                                    <div className="flex-1 space-y-1">
                                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-purple-100 shadow-sm relative group">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-[11px] font-black text-dark-text">{c.authorName}</p>
                                                {isCMe && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.text); }} className="text-purple-300 hover:text-violet-500"><Send size={10} /></button>
                                                        <button onClick={() => onCommentAction(post.id, c.id, 'delete')} className="text-purple-300 hover:text-rose-500"><Trash2 size={10} /></button>
                                                    </div>
                                                )}
                                            </div>
                                            {editingCommentId === c.id ? (
                                                <div className="mt-2 space-y-2">
                                                    <input 
                                                        value={editCommentText} 
                                                        onChange={e=>setEditCommentText(e.target.value)} 
                                                        className="w-full bg-purple-50 p-2 rounded-lg text-xs outline-none border border-violet-200"
                                                    />
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={()=>setEditingCommentId(null)} className="px-2 py-1 text-[9px] font-bold text-gray-400">Cancel</button>
                                                        <button onClick={()=>{ onCommentAction(post.id, c.id, 'edit', editCommentText); setEditingCommentId(null); }} className="px-2 py-1 text-[9px] font-bold bg-violet-600 text-white rounded">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-dark-text/80 font-medium leading-relaxed">{c.text}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 pl-2 text-[10px] font-black text-purple-300">
                                            <button onClick={() => onCommentAction(post.id, c.id, 'like')} className={clx("hover:text-violet-600", cLiked && "text-rose-500")}>
                                                {cLiked ? 'Liked' : 'Like'} ({(c.likes?.length || 0)})
                                            </button>
                                            <button className="hover:text-violet-600">Reply</button>
                                            <span className="font-medium opacity-60">{timeAgo(c.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    
                    {/* Input Field */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-purple-50/50">
                        <Avatar name={userName} photo={userProfilePhoto} size={8} />
                        <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border border-purple-100 pr-1.5 pl-4 py-1.5 focus-within:ring-4 focus-within:ring-violet-50 transition-all">
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleComment()}
                                placeholder="Add a brilliant comment..."
                                className="flex-1 bg-transparent text-[13px] outline-none font-medium placeholder:text-purple-300"
                            />
                            <button onClick={handleComment} className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition shadow-lg shadow-violet-200">
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DirectMessaging = ({ users, schoolId, userId, userRole, userName, userProfilePhoto }) => {
    const [chats, setChats] = useState([]);
    const [activeTarget, setActiveTarget] = useState(null);
    const [msgText, setMsgText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [mutedUsers, setMutedUsers] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const msgsEndRef = React.useRef(null);
    const moreMenuRef = React.useRef(null);

    const fetchChats = async (targetId) => {
        try {
            const res = await fetch(`/api/connect/chats/${targetId}`, { headers: { 'x-user-id': userId, 'x-school-id': schoolId } });
            if(res.ok) setChats(await res.json());
        } catch(e){}
    };

    useEffect(() => {
        if(activeTarget) { fetchChats(activeTarget.id); const iv = setInterval(()=>fetchChats(activeTarget.id), 5000); return ()=>clearInterval(iv); }
    }, [activeTarget]);
    
    useEffect(() => {
        msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    // Close more menu on outside click
    useEffect(() => {
        const handler = (e) => { if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSend = async () => {
        if(!msgText.trim() || !activeTarget) return;
        const tempText = msgText;
        setMsgText('');
        try {
            const res = await fetch(`/api/connect/chats/${activeTarget.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId, 'x-school-id': schoolId },
                body: JSON.stringify({ text: tempText, authorName: userName, authorPhoto: userProfilePhoto })
            });
            if(res.ok) {
                const sent = await res.json();
                setChats(c => [...c, sent]);
            }
        } catch(e){}
    };

    const handleClearChat = () => { setChats([]); setShowMoreMenu(false); };
    const handleMute = () => {
        if (!activeTarget) return;
        setMutedUsers(m => m.includes(activeTarget.id) ? m.filter(x => x !== activeTarget.id) : [...m, activeTarget.id]);
        setShowMoreMenu(false);
    };
    const handleBlock = () => {
        if (!activeTarget) return;
        setBlockedUsers(b => b.includes(activeTarget.id) ? b.filter(x => x !== activeTarget.id) : [...b, activeTarget.id]);
        setActiveTarget(null);
        setShowMoreMenu(false);
    };

    // Live search filter
    const filteredUsers = users.filter(u =>
        !blockedUsers.includes(u.id) &&
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    // Chat stats for activity panel
    const myMsgs = chats.filter(c => c.fromId === userId);
    const theirMsgs = chats.filter(c => c.fromId !== userId);

    return (
        <div className="flex bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
            {/* ── Left Panel: Conversation List ── */}
            <div className="w-[340px] shrink-0 border-r border-gray-100 flex flex-col bg-white">
                {/* Header */}
                <div className="px-5 pt-5 pb-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[22px] font-black text-gray-900">Messages</h2>
                    </div>
                    {/* Live Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search Messenger"
                            className="w-full pl-9 pr-9 py-2.5 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-200 transition font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <Plus size={14} className="rotate-45" />
                            </button>
                        )}
                    </div>
                    {/* Search result hint */}
                    {searchQuery && (
                        <p className="text-[11px] text-gray-400 font-medium mt-2 pl-1">
                            {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                        </p>
                    )}
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
                    {filteredUsers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 gap-2 text-center">
                            <Search size={28} className="text-gray-200" />
                            <p className="text-sm font-bold text-gray-400">No conversations found</p>
                            {searchQuery && <p className="text-xs text-gray-300">Try a different name</p>}
                        </div>
                    )}
                    {filteredUsers.map(u => {
                        const isActive = activeTarget?.id === u.id;
                        const isMuted = mutedUsers.includes(u.id);
                        return (
                            <button
                                key={u.id}
                                onClick={() => { setActiveTarget(u); setShowActivity(false); setShowMoreMenu(false); }}
                                className={clx(
                                    'w-full flex items-center gap-3 px-4 py-3 transition-all text-left',
                                    isActive ? 'bg-violet-50 border-l-[3px] border-violet-500' : 'hover:bg-gray-50 border-l-[3px] border-transparent'
                                )}
                            >
                                {/* Avatar with online dot */}
                                <div className="relative shrink-0">
                                    <Avatar name={u.name} photo={u.profilePhoto} size={12} />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className={clx("text-[14px] truncate", isActive ? 'font-black text-violet-700' : 'font-bold text-gray-900')}>
                                            {u.name}
                                        </p>
                                        {isMuted && <span className="text-[10px] text-gray-400 shrink-0">🔇</span>}
                                    </div>
                                    <p className="text-[12px] text-gray-400 font-medium truncate mt-0.5">{u.role || 'Member'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Right Panel: Chat Area ── */}
            <div className="flex-1 flex min-w-0">
                {/* Chat main */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                    {activeTarget ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
                                <div className="relative shrink-0">
                                    <Avatar name={activeTarget.name} photo={activeTarget.profilePhoto} size={11} />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-black text-[15px] text-gray-900">{activeTarget.name}</h3>
                                    <p className="text-[11px] text-green-500 font-bold">
                                        {mutedUsers.includes(activeTarget.id) ? '🔇 Muted' : 'Active now'}
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center gap-1 relative">
                                    {/* Activity / Stats button */}
                                    <button
                                        onClick={() => { setShowActivity(a => !a); setShowMoreMenu(false); }}
                                        title="Chat Activity"
                                        className={clx(
                                            "w-9 h-9 rounded-full flex items-center justify-center transition",
                                            showActivity ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-violet-500'
                                        )}
                                    >
                                        <Activity size={18} />
                                    </button>
                                    {/* Three-dot menu */}
                                    <div ref={moreMenuRef} className="relative">
                                        <button
                                            onClick={() => { setShowMoreMenu(m => !m); setShowActivity(false); }}
                                            className={clx(
                                                "w-9 h-9 rounded-full flex items-center justify-center transition",
                                                showMoreMenu ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-violet-500'
                                            )}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                        {showMoreMenu && (
                                            <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => { setShowMoreMenu(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition text-left"
                                                    >
                                                        <UserPlus size={15} className="text-violet-500" />
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={handleMute}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition text-left"
                                                    >
                                                        <Bell size={15} className={mutedUsers.includes(activeTarget.id) ? 'text-green-500' : 'text-amber-500'} />
                                                        {mutedUsers.includes(activeTarget.id) ? 'Unmute Notifications' : 'Mute Notifications'}
                                                    </button>
                                                    <button
                                                        onClick={handleClearChat}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition text-left"
                                                    >
                                                        <RefreshCw size={15} className="text-blue-500" />
                                                        Clear Chat
                                                    </button>
                                                    <div className="my-1 border-t border-gray-100" />
                                                    <button
                                                        onClick={handleBlock}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                                                    >
                                                        <Lock size={15} className="text-rose-500" />
                                                        Block {activeTarget.name.split(' ')[0]}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages area */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 flex flex-col custom-scrollbar bg-white">
                                {chats.length === 0 && (
                                    <div className="my-auto flex flex-col items-center gap-3 text-center">
                                        <div className="relative shrink-0">
                                            <Avatar name={activeTarget.name} photo={activeTarget.profilePhoto} size={20} />
                                            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg">{activeTarget.name}</p>
                                            <p className="text-sm text-gray-400 font-medium mt-1">{activeTarget.role || 'School Member'}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium mt-2">Say hi to start a conversation 👋</p>
                                    </div>
                                )}
                                {chats.map((c, i) => {
                                    const isMe = c.fromId === userId;
                                    const prevMsg = chats[i - 1];
                                    const showAvatar = !isMe && (!prevMsg || prevMsg.fromId !== c.fromId);
                                    return (
                                        <div key={c.id} className={clx("flex items-end gap-2", isMe ? 'justify-end' : 'justify-start')}>
                                            {!isMe && (
                                                <div className="w-7 shrink-0">
                                                    {showAvatar && <Avatar name={activeTarget.name} photo={activeTarget.profilePhoto} size={7} />}
                                                </div>
                                            )}
                                            <div className={clx(
                                                "px-4 py-2.5 rounded-2xl text-[14px] font-medium leading-relaxed max-w-[65%] shadow-sm",
                                                isMe
                                                    ? 'bg-violet-600 text-white rounded-br-[4px]'
                                                    : 'bg-gray-100 text-gray-900 rounded-bl-[4px]'
                                            )}>
                                                {c.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={msgsEndRef} />
                            </div>

                            {/* Input bar */}
                            <div className="px-4 py-3 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-violet-500 transition shrink-0">
                                        <ImageIcon size={18} />
                                    </button>
                                    <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-violet-500 transition shrink-0">
                                        <Smile size={18} />
                                    </button>
                                    <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
                                        <input
                                            type="text"
                                            value={msgText}
                                            onChange={e => setMsgText(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            placeholder="Aa"
                                            className="flex-1 bg-transparent text-[14px] outline-none font-medium placeholder-gray-400 text-gray-900"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        className={clx(
                                            "w-9 h-9 rounded-full flex items-center justify-center transition shrink-0",
                                            msgText.trim()
                                                ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md"
                                                : "text-violet-400 hover:bg-gray-100"
                                        )}
                                    >
                                        {msgText.trim() ? <Send size={16} className="ml-0.5" /> : <Heart size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white">
                            <div className="w-24 h-24 rounded-full border-[3px] border-gray-200 flex items-center justify-center">
                                <Send size={40} className="text-gray-300 -rotate-12" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-[22px] font-black text-gray-900">Your messages</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Send private messages to a friend.</p>
                            </div>
                            <button
                                onClick={() => filteredUsers[0] && setActiveTarget(filteredUsers[0])}
                                className="px-6 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-full hover:bg-violet-700 transition shadow-md"
                            >
                                Send message
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Activity Side Panel ── */}
                {showActivity && activeTarget && (
                    <div className="w-[260px] shrink-0 border-l border-gray-100 bg-gray-50/50 flex flex-col p-5 gap-5 animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900">Chat Activity</h3>
                            <button onClick={() => setShowActivity(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus size={16} className="rotate-45" />
                            </button>
                        </div>
                        {/* User card */}
                        <div className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="relative">
                                <Avatar name={activeTarget.name} photo={activeTarget.profilePhoto} size={16} />
                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{activeTarget.name}</p>
                            <span className="text-[11px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">{activeTarget.role || 'Member'}</span>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
                                <p className="text-2xl font-black text-violet-600">{chats.length}</p>
                                <p className="text-[11px] text-gray-400 font-bold text-center">Total Messages</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
                                <p className="text-2xl font-black text-emerald-500">{myMsgs.length}</p>
                                <p className="text-[11px] text-gray-400 font-bold text-center">Sent by You</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
                                <p className="text-2xl font-black text-amber-500">{theirMsgs.length}</p>
                                <p className="text-[11px] text-gray-400 font-bold text-center">From Them</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
                                <p className="text-2xl font-black text-rose-400">
                                    {chats.length > 0 ? Math.round((myMsgs.length / chats.length) * 100) : 0}%
                                </p>
                                <p className="text-[11px] text-gray-400 font-bold text-center">Your Share</p>
                            </div>
                        </div>
                        {/* Quick actions */}
                        <div className="mt-auto space-y-2">
                            <button onClick={handleMute} className="w-full py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <Bell size={14} className="text-amber-500" />
                                {mutedUsers.includes(activeTarget.id) ? 'Unmute' : 'Mute'}
                            </button>
                            <button onClick={handleClearChat} className="w-full py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <RefreshCw size={14} className="text-blue-500" />
                                Clear Chat
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


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
    const [showSidebar, setShowSidebar] = useState(false);
    
    // Composer Extras
    const [draftFeeling, setDraftFeeling] = useState('');
    const [draftLocation, setDraftLocation] = useState('');
    const [draftStyle, setDraftStyle] = useState(null); // { bg: string, text: string }
    const [showFeelingPicker, setShowFeelingPicker] = useState(false);
    const [showLocationInput, setShowLocationInput] = useState(false);
    const [showStylePicker, setShowStylePicker] = useState(false);

    const [users, setUsers] = useState([]);

    // Stories API state
    const [stories, setStories] = useState([]);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [storyContent, setStoryContent] = useState('');
    const [storyImageUrl, setStoryImageUrl] = useState('');
    const [storySong, setStorySong] = useState('None');
    const [viewingStoryIndex, setViewingStoryIndex] = useState(-1);
    const [postingStory, setPostingStory] = useState(false);
    const [storyReply, setStoryReply] = useState('');
    
    // Networking & Branding
    const [schoolBranding, setSchoolBranding] = useState({ name: 'SmartSchool', logo: null });
    const [counts, setCounts] = useState({ notifications: 0, messages: 0 });
    const [connections, setConnections] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);

    // Modal States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, postId: null, commentId: null, type: 'post' });
    const [reshareModal, setReshareModal] = useState({ isOpen: false, post: null });

    const TRENDING_SONGS = ['None', 'Afrobeats Mashup', 'Calm Down - Rema', 'Last Last - Burna Boy', 'Water - Tyla', 'Amapiano Mix', 'Rush - Ayra Starr'];

    const schoolId = localStorage.getItem('schoolId') || 'local';
    const rawRole = (localStorage.getItem('userRole') || 'student').toLowerCase();
    const isSchoolAdmin = rawRole.includes('admin');
    const isModerator = rawRole.includes('teacher') || rawRole.includes('staff') || rawRole.includes('moderator');

    // Fix: Prioritize names and handle all admin variations
    const userName = (isSchoolAdmin ? (localStorage.getItem('superAdminName') || localStorage.getItem('fullname') || localStorage.getItem('adminName'))
                   : isModerator ? (localStorage.getItem('teacherName') || localStorage.getItem('fullname') || localStorage.getItem('staffName'))
                   : localStorage.getItem('studentName') || localStorage.getItem('fullname')) || 'User';

    const userProfilePhoto = isSchoolAdmin ? localStorage.getItem('superAdminPhoto')
                          : isModerator ? localStorage.getItem('teacherPhoto')
                          : localStorage.getItem('studentPhoto') || null;

    const userId = isSchoolAdmin ? (localStorage.getItem('userPhone') || 'admin')
                : isModerator ? localStorage.getItem('teacherId')
                : localStorage.getItem('studentId') || 'user';

    const displayRole = isSchoolAdmin ? 'School Admin'
                      : isModerator ? 'Moderator' : 'Student';
    const userRole = isSchoolAdmin ? 'admin' : isModerator ? 'teacher' : 'student';

    const NAV_ITEMS = [
        { icon: Globe, label: 'Feed', badge: null },
        { icon: Users, label: 'My Network', badge: null },
        { icon: Bell, label: 'Notifications', badge: counts.notifications > 0 ? counts.notifications : null },
        { icon: MessageSquare, label: 'Messages', badge: counts.messages > 0 ? counts.messages : null },
        { icon: Bookmark, label: 'Saved Posts', badge: null },
        { icon: Calendar, label: 'Events', badge: null },
        { icon: TrendingUp, label: 'Trending', badge: null },
        { icon: Award, label: 'Achievements', badge: null },
    ];

    const fetchPosts = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const res = await fetch('/api/connect/posts', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setPosts(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/connect/users', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (e) { console.error(e); }
    };

    const fetchStories = async () => {
        try {
            const res = await fetch('/api/connect/stories', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setStories(data);
        } catch (e) { console.error(e); }
    };

    const fetchBranding = async () => {
        try {
            const res = await fetch('/api/connect/school-info', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (data.name) setSchoolBranding(data);
        } catch (e) { console.error(e); }
    };

    const fetchCounts = async () => {
        try {
            const res = await fetch('/api/connect/counts', { headers: { 'x-school-id': schoolId, 'x-user-id': userId } });
            const data = await res.json();
            if (data.notifications !== undefined) setCounts(data);
        } catch (e) { console.error(e); }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/connect/notifications', { headers: { 'x-school-id': schoolId, 'x-user-id': userId } });
            const data = await res.json();
            if (Array.isArray(data)) setNotifications(data);
        } catch (e) { console.error(e); }
    };

    const clearNotifications = async () => {
        try {
            const res = await fetch('/api/connect/notifications/clear', { method: 'POST', headers: { 'x-school-id': schoolId, 'x-user-id': userId } });
            if (res.ok) {
                setCounts(p => ({ ...p, notifications: 0 }));
                setNotifications(n => n.map(notif => ({ ...notif, read: true })));
            }
        } catch (e) { console.error(e); }
    };

    const fetchTrending = async () => {
        try {
            const res = await fetch('/api/connect/trending', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setTrendingPosts(data);
        } catch (e) { console.error(e); }
    };

    const fetchSaved = async () => {
        // Mocked or use personal storage
        const saved = JSON.parse(localStorage.getItem('skullar_saved_posts') || '[]');
        setSavedPosts(saved);
    };

    const handleSavePost = (post) => {
        const saved = JSON.parse(localStorage.getItem('skullar_saved_posts') || '[]');
        const index = saved.findIndex(p => p.id === post.id);
        if(index === -1) {
            saved.push(post);
        } else {
            saved.splice(index, 1);
        }
        localStorage.setItem('skullar_saved_posts', JSON.stringify(saved));
        setSavedPosts(saved);
    };

    const handleUpdatePost = async (postId, content) => {
        try {
            const res = await fetch(`/api/connect/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId, 'x-user-id': userId },
                body: JSON.stringify({ content })
            });
            if (res.ok) fetchPosts(false);
            else {
                const err = await res.json();
                alert(err.error + (err.reason ? '\nReason: ' + err.reason : ''));
            }
        } catch (e) { console.error(e); }
    };

    const handleDeletePost = async (postId) => {
        setDeleteModal({ isOpen: true, postId, commentId: null, type: 'post' });
    };

    const handleCommentAction = async (postId, commentId, action, data) => {
        if (action === 'delete') {
            setDeleteModal({ isOpen: true, postId, commentId, type: 'comment' });
            return;
        }
        try {
            const method = action === 'edit' ? 'PUT' : 'POST';
            const url = `/api/connect/posts/${postId}/comments/${commentId}${action === 'like' ? '/like' : ''}`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId, 'x-user-id': userId },
                body: action === 'edit' ? JSON.stringify({ text: data }) : null
            });
            if (res.ok) fetchPosts(false);
        } catch (e) { console.error(e); }
    };

    const handleConfirmDelete = async () => {
        const { postId, commentId, type } = deleteModal;
        const url = type === 'post' ? `/api/connect/posts/${postId}` : `/api/connect/posts/${postId}/comments/${commentId}`;
        try {
            const res = await fetch(url, { method: 'DELETE', headers: { 'x-school-id': schoolId, 'x-user-id': userId } });
            if (res.ok) fetchPosts(false);
        } catch (e) { console.error(e); }
        finally { setDeleteModal({ isOpen: false, postId: null, commentId: null, type: 'post' }); }
    };

    const handleShareRequest = (post) => {
        setReshareModal({ isOpen: true, post });
    };

    const handleReshare = async (postId, commentary) => {
        try {
            const res = await fetch(`/api/connect/posts/${postId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId, 'x-user-id': userId },
                body: JSON.stringify({ 
                    authorName: userName, 
                    authorPhoto: userProfilePhoto, 
                    role: userRole,
                    commentary 
                })
            });
            if (res.ok) {
                fetchPosts(false);
                setReshareModal({ isOpen: false, post: null });
            }
        } catch (e) { console.error(e); }
    };

    const fetchConnections = async () => {
        try {
            const res = await fetch('/api/connect/connections', { headers: { 'x-school-id': schoolId } });
            const data = await res.json();
            if (Array.isArray(data)) setConnections(data);
        } catch (e) { console.error(e); }
    };

    const handleConnect = async (targetId) => {
        try {
            const res = await fetch('/api/connect/connections/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId, 'x-user-id': userId },
                body: JSON.stringify({ targetId })
            });
            if (res.ok) fetchConnections();
        } catch (e) { console.error(e); }
    };

    const handleAccept = async (requestId) => {
        try {
            const res = await fetch('/api/connect/connections/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ requestId })
            });
            if (res.ok) fetchConnections();
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchPosts();
        fetchUsers();
        fetchStories();
        fetchBranding();
        fetchCounts();
        fetchConnections();
        fetchNotifications();
        fetchTrending();
        fetchSaved();
        const iv = setInterval(() => { 
            fetchPosts(false); 
            fetchStories();
            fetchCounts();
            fetchConnections();
            fetchNotifications();
            fetchTrending();
        }, 30000);
        return () => clearInterval(iv);
    }, []);

    const handleStoryFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Please choose media under 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setStoryImageUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handlePostFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Please choose media under 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setDraftImageUrl(reader.result);
            setShowImageInput(true);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (viewingStoryIndex === -1) return;
            if (e.key === 'ArrowLeft') setViewingStoryIndex(prev => Math.max(0, prev - 1));
            else if (e.key === 'ArrowRight') setViewingStoryIndex(prev => Math.min(stories.length - 1, prev + 1));
            else if (e.key === 'Escape') setViewingStoryIndex(-1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewingStoryIndex, stories.length]);

    const handlePostStory = async () => {
        if (!storyContent.trim() && !storyImageUrl.trim()) return;
        setPostingStory(true);
        try {
            const res = await fetch('/api/connect/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({
                    authorName: userName,
                    content: storyContent,
                    imageUrl: storyImageUrl || null,
                    song: storySong === 'None' ? null : storySong
                })
            });
            if (res.ok) {
                const created = await res.json();
                setStories(s => [created, ...s]);
                setShowStoryModal(false);
                setStoryContent('');
                setStoryImageUrl('');
                setStorySong('None');
            } else {
                const err = await res.json();
                alert(err.error + (err.reason ? '\nReason: ' + err.reason : ''));
            }
        } catch (e) { console.error(e); }
        finally { setPostingStory(false); }
    };

    const handleReplyStory = async (storyId) => {
        if(!storyReply.trim()) return;
        try {
            const res = await fetch(`/api/connect/stories/${storyId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({ authorName: userName, text: storyReply })
            });
            if(res.ok) setStoryReply('');
        } catch(e){}
    };

    const handleLikeStory = async (storyId) => {
        setStories(p => p.map(s => 
            s.id === storyId ? { ...s, likes: s.likes?.includes(userId) ? s.likes.filter(x=>x!==userId) : [...(s.likes||[]), userId] } : s
        ));
        try {
            await fetch(`/api/connect/stories/${storyId}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId }, body: JSON.stringify({ userId }) });
        } catch(e){}
    };

    const handlePost = async () => {
        if (!draftContent.trim()) return;
        setPosting(true);
        try {
            const res = await fetch('/api/connect/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-school-id': schoolId },
                body: JSON.stringify({
                    authorName: userName,
                    authorPhoto: userProfilePhoto,
                    role: displayRole,
                    content: draftContent,
                    imageUrl: draftImageUrl || null,
                    feeling: draftFeeling || null,
                    location: draftLocation || null,
                    style: draftStyle || null,
                    visibility: 'all',
                })
            });
            if (res.ok) {
                const created = await res.json();
                setPosts(p => [created, ...p]);
                setDraftContent('');
                setDraftImageUrl('');
                setDraftFeeling('');
                setDraftLocation('');
                setDraftStyle(null);
                setShowImageInput(false);
                setShowFeelingPicker(false);
                setShowLocationInput(false);
                setShowStylePicker(false);
            } else {
                const err = await res.json();
                alert(err.error + (err.reason ? '\nReason: ' + err.reason : ''));
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
        } catch (e) {
            console.error('Failed to like post:', e);
            fetchPosts(false); 
        }
    };

    const handleComment = async (postId, directText) => {
        const text = directText || (commentInput[postId] || '').trim();
        if (!text) return;
        try {
            const res = await fetch(`/api/connect/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-school-id': schoolId,
                    'x-user-id': userId
                },
                body: JSON.stringify({ authorName: userName, authorPhoto: userProfilePhoto, text })
            });
            if (res.ok) {
                const comment = await res.json();
                setPosts(p => p.map(post =>
                    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
                ));
                setCommentInput(c => ({ ...c, [postId]: '' }));
            } else {
                const err = await res.json();
                alert(err.error + (err.reason ? '\nReason: ' + err.reason : ''));
            }
        } catch (e) { console.error(e); }
    };



    return (
        <div className="min-h-screen -m-6 bg-[#FAF5FF] font-inter">
            {/* ── Top Navbar ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-purple-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    {/* Toggle & Logo */}
                    <div className="flex items-center gap-4 shrink-0">
                        <button 
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 -ml-2 rounded-xl text-purple-400 hover:bg-purple-50 transition-all active:scale-95"
                            title="Toggle Menu"
                        >
                            {showSidebar ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="flex items-center gap-2.5">
                            {schoolBranding.logo ? (
                                <img src={schoolBranding.logo} alt="School Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <img src={SkullarLogo} alt="Skullar" className="w-8 h-8 object-contain" />
                            )}
                            <div>
                                <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-800 leading-none">{schoolBranding.name}</p>
                                <p className="text-[9px] font-bold text-purple-400 leading-none">Stay Connected</p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-xs">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                            <input
                                type="text"
                                placeholder={`Search ${schoolBranding.name}...`}
                                className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full bg-purple-50 border border-purple-100 focus:outline-none focus:border-violet-300 placeholder:text-purple-300 text-dark-text"
                            />
                        </div>
                    </div>

                    {/* Right: Notification icons + user */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => setActiveNav('Notifications')} className="relative p-2 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-100 transition">
                            <Bell size={16} />
                            {counts.notifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{counts.notifications}</span>
                            )}
                        </button>
                        <button onClick={() => setActiveNav('Messages')} className="relative p-2 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-100 transition">
                            <MessageSquare size={16} />
                            {counts.messages > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{counts.messages}</span>
                            )}
                        </button>
                        <div className="flex items-center gap-2.5 pl-3 border-l border-purple-100">
                            <div className="text-right">
                                <p className="text-xs font-black text-dark-text leading-none">{userName}</p>
                                <p className="text-[10px] text-purple-400 font-bold">{displayRole}</p>
                            </div>
                            <Avatar name={userName} photo={userProfilePhoto} size={9} />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className={clx(
                "max-w-[1600px] mx-auto px-4 pt-0 pb-4 grid gap-4 transition-all duration-300",
                showSidebar 
                    ? (activeNav === 'Messages' ? 'grid-cols-[240px_1fr]' : 'grid-cols-[240px_1fr_300px]')
                    : 'grid-cols-1'
            )}>

                {/* ── Left Sidebar ── */}
                <aside className={clx(
                    "sticky top-20 self-start transition-all duration-300 overflow-hidden",
                    showSidebar ? "w-[240px] opacity-100" : "w-0 opacity-0 pointer-events-none"
                )}>
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

                {/* ── Dynamic Content ── */}
                {activeNav === 'Messages' ? (
                    <DirectMessaging 
                        users={users} 
                        schoolId={schoolId} 
                        userId={userId} 
                        userName={userName} 
                        userRole={userRole} 
                        userProfilePhoto={userProfilePhoto} 
                    />
                ) : activeNav === 'Achievements' ? (
                    <main className="space-y-4 min-w-0">
                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-dark-text italic tracking-tight">Community Leaders</h2>
                                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Top engaged contributors this month</p>
                                </div>
                            </div>
                            
                            <div className="grid gap-4">
                                {users.map(u => {
                                    const userPosts = posts.filter(p => p.authorName === u.name);
                                    const score = userPosts.length * 10 + userPosts.reduce((acc, p) => acc + (p.likes?.length || 0) * 2 + (p.comments?.length || 0) * 5, 0);
                                    return { ...u, score };
                                }).sort((a,b) => b.score - a.score).map((u, idx) => (
                                    <div key={idx} className={clx("flex items-center gap-4 p-5 rounded-3xl border transition-all", idx === 0 ? "bg-amber-50/30 border-amber-100 shadow-sm" : idx === 1 ? "bg-slate-50/50 border-slate-100" : "bg-white border-purple-50")}>
                                        <div className="text-sm font-black text-purple-200 w-6">#{idx+1}</div>
                                        <Avatar name={u.name} photo={u.profilePhoto} size={14} />
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-dark-text">{u.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-black uppercase">{u.role}</span>
                                                <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1"><Award size={10} /> {u.score} XP</span>
                                            </div>
                                        </div>
                                        {idx === 0 && <Award size={24} className="text-amber-500 drop-shadow-md" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                ) : activeNav === 'Trending' ? (
                    <main className="space-y-4 min-w-0">
                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-dark-text italic tracking-tight">Trending Now</h2>
                                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Top 10 hottest posts this week</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {trendingPosts.map((post, idx) => (
                                    <div key={post.id} className="relative pl-8 group">
                                        <div className="absolute left-0 top-0 text-xl font-black text-purple-100 group-hover:text-violet-200 transition-colors">#{idx+1}</div>
                                        <PostItem
                                            post={post}
                                            userId={userId}
                                            userName={userName}
                                            userProfilePhoto={userProfilePhoto}
                                            onLike={handleLike}
                                            onComment={handleComment}
                                            onShare={handleShareRequest}
                                            onDelete={handleDeletePost}
                                            onSave={handleSavePost}
                                            onUpdate={handleUpdatePost}
                                            onCommentAction={handleCommentAction}
                                            isSaved={savedPosts.some(p => p.id === post.id)}
                                            canDelete={post.authorName === userName || userRole === 'admin'}
                                        />
                                    </div>
                                ))}
                                {trendingPosts.length === 0 && (
                                    <div className="text-center py-12">
                                        <Activity size={40} className="mx-auto text-purple-100 mb-3" />
                                        <p className="text-[11px] text-purple-300 font-black uppercase tracking-widest">No trending activity yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                ) : activeNav === 'Saved Posts' ? (
                    <main className="space-y-4 min-w-0">
                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                                    <Bookmark size={20} />
                                </div>
                                <h2 className="text-xl font-black text-dark-text italic tracking-tight">Saved for Later</h2>
                            </div>
                            
                            <div className="space-y-6">
                                {savedPosts.map(post => (
                                    <PostItem
                                        key={post.id}
                                        post={post}
                                        userId={userId}
                                        userName={userName}
                                        userProfilePhoto={userProfilePhoto}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        onShare={handleShareRequest}
                                        onDelete={handleDeletePost}
                                        onSave={handleSavePost}
                                        onUpdate={handleUpdatePost}
                                        onCommentAction={handleCommentAction}
                                        isSaved={true}
                                        canDelete={post.authorName === userName || userRole === 'admin'}
                                    />
                                ))}
                                {savedPosts.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bookmark size={40} className="mx-auto text-purple-100 mb-3" />
                                        <p className="text-[11px] text-purple-300 font-black uppercase tracking-widest">Your library is empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                ) : activeNav === 'Notifications' ? (
                    <main className="space-y-4 min-w-0">
                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-dark-text italic tracking-tight">Notifications</h2>
                                <button onClick={clearNotifications} className="px-3 py-1 bg-purple-50 text-purple-500 text-[10px] font-black rounded-full uppercase hover:bg-violet-100 hover:text-violet-600 transition">Mark all as read</button>
                            </div>
                            
                            <div className="space-y-2">
                                {notifications.map(n => {
                                    const sender = users.find(u => u.id === n.fromId);
                                    return (
                                        <div key={n.id} className={clx("flex items-start gap-4 p-4 rounded-2xl transition-all border", n.read ? "bg-white border-purple-50 opacity-60" : "bg-violet-50/30 border-violet-100/50 shadow-sm")}>
                                            <Avatar name={sender?.name || 'User'} photo={sender?.profilePhoto} size={11} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-dark-text">{n.message}</p>
                                                <p className="text-[10px] text-purple-400 font-bold mt-1 uppercase leading-none">{timeAgo(n.createdAt)}</p>
                                            </div>
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-violet-600 mt-2 shrink-0" />}
                                        </div>
                                    );
                                })}
                                {notifications.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bell size={40} className="mx-auto text-purple-100 mb-3" />
                                        <p className="text-[11px] text-purple-300 font-black uppercase tracking-widest">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                ) : activeNav === 'My Network' ? (
                    <main className="space-y-4 min-w-0">
                        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-dark-text italic tracking-tight">Social Network</h2>
                                <div className="px-3 py-1 bg-violet-100 text-violet-700 text-[10px] font-black rounded-full uppercase">Beta</div>
                            </div>
                            
                            {/* Pending Requests */}
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock size={16} className="text-purple-400" />
                                    <h3 className="text-xs font-black tracking-widest uppercase text-purple-400">Pending Requests</h3>
                                </div>
                                <div className="grid gap-3">
                                    {connections.filter(c => c.to === userId && c.status === 'pending').map(req => {
                                        const sender = users.find(u => u.id === req.from);
                                        if(!sender) return null;
                                        return (
                                            <div key={req.id} className="flex items-center gap-4 p-5 rounded-3xl bg-purple-50/40 border border-purple-100/50 hover:bg-purple-50 transition-colors">
                                                <Avatar name={sender.name} photo={sender.profilePhoto} size={14} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-black text-dark-text leading-tight">{sender.name}</p>
                                                    <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider mt-0.5">{sender.role}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleAccept(req.id)} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-violet-500/20 hover:opacity-90 transition active:scale-95">Accept</button>
                                                    <button className="px-5 py-2.5 bg-white text-rose-500 rounded-2xl text-[11px] font-black border border-rose-100 hover:bg-rose-50 transition active:scale-95">Decline</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {connections.filter(c => c.to === userId && c.status === 'pending').length === 0 && (
                                        <div className="text-center py-6 bg-purple-50/20 rounded-2xl border border-dashed border-purple-100/50">
                                            <p className="text-[11px] text-purple-300 font-bold">No invitations at the moment</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* My Connections */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Users size={16} className="text-purple-400" />
                                    <h3 className="text-xs font-black tracking-widest uppercase text-purple-400">My Connections</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {connections.filter(c => c.status === 'accepted' && (c.from === userId || c.to === userId)).map(conn => {
                                        const otherId = conn.from === userId ? conn.to : conn.from;
                                        const peer = users.find(u => u.id === otherId);
                                        if(!peer) return null;
                                        return (
                                            <div key={conn.id} className="flex items-center gap-3 p-4 rounded-3xl bg-white border border-purple-50 hover:border-violet-200 transition-all shadow-sm group">
                                                <Avatar name={peer.name} photo={peer.profilePhoto} size={12} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-dark-text truncate leading-tight">{peer.name}</p>
                                                    <p className="text-[10px] text-purple-400 font-bold uppercase mt-0.5">{peer.role}</p>
                                                </div>
                                                <button onClick={() => setActiveNav('Messages')} className="p-2.5 rounded-2xl bg-violet-50 text-violet-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-100">
                                                    <MessageSquare size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                {connections.filter(c => c.status === 'accepted' && (c.from === userId || c.to === userId)).length === 0 && (
                                    <div className="text-center py-12 bg-purple-50/10 rounded-[32px] border border-dashed border-purple-100">
                                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users size={32} className="text-purple-200" />
                                        </div>
                                        <p className="text-xs text-purple-300 font-bold">Your network is empty. Start connecting!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                ) : (
                <><main className="space-y-4 min-w-0">

                    {/* Story Row */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <div className="flex items-center gap-4 overflow-x-auto pb-1 custom-scrollbar">
                            {/* Add Story */}
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <div onClick={() => setShowStoryModal(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 border-2 border-dashed border-violet-300 flex items-center justify-center cursor-pointer hover:from-violet-200 transition">
                                    <Plus size={22} className="text-violet-500" />
                                </div>
                                <p className="text-[10px] font-bold text-gray-500">Add Story</p>
                            </div>
                            {/* Story avatars */}
                            {stories.map((s, i) => (
                                <div key={s.id || i} onClick={() => setViewingStoryIndex(i)} className="flex flex-col items-center gap-2 shrink-0">
                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradient(s.authorName)} text-white flex items-center justify-center font-black text-xl border-3 border-white shadow-md ring-2 ring-violet-400 cursor-pointer`}>
                                        {s.authorName[0]?.toUpperCase()}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-500">{s.authorName.split(' ')[0]}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compose */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <div className={clx("flex items-center gap-3 mb-4 p-4 rounded-2xl transition-all", draftStyle ? `${draftStyle.bg} min-h-[120px] shadow-inner` : "bg-purple-50")}>
                            <Avatar name={userName} photo={userProfilePhoto} size={10} />
                            <div className="flex-1 flex flex-col">
                                {(draftFeeling || draftLocation) && (
                                    <div className={clx("text-[10px] font-bold mb-1", draftStyle ? "text-white/80" : "text-purple-400")}>
                                        {draftFeeling && <span>is feeling {draftFeeling} </span>}
                                        {draftLocation && <span>at {draftLocation}</span>}
                                    </div>
                                )}
                                <textarea
                                    value={draftContent}
                                    onChange={e => setDraftContent(e.target.value)}
                                    placeholder={draftStyle ? "" : `What's on your mind, ${userName.split(' ')[0]}?`}
                                    className={clx(
                                        "w-full bg-transparent outline-none resize-none font-medium placeholder:text-purple-300",
                                        draftStyle ? "text-white text-xl text-center placeholder:text-white/50" : "text-sm text-dark-text"
                                    )}
                                    rows={draftStyle ? 3 : 1}
                                />
                            </div>
                        </div>

                        {showStylePicker && (
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                                <button onClick={() => setDraftStyle(null)} className="w-8 h-8 rounded-lg border-2 border-purple-100 flex items-center justify-center shrink-0 hover:bg-purple-50 transition"><Globe size={14} className="text-purple-300" /></button>
                                {[
                                    { bg: 'bg-gradient-to-r from-violet-600 to-indigo-600', text: 'white' },
                                    { bg: 'bg-gradient-to-r from-rose-500 to-orange-500', text: 'white' },
                                    { bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', text: 'white' },
                                    { bg: 'bg-gradient-to-r from-blue-600 to-cyan-500', text: 'white' },
                                    { bg: 'bg-gradient-to-r from-fuchsia-600 to-purple-600', text: 'white' },
                                    { bg: 'bg-gradient-to-r from-amber-500 to-rose-500', text: 'white' },
                                    ...ACADEMIC_THEMES
                                ].map((style, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setDraftStyle(style)}
                                        className={clx("w-8 h-8 rounded-lg shrink-0 transition-transform active:scale-90 border border-black/5", style.bg, draftStyle?.bg === style.bg && "ring-2 ring-violet-500 ring-offset-2 scale-110 shadow-lg")}
                                        title={style.label || `Style ${i}`}
                                    />
                                ))}
                            </div>
                        )}

                        {showFeelingPicker && (
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {['Happy', 'Excited', 'Focused', 'Blessed', 'Loved', 'Cool', 'Creative', 'Sleepy'].map(f => (
                                    <button key={f} onClick={() => { setDraftFeeling(f); setShowFeelingPicker(false); }} className={clx("px-3 py-1.5 rounded-full text-[11px] font-bold transition-all", draftFeeling === f ? 'bg-violet-600 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100')}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showLocationInput && (
                            <div className="mb-4 relative">
                                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                                <input
                                    type="text"
                                    value={draftLocation}
                                    onChange={e => setDraftLocation(e.target.value)}
                                    placeholder="Where are you?"
                                    className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-purple-50 border border-purple-100 focus:outline-none focus:border-violet-300 placeholder:text-purple-300 text-dark-text"
                                />
                                <button onClick={() => { setDraftLocation(''); setShowLocationInput(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-400">CLEAR</button>
                            </div>
                        )}

                        {draftImageUrl && (
                            <div className="mb-4 relative rounded-2xl overflow-hidden group">
                                <img src={draftImageUrl} alt="Draft" className="w-full max-h-60 object-cover" />
                                <button onClick={() => setDraftImageUrl('')} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-purple-50 pt-3">
                            <div className="flex items-center gap-1">
                                <input type="file" id="post-file" hidden accept="image/*" onChange={handlePostFileChange} />
                                <label
                                    htmlFor="post-file"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                >
                                    <ImageIcon size={15} /> Photo
                                </label>
                                <button onClick={() => setShowStylePicker(!showStylePicker)} className={clx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition", showStylePicker ? "bg-violet-100 text-violet-600" : "text-violet-500 hover:bg-violet-50")}>
                                    <Video size={15} /> Style
                                </button>
                                <button onClick={() => setShowFeelingPicker(!showFeelingPicker)} className={clx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition", showFeelingPicker ? "bg-amber-100 text-amber-600" : "text-amber-500 hover:bg-amber-50")}>
                                    <Smile size={15} /> Feeling
                                </button>
                                <button onClick={() => setShowLocationInput(!showLocationInput)} className={clx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition", showLocationInput ? "bg-rose-100 text-rose-600" : "text-rose-500 hover:bg-rose-50")}>
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
                        posts.map(post => (
                            <PostItem
                                key={post.id}
                                post={post}
                                userId={userId}
                                userName={userName}
                                userProfilePhoto={userProfilePhoto}
                                onLike={handleLike}
                                onComment={handleComment}
                                onShare={handleShareRequest}
                                onDelete={handleDeletePost}
                                onSave={handleSavePost}
                                onUpdate={handleUpdatePost}
                                onCommentAction={handleCommentAction}
                                isSaved={savedPosts.some(s => s.id === post.id)}
                                canDelete={post.authorId === userId || userRole === 'admin'}
                            />
                        ))
                    )}
                </main>

                {/* ── Right Sidebar ── */}
                <aside className="sticky top-20 self-start space-y-4">
                    {/* Suggested Connections */}
                    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4">
                        <h3 className="text-sm font-black text-dark-text mb-3">Suggested Connections</h3>
                        <div className="space-y-3">
                            {users.filter(u => u.id !== userId).slice(0, 5).map((u, i) => {
                                const conn = connections.find(c => (c.from === userId && c.to === u.id) || (c.from === u.id && c.to === userId));
                                const isPending = conn?.status === 'pending';
                                const isConnected = conn?.status === 'accepted';
                                
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <Avatar name={u.name} photo={u.profilePhoto} size={9} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-dark-text truncate">{u.name}</p>
                                            <p className="text-[10px] text-purple-400 font-medium">{u.role}</p>
                                        </div>
                                        {isConnected ? (
                                            <button onClick={() => setActiveNav('Messages')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition">
                                                <MessageSquare size={14} />
                                            </button>
                                        ) : isPending ? (
                                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                                                <Clock size={14} />
                                            </div>
                                        ) : (
                                            <button onClick={() => handleConnect(u.id)} className="p-1.5 rounded-lg bg-violet-50 text-violet-500 hover:bg-violet-100 transition">
                                                <UserPlus size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
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
                        <p className="text-sm font-black">{schoolBranding.name}</p>
                        <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1"><Lock size={10} />Intra-school only</p>
                    </div>
                </aside>
                </>
                )}
            </div>

            {/* Create Story Modal */}
            {showStoryModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-purple-50 flex justify-between items-center bg-purple-50/30">
                            <h3 className="font-black text-dark-text text-sm">Add to Story</h3>
                            <button onClick={() => setShowStoryModal(false)} className="text-purple-300 hover:text-rose-500 transition">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <textarea
                                value={storyContent}
                                onChange={e => setStoryContent(e.target.value)}
                                placeholder="Write something or add a caption..."
                                className="w-full bg-purple-50 rounded-2xl px-5 py-4 text-sm text-dark-text font-medium placeholder:text-purple-300 border border-purple-100 focus:border-violet-300 focus:bg-white outline-none min-h-[120px] resize-none"
                            />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black tracking-widest uppercase text-gray-400 pl-1">Media & Music</label>
                                {/* Preview Box */}
                                {storyImageUrl && (
                                    <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden shadow-inner group">
                                        <img src={storyImageUrl} alt="Preview" className="w-full h-full object-cover opacity-80 transition group-hover:scale-105" />
                                        <button onClick={() => setStoryImageUrl('')} className="absolute top-2 right-2 text-white bg-black/50 p-1.5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-rose-500 transition shadow-md">✕</button>
                                        {storyContent && <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] bg-black/40 backdrop-blur-sm p-1.5 rounded-lg line-clamp-2">{storyContent}</p>}
                                    </div>
                                )}
                                
                                {!storyImageUrl && (
                                    <label className="w-full bg-purple-50 hover:bg-violet-50 rounded-xl px-4 py-3 text-xs text-violet-500 font-bold border border-dashed border-violet-200 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                                        <ImageIcon size={16} />
                                        Upload Photo or Video
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleStoryFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                <select 
                                    value={storySong} 
                                    onChange={e => setStorySong(e.target.value)}
                                    className="w-full bg-purple-50 rounded-xl px-4 py-2.5 text-xs text-dark-text font-medium border border-purple-100 focus:border-violet-300 focus:bg-white outline-none appearance-none"
                                >
                                    {TRENDING_SONGS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handlePostStory}
                                disabled={postingStory || (!storyContent.trim() && !storyImageUrl.trim())}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-2xl text-sm font-black shadow-lg shadow-violet-500/20 hover:opacity-90 disabled:opacity-50 transition-all mt-2"
                            >
                                {postingStory ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Add to Story
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Instagram Style Story Carousel */}
            {viewingStoryIndex !== -1 && (
                <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex items-center justify-center overflow-hidden font-inter touch-none">
                    
                    {/* Background Blur */}
                    {stories[viewingStoryIndex]?.imageUrl && (
                        <div className="absolute inset-0 z-0">
                            <img src={stories[viewingStoryIndex].imageUrl} className="w-full h-full object-cover opacity-20 blur-3xl scale-125" alt="" />
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {viewingStoryIndex > 0 && (
                        <button onClick={() => setViewingStoryIndex(i => i - 1)} className="absolute left-4 md:left-8 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition shadow-xl hidden md:flex">
                            <ChevronDown size={24} className="rotate-90 ml-0.5 mt-0.5" />
                        </button>
                    )}
                    {viewingStoryIndex < stories.length - 1 && (
                        <button onClick={() => setViewingStoryIndex(i => i + 1)} className="absolute right-4 md:right-8 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition shadow-xl hidden md:flex">
                            <ChevronDown size={24} className="-rotate-90 mr-0.5 mt-0.5" />
                        </button>
                    )}

                    {/* Close */}
                    <button onClick={() => setViewingStoryIndex(-1)} className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] text-white hover:bg-white/10 p-3 rounded-full backdrop-blur-sm transition font-black">
                        ✕
                    </button>

                    {/* Main Track */}
                    <div className="relative flex items-center justify-center w-full h-[100dvh] md:h-[90vh] md:gap-8">
                        {stories.map((story, i) => {
                            const isCenter = i === viewingStoryIndex;
                            const isLeft = i === viewingStoryIndex - 1;
                            const isRight = i === viewingStoryIndex + 1;
                            
                            if (!isCenter && !isLeft && !isRight) return null;

                            const liked = story.likes?.includes(userId);

                            return (
                                <div 
                                    key={story.id} 
                                    className={clx(
                                        "absolute md:relative rounded-b-lg md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out select-none",
                                        isCenter ? "w-full max-w-[420px] h-full z-50 md:ring-1 md:ring-white/10" : "hidden md:flex w-[280px] h-[75vh] opacity-30 scale-[0.8] blur-[2px] cursor-pointer hover:opacity-50 z-30"
                                    )}
                                    // Touch areas for mobile navigation
                                    onClick={(e) => {
                                        if (isLeft) setViewingStoryIndex(i);
                                        if (isRight) setViewingStoryIndex(i);
                                        if (isCenter && e.clientX > window.innerWidth / 2) setViewingStoryIndex(prev => Math.min(stories.length - 1, prev + 1));
                                        if (isCenter && e.clientX <= window.innerWidth / 2) setViewingStoryIndex(prev => Math.max(0, prev - 1));
                                    }}
                                >
                                    {/* Visual Content */}
                                    <div className="absolute inset-0 bg-[#0f0f0f] pointer-events-none overflow-hidden">
                                        {story.imageUrl && <img src={story.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" onError={e=>e.target.style.display='none'} />}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                                    </div>

                                    {/* Top Metadata */}
                                    {isCenter && (
                                        <div className="absolute top-0 inset-x-0 p-3 pt-6 md:pt-4 z-20 flex flex-col gap-3 pointer-events-none text-white">
                                            {/* Segmented Progress */}
                                            <div className="flex gap-1.5 shadow-sm">
                                                {stories.map((_, idx) => (
                                                    <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                                                        {idx <= viewingStoryIndex && <div className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] w-full" />}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(story.authorName)} flex items-center justify-center font-black text-[11px] shadow-lg border-2 border-white/90 pointer-events-auto`}>
                                                    {story.authorName[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 drop-shadow-md">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-[13px] font-bold">{story.authorName}</p>
                                                        <span className="text-[11px] opacity-80 font-medium">{timeAgo(story.createdAt)}</span>
                                                    </div>
                                                    {story.song && (
                                                        <p className="text-[10px] flex items-center gap-1 opacity-90 mt-0.5 max-w-[200px] truncate"><Video size={10} className="shrink-0"/> {story.song}</p>
                                                    )}
                                                </div>
                                                <button className="pointer-events-auto p-1 hover:bg-white/10 rounded-full transition mr-8 md:mr-0">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Caption (Center) */}
                                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 z-10 flex flex-col justify-center pointer-events-none pb-12">
                                        {story.content && (
                                            <p className={clx("text-white font-black text-center leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] whitespace-pre-wrap", 
                                                isCenter ? (story.content.length < 200 ? "text-3xl italic" : "text-xl font-medium") : "text-sm font-medium", 
                                                story.imageUrl && "bg-black/40 backdrop-blur-sm self-center p-4 rounded-3xl w-max max-w-full text-left inline-block"
                                            )}>
                                                {story.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom Action Bar */}
                                    {isCenter && (
                                        <div className="absolute bottom-0 inset-x-0 p-4 pb-8 md:pb-4 z-40 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                            <div className="flex-1 bg-black/40 border border-white/20 rounded-full flex items-center px-4 py-3 backdrop-blur-md focus-within:bg-black/60 transition-colors">
                                                <input 
                                                    type="text" 
                                                    placeholder={`Reply to ${story.authorName}...`} 
                                                    value={storyReply}
                                                    onChange={e => setStoryReply(e.target.value)}
                                                    onKeyDown={e => {
                                                        if(e.key === 'Enter') handleReplyStory(story.id);
                                                    }}
                                                    className="bg-transparent outline-none flex-1 text-[13px] font-medium text-white placeholder:text-white/70"
                                                />
                                            </div>
                                            <button onClick={() => handleLikeStory(story.id)} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-white hover:bg-white/10 backdrop-blur-sm transition group">
                                                <Heart className={clx("transition-transform group-active:scale-75", liked && "fill-rose-500 text-rose-500")} size={24} />
                                            </button>
                                            <button onClick={() => handleReplyStory(story.id)} disabled={!storyReply.trim()} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-white disabled:opacity-30 hover:bg-white/10 backdrop-blur-sm transition">
                                                <Send size={22} className="-mt-0.5 ml-0.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title={deleteModal.type === 'post' ? 'Delete Post' : 'Delete Comment'}
                message={`Are you sure you want to remove this ${deleteModal.type}? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, postId: null, commentId: null, type: 'post' })}
            />

            <ReshareModal 
                isOpen={reshareModal.isOpen}
                post={reshareModal.post}
                onReshare={handleReshare}
                onCancel={() => setReshareModal({ isOpen: false, post: null })}
            />
        </div>
    );
}
