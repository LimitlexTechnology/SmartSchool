import React, { useEffect, useRef, useState } from 'react'

const initials = (name) => {
  const p = (name || '').trim().split(' ')
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || 'AD'
}

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

const ProfileMenu = ({ onLogout }) => {
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(() => localStorage.getItem('adminName') || 'Admin User')
  const [phone, setPhone] = useState(() => localStorage.getItem('adminPhone') || localStorage.getItem('userPhone') || '')
  const [role] = useState('System Admin')
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))

  useEffect(() => {
    const handler = () => {
      setName(localStorage.getItem('adminName') || 'Admin User')
      setPhone(localStorage.getItem('adminPhone') || localStorage.getItem('userPhone') || '')
    }
    window.addEventListener('adminProfile:change', handler)
    return () => window.removeEventListener('adminProfile:change', handler)
  }, [])

  const save = () => {
    localStorage.setItem('adminName', name.trim() || 'Admin User')
    localStorage.setItem('adminPhone', phone.trim())
    window.dispatchEvent(new CustomEvent('adminProfile:change'))
    setEdit(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v=>!v)} className="flex items-center gap-3 pl-6 border-l border-gray-100">
        <div className="text-right hidden md:block">
          <div className="text-sm font-bold text-dark-text truncate max-w-[160px]">{name}</div>
          <div className="text-[10px] text-muted-text uppercase tracking-wider font-semibold">{role}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-soft-teal flex items-center justify-center text-white font-bold border-2 border-transparent">
          {initials(name)}
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-soft-sm p-4 z-[3000]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-soft-teal flex items-center justify-center text-white font-extrabold">{initials(name)}</div>
            <div>
              <div className="font-extrabold text-dark-text">{name}</div>
              <div className="text-xs text-muted-text font-bold">{phone || '—'}</div>
              <div className="text-xs text-primary-teal font-extrabold">{role}</div>
            </div>
          </div>
          {!edit && (
            <div className="mt-3 space-y-2">
              <button onClick={()=>setEdit(true)} className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Edit profile</button>
              <a href="/dashboard/settings" className="block px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Settings</a>
              <a href="/help" className="block px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold">Help</a>
              <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-error">Log out</button>
            </div>
          )}
          {edit && (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-xs font-bold text-muted-text">Full Name</div>
                <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-text">Phone</div>
                <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={()=>setEdit(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold">Cancel</button>
                <button onClick={save} className="px-3 py-1.5 rounded-lg bg-primary-teal text-white text-xs font-bold">Save</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileMenu

