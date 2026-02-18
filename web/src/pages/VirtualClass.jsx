import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Users,
    MessageSquare,
    Share2,
    MoreHorizontal,
    PhoneOff,
    Monitor,
    Hand,
    Smile,
    Calendar,
    Settings,
    Shield,
    Bot,
    Plus,
    ChevronRight
} from 'lucide-react';

const VirtualClass = () => {
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const scheduledClasses = [
        { id: 1, title: 'Advanced Physics - Quantum Mechanics', teacher: 'Dr. Robert Oppen', time: 'LIVE NOW', students: 24, status: 'live' },
        { id: 2, title: 'Literature & Composition', teacher: 'Ms. Emily Bronte', time: 'Starts in 15m', students: 18, status: 'upcoming' },
        { id: 3, title: 'Global Economics 101', teacher: 'Prof. Adam Smith', time: 'Starts in 1h', students: 42, status: 'upcoming' },
    ];

    const CallControls = () => (
        <div className="flex items-center gap-4 px-8 py-4 bg-white shadow-2xl rounded-[32px] border border-gray-100 animate-slide-up">
            <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all ${isMuted ? 'bg-error text-white' : 'bg-light-bg text-dark-text hover:bg-gray-100 anim-hover'}`}
            >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-error text-white' : 'bg-light-bg text-dark-text hover:bg-gray-100'}`}
            >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>
            <div className="h-10 w-[1px] bg-gray-100 mx-2" />
            <button className="p-4 rounded-full bg-light-bg text-dark-text hover:bg-gray-100"><Monitor size={22} /></button>
            <button className="p-4 rounded-full bg-light-bg text-dark-text hover:bg-gray-100"><Hand size={22} /></button>
            <button className="p-4 rounded-full bg-light-bg text-dark-text hover:bg-gray-100"><Smile size={22} /></button>
            <div className="h-10 w-[1px] bg-gray-100 mx-2" />
            <button className="p-4 rounded-full bg-primary-teal text-white hover:opacity-90"><Share2 size={22} /></button>
            <button
                onClick={() => setIsInCall(false)}
                className="p-4 rounded-full bg-error text-white hover:bg-error/90 rotate-[135deg]"
            >
                <PhoneOff size={22} />
            </button>
        </div>
    );

    if (isInCall) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-fade-in">
                {/* Main Call Interface */}
                <div className="flex-1 flex gap-6 min-h-0">
                    <div className="flex-1 bg-[#0F172A] rounded-[48px] relative group overflow-hidden border-4 border-white shadow-3xl">
                        {/* Video Feed Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {isVideoOff ? (
                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center text-white text-4xl font-black border-2 border-white/20">
                                    RO
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-primary-teal/20 to-soft-teal/20 flex flex-col items-center justify-center text-white/20">
                                    <Video size={100} strokeWidth={1} />
                                    <p className="mt-4 font-bold uppercase tracking-widest text-sm">HD Live Stream Active</p>
                                </div>
                            )}
                        </div>

                        {/* Overlays */}
                        <div className="absolute top-8 left-8 flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl text-white border border-white/10">
                                <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-widest">Live: Quantum Mechanics</span>
                            </div>
                            <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white/60 text-[10px] uppercase font-bold w-fit">
                                Dr. Robert Oppen
                            </div>
                        </div>

                        <div className="absolute bottom-8 right-8 w-64 h-48 bg-gray-900 rounded-[32px] border-2 border-white/10 shadow-2xl overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex flex-col items-center justify-center text-white/30 italic text-[10px] font-bold">
                                <Users size={24} className="mb-2" />
                                You (Student View)
                            </div>
                        </div>

                        {/* Centered Controls Overlay */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                            <CallControls />
                        </div>
                    </div>

                    {/* Chat & Participants Sidebar */}
                    <div className="w-96 flex flex-col gap-6">
                        <Card className="flex-1 flex flex-col" padding="none">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2"><MessageSquare size={18} /> Classroom Chat</h3>
                                <div className="p-2 bg-light-bg rounded-lg text-primary-teal"><Bot size={20} /></div>
                            </div>
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                <div className="p-4 bg-light-bg rounded-2xl rounded-tl-none border border-gray-100">
                                    <p className="text-xs font-bold text-primary-teal mb-1">Dr. Oppen</p>
                                    <p className="text-sm text-dark-text leading-relaxed">Let&apos;s look at the wave-particle duality equations on page 42...</p>
                                </div>
                                <div className="p-4 bg-primary-teal/5 rounded-2xl rounded-tr-none border border-primary-teal/10 ml-8">
                                    <p className="text-xs font-bold text-muted-text mb-1">Me</p>
                                    <p className="text-sm text-dark-text leading-relaxed">Does this relate to the double-slit experiment results?</p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-50 flex gap-3">
                                <input className="flex-1 bg-light-bg border-none rounded-xl px-4 py-3 text-sm font-medium outline-none" placeholder="Type a question..." />
                                <Button className="p-3 aspect-square h-auto rounded-xl"><Plus size={20} /></Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Virtual Classroom</h1>
                    <p className="text-muted-text mt-1">Institutional-grade live learning and collaboration.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-5 border-gray-200">
                        <Calendar size={18} />
                        Schedule New
                    </Button>
                    <Button className="flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary-teal/20">
                        <Settings size={18} />
                        Configure Room
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Featured Class */}
                <div className="lg:col-span-2">
                    <Card padding="none" className="overflow-hidden group min-h-[450px] relative flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-teal to-[#0F172A] opacity-90 -z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577891748550-699761595192?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center -z-20 grayscale opacity-20" />

                        <div className="p-10 flex flex-col justify-between h-full text-white">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 bg-error rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/30 animate-pulse">Live Broadcast</span>
                                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Institution-Only</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight max-w-xl">
                                    Advanced Physics: <span className="text-soft-teal">Quantum Mechanics</span>
                                </h2>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20"><Users size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/50 uppercase">Students Joined</p>
                                            <p className="text-sm font-black">24 / 32 Present</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20"><Shield size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/50 uppercase">Session Security</p>
                                            <p className="text-sm font-black text-success">End-to-End Encrypted</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 flex flex-col sm:flex-row gap-4 items-center">
                                <Button
                                    className="h-14 px-10 bg-white text-dark-text hover:bg-white/90 rounded-2xl flex items-center gap-3 shadow-2xl"
                                    onClick={() => setIsInCall(true)}
                                >
                                    <Video size={20} />
                                    Join Session Now
                                </Button>
                                <button className="text-white hover:text-soft-teal font-extrabold text-sm uppercase tracking-widest flex items-center gap-2 group">
                                    Request Guest Invite <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Upcoming Schedule */}
                <div className="flex flex-col gap-6">
                    <Card padding="large">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-primary-teal" /> Upcoming Classes
                        </h3>
                        <div className="space-y-4">
                            {scheduledClasses.filter(c => c.status !== 'live').map(cls => (
                                <div key={cls.id} className="p-4 rounded-[24px] border border-gray-100 hover:border-primary-teal/30 hover:bg-light-bg/50 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2 text-primary-teal font-black text-[10px] uppercase tracking-[0.1em]">
                                        <span>{cls.time}</span>
                                        <span className="flex items-center gap-1"><Users size={12} /> {cls.students} scheduled</span>
                                    </div>
                                    <h4 className="font-bold text-dark-text mb-1 group-hover:text-primary-teal transition-colors">{cls.title}</h4>
                                    <p className="text-xs font-medium text-muted-text">{cls.teacher}</p>
                                </div>
                            ))}
                        </div>
                        <Button fullWidth variant="outline" className="mt-6 h-12 rounded-2xl border-gray-200 text-xs font-black uppercase tracking-widest">
                            View Full Schedule
                        </Button>
                    </Card>

                    <Card className="bg-[#0F172A] p-8 text-white border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-teal/40 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <Bot size={32} className="text-soft-teal mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-xl mb-2">Automated Recording</h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                All sessions are automatically transcribed and summarized for your institutional archive.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase border border-white/5">Auto-Transcribe</span>
                                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase border border-white/5">AI Summary</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VirtualClass;
