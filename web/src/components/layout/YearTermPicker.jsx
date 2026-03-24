import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const terms = ['First Term', 'Second Term', 'Third Term']

function useOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

const YearTermPicker = ({ type, variant }) => {
  const [open, setOpen] = useState(false)
  const [showAdminOnly, setShowAdminOnly] = useState(false)
  const userRole = localStorage.getItem('userRole')
  const isAdmin = userRole === 'admin' || userRole === 'superadmin'

  const [baseYear, setBaseYear] = useState(() => {
    const stored = localStorage.getItem('academicBaseYear')
    if (stored) return parseInt(stored, 10)
    const y = new Date().getFullYear()
    return new Date().getMonth() >= 8 ? y : y - 1 
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return localStorage.getItem('academicYearLabel') || `${baseYear}/${baseYear + 1}`
  })
  const [selectedTerm, setSelectedTerm] = useState(() => {
    return localStorage.getItem('academicTermLabel') || 'First Term'
  })
  const [draftYear, setDraftYear] = useState(selectedYear)
  const [draftTerm, setDraftTerm] = useState(selectedTerm)
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))

  useEffect(() => {
    setDraftYear(selectedYear)
    setDraftTerm(selectedTerm)
  }, [open, selectedYear, selectedTerm])

  // Listen for changes from other pickers
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setSelectedYear(e.detail.year)
        setSelectedTerm(e.detail.term)
      }
    }
    window.addEventListener('academicPeriod:change', handler)
    return () => window.removeEventListener('academicPeriod:change', handler)
  }, [])

  const years = [
    `${baseYear + 1}/${baseYear + 2}`,
    `${baseYear}/${baseYear + 1}`,
    `${baseYear - 1}/${baseYear}`,
  ]

  const save = (newYear, newTerm) => {
    if (!isAdmin) {
      setShowAdminOnly(true)
      setTimeout(() => setShowAdminOnly(false), 2000)
      return
    }
    const y = newYear || draftYear
    const t = newTerm || draftTerm
    setSelectedYear(y)
    setSelectedTerm(t)
    const start = parseInt(y.split('/')[0], 10)
    localStorage.setItem('academicBaseYear', String(start))
    localStorage.setItem('academicYearLabel', y)
    localStorage.setItem('academicTermLabel', t)
    setOpen(false)
    window.dispatchEvent(new CustomEvent('academicPeriod:change', { detail: { year: y, term: t } }))
  }

  if (variant === 'sidebar') {
    const label = type === 'year' ? selectedYear : selectedTerm
    const options = type === 'year' ? years : terms

    return (
      <div className="relative w-full" ref={ref}>
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-black text-dark-text hover:bg-white hover:border-primary-teal/30 transition-all group"
        >
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className={`text-muted-text group-hover:text-primary-teal transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 z-[2000] animate-scale-in">
            <div className="flex flex-col gap-0.5">
              {options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => {
                    if (type === 'year') save(opt, selectedTerm)
                    else save(selectedYear, opt)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${label === opt ? 'bg-primary-teal text-white' : 'text-dark-text hover:bg-light-bg'}`}
                >
                  {opt}
                </button>
              ))}
              {type === 'year' && (
                <div className="mt-1 border-t border-gray-50 pt-1 flex items-center gap-1">
                  <button onClick={() => setBaseYear(y => y - 1)} className="flex-1 py-1 rounded-md hover:bg-light-bg text-[10px] font-bold text-muted-text">Prev</button>
                  <button onClick={() => setBaseYear(y => y + 1)} className="flex-1 py-1 rounded-md hover:bg-light-bg text-[10px] font-bold text-muted-text">Next</button>
                </div>
              )}
            </div>
            {showAdminOnly && (
              <div className="px-2 py-1.5 text-[8px] font-black text-rose-500 uppercase tracking-widest text-center">
                Admin Only
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Default Navbar variant
  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <button onClick={()=>setOpen(v=>!v)} className="px-3 py-1.5 rounded-full bg-light-bg border border-gray-200 text-xs font-extrabold text-dark-text hover:bg-white">
          {selectedYear}
        </button>
        <button onClick={()=>setOpen(v=>!v)} className="px-3 py-1.5 rounded-full bg-light-bg border border-gray-200 text-xs font-extrabold text-dark-text hover:bg-white">
          {selectedTerm}
        </button>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-[320px] bg-white border border-gray-100 rounded-2xl shadow-soft-sm p-3 z-[2000]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-extrabold text-muted-text mb-2">Academic Year</div>
              <div className="space-y-1">
                {years.map(y=>(
                  <button key={y} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${draftYear===y?'bg-primary-teal text-white':'hover:bg-light-bg'} ${!isAdmin && 'opacity-50 cursor-not-allowed'}`} onClick={() => isAdmin ? setDraftYear(y) : setShowAdminOnly(true)}>{y}</button>
                ))}
                <input
                  className={`mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm ${!isAdmin && 'bg-gray-50'}`}
                  placeholder="Enter Year… (e.g., 2026/2027)"
                  readOnly={!isAdmin}
                  onChange={e=>isAdmin && setDraftYear(e.target.value)}
                  onFocus={() => !isAdmin && setShowAdminOnly(true)}
                  value={draftYear}
                />
              </div>
            </div>
            <div>
              <div className="text-xs font-extrabold text-muted-text mb-2">Term</div>
              <div className="space-y-1">
                {terms.map(t=>(
                  <button key={t} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${draftTerm===t?'bg-primary-teal text-white':'hover:bg-light-bg'} ${!isAdmin && 'opacity-50 cursor-not-allowed'}`} onClick={() => isAdmin ? setDraftTerm(t) : setShowAdminOnly(true)}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          {showAdminOnly && (
            <div className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center animate-bounce">
              Only admin can set it
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button onClick={() => isAdmin ? setBaseYear(y=>y-1) : setShowAdminOnly(true)} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold ${!isAdmin && 'opacity-50'}`}>◀</button>
              <button onClick={() => isAdmin ? setBaseYear(y=>y+1) : setShowAdminOnly(true)} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold ${!isAdmin && 'opacity-50'}`}>▶</button>
            </div>
            <button onClick={() => save()} className={`px-4 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-extrabold ${!isAdmin && 'bg-gray-400 cursor-not-allowed'}`}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default YearTermPicker
