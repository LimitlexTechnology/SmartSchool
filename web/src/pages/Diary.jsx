import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Image as ImageIcon,
    Video,
    MessageSquare,
    Bell,
    ChevronLeft,
    ChevronRight,
    Plus,
    MapPin,
    Calendar as CalendarIcon,
    Heart,
    Share2,
    X,
    Clock
} from 'lucide-react';

const Diary = () => {
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'calendar'
    const [selectedEvent, setSelectedEvent] = useState(null);

    const posts = [
        {
            id: 1,
            author: "Ms. Sarah Wilson",
            role: "Class Teacher",
            time: "2 hours ago",
            content: "Grade 10B had an amazing science lab session today! We explored the chemical reactions between various metals and hydrochloric acid. Students were very engaged and followed all safety protocols perfectly.",
            hasImage: true,
            comments: 4,
            likes: 12,
            tags: ["Science", "ClassActivity"]
        },
        {
            id: 2,
            author: "Coach Michael",
            role: "Sports Director",
            time: "5 hours ago",
            content: "Reminder: The inter-school basketball tournament starts this Friday at 4:30 PM. Please ensure students have their smart wristbands for attendance and canteen access.",
            hasVideo: true,
            comments: 2,
            likes: 8,
            tags: ["Sports", "Tournament"]
        }
    ];

    const events = [
        { id: 1, title: 'Annual Sports Day', date: 'Oct 20, 2026', time: '08:00 AM', type: 'School-wide', color: 'primary' },
        { id: 2, title: 'Parent-Teacher Meeting', date: 'Oct 22, 2026', time: '02:00 PM', type: 'Class 10B', color: 'secondary' },
        { id: 3, title: 'Science Fair', date: 'Oct 25, 2026', time: '10:00 AM', type: 'Exhibition', color: 'soft' },
        { id: 4, title: 'Autumn Break Begins', date: 'Oct 30, 2026', time: 'N/A', type: 'Holiday', color: 'error' },
    ];

    const CalendarDay = ({ day, isSelected, hasEvent, color }) => {
        const bgColor = isSelected ? 'bg-primary-teal text-white' : 'hover:bg-light-bg';
        return (
            <div
                className={`h-24 md:h-32 border border-gray-50 flex flex-col p-2 transition-all cursor-pointer ${bgColor}`}
                onClick={() => hasEvent && setSelectedEvent({ day, title: 'Sample Event' })}
            >
                <span className="text-sm font-bold opacity-60">{day}</span>
                {hasEvent && (
                    <div className={`mt-2 p-1.5 rounded-lg text-[8px] md:text-[10px] font-bold uppercase truncate shadow-sm
            ${color === 'primary' ? 'bg-primary-teal text-white' : ''}
            ${color === 'secondary' ? 'bg-secondary-teal text-white' : ''}
            ${color === 'soft' ? 'bg-soft-teal text-white' : ''}
            ${color === 'error' ? 'bg-error text-white' : ''}
          `}>
                        {hasEvent}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Parent-School Diary</h1>
                    <p className="text-muted-text mt-1">Daily updates, memories, and school calendar.</p>
                </div>
                <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-[#0F172A] text-white' : 'text-muted-text hover:text-primary-teal'}`}
                    >
                        Daily Feed
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-[#0F172A] text-white' : 'text-muted-text hover:text-primary-teal'}`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {activeTab === 'feed' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feed Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {posts.map(post => (
                            <Card key={post.id} padding="none" className="overflow-hidden group hover:border-primary-teal transition-all">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-light-bg to-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-teal font-black text-xl border-2 border-primary-teal/20 shadow-sm">
                                            {post.author[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-text">{post.author}</h4>
                                            <p className="text-xs font-bold text-muted-text uppercase tracking-widest">{post.role} • {post.time}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-muted-text hover:text-primary-teal transition-all">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <p className="text-[#0F172A] text-lg leading-relaxed mb-6 italic">
                                        "{post.content}"
                                    </p>

                                    {post.hasImage && (
                                        <div className="aspect-video bg-gray-100 rounded-[32px] mb-6 flex items-center justify-center relative overflow-hidden group/img">
                                            <ImageIcon size={48} className="text-gray-300 group-hover/img:scale-110 transition-transform" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary-teal/20 to-transparent"></div>
                                            <div className="absolute bottom-6 left-6 flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase text-primary-teal">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {post.hasVideo && (
                                        <div className="aspect-video bg-[#0F172A] rounded-[32px] mb-6 flex items-center justify-center relative overflow-hidden">
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 text-white animate-pulse">
                                                <Video size={32} />
                                            </div>
                                            <div className="absolute bottom-6 left-6 flex gap-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase text-white">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex gap-6">
                                            <button className="flex items-center gap-2 text-muted-text hover:text-error transition-all group">
                                                <Heart size={20} className="group-hover:fill-error" />
                                                <span className="text-sm font-bold">{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-muted-text hover:text-primary-teal transition-all">
                                                <MessageSquare size={20} />
                                                <span className="text-sm font-bold">{post.comments}</span>
                                            </button>
                                        </div>
                                        <button className="text-muted-text hover:text-primary-teal transition-all">
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-light-bg flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-primary-teal border border-primary-teal/10">JD</div>
                                    <input
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-400"
                                        placeholder="Add a comment or feedback..."
                                    />
                                    <button className="text-primary-teal">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Side Column */}
                    <div className="flex flex-col gap-6">
                        <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                <Bell size={24} className="text-soft-teal" /> Essential Alerts
                            </h3>
                            <div className="flex flex-col gap-4 relative z-10">
                                {[
                                    { text: 'Science Fair Project Due', date: 'Oct 25', color: 'primary' },
                                    { text: 'Uniform Inspection', date: 'Oct 19', color: 'soft' }
                                ].map((alert, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white ${alert.color === 'primary' ? 'bg-primary-teal' : 'bg-soft-teal'}`}>
                                            {alert.date}
                                        </div>
                                        <p className="text-sm font-medium text-white/90">{alert.text}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card padding="large">
                            <h4 className="font-extrabold text-[#0F172A] mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                                <MapPin className="text-primary-teal" size={16} /> Locations Active
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                                    <p className="text-sm font-bold text-dark-text">John: <span className="text-muted-text font-medium">Class 10B (Main Block)</span></p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    <p className="text-sm font-bold text-dark-text">Sarah: <span className="text-muted-text font-medium">Off-campus</span></p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* Calendar View */}
                    <Card padding="none" className="overflow-hidden">
                        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <h3 className="text-2xl font-black text-[#0F172A]">October 2026</h3>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-primary-teal hover:text-white transition-all">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-primary-teal hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                            <Button className="flex items-center gap-2 h-11 px-6">
                                <Plus size={18} /> Add Event
                            </Button>
                        </div>

                        <div className="grid grid-cols-7 border-collapse">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-text bg-light-bg border border-gray-50">
                                    {day}
                                </div>
                            ))}

                            {[...Array(31)].map((_, i) => {
                                const dayNum = i + 1;
                                const event = events.find(e => parseInt(e.date.split(' ')[1]) === dayNum);
                                return (
                                    <CalendarDay
                                        key={i}
                                        day={dayNum}
                                        isSelected={dayNum === 18}
                                        hasEvent={event?.title}
                                        color={event?.color}
                                    />
                                );
                            })}
                        </div>
                    </Card>

                    {/* Event Modal Placeholder */}
                    {selectedEvent && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-dark-text/40 backdrop-blur-md" onClick={() => setSelectedEvent(null)}>
                            <Card className="max-w-md w-full animate-scale-in" padding="large" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-[#0F172A]">Event Details</h3>
                                    <button onClick={() => setSelectedEvent(null)}><X /></button>
                                </div>
                                <div className="bg-primary-teal/10 p-6 rounded-[24px] mb-6">
                                    <h4 className="text-xl font-bold text-primary-teal mb-2">Annual Sports Day</h4>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-muted-text">
                                            <CalendarIcon size={16} /> October 20, 2026
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-muted-text">
                                            <Clock size={16} /> 08:00 AM - 04:00 PM
                                        </div>
                                    </div>
                                </div>
                                <p className="text-muted-text leading-relaxed mb-8">
                                    Join us for a day of teamwork and competition! Students should arrive in their sports kits and bring their smart wristbands for attendance and the canteen.
                                </p>
                                <Button fullWidth onClick={() => setSelectedEvent(null)}>Dismiss</Button>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Diary;
