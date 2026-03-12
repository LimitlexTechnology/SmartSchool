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
    Users,
    ListChecks,
    Utensils,
    History
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import parentHero from '../assets/parent-hero.png';
import studentHero from '../assets/student-hero.png';
import SkullarLogo from '../assets/Skullar Logo.png';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const slides = [
        {
            title: "Future of Institution Management.",
            subtitle: "Smart Excellence",
            description: "Empower your school with 360-degree automation. From smart wristbands to institutional performance insights.",
            cta: "Transform Your School",
            secondaryCta: "Book a Demo",
            theme: "soft-teal"
        },
        {
            title: "Innovation in Every Classroom.",
            subtitle: "AI-Powered Success",
            description: "Automate lesson planning and administrative overhead. Focus on what matters: student growth and safety.",
            cta: "Get Started Free",
            secondaryCta: "Watch Highlights",
            theme: "primary-teal"
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const moveX = (clientX - window.innerWidth / 2) / 50;
            const moveY = (clientY - window.innerHeight / 2) / 50;
            setMousePos({ x: moveX, y: moveY });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(timer);
        };
    }, [slides.length]);

    const ReactionBubbles = ({ active }) => {
        if (!active) return null;
        return (
            <div className="absolute inset-0 pointer-events-none z-50">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl animate-float-up opacity-0"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            bottom: '20%',
                            animationDelay: `${i * 0.5}s`,
                        }}
                    >
                        {['✨', '💖', '🎓', '📚', '🚀', '🔥'][i % 6]}
                    </div>
                ))}
            </div>
        );
    };

    const features = [
        {
            icon: ShieldCheck,
            title: "Smart Wristbands",
            description: "Unified check-in/out, cashless payments, and bus/library passes for every student."
        },
        {
            icon: Sparkles,
            title: "AI Teacher Assistant",
            description: "Automate lesson plans, report remarks, and gain deep performance insights via AI."
        },
        {
            icon: ListChecks,
            title: "Assessments Suite",
            description: "Comprehensive quizzes, class tests, and automated homework management."
        },
        {
            icon: Calendar,
            title: "Parent-School Diary",
            description: "Seamless real-time communication feed and shared institutional calendars."
        },
        {
            icon: Utensils,
            title: "Canteen & Transport",
            description: "Integrated logistics for campus dining and safe student transportation tracking."
        },
        {
            icon: History,
            title: "Accounting & Inventory",
            description: "Professional financial management and automated inventory tracking for schools."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-inter">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={SkullarLogo} alt="Skullar" className="w-[150px] h-auto object-contain" />
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-muted-text font-medium hover:text-primary-teal transition-colors">Features</a>
                        <a href="#ai" className="text-muted-text font-medium hover:text-primary-teal transition-colors">AI Assistant</a>
                        <a href="#assessments" className="text-muted-text font-medium hover:text-primary-teal transition-colors">Assessments</a>
                        <Link to="/login">
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
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            <Button fullWidth>Launch App</Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Carousel Section */}
            <section className="pt-24 pb-20 md:pt-40 md:pb-32 bg-[#EBF4F6] relative overflow-hidden min-h-[850px] flex items-center">
                {/* Background Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none transition-transform duration-700 ease-out"
                    style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
                >
                    <svg width="100%" height="100%">
                        <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#09637E" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#hero-grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full relative z-10">
                    {/* Left Content - Dynamic Text */}
                    <div className="flex flex-col gap-8 text-center lg:text-left animate-fade-in" key={currentSlide}>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-teal/10 rounded-full w-fit mx-auto lg:mx-0 transition-all duration-500`}>
                            <Sparkles size={16} className="text-primary-teal" />
                            <span className="text-xs font-black text-primary-teal uppercase tracking-widest">{slides[currentSlide].subtitle}</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold text-[#0F172A] leading-[1] tracking-tighter">
                            {slides[currentSlide].title.split(',')[0]}, <br />
                            <span className="text-primary-teal relative inline-block">
                                {slides[currentSlide].title.split(',')[1]}
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M1 9C50 3 150 3 299 9" stroke="#09637E" strokeWidth="6" strokeLinecap="round" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-xl text-muted-text max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                            {slides[currentSlide].description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <Link to="/dashboard">
                                <Button className="px-12 h-[72px] text-xl rounded-2xl shadow-2xl shadow-primary-teal/30 flex items-center gap-3 group bg-[#0F172A] border-none">
                                    {slides[currentSlide].cta} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                            <div className="flex -space-x-4 items-center">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#EBF4F6] bg-gray-200"></div>
                                ))}
                                <div className="pl-6 text-sm font-bold text-muted-text uppercase tracking-widest">Global Commmunity</div>
                            </div>
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex gap-3 justify-center lg:justify-start mt-8">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-12 bg-primary-teal' : 'w-2 bg-primary-teal/20'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Visual - Dynamic Illustration & Hovering Stuffs */}
                    <div className="relative group perspective-2000">
                        {/* Hovering Javascript Elements (Stuff) */}
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <div className="absolute top-0 -left-10 animate-bounce-slow" style={{ animationDelay: '0s' }}>
                                <Card className="p-4 bg-white/90 backdrop-blur-xl border-white shadow-2xl flex items-center gap-4 rotate-[-6deg]">
                                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center"><Calendar /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-text uppercase">Upcoming</p>
                                        <p className="text-xs font-bold">Science Fair</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="absolute -bottom-10 right-0 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                                <Card className="p-4 bg-white/90 backdrop-blur-xl border-white shadow-2xl flex items-center gap-4 rotate-[6deg]">
                                    <div className="w-10 h-10 rounded-xl bg-primary-teal text-white flex items-center justify-center shadow-lg"><Wallet /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/50 uppercase">Wallet</p>
                                        <p className="text-xs font-bold text-dark-text">Refilled $50</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="absolute top-1/2 -right-16 animate-pulse-slow">
                                <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-teal shadow-xl border border-white/50">
                                    <Smartphone />
                                </div>
                            </div>
                        </div>

                        {/* Main Visual Composition */}
                        <div
                            className="relative w-full aspect-square max-w-[650px] mx-auto transition-all duration-700 ease-out transform group-hover:rotate-y-12"
                            style={{
                                transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px) rotateY(${mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.5}deg)`
                            }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-tr from-primary-teal/30 to-soft-teal/30 rounded-full blur-[100px] transition-opacity duration-1000 ${currentSlide === 0 ? 'opacity-100' : 'opacity-40'}`}></div>

                            {/* Image Visual Slot */}
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                {currentSlide === 0 ? (
                                    /* Slide 0: African American Parent Image */
                                    <div className="relative w-full h-full animate-fade-in flex flex-col items-center justify-center">
                                        <ReactionBubbles active={currentSlide === 0} />
                                        <div
                                            className="relative w-[90%] aspect-[4/5] rounded-[60px] border-[12px] border-white shadow-3xl overflow-hidden group/img bg-white transition-transform duration-500 ease-out"
                                            style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
                                        >
                                            <img
                                                src={parentHero}
                                                alt="Parent using phone"
                                                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/img:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-40 text-white flex items-center justify-center">
                                                <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-500">
                                                    <Sparkles className="animate-pulse" size={48} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-48 bg-[#09637E]/10 rounded-full blur-3xl -z-10 tracking-widest"></div>
                                    </div>
                                ) : (
                                    /* Slide 1: Student Image with School Bag & Wristband */
                                    <div className="relative w-full h-full animate-fade-in flex flex-col items-center justify-center">
                                        <ReactionBubbles active={currentSlide === 1} />
                                        <div
                                            className="relative w-[85%] aspect-[3/4] rounded-[48px] border-[12px] border-white shadow-3xl overflow-hidden group/img bg-white transition-transform duration-500 ease-out"
                                            style={{ transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)` }}
                                        >
                                            <img
                                                src={studentHero}
                                                alt="Students with wristband"
                                                className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover/img:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary-teal/20 to-transparent flex items-center justify-center">
                                                <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 bg-white/10 backdrop-blur-sm p-4 rounded-full">
                                                    <Users className="text-white animate-bounce" size={40} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating ID Card */}
                                        <div
                                            className="absolute top-10 -right-8 animate-bounce-slow"
                                            style={{ transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)` }}
                                        >
                                            <Card className="w-48 bg-white/95 backdrop-blur-xl p-4 border-none shadow-2xl flex flex-col gap-3 rotate-6 transform hover:rotate-0 transition-all duration-500">
                                                <div className="flex justify-between items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-teal flex items-center justify-center text-white font-bold text-xs">JD</div>
                                                    <div className="w-8 h-2 bg-gray-100 rounded-full"></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-muted-text uppercase tracking-widest">Student Access</p>
                                                    <div className="w-full h-1 bg-gray-50 rounded-full"></div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}
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
                                            &quot;Generate a comprehensive lesson plan for Grade 10 Physics: The Water Cycle, including 5 interactive MCQ questions and a visual aids guide...&quot;
                                        </p>
                                        <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-soft-teal rounded-full blur-xl opacity-50"></div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="w-2 h-2 bg-primary-teal rounded-full shadow-[0_0_10px_#09637E]"></div>
                                                <div className="flex-1 h-3 bg-white/5 rounded-full relative overflow-hidden">
                                                    <div className={`absolute inset-0 bg-primary-teal/30 ${i === 1 ? 'w-[85%]' : 'w-[60%]'}`}></div>
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
                            Empower your educators with cutting-edge AI. From drafting lesson notes to personalizing student assessments, Skullar automates the routine so teachers can focus on <span className="text-white underline decoration-soft-teal underline-offset-4">mentoring</span>.
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
                                <img src={SkullarLogo} alt="Skullar" className="w-[150px] h-auto object-contain" />
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
                        © 2026 Skullar SaaS. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
