import React, { useEffect, useRef, useState } from 'react'

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

const YearTermPicker = () => {
  const [open, setOpen] = useState(false)
  const [showAdminOnly, setShowAdminOnly] = useState(false)
  const userRole = localStorage.getItem('userRole')
  const isAdmin = userRole === 'admin' || userRole === 'superadmin'

  const [baseYear, setBaseYear] = useState(() => {
    const stored = localStorage.getItem('academicBaseYear')
    if (stored) return parseInt(stored, 10)
    const y = new Date().getFullYear()
    return new Date().getMonth() >= 8 ? y : y - 1 // academic year usually starts Sep
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
  }, [open])

  const years = [
    `${baseYear + 1}/${baseYear + 2}`,
    `${baseYear}/${baseYear + 1}`,
    `${baseYear - 1}/${baseYear}`,
  ]

  const save = () => {
    if (!isAdmin) {
      setShowAdminOnly(true)
      setTimeout(() => setShowAdminOnly(false), 2000)
      return
    }
    setSelectedYear(draftYear)
    setSelectedTerm(draftTerm)
    // persist
    const start = parseInt(draftYear.split('/')[0], 10)
    localStorage.setItem('academicBaseYear', String(start))
    localStorage.setItem('academicYearLabel', draftYear)
    localStorage.setItem('academicTermLabel', draftTerm)
    setOpen(false)
    window.dispatchEvent(new CustomEvent('academicPeriod:change', { detail: { year: draftYear, term: draftTerm } }))
  }

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
            <button onClick={save} className={`px-4 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-extrabold ${!isAdmin && 'bg-gray-400 cursor-not-allowed'}`}>OK</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default YearTermPicker

