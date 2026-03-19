import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MoreVertical, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Users, 
  User,
  FileText, 
  Trophy,
  Plus
} from 'lucide-react'

const SubjectDetails = () => {
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Announcements')
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState(null)
  
  const tabs = ['Announcements', 'Assignments', 'Course Materials', 'People', 'Grades']

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/teaching-assignments')
        const j = await r.json()
        if (r.ok) {
          const assignment = j.assignments.find(a => a.id === subjectId)
          if (assignment) {
            setSubjectData(assignment)
          }
        }
      } catch (e) {
        console.error('Failed to load subject details:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [subjectId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black text-muted-text uppercase tracking-widest">Opening Classroom...</p>
      </div>
    )
  }

  if (!subjectData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Subject Not Found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-teal text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    )
  }

  // Generate a consistent color based on subject name
  const colors = [
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-rose-400 to-pink-600',
    'from-violet-400 to-purple-600',
    'from-cyan-400 to-blue-500'
  ]
  const subjectName = subjectData.subjectName || 'Unknown Subject'
  const colorClass = colors[subjectName.length % colors.length]

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-20 pb-2 -mx-3 px-3 md:mx-0 md:px-0">
        <div className="flex items-center w-full md:w-auto gap-2 md:gap-4 mb-3 md:mb-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-light-bg text-muted-text transition shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-2 text-xs md:text-sm font-black whitespace-nowrap transition-all relative uppercase tracking-wider ${
                  activeTab === tab ? 'text-primary-teal' : 'text-muted-text hover:text-dark-text'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-teal rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-light-bg text-muted-text transition">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Subject Banner */}
      <div className={`w-full h-48 md:h-64 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br ${colorClass} p-6 md:p-10 flex flex-col justify-end relative overflow-hidden shadow-xl mb-6 md:mb-8 group`}>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 backdrop-blur-sm rounded-l-[10rem] -mr-20 translate-x-10 group-hover:translate-x-0 transition-transform duration-700" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-1 md:mb-2 leading-tight">{subjectName}</h1>
          <p className="text-base md:text-xl font-bold text-white/80">{subjectData.grade || 'General'}</p>
        </div>
        <div className="absolute top-6 right-6 md:top-10 md:right-10 w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white border border-white/30 shadow-2xl">
          <BookOpen size={32} className="md:hidden" />
          <BookOpen size={48} className="hidden md:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar - Upcoming (Moved below feed on mobile) */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-soft-sm lg:sticky lg:top-24">
            <h3 className="text-sm font-black text-dark-text flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Calendar size={18} className="text-primary-teal" /> Upcoming
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 group hover:bg-rose-100 transition cursor-pointer">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Overdue</div>
                <h4 className="text-xs font-black text-dark-text leading-tight mb-2">COMPLIANT AND RESIS...</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-text">
                  <Calendar size={12} /> Overdue
                </div>
              </div>
              <p className="text-[10px] font-bold text-muted-text text-center italic mt-4">No other work due soon</p>
              <button className="w-full mt-4 py-2.5 text-[10px] font-black text-primary-teal uppercase tracking-widest hover:bg-primary-teal/5 rounded-xl transition">
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Main Feed Area */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {activeTab === 'Announcements' && (
            <div className="space-y-6">
              {/* Announce Input */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 shadow-soft-sm flex items-center gap-4 group hover:shadow-md transition cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal overflow-hidden border border-primary-teal/20 shrink-0">
                  <User size={20} className="md:hidden" />
                  <User size={24} className="hidden md:block" />
                </div>
                <div className="flex-1 text-xs md:text-sm font-bold text-muted-text group-hover:text-dark-text transition">
                  Announce something to your class
                </div>
                <div className="p-2 rounded-xl bg-light-bg text-muted-text shrink-0">
                  <Plus size={18} md:size={20} />
                </div>
              </div>

              {/* Feed Content Placeholder */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                  <MessageSquare size={32} className="md:hidden" />
                  <MessageSquare size={48} className="hidden md:block" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">This is where you can talk to your class.</h3>
                <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                  Use this stream to share announcements, post assignments, and answer students' questions.
                </p>
                <button className="mt-8 w-full md:w-auto px-6 py-3 md:py-4 bg-primary-teal text-white rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20">
                  Post Announcement
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Assignments' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                <FileText size={32} className="md:hidden" />
                <FileText size={48} className="hidden md:block" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">No assignments yet.</h3>
              <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                Once assignments are posted, they will appear here for students to complete.
              </p>
            </div>
          )}

          {activeTab === 'Course Materials' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                <BookOpen size={32} className="md:hidden" />
                <BookOpen size={48} className="hidden md:block" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">Materials will appear here.</h3>
              <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                Upload PDFs, videos, and links to help your students learn.
              </p>
            </div>
          )}

          {activeTab === 'People' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                <Users size={32} className="md:hidden" />
                <Users size={48} className="hidden md:block" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">Class Roster</h3>
              <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                View all teachers and students enrolled in this subject.
              </p>
            </div>
          )}

          {activeTab === 'Grades' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
              <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                <Trophy size={32} className="md:hidden" />
                <Trophy size={48} className="hidden md:block" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">Gradebook</h3>
              <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                Track student progress and performance in this subject.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubjectDetails
