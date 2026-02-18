import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu,
    X,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Calendar,
    Wallet,
    BarChart3,
    Smartphone,
    Check,
    BrainCircuit,
    Users
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: ShieldCheck,
            title: "Smart Wristbands",
            description: "Real-time safety tracking and cashless campus payments for every student."
        },
        {
            icon: Sparkles,
            title: "AI Teacher Assistant",
            description: "Generate lesson notes, quizzes, and personalized learning paths in seconds."
        },
        {
            icon: Calendar,
            title: "Parent-School Diary",
            description: "Seamless communication with daily memories, event alerts, and feedback."
        },
        {
            icon: Wallet,
            title: "Digital Wallet",
            description: "Secure, monitored spending for canteen, books, and transport services."
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Deep insights into performance trends and school-wide finance reporting."
        },
        {
            icon: Smartphone,
            title: "Mobile First",
            description: "Full management suite optimized for teachers, parents, and admins on the go."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-teal rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <span className="text-xl font-bold text-dark-text tracking-tight">Smart School</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-muted-text font-medium hover:text-primary-teal transition-colors">Features</a>
                        <a href="#ai" className="text-muted-text font-medium hover:text-primary-teal transition-colors">AI Assistant</a>
                        <a href="#assessments" className="text-muted-text font-medium hover:text-primary-teal transition-colors">Assessments</a>
                        <Link to="/dashboard">
                            <Button>Launch App</Button>
                        </Link>
                    </div>

                    <button className="md:hidden text-dark-text" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl">
                        <a href="#features" className="text-muted-text font-medium py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
                        <a href="#ai" className="text-muted-text font-medium py-2" onClick={() => setIsMenuOpen(false)}>AI Assistant</a>
                        <a href="#assessments" className="text-muted-text font-medium py-2" onClick={() => setIsMenuOpen(false)}>Assessments</a>
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                            <Button fullWidth>Launch App</Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-[#EBF4F6] relative overflow-hidden">
                {/* Background SVG Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="flex flex-col gap-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-teal/10 rounded-full w-fit mx-auto lg:mx-0">
                            <Sparkles size={16} className="text-primary-teal" />
                            <span className="text-xs font-black text-primary-teal uppercase tracking-widest">Next-Gen Education SaaS</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] leading-tight tracking-tighter">
                            The Future of <span className="text-primary-teal relative">
                                School Management
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M1 9C50 3 150 3 299 9" stroke="#09637E" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </span> is Here.
                        </h1>
                        <p className="text-xl text-muted-text max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                            An all-in-one platform integrating <span className="text-dark-text font-bold">smart safety</span>, <span className="text-dark-text font-bold">AI-powered teaching</span>, and <span className="text-dark-text font-bold">seamless engagement</span> for the modern campus.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/dashboard">
                                <Button className="px-10 h-[64px] text-lg rounded-2xl shadow-xl shadow-primary-teal/20 flex items-center gap-3 group">
                                    Launch Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" className="px-10 h-[64px] text-lg rounded-2xl border-2 border-primary-teal/20 text-[#09637E] hover:bg-white transition-all">
                                Watch Product Demo
                            </Button>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                        {['JD', 'SM', 'RK', 'AL'][i - 1]}
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    {[1, 2, 3, 4, 5].map(i => <CheckCircle2 key={i} size={12} fill="currentColor" />)}
                                </div>
                                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Trusted by 500+ Institutions</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        {/* Premium Visual Representation */}
                        <div className="relative w-full aspect-square max-w-[550px] mx-auto">
                            {/* Animated Background Effects */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary-teal/20 to-soft-teal/20 rounded-full blur-[120px] animate-pulse-slow"></div>

                            {/* Hovering Glassmorphism Dashboard Mock */}
                            <div className="absolute inset-0 z-10 transition-transform duration-500 group-hover:rotate-1 group-hover:scale-105">
                                <Card className="w-full h-full bg-white/40 backdrop-blur-2xl rounded-[48px] border-white/50 shadow-2xl overflow-hidden p-0 flex flex-col">
                                    <div className="bg-[#0F172A] h-[60px] flex items-center justify-between px-8 border-b border-white/10">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-error/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-warning/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-success/50"></div>
                                        </div>
                                        <div className="w-48 h-2 bg-white/10 rounded-full"></div>
                                        <div className="w-6 h-6 rounded-lg bg-primary-teal"></div>
                                    </div>
                                    <div className="flex-1 p-8 flex flex-col gap-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-32 bg-primary-teal/10 rounded-3xl border border-primary-teal/20 p-6 flex flex-col justify-between">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-teal shadow-sm"><Users size={20} /></div>
                                                <div className="w-12 h-2 bg-primary-teal/20 rounded-full"></div>
                                            </div>
                                            <div className="h-32 bg-soft-teal/10 rounded-3xl border border-soft-teal/20 p-6 flex flex-col justify-between">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-soft-teal shadow-sm"><Wallet size={20} /></div>
                                                <div className="w-12 h-2 bg-soft-teal/20 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white/50 rounded-4xl border border-white p-6 relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                                                <div className="w-8 h-8 rounded-full bg-primary-teal/10"></div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                                                <div className="w-3/4 h-2 bg-gray-100 rounded-full"></div>
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Floating UI Elements */}
                                <div className="absolute top-10 -right-12 animate-bounce-slow delay-150">
                                    <Card className="p-4 bg-white/80 backdrop-blur-xl border-white shadow-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><ShieldCheck /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-text uppercase">Student Safe</p>
                                            <p className="text-xs font-bold">Campus Entrance A</p>
                                        </div>
                                    </Card>
                                </div>

                                <div className="absolute -bottom-6 -left-12 animate-bounce-slow">
                                    <Card className="p-4 bg-white/80 backdrop-blur-xl border-white shadow-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-teal text-white flex items-center justify-center shadow-lg shadow-primary-teal/20"><Sparkles /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-text uppercase tracking-widest">AI Generated</p>
                                            <p className="text-xs font-bold">Physics Lesson Plan</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 max-w-7xl mx-auto px-6 relative">
                <div className="text-center mb-20 flex flex-col gap-5">
                    <div className="w-12 h-1 bg-primary-teal mx-auto rounded-full"></div>
                    <h2 className="text-4xl md:text-6xl font-black text-dark-text tracking-tight">Everything you need to <br className="hidden md:block" /> run a <span className="text-primary-teal italic">modern</span> school.</h2>
                    <p className="text-lg text-muted-text max-w-2xl mx-auto font-medium">
                        Unified modules designed for high-performance administrative control and student success.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, i) => (
                        <Card key={i} padding="large" className="group border-transparent hover:border-primary-teal/20 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary-teal/5 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-teal/5 rounded-full blur-3xl group-hover:bg-primary-teal/10 transition-colors"></div>

                            <div className="w-16 h-16 rounded-2xl bg-primary-teal/5 text-primary-teal flex items-center justify-center mb-8 group-hover:bg-primary-teal group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                                <feature.icon size={30} />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-dark-text">{feature.title}</h3>
                            <p className="text-muted-text font-medium leading-relaxed mb-6">{feature.description}</p>

                            <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-teal opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                Learn More <ArrowRight size={14} />
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            {/* AI Assistant Section */}
            <section id="ai" className="py-32 bg-[#0F172A] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-teal/5 blur-[120px] rounded-full"></div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative group perspective-1000">
                        {/* Holographic AI UI Component */}
                        <div className="relative rotate-y-12 transition-transform duration-700 group-hover:rotate-y-0">
                            <Card padding="none" className="bg-white/5 backdrop-blur-xl rounded-[40px] overflow-hidden border-white/10 shadow-[0_0_50px_rgba(9,99,126,0.3)]">
                                <div className="bg-gradient-to-r from-primary-teal to-soft-teal p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
                                            <Sparkles className="text-white" size={18} />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest">AI Intelligence</span>
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">v4.2 Engine</div>
                                </div>
                                <div className="p-10 flex flex-col gap-8">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-teal/20 flex items-center justify-center text-primary-teal"><BrainCircuit /></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                                            <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="relative p-6 bg-white/5 rounded-3xl border border-white/5">
                                        <p className="text-sm font-medium italic text-soft-teal leading-relaxed">
                                            "Generate a comprehensive lesson plan for Grade 10 Physics: The Water Cycle, including 5 interactive MCQ questions and a visual aids guide..."
                                        </p>
                                        <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-soft-teal rounded-full blur-xl opacity-50"></div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="w-2 h-2 bg-primary-teal rounded-full shadow-[0_0_10px_#09637E]"></div>
                                                <div className="flex-1 h-3 bg-white/5 rounded-full relative overflow-hidden">
                                                    <div className={`absolute inset-0 bg-primary-teal/30 w-[${i === 1 ? '85%' : '60%'}]`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 relative z-10">
                        <div className="w-16 h-1 bg-soft-teal rounded-full"></div>
                        <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                            AI Powered Teaching. <br />
                            <span className="text-soft-teal">Reduced Workload.</span>
                        </h2>
                        <p className="text-xl text-white/60 leading-relaxed font-medium">
                            Empower your educators with cutting-edge AI. From drafting lesson notes to personalizing student assessments, Smart School automates the routine so teachers can focus on <span className="text-white underline decoration-soft-teal underline-offset-4">mentoring</span>.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                            {[
                                { t: 'Lesson Autopilot', d: 'Generate full notes from topics' },
                                { t: 'Smart Quizzing', d: 'Auto-draft MCQ & Short answers' },
                                { t: 'Insight Engine', d: 'Predictive student performance' },
                                { t: 'Content Library', d: 'Interactive teaching auxiliary' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="mt-1 p-1 bg-white/10 text-soft-teal rounded-lg group-hover:bg-soft-teal group-hover:text-[#0F172A] transition-all"><Check size={16} strokeWidth={4} /></div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{item.t}</h4>
                                        <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-fit px-10 py-5 bg-soft-teal hover:bg-white border-none text-[#0F172A] font-black uppercase tracking-widest text-xs mt-6 transition-all shadow-xl shadow-soft-teal/10">
                            Explore Intelligence Tools
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="bg-light-bg pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-[#0F172A] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-teal/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-soft-teal/20 rounded-full -ml-32 -mb-32 blur-[80px]"></div>

                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10">
                            Ready to transform <br className="hidden md:block" /> your school?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Button className="px-10 h-[60px] text-lg rounded-2xl bg-primary-teal border-none">
                                Start Free Trial
                            </Button>
                            <Button variant="outline" className="px-10 h-[60px] text-lg rounded-2xl border-white/20 text-white hover:bg-white/10">
                                Contact Sales
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 mb-12">
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-teal rounded-lg flex items-center justify-center text-white font-bold">S</div>
                                <span className="font-bold text-dark-text text-lg">Smart School</span>
                            </div>
                            <p className="text-muted-text text-sm">
                                Revolutionizing education through technology and connectivity.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-dark-text mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-muted-text">
                                <li><a href="#" className="hover:text-primary-teal">Wristbands</a></li>
                                <li><a href="#" className="hover:text-primary-teal">AI Editor</a></li>
                                <li><a href="#" className="hover:text-primary-teal">Assessments</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-dark-text mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-muted-text">
                                <li><a href="#" className="hover:text-primary-teal">About Us</a></li>
                                <li><a href="#" className="hover:text-primary-teal">Careers</a></li>
                                <li><a href="#" className="hover:text-primary-teal">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-dark-text mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-muted-text">
                                <li><a href="#" className="hover:text-primary-teal">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-teal">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-primary-teal">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-gray-200 text-center text-sm text-muted-text">
                        © 2026 Smart School SaaS. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
