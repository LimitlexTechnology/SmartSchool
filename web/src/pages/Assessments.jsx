import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Timer,
    Users,
    Filter,
    Eye,
    Check,
    X
} from 'lucide-react';

const Assessments = () => {
    const [view, setView] = useState('student'); // 'student' or 'teacher'
    const [isTakingTest, setIsTakingTest] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    const studentAssessments = [
        { id: '1', title: 'Algebra Quiz 1', type: 'Quiz', dueDate: 'Today, 2:00 PM', status: 'Pending', subject: 'Mathematics', questions: 10, duration: '20m' },
        { id: '2', title: 'Modern History Essay', type: 'Homework', dueDate: 'Tomorrow', status: 'Pending', subject: 'History', questions: 5, duration: 'N/A' },
        { id: '3', title: 'Biology Lab Report', type: 'Class Test', dueDate: 'Yesterday', status: 'Completed', subject: 'Science', score: '95/100' },
        { id: '4', title: 'Physics Problems', type: 'Homework', dueDate: 'Oct 15, 2026', status: 'Overdue', subject: 'Science' },
    ];

    const teacherSubmissions = [
        { id: 'S1', name: 'John Doe', type: 'Quiz', score: '90%', status: 'Completed', date: '2h ago' },
        { id: 'S2', name: 'Sarah Smith', type: 'Homework', score: '-', status: 'Pending', date: '4h ago' },
        { id: 'S3', name: 'Mike Johnson', type: 'Quiz', score: '45%', status: 'Overdue', date: 'Yesterday' },
    ];

    const StatusBadge = ({ status }) => {
        const styles = {
            Pending: 'bg-soft-teal text-white',
            Completed: 'bg-primary-teal text-white',
            Overdue: 'bg-error text-white',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (isTakingTest) {
        return (
            <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center justify-between bg-[#0F172A] p-6 rounded-[24px] text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{selectedAssessment?.title}</h2>
                            <p className="text-white/60 text-sm">{selectedAssessment?.subject} • Question 1 of 10</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-error/20 border border-error/30 rounded-2xl">
                        <Timer size={24} className="text-error animate-pulse" />
                        <span className="font-mono text-2xl font-bold">19:45</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2" padding="large">
                        <div className="flex flex-col gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-dark-text leading-relaxed">
                                    1. Solve for x in the following quadratic equation: <br />
                                    <span className="font-mono bg-light-bg px-2 py-1 rounded italic">x² - 5x + 6 = 0</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'A', text: 'x = 2 or x = 3' },
                                    { id: 'B', text: 'x = 1 or x = 6' },
                                    { id: 'C', text: 'x = -2 or x = -3' },
                                    { id: 'D', text: 'None of the above' }
                                ].map((opt) => (
                                    <button key={opt.id} className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-primary-teal hover:bg-primary-teal/5 transition-all group text-left">
                                        <div className="flex items-center gap-4">
                                            <span className="w-10 h-10 rounded-xl bg-light-bg text-dark-text font-bold flex items-center justify-center group-hover:bg-primary-teal group-hover:text-white">
                                                {opt.id}
                                            </span>
                                            <span className="font-semibold text-dark-text">{opt.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                                <Button variant="outline">Previous Question</Button>
                                <Button className="px-10" onClick={() => setIsTakingTest(false)}>Next Question</Button>
                            </div>
                        </div>
                    </Card>

                    <Card padding="large" className="h-fit">
                        <h4 className="font-bold text-dark-text mb-6 flex items-center gap-2">
                            <Timer size={18} /> Question Palette
                        </h4>
                        <div className="grid grid-cols-5 gap-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer transition-all
                  ${i === 0 ? 'bg-primary-teal text-white' : 'bg-light-bg text-muted-text hover:bg-gray-200'}
                `}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-soft-teal/5 rounded-2xl border border-soft-teal/10">
                            <p className="text-xs text-muted-text leading-relaxed">
                                <span className="font-bold text-soft-teal">Pro Tip:</span> You can flag questions to review them later before final submission.
                            </p>
                        </div>
                        <Button fullWidth variant="ghost" className="mt-6 text-error">Quit Assessment</Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A]">Assessments</h1>
                    <p className="text-muted-text mt-1">Quizzes, Class Tests, and Homework tracking.</p>
                </div>
                <div className="flex p-1 bg-white rounded-[16px] border border-gray-100 w-fit">
                    <button
                        onClick={() => setView('student')}
                        className={`px-6 py-2.5 rounded-[12px] text-sm font-bold transition-all ${view === 'student' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-muted-text hover:text-primary-teal'}`}
                    >
                        Student View
                    </button>
                    <button
                        onClick={() => setView('teacher')}
                        className={`px-6 py-2.5 rounded-[12px] text-sm font-bold transition-all ${view === 'teacher' ? 'bg-[#0F172A] text-white shadow-lg' : 'text-muted-text hover:text-primary-teal'}`}
                    >
                        Teacher View
                    </button>
                </div>
            </div>

            {view === 'student' ? (
                <>
                    {/* Student Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-soft-teal/5" padding="large">
                            <div className="w-14 h-14 bg-soft-teal/10 text-soft-teal rounded-[20px] flex items-center justify-center shadow-sm">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-text uppercase tracking-widest mb-1">Pending Items</p>
                                <h3 className="text-3xl font-extrabold">12</h3>
                            </div>
                        </Card>
                        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-primary-teal/5" padding="large">
                            <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-[20px] flex items-center justify-center shadow-sm">
                                <CheckCircle2 size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-text uppercase tracking-widest mb-1">Completed</p>
                                <h3 className="text-3xl font-extrabold">48</h3>
                            </div>
                        </Card>
                        <Card className="flex items-center gap-4 bg-gradient-to-br from-white to-error/5" padding="large">
                            <div className="w-14 h-14 bg-error/10 text-error rounded-[20px] flex items-center justify-center shadow-sm">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-text uppercase tracking-widest mb-1">Overdue</p>
                                <h3 className="text-3xl font-extrabold">2</h3>
                            </div>
                        </Card>
                    </div>

                    {/* Assessment List */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="text-primary-teal" /> Your Weekly List
                            </h3>
                            <Button variant="ghost" className="text-primary-teal font-bold">View History</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {studentAssessments.map(item => (
                                <Card key={item.id} padding="medium" className="group hover:border-primary-teal transition-all hover:translate-x-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center 
                        ${item.status === 'Completed' ? 'bg-primary-teal/10 text-primary-teal' : 'bg-light-bg text-muted-text'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-dark-text group-hover:text-primary-teal transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm font-medium text-muted-text">{item.subject} • {item.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 sm:text-right">
                                            <div className="hidden lg:block">
                                                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">Due Date</p>
                                                <p className="text-sm font-bold text-dark-text">{item.dueDate}</p>
                                            </div>
                                            <div className="hidden xl:block">
                                                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">Questions</p>
                                                <p className="text-sm font-bold text-dark-text">{item.questions || '-'}</p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                            <div className="flex gap-2">
                                                {item.status === 'Pending' && (
                                                    <Button
                                                        className="bg-primary-teal text-white px-6"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAssessment(item);
                                                            if (item.type === 'Quiz' || item.type === 'Class Test') {
                                                                setIsTakingTest(true);
                                                            }
                                                        }}
                                                    >
                                                        {item.type === 'Homework' ? 'Upload' : 'Start'}
                                                    </Button>
                                                )}
                                                {item.status === 'Completed' && (
                                                    <div className="px-4 py-2 bg-success/10 text-success text-sm font-bold rounded-xl flex items-center gap-2">
                                                        <Check size={16} /> {item.score}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Teacher Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card padding="large">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="text-primary-teal" size={24} />
                                <span className="text-xs font-bold text-primary-teal bg-primary-teal/10 px-3 py-1 rounded-full uppercase">Active</span>
                            </div>
                            <h3 className="text-3xl font-extrabold">245</h3>
                            <p className="text-sm text-muted-text font-medium">Students Enrolled</p>
                        </Card>
                        <Card padding="large">
                            <div className="flex items-center justify-between mb-4">
                                <CheckCircle2 className="text-success" size={24} />
                                <span className="text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-full uppercase">Good</span>
                            </div>
                            <h3 className="text-3xl font-extrabold">92%</h3>
                            <p className="text-sm text-muted-text font-medium">Submission Rate</p>
                        </Card>
                        <Card padding="large">
                            <div className="flex items-center justify-between mb-4">
                                <AlertCircle className="text-error" size={24} />
                                <span className="text-xs font-bold text-error bg-error/10 px-3 py-1 rounded-full uppercase">Alert</span>
                            </div>
                            <h3 className="text-3xl font-extrabold">12</h3>
                            <p className="text-sm text-muted-text font-medium">Students Struggling</p>
                        </Card>
                    </div>

                    {/* Submissions Table */}
                    <Card padding="large">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <h3 className="text-xl font-bold">Latest Submissions</h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="relative group">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text group-hover:text-primary-teal" size={16} />
                                    <select className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 text-sm font-bold appearance-none bg-light-bg focus:ring-1 focus:ring-primary-teal outline-none cursor-pointer">
                                        <option>All Classes</option>
                                        <option>Grade 10A</option>
                                        <option>Grade 10B</option>
                                    </select>
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Eye size={18} /> Review All
                                </Button>
                                <Button size="sm" className="bg-primary-teal text-white">Create New</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-[10px] font-bold text-muted-text uppercase tracking-widest text-left italic">
                                        <th className="pb-4 pt-0">Student Name</th>
                                        <th className="pb-4 pt-0">Type</th>
                                        <th className="pb-4 pt-0">Status</th>
                                        <th className="pb-4 pt-0">Score</th>
                                        <th className="pb-4 pt-0">Date</th>
                                        <th className="pb-4 pt-0 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {teacherSubmissions.map((sub, i) => (
                                        <tr key={i} className="group hover:bg-light-bg/50 transition-colors">
                                            <td className="py-4 font-bold text-dark-text">{sub.name}</td>
                                            <td className="py-4 text-sm text-muted-text">{sub.type}</td>
                                            <td className="py-4">
                                                <StatusBadge status={sub.status} />
                                            </td>
                                            <td className={`py-4 font-extrabold ${sub.score === '-' ? 'text-muted-text' : 'text-primary-teal'}`}>{sub.score}</td>
                                            <td className="py-4 text-sm text-muted-text font-medium">{sub.date}</td>
                                            <td className="py-4 text-right">
                                                <button className="p-2 text-muted-text hover:text-primary-teal transition-all">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Assessments;
