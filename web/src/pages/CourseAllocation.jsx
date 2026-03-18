import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, BookOpen, User, Trash2, Filter } from 'lucide-react'

const CourseAllocation = () => {
  const [q, setQ] = useState('')
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  
  // Form States
  const [newSubject, setNewSubject] = useState({ name: '', category: 'General' })
  const [newAssign, setNewAssign] = useState({ classId: '', teacherId: '', subjectId: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/teaching-assignments')
      const j = await r.json()
      if (r.ok) {
        setAssignments(j.assignments || [])
        setClasses(j.classes || [])
        setTeachers(j.teachers || [])
        setSubjects(j.subjects || [])
      }
    } catch (e) {
      console.error('Failed to load allocation data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      })
      if (r.ok) {
        setShowSubjectModal(false)
        setNewSubject({ name: '', category: 'General' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const r = await fetch('/api/teaching-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssign)
      })
      if (r.ok) {
        setShowAssignModal(false)
        setNewAssign({ classId: '', teacherId: '', subjectId: '' })
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return
    try {
      const r = await fetch(`/api/teaching-assignments/${id}`, { method: 'DELETE' })
      if (r.ok) loadData()
    } catch (e) { console.error(e) }
  }

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => 
      a.subjectName.toLowerCase().includes(q.toLowerCase()) ||
      a.teacherName.toLowerCase().includes(q.toLowerCase()) ||
      a.className.toLowerCase().includes(q.toLowerCase())
    )
  }, [assignments, q])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-dark-text">Course Allocation</h1>
          <p className="text-sm font-bold text-muted-text">Manage subjects and assign teachers to classes</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSubjectModal(true)}
            className="px-4 py-2.5 bg-white border border-gray-200 text-dark-text rounded-xl text-sm font-black hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
          >
            <BookOpen size={18} /> Manage Subjects
          </button>
          <button 
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2.5 bg-primary-teal text-white rounded-xl text-sm font-black hover:bg-secondary-teal transition flex items-center gap-2 shadow-lg shadow-primary-teal/20"
          >
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm">
          <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Total Subjects</div>
          <div className="text-3xl font-black text-dark-text">{subjects.length}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm">
          <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Active Assignments</div>
          <div className="text-3xl font-black text-dark-text">{assignments.length}</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft-sm">
          <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Classes Covered</div>
          <div className="text-3xl font-black text-dark-text">{new Set(assignments.map(a => a.classId)).size} / {classes.length}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={18} />
            <input 
              type="text" 
              placeholder="Search by subject, teacher or class..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20 transition"
            />
          </div>
          <div className="flex items-center gap-2">
             <Filter size={18} className="text-muted-text" />
             <span className="text-xs font-black text-muted-text uppercase tracking-widest">Filter</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-light-bg/50">
                <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Teacher</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-teal border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs font-bold text-muted-text">Loading assignments...</p>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-xs font-bold text-muted-text italic">
                    No assignments found. Start by adding a new one!
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-light-bg/30 transition group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-dark-text">{a.subjectName}</div>
                      <div className="text-[10px] font-bold text-muted-text uppercase">{a.category || 'General'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-dark-text">
                        <div className="w-8 h-8 rounded-lg bg-primary-teal/10 flex items-center justify-center text-primary-teal">
                          <User size={14} />
                        </div>
                        {a.teacherName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-dark-text">{a.className}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg bg-gray-100 text-dark-text text-[10px] font-black uppercase">
                        {a.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="p-2 text-muted-text hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Management Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-dark-text">Manage Subjects</h2>
                <button onClick={() => setShowSubjectModal(false)} className="p-2 hover:bg-light-bg rounded-xl transition text-muted-text"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Subject Name</label>
                  <input 
                    type="text" 
                    required
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    placeholder="e.g. Mathematics"
                    className="w-full px-4 py-3 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-primary-teal text-white rounded-2xl text-xs font-black hover:bg-secondary-teal transition shadow-lg">Add Subject</button>
              </form>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-4">Existing Subjects</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-light-bg/50 rounded-2xl border border-gray-50">
                      <span className="text-sm font-bold text-dark-text">{s.name}</span>
                      <button 
                        onClick={async () => {
                          if(confirm('Delete subject?')) {
                            await fetch(`/api/subjects/${s.id}`, { method: 'DELETE' })
                            loadData()
                          }
                        }}
                        className="text-muted-text hover:text-rose-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-dark-text">New Assignment</h2>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-light-bg rounded-xl transition text-muted-text"><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Select Subject</label>
                  <select 
                    required
                    value={newAssign.subjectId}
                    onChange={(e) => setNewAssign({...newAssign, subjectId: e.target.value})}
                    className="w-full px-4 py-3 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20"
                  >
                    <option value="">Choose a subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Select Class</label>
                  <select 
                    required
                    value={newAssign.classId}
                    onChange={(e) => setNewAssign({...newAssign, classId: e.target.value})}
                    className="w-full px-4 py-3 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1 block">Assign Teacher</label>
                  <select 
                    required
                    value={newAssign.teacherId}
                    onChange={(e) => setNewAssign({...newAssign, teacherId: e.target.value})}
                    className="w-full px-4 py-3 bg-light-bg border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20"
                  >
                    <option value="">Choose a teacher...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full py-4 bg-primary-teal text-white rounded-2xl text-sm font-black hover:bg-secondary-teal transition shadow-lg shadow-primary-teal/20">Create Assignment</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseAllocation
