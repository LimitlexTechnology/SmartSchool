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
  Plus,
  ClipboardList,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ChevronRight
} from 'lucide-react'

const SubjectDetails = () => {
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Announcements')
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [assignments, setAssignments] = useState([])
  const [materials, setMaterials] = useState([])
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [showAnnounceModal, setShowAnnounceModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' })
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'link', url: '', description: '' })
  const [isPosting, setIsPosting] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' })
  const [isGrading, setIsGrading] = useState(false)
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null)
  
  const tabs = ['Announcements', 'Assignments', 'Course Materials', 'People', 'Grades']

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/teaching-assignments')
      const j = await r.json()
      if (r.ok) {
        const assignment = j.assignments.find(a => a.id === subjectId)
        if (assignment) {
          setSubjectData(assignment)
          
          // Load all details in parallel
          const [ar, asr, mr, sr, subr] = await Promise.all([
            fetch(`/api/announcements?subjectId=${subjectId}`),
            fetch(`/api/class-assignments?subjectId=${subjectId}`),
            fetch(`/api/course-materials?subjectId=${subjectId}`),
            fetch(`/api/students?classId=${assignment.classId}&pageSize=100`),
            fetch(`/api/submissions?subjectId=${subjectId}`)
          ])
          
          if (ar.ok) {
            const aj = await ar.json()
            setAnnouncements(aj.announcements || [])
          }
          if (asr.ok) {
            const asj = await asr.json()
            setAssignments(asj.assignments || [])
          }
          if (mr.ok) {
            const mj = await mr.json()
            setMaterials(mj || [])
          }
          if (sr.ok) {
            const sj = await sr.json()
            setStudents(sj.data || [])
          }
          if (subr.ok) {
            const subj = await subr.json()
            setSubmissions(subj || [])
          }
        }
      }
    } catch (e) {
      console.error('Failed to load subject details:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [subjectId])

  const handlePostMaterial = async (e) => {
    e.preventDefault()
    if (!newMaterial.title.trim() || !newMaterial.url.trim()) return

    setIsPosting(true)
    try {
      const r = await fetch('/api/course-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMaterial,
          subjectId
        })
      })

      if (r.ok) {
        setNewMaterial({ title: '', type: 'link', url: '', description: '' })
        setShowMaterialModal(false)
        loadData()
      }
    } catch (e) {
      console.error('Failed to post material:', e)
    } finally {
      setIsPosting(false)
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return
    try {
      const r = await fetch(`/api/course-materials/${id}`, { method: 'DELETE' })
      if (r.ok) loadData()
    } catch (e) {
      console.error('Failed to delete material:', e)
    }
  }

  const handlePostAnnouncement = async (e) => {
    e.preventDefault()
    if (!newAnnouncement.trim()) return

    setIsPosting(true)
    try {
      const role = localStorage.getItem('userRole') || 'teacher'
      const sid = localStorage.getItem('schoolId') || 'local'
      const nameKey = role === 'teacher' ? `teacherName:${sid}` : `adminName:${sid}`
      const authorName = localStorage.getItem(nameKey) || localStorage.getItem('adminName') || 'Teacher'

      const r = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newAnnouncement,
          subjectId,
          classId: subjectData?.classId,
          authorName,
          authorRole: role
        })
      })

      if (r.ok) {
        setNewAnnouncement('')
        setShowAnnounceModal(false)
        loadData()
      }
    } catch (e) {
      console.error('Failed to post announcement:', e)
    } finally {
      setIsPosting(false)
    }
  }

  const handleUpdateGrade = async (e) => {
    e.preventDefault()
    if (!selectedSubmission) return
    setIsGrading(true)
    try {
      const r = await fetch(`/api/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      })
      if (r.ok) {
        setSelectedSubmission(null)
        setGradeData({ score: '', feedback: '' })
        loadData()
      }
    } catch (e) {
      console.error('Failed to update grade:', e)
    } finally {
      setIsGrading(false)
    }
  }

  const handlePostAssignment = async (e) => {
    e.preventDefault()
    if (!newAssignment.title.trim()) return

    setIsPosting(true)
    try {
      const r = await fetch('/api/class-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          subjectId,
          classId: subjectData?.classId
        })
      })

      if (r.ok) {
        setNewAssignment({ title: '', description: '', dueDate: '' })
        setShowAssignModal(false)
        loadData()
      }
    } catch (e) {
      console.error('Failed to post assignment:', e)
    } finally {
      setIsPosting(false)
    }
  }

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
      {/* Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-dark-text">New Announcement</h3>
                <button 
                  onClick={() => setShowAnnounceModal(false)}
                  className="p-2 hover:bg-light-bg rounded-xl text-muted-text transition"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handlePostAnnouncement}>
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="What's on your mind? Share it with the class..."
                  className="w-full h-40 p-4 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-2xl resize-none outline-none text-sm font-bold text-dark-text transition"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAnnounceModal(false)}
                    className="px-6 py-3 text-xs font-black text-muted-text uppercase tracking-widest hover:text-dark-text transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting || !newAnnouncement.trim()}
                    className="px-8 py-3 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPosting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                    Post Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-dark-text">Add Course Material</h3>
                <button 
                  onClick={() => setShowMaterialModal(false)}
                  className="p-2 hover:bg-light-bg rounded-xl text-muted-text transition"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handlePostMaterial} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Title</label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Material Title"
                    className="w-full px-4 py-3 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-xl outline-none text-sm font-bold text-dark-text transition"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Type</label>
                  <select
                    value={newMaterial.type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    className="w-full px-4 py-3 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-xl outline-none text-sm font-bold text-dark-text transition"
                  >
                    <option value="link">Link / URL</option>
                    <option value="file">File (External URL)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">URL</label>
                  <input
                    type="url"
                    value={newMaterial.url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-xl outline-none text-sm font-bold text-dark-text transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Description</label>
                  <textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Optional description..."
                    className="w-full h-24 p-4 bg-light-bg border-2 border-transparent focus:border-primary-teal/20 rounded-xl resize-none outline-none text-sm font-bold text-dark-text transition"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(false)}
                    className="px-6 py-3 text-xs font-black text-muted-text uppercase tracking-widest hover:text-dark-text transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPosting || !newMaterial.title.trim() || !newMaterial.url.trim()}
                    className="px-8 py-3 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPosting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Add Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
              <div 
                onClick={() => setShowAnnounceModal(true)}
                className="bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 shadow-soft-sm flex items-center gap-4 group hover:shadow-md transition cursor-pointer"
              >
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

              {/* Feed Content */}
              {announcements.length > 0 ? (
                <div className="space-y-6">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-soft-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal overflow-hidden border border-primary-teal/20">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-dark-text">{announcement.authorName}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-text uppercase tracking-widest">
                              <span>{announcement.authorRole}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span>{new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-light-bg rounded-xl text-muted-text transition">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-dark-text leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </div>
                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {announcement.attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-light-bg border border-gray-100 rounded-xl hover:bg-gray-100 transition cursor-pointer group">
                              <FileText size={16} className="text-primary-teal" />
                              <span className="text-[10px] font-black text-dark-text uppercase tracking-widest">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Feed Content Placeholder */
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 shadow-soft-sm text-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-light-bg rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                    <MessageSquare size={32} className="md:hidden" />
                    <MessageSquare size={48} className="hidden md:block" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-dark-text mb-2">This is where you can talk to your class.</h3>
                  <p className="text-xs md:text-sm font-bold text-muted-text max-w-md mx-auto">
                    Use this stream to share announcements, post assignments, and answer students' questions.
                  </p>
                  <button 
                    onClick={() => setShowAnnounceModal(true)}
                    className="mt-8 w-full md:w-auto px-6 py-3 md:py-4 bg-primary-teal text-white rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
                  >
                    Post Announcement
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Assignments' && (
            <div className="space-y-6">
              {/* Create Button */}
              <div className="flex justify-start">
                <button 
                  onClick={() => navigate('/dashboard/online-campus/create-assignment', { state: { subjectId, classId: subjectData?.classId } })}
                  className="px-6 py-2.5 bg-primary-teal text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create
                </button>
              </div>

              {assignments.length > 0 ? (
                <div className="space-y-6">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="w-10 h-10 rounded-xl bg-primary-teal/5 flex items-center justify-center text-primary-teal shrink-0">
                              <ClipboardList size={20} />
                            </div>
                            <h3 className="text-sm font-black text-dark-text uppercase tracking-wider leading-tight">{assignment.title}</h3>
                          </div>
                          <div className="text-[10px] font-bold text-muted-text self-end sm:self-auto">
                            Posted {new Date(assignment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {assignment.dueDate && (
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                              Due {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          <p className="text-sm font-bold text-muted-text leading-relaxed whitespace-pre-wrap">
                            {assignment.description}
                          </p>

                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div className="mt-4">
                              {assignment.attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl max-w-md group cursor-pointer hover:border-primary-teal/20 transition">
                                  <div className="w-10 h-10 rounded-lg bg-primary-teal/5 flex items-center justify-center text-primary-teal">
                                    <FileText size={20} />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-xs font-black text-dark-text">{file.name}</h4>
                                    <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{file.type || 'document'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                        <button 
                          onClick={() => setViewingSubmissionsFor(assignment)}
                          className="text-[10px] font-black text-primary-teal uppercase tracking-widest hover:text-secondary-teal transition flex items-center gap-1 group/btn"
                        >
                          VIEW DETAILS
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-text uppercase tracking-widest">
                          <span>{submissions.filter(s => s.assignmentId === assignment.id).length} turned in</span>
                          <span>{submissions.filter(s => s.assignmentId === assignment.id && s.score !== null).length} graded</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-16 shadow-soft-sm text-center">
                  <div className="w-32 h-32 bg-light-bg rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                    <FileText size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-dark-text mb-2">No assignments yet.</h3>
                  <p className="text-sm font-bold text-muted-text max-w-md mx-auto">
                    Once assignments are posted, they will appear here for students to complete.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Course Materials' && (
            <div className="space-y-6">
              {/* Add Material Button */}
              <div className="flex justify-start">
                <button 
                  onClick={() => setShowMaterialModal(true)}
                  className="px-6 py-2.5 bg-primary-teal text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Material
                </button>
              </div>

              {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((material) => (
                    <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-soft-sm hover:shadow-md transition group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary-teal/5 flex items-center justify-center text-primary-teal border border-primary-teal/10">
                            {material.type === 'file' ? <FileText size={24} /> : <LinkIcon size={24} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-dark-text group-hover:text-primary-teal transition-colors">{material.title}</h4>
                            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{material.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={material.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-light-bg text-muted-text hover:text-primary-teal rounded-lg transition"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button 
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="p-2 hover:bg-rose-50 text-muted-text hover:text-rose-500 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {material.description && (
                        <p className="mt-4 text-xs font-bold text-muted-text leading-relaxed line-clamp-2">
                          {material.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-16 shadow-soft-sm text-center">
                  <div className="w-32 h-32 bg-light-bg rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                    <BookOpen size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-dark-text mb-2">Materials will appear here.</h3>
                  <p className="text-sm font-bold text-muted-text max-w-md mx-auto">
                    Upload PDFs, videos, and links to help your students learn.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'People' && (
            <div className="space-y-8">
              {/* Teacher Section */}
              <section>
                <h3 className="text-xs font-black text-muted-text uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <UserCheck size={16} className="text-primary-teal" /> Teachers
                </h3>
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-soft-sm">
                  <div className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-dark-text">{subjectData?.teacherName || 'Assigned Teacher'}</h4>
                      <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Subject Lead</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Students Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-muted-text uppercase tracking-[0.2em] flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary-teal" /> Students
                  </h3>
                  <span className="text-[10px] font-black text-primary-teal bg-primary-teal/5 px-3 py-1 rounded-full uppercase tracking-widest">
                    {students.length} Enrolled
                  </span>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-soft-sm divide-y divide-gray-50">
                  {students.length > 0 ? students.map((student) => (
                    <div key={student.id} className="p-6 flex items-center justify-between hover:bg-light-bg/50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-light-bg flex items-center justify-center text-muted-text overflow-hidden border border-gray-100">
                          {student.profilePhoto ? (
                            <img src={student.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-dark-text">{student.firstName} {student.lastName}</h4>
                          <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{student.wristbandId || 'No ID'}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white rounded-xl text-muted-text hover:text-primary-teal transition shadow-sm border border-transparent hover:border-gray-100">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  )) : (
                    <div className="p-12 text-center">
                      <p className="text-sm font-bold text-muted-text">No students enrolled in this class yet.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'Grades' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-soft-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light-bg/50 border-b border-gray-100">
                      <th className="p-6 text-[10px] font-black text-muted-text uppercase tracking-widest w-64">Student</th>
                      {assignments.length > 0 ? assignments.map(assignment => (
                        <th key={assignment.id} className="p-6 text-[10px] font-black text-muted-text uppercase tracking-widest min-w-[120px] text-center">
                          <div className="truncate max-w-[100px] mx-auto" title={assignment.title}>
                            {assignment.title}
                          </div>
                          <div className="text-[8px] mt-1 text-primary-teal/60 font-bold">
                            Max: {assignment.maxScore || 100}
                          </div>
                        </th>
                      )) : (
                        <th className="p-6 text-[10px] font-black text-muted-text uppercase tracking-widest text-center">No Assignments</th>
                      )}
                      <th className="p-6 text-[10px] font-black text-primary-teal uppercase tracking-widest text-center w-32">Average</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.length > 0 ? students.map((student) => {
                      const studentSubmissions = submissions.filter(s => s.studentId === student.id)
                      const gradedSubmissions = studentSubmissions.filter(s => s.score !== null)
                      const average = gradedSubmissions.length > 0 
                        ? Math.round(gradedSubmissions.reduce((acc, s) => {
                            const assignment = assignments.find(a => a.id === s.assignmentId)
                            const max = assignment?.maxScore || 100
                            return acc + (s.score / max) * 100
                          }, 0) / gradedSubmissions.length)
                        : null

                      return (
                        <tr key={student.id} className="hover:bg-light-bg/30 transition">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-light-bg flex items-center justify-center text-muted-text text-[10px] font-bold border border-gray-100 overflow-hidden">
                                {student.profilePhoto ? (
                                  <img src={student.profilePhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User size={14} />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-black text-dark-text leading-none mb-1">{student.firstName} {student.lastName}</div>
                                <div className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{student.wristbandId || 'No ID'}</div>
                              </div>
                            </div>
                          </td>
                          {assignments.length > 0 ? assignments.map(assignment => {
                            const sub = studentSubmissions.find(s => s.assignmentId === assignment.id)
                            return (
                              <td key={assignment.id} className="p-6 text-center">
                                <div 
                                  onClick={() => {
                                    if (sub) {
                                      setSelectedSubmission(sub)
                                      setGradeData({ 
                                        score: sub.score !== null ? sub.score : '', 
                                        feedback: sub.feedback || '' 
                                      })
                                    }
                                  }}
                                  className={`inline-flex items-center justify-center w-12 h-10 rounded-xl border text-sm font-bold transition-all cursor-pointer hover:scale-105 ${
                                  sub?.score !== null && sub?.score !== undefined
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : sub 
                                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                                      : 'bg-gray-50 border-gray-100 text-muted-text hover:border-primary-teal/20'
                                }`}>
                                  {sub?.score !== null && sub?.score !== undefined ? sub.score : sub ? '—' : '—'}
                                </div>
                              </td>
                            )
                          }) : (
                            <td className="p-6 text-center text-xs font-bold text-muted-text italic">
                              Waiting for assignments...
                            </td>
                          )}
                          <td className="p-6 text-center">
                            <div className={`text-sm font-black px-3 py-1.5 rounded-lg inline-block ${
                              average !== null 
                                ? 'text-primary-teal bg-primary-teal/5' 
                                : 'text-muted-text bg-gray-50'
                            }`}>
                              {average !== null ? `${average}%` : '—'}
                            </div>
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan={assignments.length + 2} className="p-20 text-center">
                          <div className="w-20 h-20 bg-light-bg rounded-[1.5rem] flex items-center justify-center text-muted-text mx-auto mb-4 border border-gray-50">
                            <Trophy size={32} />
                          </div>
                          <h4 className="text-lg font-black text-dark-text mb-1">No data available</h4>
                          <p className="text-xs font-bold text-muted-text max-w-xs mx-auto">
                            The gradebook will populate once students are enrolled and assignments are posted.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submissions Modal */}
      {viewingSubmissionsFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-dark-text/60 backdrop-blur-sm" onClick={() => setViewingSubmissionsFor(null)}></div>
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Submissions</h3>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{viewingSubmissionsFor.title}</p>
                </div>
              </div>
              <button onClick={() => setViewingSubmissionsFor(null)} className="p-2 hover:bg-light-bg rounded-xl transition-colors text-muted-text">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 gap-4">
                {students.map(student => {
                  const sub = submissions.find(s => s.studentId === student.id && s.assignmentId === viewingSubmissionsFor.id);
                  return (
                    <div key={student.id} className="bg-light-bg/50 rounded-2xl p-4 flex items-center justify-between hover:bg-light-bg transition border border-transparent hover:border-primary-teal/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-muted-text overflow-hidden border border-gray-100">
                          {student.profilePhoto ? (
                            <img src={student.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-dark-text">{student.firstName} {student.lastName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {sub ? (
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                sub.score !== null ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {sub.score !== null ? 'Graded' : 'Turned In'}
                              </span>
                            ) : (
                              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 uppercase tracking-widest">
                                Missing
                              </span>
                            )}
                            {sub && (
                              <span className="text-[8px] font-bold text-muted-text uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> {new Date(sub.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {sub ? (
                          <>
                            {sub.score !== null && (
                              <div className="text-right mr-4">
                                <div className="text-xs font-black text-primary-teal">{sub.score} / {viewingSubmissionsFor.maxScore || 100}</div>
                                <div className="text-[8px] font-bold text-muted-text uppercase tracking-widest">Score</div>
                              </div>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGradeData({ 
                                  score: sub.score !== null ? sub.score : '', 
                                  feedback: sub.feedback || '' 
                                });
                              }}
                              className="px-4 py-2 bg-white text-primary-teal border border-primary-teal/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-teal hover:text-white transition shadow-sm"
                            >
                              {sub.score !== null ? 'Update Grade' : 'Grade Now'}
                            </button>
                          </>
                        ) : (
                          <div className="text-[10px] font-bold text-muted-text italic pr-4">Waiting for submission...</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-dark-text/60 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">Grade Submission</h3>
                  <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">
                    {students.find(s => s.id === selectedSubmission.studentId)?.firstName} {students.find(s => s.id === selectedSubmission.studentId)?.lastName}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-light-bg rounded-xl transition-colors text-muted-text">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateGrade} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Submitted File</label>
                  <div className="p-4 bg-light-bg rounded-2xl border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-primary-teal" />
                      <span className="text-sm font-bold text-dark-text truncate max-w-[150px]">{selectedSubmission.fileName}</span>
                    </div>
                    <button type="button" className="p-2 hover:bg-white rounded-lg text-primary-teal transition shadow-sm">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                  <div className="text-[10px] font-bold text-muted-text uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Clock size={12} /> Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Enter Mark</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="0"
                      value={gradeData.score}
                      onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                      className="w-full px-6 py-4 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-text uppercase">
                      / {assignments.find(a => a.id === selectedSubmission.assignmentId)?.maxScore || 100}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Teacher Feedback</label>
                <textarea 
                  placeholder="Great work! Keep it up..."
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full px-6 py-4 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal transition-all min-h-[120px]"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 py-4 bg-light-bg text-dark-text rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isGrading}
                  className="flex-1 py-4 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center justify-center gap-2"
                >
                  {isGrading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubjectDetails
