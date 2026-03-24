import React, { useEffect, useState } from 'react'
import { Users, BookOpen, ClipboardList, LayoutGrid, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Stat = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-soft-sm p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-primary-teal/10 text-primary-teal flex items-center justify-center">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-2xl font-black text-dark-text leading-none">{value}</div>
      <div className="text-[11px] font-bold text-muted-text uppercase tracking-widest mt-1">{label}</div>
    </div>
  </div>
)

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ students: '—', lessons: '—', classes: '—', assessments: '—' })
  const [schoolName, setSchoolName] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('schoolName')) || '')
  const [announcements, setAnnouncements] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch('/api/students?page=1&pageSize=1').then(r=>r.json()).catch(()=>({ total: '—' }))
        const t = await fetch('/api/lessons?status=pending').then(r=>r.json()).catch(()=>({ total: '—' }))
        const c = await fetch('/api/classes').then(r=>r.json()).catch(()=>[])
        const a = await fetch('/api/announcements').then(r=>r.json()).catch(()=>[])

        setStats({
          students: s.total ?? '—',
          lessons: t.total ?? '—',
          classes: Array.isArray(c) ? c.length : '—',
          assessments: '—'
        })
        setAnnouncements(a)
        if (!schoolName) {
          const prof = await fetch('/api/school-auth/profile').then(r=>r.ok?r.json():null).catch(()=>null)
          if (prof && (prof.schoolName || prof.name)) {
            const nm = prof.schoolName || prof.name || ''
            setSchoolName(nm)
            if (typeof window !== 'undefined') window.localStorage.setItem('schoolName', nm)
          }
        }
      } catch {}
    }
    load()
  }, [schoolName])
  const name = (typeof window !== 'undefined' && window.localStorage.getItem('userPhone')) || 'Teacher'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-text">Welcome</h1>
          <p className="text-sm text-muted-text font-bold">Your teaching overview</p>
          <p className="text-xs font-extrabold text-primary-teal mt-1">School: {schoolName || '—'}</p>
        </div>
        <button
          onClick={() => navigate('/teacher/announcements')}
          className="flex items-center gap-2 bg-primary-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-teal/20 hover:shadow-primary-teal/30 transition-all hover:-translate-y-0.5"
        >
          <MessageSquare size={18} />
          Messages
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Students" value={stats.students} />
        <Stat icon={BookOpen} label="Lessons" value={stats.lessons} />
        <Stat icon={LayoutGrid} label="Classes" value={stats.classes} />
        <Stat icon={ClipboardList} label="Assessments" value={stats.assessments} />
      </div>

      {announcements.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft-sm overflow-hidden animate-slide-up">
          <div className="bg-primary-teal/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-dark-text uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary-teal" /> Latest Announcement
            </h3>
            <span className="text-[10px] font-bold text-primary-teal bg-white px-2 py-1 rounded-lg shadow-sm">
              {new Date(announcements[0].createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="p-6">
            <h4 className="text-lg font-black text-dark-text mb-2 uppercase">{announcements[0].title}</h4>
            <p className="text-sm text-muted-text line-clamp-3 mb-4">{announcements[0].content}</p>
            <button 
              onClick={() => window.location.href = '/teacher/announcements'}
              className="text-[10px] font-black text-primary-teal uppercase tracking-widest hover:text-secondary-teal transition-colors"
            >
              Read Full Announcement →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
