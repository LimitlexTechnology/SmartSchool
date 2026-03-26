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
  const schoolId = (typeof window !== 'undefined' && window.localStorage.getItem('schoolId')) || 'local'
  const userRole = (typeof window !== 'undefined' && window.localStorage.getItem('userRole')) || 'admin'
  const keyName = `adminName:${schoolId}`
  const keyPhone = `adminPhone:${schoolId}`
  const [name, setName] = useState(() => {
    if (userRole === 'teacher') return localStorage.getItem('teacherName') || 'Teacher'
    return localStorage.getItem(keyName) || localStorage.getItem('adminName') || 'Admin User'
  })
  const [phone, setPhone] = useState(() => {
    if (userRole === 'teacher') return localStorage.getItem('userPhone') || ''
    return localStorage.getItem(keyPhone) || localStorage.getItem('adminPhone') || localStorage.getItem('userPhone') || ''
  })
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('userProfilePic') || '')
  const role = userRole === 'teacher' ? 'Teacher' : userRole === 'superadmin' ? 'Super Admin' : 'School Admin'
  const ref = useRef(null)
  useOutside(ref, () => setOpen(false))

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let endpoint = ''
        if (userRole === 'teacher') endpoint = '/api/teacher-auth/profile'
        else if (userRole === 'superadmin') endpoint = '/api/superadmin/profile'
        else if (userRole === 'admin') endpoint = '/api/school-auth/profile'

        if (endpoint) {
          const res = await fetch(endpoint)
          if (res.ok) {
            const data = await res.json()
            const newName = data.name || data.adminName || name
            const newPic = data.profilePicture || data.adminProfilePicture || ''
            const newPhone = data.phone || data.adminPhone || phone

            setName(newName)
            setProfilePic(newPic)
            setPhone(newPhone)

            localStorage.setItem('userProfilePic', newPic)
            if (userRole === 'teacher') {
              localStorage.setItem('teacherName', newName)
              localStorage.setItem('userPhone', newPhone)
            } else if (userRole === 'admin') {
              localStorage.setItem(`adminName:${schoolId}`, newName)
              localStorage.setItem(`adminPhone:${schoolId}`, newPhone)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }

    fetchProfile()

    const handler = () => {
      fetchProfile()
    }
    window.addEventListener('adminProfile:change', handler)
    return () => window.removeEventListener('adminProfile:change', handler)
  }, [userRole, schoolId])

  const save = () => {
    const sid = localStorage.getItem('schoolId') || 'local'
    if (sid !== 'local') {
      try {
        fetch('/api/school-auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminName: name.trim(), adminPhone: phone.trim() })
        }).catch(()=>{})
      } catch {}
    } else {
      try {
        fetch('/api/superadmin/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() || 'Super Admin', phone: phone.trim() })
        }).catch(()=>{})
      } catch {}
    }
    localStorage.setItem(`adminName:${sid}`, name.trim() || 'Admin User')
    localStorage.setItem(`adminPhone:${sid}`, phone.trim())
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
        <div className="w-10 h-10 rounded-full bg-soft-teal flex items-center justify-center text-white font-bold border-2 border-transparent overflow-hidden">
          {profilePic ? (
            <img src={profilePic} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-soft-sm p-4 z-[3000]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-soft-teal flex items-center justify-center text-white font-extrabold overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt={name} className="w-full h-full object-cover" />
              ) : (
                initials(name)
              )}
            </div>
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

