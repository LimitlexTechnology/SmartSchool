import React, { useEffect, useState } from 'react'
import {
    Bell, User, Star, Calendar, Clock,
    BookOpen, ChevronRight, LogOut, GraduationCap,
    MessageSquare, Settings, Users, FileText, TrendingUp, TrendingDown, X,
    Menu, LayoutDashboard, CreditCard, ClipboardList, Filter, Search, Plus, Minus
} from 'lucide-react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import SkullarLogo from '../assets/Skullar Logo.png'

const StudentPortal = () => {
    const [student, setStudent] = useState(null)
    const [siblings, setSiblings] = useState([])
    const [behaviorHistory, setBehaviorHistory] = useState([])
    const [upcomingAssignments, setUpcomingAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('Dashboard')
    const [saving, setSaving] = useState(false)
    const [showBehaviorsModal, setShowBehaviorsModal] = useState(false)
    const [showProfileSwitcher, setShowProfileSwitcher] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const studentId = localStorage.getItem('studentTableId')
        if (!studentId) {
            navigate('/login')
            return
        }

        const fetchData = async () => {
            try {
                const sRes = await fetch(`/api/students/${studentId}`)
                if (!sRes.ok) throw new Error('Failed to fetch student')
                const sData = await sRes.json()
                setStudent(sData)

                // Fetch siblings
                const sibRes = await fetch(`/api/students/${studentId}/siblings`)
                if (sibRes.ok) setSiblings(await sibRes.json())

                // Fetch behavior history
                const behRes = await fetch(`/api/students/${studentId}/behavior/history`)
                if (behRes.ok) setBehaviorHistory(await behRes.json())

                // Fetch all assignments across subjects for "Upcoming" section
                const subRes = await fetch('/api/student/subjects')
                if (subRes.ok) {
                    const { subjects } = await subRes.json()
                    const allAssignmentsPromises = subjects.map(sub => 
                        fetch(`/api/class-assignments?subjectId=${sub.id}`).then(r => r.json())
                    )
                    const assignmentsResults = await Promise.all(allAssignmentsPromises)
                    
                    // Flatten and filter for upcoming/overdue
                    const flattened = assignmentsResults.flatMap((res, idx) => 
                        (res.assignments || []).map(a => ({ ...a, subjectName: subjects[idx].subjectName }))
                    )
                    
                    // Filter: Not submitted and due date is in the future or recently past
                    const subr = await fetch(`/api/submissions?studentId=${studentId}`)
                    const submissions = subr.ok ? await subr.json() : []
                    const submittedIds = submissions.map(s => s.assignmentId)
                    
                    const upcoming = flattened
                        .filter(a => !submittedIds.includes(a.id))
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    
                    setUpcomingAssignments(upcoming.slice(0, 5))
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    // Update activeTab based on current location
    useEffect(() => {
        if (location.pathname.includes('/portal/online-campus')) {
            setActiveTab('Online Campus')
        } else if (location.pathname === '/portal') {
            setActiveTab('Dashboard')
        }
    }, [location.pathname])

    const switchProfile = (sibId) => {
        localStorage.setItem('studentTableId', sibId)
        setLoading(true)
        window.location.reload()
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const handleGuardianPhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            alert("Image is too large. Max 2MB.")
            return
        }
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result
            setSaving(true)
            try {
                const res = await fetch(`/api/students/${student.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guardianPhoto: base64 })
                })
                if (!res.ok) throw new Error('Failed to upload')
                const updated = await res.json()
                setStudent(prev => ({ ...prev, guardianPhoto: updated.guardianPhoto || base64 }))
                alert("Guardian photo updated successfully!")
            } catch (err) {
                console.error(err)
                alert("Failed to update guardian photo.")
            } finally {
                setSaving(false)
            }
        }
        reader.readAsDataURL(file)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#5E9E9E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!student) return null

    const getBehaviorStatus = (pts) => {
        const p = pts || 0
        if (p >= 80) return { label: 'EXCELLENT', bg: 'bg-[#065F46]', color: 'text-[#065F46]' }
        if (p >= 70) return { label: 'GOOD', bg: 'bg-[#84CC16]', color: 'text-[#84CC16]' }
        if (p >= 60) return { label: 'AVERAGE', bg: 'bg-[#EAB308]', color: 'text-[#EAB308]' }
        if (p >= 50) return { label: 'WARNING', bg: 'bg-[#F97316]', color: 'text-[#F97316]' }
        return { label: 'CRITICAL', bg: 'bg-[#991B1B]', color: 'text-[#991B1B]' }
    }

    const behStatus = getBehaviorStatus(student.behaviorPoints)

    return (
        <div className="min-h-screen bg-[#F4F7F9] font-sans">
            {/* Top Bar Navigation */}
            <header className="w-full bg-[#5E9E9E] px-6 py-2 flex items-center justify-between text-white shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="h-8 border-r border-white/20 mx-2 hidden lg:block"></div>
                    <div className="flex items-center gap-3">
                        <img src={SkullarLogo} alt="School Logo" className="h-8 w-auto object-contain" />
                        <p className="text-[10px] font-bold text-white/50 tracking-widest uppercase">The Student Portal</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-[#5E9E9E]"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Guardian</p>
                            <p className="text-sm font-bold">{student.guardianName || 'Parent'}</p>
                        </div>
                        <div
                            onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center shadow-inner relative cursor-pointer active:scale-95 transition-all"
                        >
                            {student.guardianPhoto ? (
                                <img src={student.guardianPhoto} alt="Guardian" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-white/60" />
                            )}

                            {showProfileSwitcher && siblings.length > 0 && (
                                <>
                                    <div className="fixed inset-0 z-[999]" onClick={() => setShowProfileSwitcher(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[1000] animate-slide-up">
                                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Switch Profile</p>
                                        {siblings.map(sib => (
                                            <button
                                                key={sib.id}
                                                onClick={() => switchProfile(sib.id)}
                                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-light-bg transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary-teal/10 flex items-center justify-center overflow-hidden">
                                                    {sib.profilePhoto ? <img src={sib.profilePhoto} className="w-full h-full object-cover" /> : <User size={14} className="text-primary-teal" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-dark-text">{sib.name}</p>
                                                    <p className="text-[10px] font-medium text-muted-text">{sib.studentId}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub Navigation Tabs - Desktop Only */}
            <nav className="bg-white border-b border-gray-200 px-6 overflow-x-auto sticky top-0 z-40 shadow-sm hidden lg:block">
                <div className="max-w-[1200px] mx-auto flex items-center gap-8 py-1">
                    {['Dashboard', 'Online Campus', 'Classroom', 'Accounts', 'Messages', 'Exams', 'Student Records', 'Parent Settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab)
                                if (tab === 'Online Campus') {
                                    navigate('/portal/online-campus')
                                } else if (tab === 'Dashboard') {
                                    navigate('/portal')
                                }
                            }}
                            className={`text-xs font-bold whitespace-nowrap py-4 border-b-2 transition-all ${activeTab === tab ? 'text-[#5E9E9E] border-[#5E9E9E]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-[1200px] mx-auto p-6 space-y-6 animate-fade-in">

                {location.pathname === '/portal' ? (
                    <>
                        {/* Profile Hero Section */}
                        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start justify-between shadow-sm gap-8 transition-all">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                                        {student.profilePhoto ? (
                                            <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                                <User className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center md:text-left pt-2">
                                    <h2 className="text-2xl font-bold text-[#1F2937] leading-tight">{student.firstName} {student.lastName}</h2>
                                    <p className="text-sm font-medium text-gray-500 mt-1">{student.className || student.grade} | {student.wristbandId || student.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setShowBehaviorsModal(true)}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full md:min-w-[240px] md:w-auto cursor-pointer hover:border-[#5E9E9E] hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-xs font-bold text-gray-800">Behaviour Summary</p>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#5E9E9E] transition-colors" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Behaviour Points</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-bold ${behStatus.color}`}>{student.behaviorPoints || 0}</span>
                                        <span className="text-sm font-medium text-gray-400">pts</span>
                                    </div>
                                    <div className={`inline-block px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${behStatus.bg}`}>
                                        {behStatus.label}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest mt-8">Quick Actions</h3>

                        {/* 8-Grid Quick Actions */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickAction 
                                icon={BookOpen} 
                                label="Online Campus" 
                                color="#F4ECFF" 
                                textColor="#A855F7" 
                                onClick={() => navigate('/portal/online-campus')}
                            />
                            <QuickAction icon={CreditCard} label="Accounts" color="#F0FDF4" textColor="#22C55E" />
                            <QuickAction icon={MessageSquare} label="Messages" color="#EFF6FF" textColor="#3B82F6" />
                            <QuickAction icon={GraduationCap} label="Exams" color="#FFF7ED" textColor="#F97316" />
                            <QuickAction icon={FileText} label="Assignments" color="#FFF1F2" textColor="#FB7185" />
                            <QuickAction icon={Users} label="Student Records" color="#F0F9FF" textColor="#0EA5E9" />
                            <QuickAction icon={Calendar} label="Calendar" color="#F0FDF9" textColor="#0D9488" />
                            <QuickAction icon={Settings} label="Settings" color="#F9FAFB" textColor="#4B5563" />
                        </section>

                        {/* Dashboard Grid Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Latest Alerts */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Latest Alerts</h4>
                                    <p className="text-sm font-bold text-[#1F2937]">MID-TERM EXAM / SCHOOL FEES REMINDER</p>
                                    <p className="text-[10px] font-medium text-gray-400">March 13, 2024 12:47 PM</p>
                                </div>
                                <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg">URGENT</span>
                            </div>

                            {/* Upcoming Events */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Upcoming Events</h4>
                                    <p className="text-sm font-bold text-[#1F2937]">TENTATIVE HOLIDAY - EID UL FITR</p>
                                    <p className="text-[10px] font-medium text-gray-400">March 17, 2026</p>
                                </div>
                                <Calendar className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                            </div>
                        </div>


                        {/* Stats Cards Row */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatsCard
                                icon={Calendar}
                                label="Attendance Rate"
                                value="95%"
                                status="Excellent"
                                statusColor="#22C55E"
                                statusBg="#F0FDF4"
                            />
                            <StatsCard
                                icon={GraduationCap}
                                label="Average Grade"
                                value="85%"
                                status="A"
                                statusColor="#A855F7"
                                statusBg="#F4ECFF"
                            />
                            <StatsCard
                                icon={FileText}
                                label="Assignments"
                                value="28"
                                status="5 Pending"
                                statusColor="#F97316"
                                statusBg="#FFF7ED"
                                subtext="Completed"
                            />
                            <StatsCard
                                icon={CreditCard}
                                label="Fee Status"
                                value="GH₵1500"
                                status="Due"
                                statusColor="#EF4444"
                                statusBg="#FEF2F2"
                                valueColor="#EF4444"
                                subtext="Outstanding"
                            />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Today's Schedule */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Today's Schedule</h3>
                                <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm space-y-1">
                                    <ScheduleItem time="8:00 - 9:00 AM" subject="Mathematics" teacher="Mrs. Johnson • Room 301" />
                                    <ScheduleItem time="9:00 - 10:00 AM" subject="English Language" teacher="Mr. Smith • Room 205" active />
                                    <ScheduleItem time="10:30 - 11:30 AM" subject="Science" teacher="Dr. Brown • Room Lab 2" />
                                    <ScheduleItem time="11:30 - 12:30 PM" subject="Social Studies" teacher="Mrs. Davis • Room 108" />
                                </div>
                            </div>

                            {/* Pending Assignments */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-teal" /> Upcoming
                                </h3>
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-soft-sm space-y-1 relative overflow-hidden min-h-[300px] flex flex-col">
                                    {upcomingAssignments.length > 0 ? (
                                        <>
                                            <div className="flex-1 space-y-1">
                                                {upcomingAssignments.map((assignment) => {
                                                    const isOverdue = new Date(assignment.dueDate) < new Date();
                                                    return (
                                                        <div 
                                                            key={assignment.id} 
                                                            onClick={() => navigate(`/portal/subject/${assignment.subjectId}`)}
                                                            className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group ${
                                                                isOverdue ? 'bg-rose-50/50 border border-rose-100 hover:bg-rose-100/50' : 'hover:bg-light-bg'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                                                    isOverdue ? 'bg-rose-100 text-rose-500' : 'bg-primary-teal/5 text-primary-teal'
                                                                }`}>
                                                                    <ClipboardList className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    {isOverdue && (
                                                                        <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Overdue</p>
                                                                    )}
                                                                    <p className="text-sm font-black text-dark-text group-hover:text-primary-teal transition-colors line-clamp-1 uppercase tracking-tight">
                                                                        {assignment.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <Calendar className="w-3 h-3 text-muted-text" />
                                                                        <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">
                                                                            {isOverdue ? 'Overdue' : `Due ${new Date(assignment.dueDate).toLocaleDateString()}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-teal group-hover:translate-x-1 transition-all" />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="p-4 border-t border-gray-50 flex items-center justify-center">
                                                <button 
                                                    onClick={() => navigate('/portal/online-campus')}
                                                    className="text-[10px] font-black text-primary-teal uppercase tracking-widest hover:text-secondary-teal transition"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                            <p className="text-sm font-bold text-muted-text italic">No other work due soon</p>
                                            <button 
                                                onClick={() => navigate('/portal/online-campus')}
                                                className="mt-6 text-[10px] font-black text-primary-teal uppercase tracking-widest hover:text-secondary-teal transition"
                                            >
                                                View All
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                            {/* Academic Performance */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Academic Performance</h3>
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
                                    <PerformanceItem subject="Mathematics" teacher="Mrs. Johnson" score="88%" trend="up" trendValue="6%" />
                                    <PerformanceItem subject="English Language" teacher="Mr. Smith" score="85%" trend="down" trendValue="2%" />
                                    <PerformanceItem subject="Science" teacher="Dr. Brown" score="92%" trend="up" trendValue="3%" />
                                    <PerformanceItem subject="Social Studies" teacher="Mrs. Davis" score="78%" trend="neutral" trendValue="0%" />
                                    <PerformanceItem subject="French" teacher="Mme. Laurent" score="81%" trend="up" trendValue="2%" />
                                </div>
                            </div>

                            {/* Attendance Calendar */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Attendance - March 2026</h3>
                                    <div className="flex gap-4">
                                        <LegendItem label="Present" color="#22C55E" />
                                        <LegendItem label="Absent" color="#EF4444" />
                                        <LegendItem label="Late" color="#FACC15" />
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                    <div className="grid grid-cols-7 gap-3 mb-4">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <div key={day} className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">{day}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-3">
                                        <div className="col-span-6"></div>
                                        <CalendarDay day="1" status="present" />
                                        <CalendarDay day="2" status="present" />
                                        <CalendarDay day="3" status="present" />
                                        <CalendarDay day="4" status="present" />
                                        <CalendarDay day="5" status="late" />
                                        <CalendarDay day="6" status="present" />
                                        <CalendarDay day="7" status="holiday" />
                                        <CalendarDay day="8" status="holiday" />
                                        <CalendarDay day="9" status="present" />
                                        <CalendarDay day="10" status="present" />
                                        <CalendarDay day="11" status="present" />
                                        <CalendarDay day="12" status="absent" />
                                        <CalendarDay day="13" status="present" />
                                        <CalendarDay day="14" status="holiday" />
                                        <CalendarDay day="15" status="holiday" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                ) : (
                    <Outlet />
                )}

                {activeTab === 'Parent Settings' && (
                    <div className="space-y-6">
                        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Guardian Profile Settings</h3>
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-dashed border-[#5E9E9E] flex items-center justify-center bg-[#F4F7F9]">
                                        {student.guardianPhoto ? (
                                            <img src={student.guardianPhoto} alt="Guardian" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <User className="w-10 h-10" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-center">No Photo<br />Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#5E9E9E] text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                        <Plus className="w-6 h-6" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleGuardianPhotoUpload} disabled={saving} />
                                    </label>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Guardian Name</h4>
                                        <p className="text-xl font-bold text-gray-800">{student.guardianName || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Relationship</h4>
                                        <p className="text-xl font-bold text-gray-800">{student.guardianRelationship || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</h4>
                                        <p className="text-xl font-bold text-gray-800">{student.guardianContact || 'Not Set'}</p>
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-sm text-gray-500 italic">Upload a profile photo to personalize your dashboard view. This photo will be visible on your ward's portal header.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {!['Dashboard', 'Parent Settings'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-[#F4F7F9] rounded-2xl flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-8 h-8 text-[#5E9E9E]/40" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{activeTab}</h3>
                        <p className="text-gray-400 font-medium">Coming soon in the next update.</p>
                    </div>
                )}

            </main>

            {/* Behavior History Modal */}
            {showBehaviorsModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setShowBehaviorsModal(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg font-black text-dark-text">Behaviour History</h3>
                                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest mt-0.5">Full track record of points</p>
                            </div>
                            <button
                                onClick={() => setShowBehaviorsModal(false)}
                                className="p-2 hover:bg-light-bg rounded-xl transition-colors text-muted-text hover:text-dark-text"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="bg-[#F4F7F9] rounded-2xl p-6 mb-2">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Balance</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black ${behStatus.color}`}>{student.behaviorPoints || 0}</span>
                                    <span className="text-sm font-bold text-muted-text">points</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {behaviorHistory.length > 0 ? (
                                    behaviorHistory.map(log => (
                                        <div key={log.id} className="group p-4 rounded-2xl border border-gray-100 hover:border-primary-teal/30 hover:bg-primary-teal/[0.02] transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.type === 'addition' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {log.type === 'addition' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-dark-text">{log.category}</p>
                                                        <p className="text-[10px] font-bold text-muted-text">{new Date(log.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-black ${log.type === 'addition' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {log.type === 'addition' ? '+' : '-'}{log.score} pts
                                                </div>
                                            </div>
                                            {log.reason && (
                                                <div className="mt-3 pl-11">
                                                    <p className="text-xs text-muted-text leading-relaxed font-medium italic">"{log.reason}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-light-bg rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                                            <Star className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-text">No records found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0">
                            <button
                                onClick={() => setShowBehaviorsModal(false)}
                                className="w-full py-3 bg-dark-text text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Navigation Drawer */}
            {isSidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-[10000] transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[10001] shadow-2xl animate-slide-right flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={SkullarLogo} alt="Skullar" className="h-8 w-auto object-contain" />
                                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">The Student Portal</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {[
                                { id: 'Dashboard', icon: LayoutDashboard },
                                { id: 'Online Campus', icon: BookOpen },
                                { id: 'Classroom', icon: Users },
                                { id: 'Accounts', icon: CreditCard },
                                { id: 'Messages', icon: MessageSquare },
                                { id: 'Exams', icon: GraduationCap },
                                { id: 'Student Records', icon: ClipboardList },
                                { id: 'Parent Settings', icon: Settings }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id)
                                        setIsSidebarOpen(false)
                                        if (item.id === 'Online Campus') {
                                            navigate('/portal/online-campus')
                                        } else if (item.id === 'Dashboard') {
                                            navigate('/portal')
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                        ? 'bg-primary-teal text-white shadow-lg shadow-primary-teal/20'
                                        : 'text-gray-500 hover:bg-light-bg hover:text-dark-text'
                                        }`}
                                >
                                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : ''} />
                                    <span className="text-sm font-bold">{item.id}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-50 space-y-1">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-light-bg hover:text-dark-text transition-all">
                                <Settings size={18} />
                                <span className="text-sm font-bold">Preferences</span>
                            </button>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                                <LogOut size={18} />
                                <span className="text-sm font-bold">Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const QuickAction = ({ icon: Icon, label, color, textColor, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 flex flex-col items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-all group active:scale-95 w-full"
    >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transform group-hover:-translate-y-1 transition-transform" style={{ backgroundColor: color }}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: textColor }} />
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-gray-500">{label}</span>
    </button>
)

const StatsCard = ({ icon: Icon, label, value, status, statusColor, statusBg, valueColor, subtext }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold" style={{ color: statusColor, backgroundColor: statusBg }}>{status}</span>
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</p>
            <p className="text-2xl font-black" style={{ color: valueColor || '#111827' }}>{value}</p>
            {subtext && <p className="text-[10px] font-bold text-gray-400 mt-1">{subtext}</p>}
        </div>
    </div>
)

const ScheduleItem = ({ time, subject, teacher, active }) => (
    <div className={`p-3 sm:p-4 rounded-xl flex items-center justify-between transition-colors ${active ? 'bg-[#EFF6FF] border border-[#BFDBFE]' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Clock className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm font-bold text-[#1F2937]">{subject}</p>
                <p className="text-[10px] font-medium text-gray-400">{teacher}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-gray-400">{time}</p>
            {active && <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 inline-block">Now</span>}
        </div>
    </div>
)

const AssignmentItem = ({ title, subject, due, priority }) => {
    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-yellow-500',
        low: 'bg-green-500'
    }
    return (
        <div className="p-3 sm:p-4 rounded-xl hover:bg-gray-50 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F4ECFF] flex items-center justify-center text-[#A855F7]">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#1F2937]">{title}</p>
                    <p className="text-[10px] font-medium text-gray-400">{subject}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-0.5 rounded text-white text-[8px] font-black uppercase tracking-widest ${priorityColors[priority]}`}>{priority}</span>
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <p className="text-[10px] font-bold whitespace-nowrap"><span className="text-gray-400">Due:</span> <span className="text-gray-500">{due.split('(')[0]}</span> <span className="text-red-400 font-bold">{due.includes('(') ? '(' + due.split('(')[1] : ''}</span></p>
                </div>
            </div>
        </div>
    )
}

const PerformanceItem = ({ subject, teacher, score, trend, trendValue }) => (
    <div className="flex items-center justify-between group">
        <div>
            <p className="text-sm font-bold text-[#1F2937]">{subject}</p>
            <p className="text-[10px] font-medium text-gray-400">{teacher}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xl font-black text-blue-600">{score}</span>
            <div className="flex items-center gap-1">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-300" />}
                <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-300'}`}>{trendValue}</span>
            </div>
        </div>
    </div>
)

const LegendItem = ({ label, color }) => (
    <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-[10px] font-bold text-gray-500">{label}</span>
    </div>
)

const CalendarDay = ({ day, status }) => {
    const statusBg = {
        present: 'bg-[#22C55E]',
        absent: 'bg-[#EF4444]',
        late: 'bg-[#FACC15]',
        holiday: 'bg-[#3B82F6]'
    }
    return (
        <div className={`aspect-square rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${statusBg[status]}`}>
            {day}
        </div>
    )
}

export default StudentPortal
