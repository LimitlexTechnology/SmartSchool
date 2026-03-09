import React, { useEffect, useState } from 'react'
import { Users, BookOpen, ClipboardList, LayoutGrid } from 'lucide-react'

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
  const [stats, setStats] = useState({ students: '—', lessons: '—', classes: '—', assessments: '—' })
  const [schoolName, setSchoolName] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem('schoolName')) || '')
  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch('/api/students?page=1&pageSize=1').then(r=>r.json()).catch(()=>({ total: '—' }))
        const t = await fetch('/api/lessons?status=pending').then(r=>r.json()).catch(()=>({ total: '—' }))
        const c = await fetch('/api/classes').then(r=>r.json()).catch(()=>[])
        setStats({
          students: s.total ?? '—',
          lessons: t.total ?? '—',
          classes: Array.isArray(c) ? c.length : '—',
          assessments: '—'
        })
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
      <div>
        <h1 className="text-2xl font-extrabold text-dark-text">Welcome</h1>
        <p className="text-sm text-muted-text font-bold">Your teaching overview</p>
        <p className="text-xs font-extrabold text-primary-teal mt-1">School: {schoolName || '—'}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Students" value={stats.students} />
        <Stat icon={BookOpen} label="Lessons" value={stats.lessons} />
        <Stat icon={LayoutGrid} label="Classes" value={stats.classes} />
        <Stat icon={ClipboardList} label="Assessments" value={stats.assessments} />
      </div>
    </div>
  )
}

export default TeacherDashboard
