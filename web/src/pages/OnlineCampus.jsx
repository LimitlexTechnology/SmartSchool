import React, { useEffect, useState, useMemo } from 'react'
import { Search, Filter, BookOpen, GraduationCap, ChevronRight, User, ArrowLeft } from 'lucide-react'

const OnlineCampus = () => {
  const [view, setView] = useState('classes') // 'classes' or 'subjects'
  const [selectedClass, setSelectedClass] = useState(null)
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/teaching-assignments')
        const j = await r.json()
        if (r.ok) {
          setClasses(j.classes || [])
          setAssignments(j.assignments || [])
        }
      } catch (e) {
        console.error('Failed to load campus data:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const classSubjects = useMemo(() => {
    if (!selectedClass) return []
    return assignments.filter(a => a.classId === selectedClass.id)
  }, [selectedClass, assignments])

  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      c.name.toLowerCase().includes(q.toLowerCase()) || 
      c.grade.toLowerCase().includes(q.toLowerCase())
    ).sort((a, b) => a.grade.localeCompare(b.grade) || a.name.localeCompare(b.name))
  }, [classes, q])

  const filteredSubjects = useMemo(() => {
    return classSubjects.filter(s => 
      s.subjectName.toLowerCase().includes(q.toLowerCase()) ||
      s.teacherName.toLowerCase().includes(q.toLowerCase())
    )
  }, [classSubjects, q])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black text-muted-text uppercase tracking-widest">Opening Online Campus...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {view === 'subjects' && (
            <button 
              onClick={() => { setView('classes'); setSelectedClass(null); setQ(''); }}
              className="p-3 rounded-2xl bg-white border border-gray-100 text-muted-text hover:text-primary-teal transition shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-dark-text">
              {view === 'classes' ? 'Online Campus' : `${selectedClass?.grade} ${selectedClass?.name}`}
            </h1>
            <p className="text-sm font-bold text-muted-text">
              {view === 'classes' ? 'Explore all classes and learning materials' : 'Available subjects and learning resources'}
            </p>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={18} />
          <input 
            type="text" 
            placeholder={view === 'classes' ? "Search for a class..." : "Search subjects or teachers..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-teal/20 transition shadow-sm"
          />
        </div>
      </div>

      {view === 'classes' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-light-bg rounded-3xl flex items-center justify-center text-muted-text mx-auto mb-4">
                <GraduationCap size={32} />
              </div>
              <p className="text-sm font-black text-muted-text uppercase tracking-widest">No classes found</p>
            </div>
          ) : (
            filteredClasses.map(c => {
              const subjectsCount = assignments.filter(a => a.classId === c.id).length
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClass(c); setView('subjects'); setQ(''); }}
                  className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-soft-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-teal/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-primary-teal/10 transition-colors" />
                  
                  <div className="w-12 h-12 rounded-2xl bg-primary-teal/10 flex items-center justify-center text-primary-teal mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  
                  <h3 className="text-xl font-black text-dark-text group-hover:text-primary-teal transition-colors">
                    {c.grade} {c.name}
                  </h3>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="px-3 py-1 rounded-full bg-light-bg text-[10px] font-black text-muted-text uppercase tracking-widest">
                      {subjectsCount} Subjects
                    </div>
                    <div className="w-8 h-8 rounded-full bg-light-bg flex items-center justify-center text-muted-text group-hover:bg-primary-teal group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-light-bg rounded-3xl flex items-center justify-center text-muted-text mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <p className="text-sm font-black text-muted-text uppercase tracking-widest">No subjects assigned yet</p>
            </div>
          ) : (
            filteredSubjects.map((s, idx) => {
              // Generate a consistent color based on subject name
              const colors = [
                'from-amber-400 to-orange-500',
                'from-emerald-400 to-teal-600',
                'from-blue-500 to-indigo-600',
                'from-rose-400 to-pink-600',
                'from-violet-400 to-purple-600',
                'from-cyan-400 to-blue-500'
              ]
              const colorClass = colors[s.subjectName.length % colors.length]
              
              return (
                <div 
                  key={s.id}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-soft-sm overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <div className={`h-32 bg-gradient-to-br ${colorClass} p-6 relative`}>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white pr-12">{s.subjectName}</h3>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">{selectedClass.grade}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-light-bg flex items-center justify-center text-muted-text">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-muted-text uppercase tracking-widest leading-none mb-1">Teacher</div>
                        <div className="text-sm font-bold text-dark-text">{s.teacherName}</div>
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-light-bg text-dark-text rounded-2xl text-xs font-black hover:bg-primary-teal hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                      Open Learning Materials
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default OnlineCampus
