import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
    Sparkles,
    Save,
    Send,
    History,
    Wand2,
    ChevronRight,
    ListChecks,
    Bold,
    Italic,
    Underline,
    List,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Check,
    X,
    Plus
} from 'lucide-react';

const AILessonNotes = () => {
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAIInsights, setShowAIInsights] = useState(true);

    const suggestions = [
        { text: "Add more interactive activities for Grade 10 students.", details: "Interactive polls and breakout groups." },
        { text: "Include a summary of the 2nd Industrial Revolution.", details: "Key inventions: Steam engine, Telegraph." },
        { text: "Draft 5 quiz questions based on the current notes.", details: "Multi-choice and short answers." },
        { text: "Suggest a relevant video for this topic.", details: "CrashCourse Physics #12 Recommended." }
    ];

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setContent(prev => prev + "\n\n### AI Generated Draft: " + topic + "\nThis lesson covers the fundamental concepts of " + topic + " including its history, mathematical foundations, and real-world applications...");
            setIsGenerating(false);
        }, 1500);
    };

    const ToolbarButton = ({ icon: Icon, active = false }) => (
        <button className={`p-2 rounded-lg transition-all ${active ? 'bg-primary-teal text-white shadow-sm' : 'text-muted-text hover:bg-gray-100 hover:text-dark-text'}`}>
            <Icon size={18} />
        </button>
    );

    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-140px)] animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">AI Lesson Notes Editor</h1>
                    <p className="text-muted-text mt-1">Generate and refine lesson plans with smart assistance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-5 border-gray-200">
                        <History size={18} />
                        History
                    </Button>
                    <Button className="flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary-teal/20">
                        <Save size={18} />
                        Save Draft
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <Card padding="large" className="flex-1 flex flex-col min-h-[600px]">
                        <div className="flex flex-col gap-6 h-full">
                            <Input
                                className="text-xl font-bold h-14 border-none border-b border-gray-100 rounded-none px-0 focus:ring-0"
                                placeholder="Enter Lesson Topic (e.g. Introduction to Calculus)"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />

                            <div className="flex flex-col flex-1 gap-2">
                                {/* Rich Text Toolbar */}
                                <div className="flex flex-wrap items-center gap-1 p-2 bg-light-bg rounded-[16px] border border-gray-100 mb-2">
                                    <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                                        <ToolbarButton icon={Heading1} />
                                        <ToolbarButton icon={Heading2} />
                                    </div>
                                    <div className="flex items-center gap-1 px-2 border-r border-gray-200">
                                        <ToolbarButton icon={Bold} active />
                                        <ToolbarButton icon={Italic} />
                                        <ToolbarButton icon={Underline} />
                                    </div>
                                    <div className="flex items-center gap-1 px-2 border-r border-gray-200">
                                        <ToolbarButton icon={List} />
                                        <ToolbarButton icon={ListChecks} />
                                    </div>
                                    <div className="flex items-center gap-1 pl-2">
                                        <ToolbarButton icon={Undo} />
                                        <ToolbarButton icon={Redo} />
                                    </div>
                                </div>

                                <div className="relative flex-1">
                                    <textarea
                                        className="w-full h-full p-6 text-lg text-dark-text leading-relaxed outline-none resize-none border-none placeholder:text-gray-300"
                                        placeholder="Start typing your lesson notes here or use the AI magic..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                    {isGenerating && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10 transition-all rounded-3xl">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="text-primary-teal animate-spin-slow" size={32} />
                                                <span className="text-xl font-bold bg-gradient-to-r from-primary-teal to-soft-teal bg-clip-text text-transparent">AI is thinking...</span>
                                            </div>
                                            <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-teal animate-progress-flow"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-auto border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-text uppercase tracking-widest">
                                    <div className="w-2 h-2 bg-success rounded-full"></div> Auto-saved 2 mins ago
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button variant="ghost" className="text-error flex-1 sm:flex-none">Discard</Button>
                                    <Button
                                        className="bg-gradient-to-r from-primary-teal to-soft-teal border-none flex items-center gap-2 px-10 shadow-xl shadow-primary-teal/20 flex-1 sm:flex-none"
                                        onClick={handleGenerate}
                                        disabled={!topic || isGenerating}
                                    >
                                        <Sparkles size={20} />
                                        Generate magic
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Sidebar */}
                <div className={`w-full lg:w-[380px] flex flex-col gap-6 transition-all duration-300 ${showAIInsights ? 'translate-x-0' : 'hidden lg:flex'}`}>
                    <Card padding="large" className="bg-[#0F172A] text-white border-none shadow-2xl relative overflow-hidden h-fit">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-teal/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-soft-teal">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Smart Assist</h3>
                                    <p className="text-[10px] text-soft-teal font-extrabold uppercase tracking-widest">AI Context Active</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIInsights(false)}
                                className="p-2 text-white/40 hover:text-white transition-colors lg:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            {suggestions.map((s, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[24px] hover:bg-white/10 hover:border-primary-teal transition-all group cursor-pointer">
                                    <h4 className="text-sm font-bold text-white group-hover:text-soft-teal transition-colors flex items-center justify-between">
                                        {s.text} <Plus size={16} />
                                    </h4>
                                    <p className="text-xs text-white/50 mt-2 leading-relaxed">
                                        {s.details}
                                    </p>
                                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 py-1.5 bg-soft-teal text-dark-text rounded-lg text-[10px] font-bold uppercase tracking-wider">Accept</button>
                                        <button className="px-3 py-1.5 border border-white/20 rounded-lg text-[10px] font-bold uppercase text-white hover:bg-white/5">Ignore</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                            <Button fullWidth className="bg-white text-[#0F172A] hover:bg-soft-teal border-none flex items-center justify-center gap-2 font-black py-4">
                                <Wand2 size={20} />
                                Full Lesson Draft
                            </Button>
                        </div>
                    </Card>

                    <Card padding="large" className="border-2 border-dashed border-gray-100 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-light-bg rounded-full text-muted-text">
                            <History size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-dark-text">Previous Drafts</h4>
                            <p className="text-xs text-muted-text mt-1">You can restore previous versions of this lesson plan anytime.</p>
                        </div>
                        <Button variant="ghost" className="text-primary-teal font-bold flex items-center gap-2">
                            View Version History <ChevronRight size={16} />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AILessonNotes;
