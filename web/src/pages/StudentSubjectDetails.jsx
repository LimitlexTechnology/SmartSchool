import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  Users, 
  User,
  FileText, 
  Trophy,
  ClipboardList,
  Link as LinkIcon,
  ExternalLink,
  UserCheck,
  GraduationCap,
  Upload,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react'

const StudentSubjectDetails = () => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Announcements')
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [assignments, setAssignments] = useState([])
  const [materials, setMaterials] = useState([])
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [submittingTo, setSubmittingTo] = useState(null)
  const [reviewPaper, setReviewPaper] = useState(null)
  const [isFetchingReview, setIsFetchingReview] = useState(false)
  const [reviewSubmission, setReviewSubmission] = useState(null)
  
  const tabs = ['Announcements', 'Assignments', 'Course Materials', 'People', 'Grades']

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Subject Info
      const r = await fetch('/api/student/subjects')
      const j = await r.json()
      if (r.ok) {
        const subject = j.subjects.find(s => s.id === subjectId)
        if (subject) {
          setSubjectData(subject)
          
          // 2. Load all details in parallel
          const [ar, asr, mr, sr, subr] = await Promise.all([
            fetch(`/api/announcements?subjectId=${subjectId}`),
            fetch(`/api/class-assignments?subjectId=${subjectId}`),
            fetch(`/api/course-materials?subjectId=${subjectId}`),
            fetch(`/api/students?classId=${subject.classId}&pageSize=100`),
            fetch(`/api/submissions?subjectId=${subjectId}&studentId=${localStorage.getItem('studentTableId')}`)
          ])
          
          if (ar.ok) {
            const aj = await ar.json()
            setAnnouncements(aj.announcements || [])
          }
          if (asr.ok) {
            const asj = await asr.json()
            const filteredAssignments = (asj.assignments || []).filter(a => a.status !== 'Draft')
            setAssignments(filteredAssignments)
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmitAssignment = async (assignmentId) => {
    if (!selectedFile) return
    setIsSubmitting(true)
    
    // Simulate upload (real implementation would use FormData)
    try {
      const studentId = localStorage.getItem('studentTableId')
      const r = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId,
          fileName: selectedFile.name,
          submittedAt: new Date().toISOString()
        })
      })

      if (r.ok) {
        setSelectedFile(null)
        setSubmittingTo(null)
        loadData()
      }
    } catch (e) {
      console.error('Submission failed:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSubmissionStatus = (assignmentId) => {
    const sub = submissions.find(s => s.assignmentId === assignmentId)
    if (sub) return { status: 'Turned In', date: sub.submittedAt, color: 'text-emerald-500', submission: sub }
    return { status: 'Assigned', color: 'text-primary-teal' }
  }

  const handleReviewAnswers = async (submission) => {
    if (!submission.fileName?.startsWith('Digital Exam:')) return
    
    // Find assignment to get paperId
    const assignment = assignments.find(a => a.id === submission.assignmentId)
    const paperAttachment = assignment?.attachments?.find(a => a.type === 'question-paper' || a.type === 'question_paper')
    const paperId = paperAttachment?.id || paperAttachment?.paperId
    
    if (!paperId) return

    setIsFetchingReview(true)
    try {
      const r = await fetch(`/api/question-papers/${paperId}`)
      if (r.ok) {
        const paperData = await r.json()
        setReviewPaper(paperData)
        setReviewSubmission(submission)
      }
    } catch (e) {
      console.error('Failed to fetch paper for review:', e)
    } finally {
      setIsFetchingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light-bg">
        <div className="w-10 h-10 border-4 border-primary-teal border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-bg pb-12">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-soft-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/portal/online-campus')}
                className="p-2.5 hover:bg-light-bg rounded-xl text-muted-text transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">
                  {subjectData?.subjectName}
                </h1>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-primary-teal" /> {subjectData?.teacherName}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex items-center gap-8 -mb-px overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab 
                  ? 'text-primary-teal' 
                  : 'text-muted-text hover:text-dark-text'
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Review Answers Modal (Student View) */}
        {reviewPaper && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-dark-text/60 backdrop-blur-sm" onClick={() => { setReviewPaper(null); setReviewSubmission(null); }}></div>
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">My Graded Test</h3>
                    <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{reviewPaper.title}</p>
                  </div>
                </div>
                <button onClick={() => { setReviewPaper(null); setReviewSubmission(null); }} className="p-2 hover:bg-light-bg rounded-xl transition-colors text-muted-text">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {reviewPaper.sections.sort((a, b) => a.order - b.order).map((section, sIdx) => {
                  const sectionQuestions = reviewPaper.questions.filter(q => q.sectionId === section.id).sort((a, b) => a.order - b.order);
                  if (sectionQuestions.length === 0) return null;

                  return (
                    <div key={section.id} className="space-y-8">
                      <div className="border-l-4 border-primary-teal pl-6">
                        <h4 className="text-lg font-black text-dark-text uppercase tracking-tight">{section.title}</h4>
                        {section.description && <p className="text-xs font-bold text-muted-text mt-1">{section.description}</p>}
                      </div>

                      <div className="space-y-10">
                        {sectionQuestions.map((q, qIdx) => {
                          const studentAnswer = reviewSubmission?.answers?.[q.id];
                          const isMCQ = q.type === 'Multiple Choice' || q.type === 'MCQ';

                          return (
                            <div key={q.id} className="space-y-4">
                              <div className="flex items-start gap-4">
                                <span className="text-xs font-black text-primary-teal bg-primary-teal/5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                                  {qIdx + 1}
                                </span>
                                <div className="flex-1 space-y-4">
                                  <h5 className="text-sm font-bold text-dark-text leading-relaxed">{q.text}</h5>
                                  
                                  {isMCQ ? (
                                    <div className="grid grid-cols-1 gap-2">
                                      {q.options?.map((option, oIdx) => {
                                        const isSelected = studentAnswer === oIdx;
                                        const isCorrect = q.correctAnswer === option;
                                        
                                        return (
                                          <div 
                                            key={oIdx}
                                            className={`p-3 rounded-xl border flex items-center justify-between ${
                                              isSelected 
                                                ? isCorrect 
                                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                                                : isCorrect
                                                  ? 'bg-emerald-50/30 border-emerald-100 text-emerald-600 border-dashed'
                                                  : 'bg-gray-50 border-gray-100 text-muted-text'
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} className="opacity-20" />}
                                              <span className="text-xs font-bold">{option}</span>
                                            </div>
                                            {isSelected && (
                                              <span className="text-[8px] font-black uppercase tracking-widest">
                                                Your Choice
                                              </span>
                                            )}
                                            {!isSelected && isCorrect && (
                                              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                                Correct Answer
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="p-4 bg-light-bg rounded-xl border border-gray-100">
                                      <p className="text-[8px] font-black text-muted-text uppercase tracking-widest mb-2">Your Answer</p>
                                      <p className="text-xs font-bold text-dark-text whitespace-pre-wrap">
                                        {studentAnswer || <span className="italic opacity-50">No answer provided</span>}
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black text-muted-text uppercase tracking-widest flex items-center gap-2">
                                      <AlertCircle size={12} /> {q.marks} Marks
                                    </div>
                                    {isMCQ && (
                                      <div className={`text-[10px] font-black uppercase tracking-widest ${
                                        (studentAnswer !== undefined && q.options[studentAnswer] === q.correctAnswer)
                                          ? 'text-emerald-500'
                                          : 'text-rose-500'
                                      }`}>
                                        {(studentAnswer !== undefined && q.options[studentAnswer] === q.correctAnswer) ? '✓ Correct' : '✕ Incorrect'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-text uppercase tracking-widest">My Total Score</span>
                  <span className="text-2xl font-black text-primary-teal">{reviewSubmission.score} / {reviewPaper.questions.reduce((acc, q) => acc + (q.marks || 0), 0)}</span>
                </div>
                <button 
                  onClick={() => { setReviewPaper(null); setReviewSubmission(null); }}
                  className="px-8 py-3 bg-primary-teal text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-12">
            {activeTab === 'Announcements' && (
              <div className="space-y-6">
                {announcements.length > 0 ? announcements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-soft-sm hover:shadow-md transition group">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal shrink-0 group-hover:scale-110 transition-transform">
                        <User size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-black text-dark-text">{ann.authorName}</h4>
                          <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest">{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] font-black text-primary-teal uppercase tracking-[0.2em] leading-none">{ann.authorRole}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-muted-text leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </div>
                  </div>
                )) : (
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-16 shadow-soft-sm text-center">
                    <div className="w-32 h-32 bg-light-bg rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                      <MessageSquare size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-dark-text mb-2">No announcements yet.</h3>
                    <p className="text-sm font-bold text-muted-text max-w-md mx-auto">
                      Check back later for updates from your teacher.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Assignments' && (
              <div className="space-y-6">
                {assignments.length > 0 ? (
                  <div className="space-y-6">
                    {assignments.map((assignment) => {
                      const subStatus = getSubmissionStatus(assignment.id)
                      const isDigital = assignment.attachments && assignment.attachments.some(a => a.type === 'question-paper' || a.type === 'question_paper')
                      
                      return (
                        <div key={assignment.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm overflow-hidden group">
                          <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <div className="w-12 h-12 rounded-2xl bg-primary-teal/5 flex items-center justify-center text-primary-teal shrink-0 group-hover:bg-primary-teal group-hover:text-white transition-all duration-300">
                                  <ClipboardList size={24} />
                                </div>
                                <div>
                                  <h3 className="text-lg font-black text-dark-text uppercase tracking-wider leading-tight group-hover:text-primary-teal transition-colors">{assignment.title}</h3>
                                  <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-1 ${subStatus.color}`}>
                                    {subStatus.status === 'Turned In' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {subStatus.status} {subStatus.date && `• ${new Date(subStatus.date).toLocaleDateString()}`}
                                  </div>
                                </div>
                              </div>
                              <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                                Due {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            </div>

                            <p className="text-sm font-bold text-muted-text leading-relaxed whitespace-pre-wrap mb-8">
                              {assignment.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                              {isDigital ? (
                                <button 
                                  onClick={() => {
                                    const paper = assignment.attachments.find(a => a.type === 'question-paper' || a.type === 'question_paper');
                                    navigate(`/portal/subject/${subjectId}/take-test`, { 
                                      state: { assignmentId: assignment.id, paperId: paper.id || paper.paperId } 
                                    });
                                  }}
                                  disabled={subStatus.status === 'Turned In'}
                                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center gap-2 ${
                                    subStatus.status === 'Turned In'
                                    ? 'bg-emerald-50 text-emerald-500 cursor-not-allowed border border-emerald-100 shadow-none'
                                    : 'bg-primary-teal text-white hover:bg-secondary-teal shadow-primary-teal/20'
                                  }`}
                                >
                                  {subStatus.status === 'Turned In' ? (
                                    <button 
                                      onClick={() => handleReviewAnswers(subStatus.submission)}
                                      disabled={isFetchingReview}
                                      className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-lg flex items-center gap-2 bg-white text-primary-teal border border-primary-teal/20 hover:bg-primary-teal/5"
                                    >
                                      {isFetchingReview ? (
                                        <div className="w-4 h-4 border-2 border-primary-teal/30 border-t-primary-teal rounded-full animate-spin" />
                                      ) : (
                                        <><FileText size={16} /> Review My Test</>
                                      )}
                                    </button>
                                  ) : (
                                    <><Play size={16} /> Take Test</>
                                  )}
                                </button>
                              ) : (
                                <>
                                  {subStatus.status === 'Assigned' ? (
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                      {submittingTo === assignment.id ? (
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                          <input 
                                            type="file" 
                                            onChange={handleFileChange}
                                            className="text-[10px] font-bold text-muted-text"
                                          />
                                          <button 
                                            onClick={() => handleSubmitAssignment(assignment.id)}
                                            disabled={!selectedFile || isSubmitting}
                                            className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition disabled:opacity-50"
                                          >
                                            {isSubmitting ? 'Uploading...' : 'Confirm'}
                                          </button>
                                          <button onClick={() => setSubmittingTo(null)} className="text-[10px] font-black text-muted-text uppercase tracking-widest hover:text-rose-500">Cancel</button>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setSubmittingTo(assignment.id)}
                                          className="px-6 py-2.5 bg-primary-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20 flex items-center gap-2"
                                        >
                                          <Upload size={16} />
                                          Add Work
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <button 
                                      className="px-6 py-2.5 bg-gray-100 text-muted-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition border border-gray-200"
                                    >
                                      Unsubmit
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-16 shadow-soft-sm text-center">
                    <div className="w-32 h-32 bg-light-bg rounded-[2.5rem] flex items-center justify-center text-muted-text mx-auto mb-6 border border-gray-50 shadow-inner">
                      <ClipboardList size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-dark-text mb-2">No assignments yet.</h3>
                    <p className="text-sm font-bold text-muted-text max-w-md mx-auto">
                      Rest easy! Once assignments are posted, they will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Course Materials' && (
              <div className="space-y-6">
                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <a 
                            href={material.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-light-bg text-muted-text hover:text-primary-teal rounded-lg transition"
                          >
                            <ExternalLink size={18} />
                          </a>
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
                    <h3 className="text-2xl font-black text-dark-text mb-2">No materials available.</h3>
                    <p className="text-sm font-bold text-muted-text max-w-md mx-auto">
                      Resources and study guides shared by your teacher will appear here.
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
                      <GraduationCap size={16} className="text-primary-teal" /> Classmates
                    </h3>
                    <span className="text-[10px] font-black text-primary-teal bg-primary-teal/5 px-3 py-1 rounded-full uppercase tracking-widest">
                      {students.length} Total
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
                            <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Classmate</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white rounded-xl text-muted-text hover:text-primary-teal transition shadow-sm border border-transparent hover:border-gray-100">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    )) : (
                      <div className="p-12 text-center">
                        <p className="text-sm font-bold text-muted-text">Loading class list...</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'Grades' && (
              <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-soft-sm">
                <div className="p-8 border-b border-gray-100 bg-light-bg/30">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                      <Trophy size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-dark-text tracking-tight uppercase leading-none mb-1">My Progress</h3>
                      <p className="text-[10px] font-bold text-muted-text uppercase tracking-widest">Overall Performance for {subjectData?.subjectName}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(assignment => {
                      const sub = submissions.find(s => s.assignmentId === assignment.id)
                      return (
                        <div key={assignment.id} className="p-6 rounded-2xl border border-gray-100 hover:border-primary-teal/20 transition group">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[8px] font-black text-muted-text uppercase tracking-widest">{assignment.assessmentType || 'Assignment'}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${sub?.score ? 'text-emerald-500' : 'text-primary-teal'}`}>
                              {sub?.score ? 'Graded' : 'Pending'}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-dark-text mb-4 truncate">{assignment.title}</h4>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[8px] font-black text-muted-text uppercase tracking-widest mb-1">Score</p>
                              <p className="text-2xl font-black text-dark-text leading-none">
                                {typeof sub?.score === 'number' ? sub.score : '—'}<span className="text-xs text-muted-text ml-1">/ {assignment.maxScore || 100}</span>
                              </p>
                            </div>
                            {typeof sub?.score === 'number' && (
                              <div className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                {Math.round((sub.score / (assignment.maxScore || 100)) * 100)}%
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {assignments.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-sm font-bold text-muted-text">No graded work yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentSubjectDetails
