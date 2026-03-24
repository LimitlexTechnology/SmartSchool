import React, { useState, useEffect } from 'react';
import { Bell, X, MessageSquare, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const getStorageKey = () => `notifications_last_seen_${localStorage.getItem('userRole') || 'default'}`;

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                
                // For simplicity, we'll use localStorage to track what was last seen
                const lastSeenStr = localStorage.getItem(getStorageKey()) || '0';
                const lastSeen = new Date(parseInt(lastSeenStr));
                const newUnread = data.filter(n => new Date(n.createdAt) > lastSeen).length;
                setUnreadCount(newUnread);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            // Mark all as seen locally when opening
            setUnreadCount(0);
            localStorage.setItem(getStorageKey(), Date.now().toString());
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'announcement': return <MessageSquare size={16} className="text-blue-500" />;
            case 'assignment': return <ClipboardList size={16} className="text-purple-500" />;
            case 'behavior': return <TrendingUp size={16} className="text-green-500" />;
            default: return <Bell size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={handleBellClick}
                className="relative p-2 rounded-button bg-light-bg text-dark-text hover:text-primary-teal transition-colors"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-[49]" onClick={() => setShowDropdown(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[50] animate-slide-up">
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-text">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold text-primary-teal bg-primary-teal/10 px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none cursor-pointer group transition-colors"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate(notif.link);
                                        }}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">{getIcon(notif.type)}</div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-dark-text group-hover:text-primary-teal transition-colors">
                                                    {notif.title}
                                                </p>
                                                <p className="text-[10px] text-muted-text line-clamp-2 mt-0.5 leading-relaxed">
                                                    {notif.content}
                                                </p>
                                                <p className="text-[9px] text-gray-400 mt-1 font-medium">
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                                    <p className="text-sm font-bold text-muted-text italic">No notifications yet</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-2 border-t border-gray-50">
                            <button 
                                onClick={() => {
                                    setShowDropdown(false);
                                }}
                                className="w-full py-2 text-center text-[10px] font-black text-primary-teal uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
