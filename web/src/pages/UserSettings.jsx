import React, { useState, useEffect } from 'react'
import { Bell, Lock, User, Globe, Moon, Sun, Eye, EyeOff, Camera } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-extrabold text-muted-text mb-3">{title}</h3>
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
      {children}
    </div>
  </div>
)

const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
  })
}

const SettingRow = ({ icon: Icon, label, description, children }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 rounded-lg bg-light-bg text-primary-teal">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-extrabold text-dark-text">{label}</div>
        <div className="text-xs text-muted-text font-bold">{description}</div>
      </div>
    </div>
    <div>{children}</div>
  </div>
)

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-teal"></div>
  </label>
)

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const role = (typeof window !== 'undefined' && window.localStorage.getItem('userRole')) || 'admin'

  const submit = async () => {
    if (role === 'superadmin') { alert('Super admin password is managed by environment settings.'); return }
    if (!newPassword || newPassword.length < 6) { alert('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { alert('New passwords do not match'); return }
    setSaving(true)
    try {
      let r
      if (role === 'teacher') {
        r = await fetch('/api/teacher-auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        })
      } else {
        r = await fetch('/api/school-auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        })
      }
      if (!r.ok) {
        const t = await r.json().catch(()=>({}))
        alert(t.error || 'Failed to change password')
        return
      }
      alert('Password changed successfully. Please log in again.')
      localStorage.clear()
      document.cookie = 'schoolId=; Path=/; Max-Age=0'
      document.cookie = 'teacherId=; Path=/; Max-Age=0'
      window.location.href = '/login'
    } finally { setSaving(false) }
  }

  if (role === 'superadmin') {
    return <p className="text-xs text-muted-text font-bold">Super admin credentials are configured by the platform operator.</p>
  }

  return (
    <div className="grid gap-3 max-w-md">
      <div className="relative">
        <input
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          className="w-full pr-12 px-3 py-2 text-sm border border-gray-200 rounded-lg"
        />
        <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute inset-y-0 right-0 px-3 text-gray-500">
          {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="relative">
        <input
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full pr-12 px-3 py-2 text-sm border border-gray-200 rounded-lg"
          minLength={6}
        />
        <button type="button" onClick={() => setShowNew(v => !v)} className="absolute inset-y-0 right-0 px-3 text-gray-500">
          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
        minLength={6}
      />
      <div>
        <button
          onClick={submit}
          disabled={saving}
          className="px-4 py-2 bg-primary-teal text-white text-sm font-bold rounded-lg hover:bg-teal-600 disabled:opacity-50"
        >
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}

const UserSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      profileVisible: true,
      showPhone: false,
      showEmail: true
    },
    appearance: {
      theme: 'light',
      language: 'en'
    },
    security: {
      twoFactor: false,
      loginAlerts: true
    }
  })

  const sid = (typeof window !== 'undefined' && window.localStorage.getItem('schoolId')) || 'local'
  const role = (typeof window !== 'undefined' && window.localStorage.getItem('userRole')) || 'admin'
  const keyName = `adminName:${sid}`
  const keyPhone = `adminPhone:${sid}`
  const keyEmail = `userEmail:${sid}`

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    logo: ''
  })

  useEffect(() => {
    const sidNow = localStorage.getItem('schoolId') || 'local'
    const nKey = `adminName:${sidNow}`
    const pKey = `adminPhone:${sidNow}`
    const eKey = `userEmail:${sidNow}`
    const name = localStorage.getItem(nKey) || localStorage.getItem('adminName') || 'Admin User'
    const email = localStorage.getItem(eKey) || localStorage.getItem('userEmail') || 'admin@school.com'
    const phone = localStorage.getItem(pKey) || localStorage.getItem('adminPhone') || localStorage.getItem('userPhone') || ''
    const role = localStorage.getItem('userRole') || 'System Admin'
    const profilePicture = localStorage.getItem(`userAvatar:${sidNow}`) || null
    
    setProfile({ name, email, phone, role, profilePicture })

    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
    if (sidNow !== 'local') {
      if (role === 'teacher') {
        fetch('/api/teacher-auth/profile').then(r => r.ok ? r.json() : null).then(j => {
          if (j) {
            setProfile(p => ({ ...p, name: j.name || p.name, phone: j.phone || p.phone, email: j.email || p.email, profilePicture: j.profilePicture || '' }))
            if (j.profilePicture) localStorage.setItem(`userAvatar:${sidNow}`, j.profilePicture)
          }
        }).catch(()=>{})
      } else {
        fetch('/api/school-auth/profile').then(r => r.ok ? r.ok ? r.json() : null : null).then(j => {
          if (j) {
            setProfile(p => ({ ...p, name: j.adminName || p.name, phone: j.adminPhone || p.phone, email: j.adminEmail || p.email, logo: j.schoolLogo || '', profilePicture: j.adminProfilePicture || '' }))
            if (j.schoolLogo) localStorage.setItem(`schoolLogo:${sidNow}`, j.schoolLogo)
            if (j.schoolName) localStorage.setItem(`schoolName:${sidNow}`, j.schoolName)
            if (j.adminProfilePicture) localStorage.setItem(`userAvatar:${sidNow}`, j.adminProfilePicture)
          }
        }).catch(()=>{})
      }
    } else {
      fetch('/api/superadmin/profile').then(r => r.ok ? r.json() : null).then(j => {
        if (j) {
          setProfile(p => ({ ...p, name: j.name || p.name, phone: j.phone || p.phone, email: j.email || p.email, profilePicture: j.profilePicture || '' }))
          if (j.profilePicture) localStorage.setItem(`userAvatar:${sidNow}`, j.profilePicture)
        }
      }).catch(()=>{})
    }
  }, [])

  const updateSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    }
    setSettings(newSettings)
    localStorage.setItem('userSettings', JSON.stringify(newSettings))
  }

  const saveProfile = () => {
    const sidNow = localStorage.getItem('schoolId') || 'local'
    const role = localStorage.getItem('userRole') || 'admin'
    
    if (sidNow !== 'local') {
      if (role === 'teacher') {
        fetch('/api/teacher-auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: profile.name, phone: profile.phone, profilePicture: profile.profilePicture })
        }).catch(()=>{})
        if (profile.profilePicture) localStorage.setItem(`userAvatar:${sidNow}`, profile.profilePicture)
      } else {
        fetch('/api/school-auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminName: profile.name,
            adminPhone: profile.phone,
            adminEmail: profile.email,
            schoolLogo: profile.logo,
            adminProfilePicture: profile.profilePicture
          })
        }).catch(()=>{})
        if (profile.logo) localStorage.setItem(`schoolLogo:${sidNow}`, profile.logo)
        if (profile.profilePicture) localStorage.setItem(`userAvatar:${sidNow}`, profile.profilePicture)
      }
    } else {
      fetch('/api/superadmin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, email: profile.email, profilePicture: profile.profilePicture })
      }).catch(()=>{})
      if (profile.profilePicture) localStorage.setItem(`userAvatar:${sidNow}`, profile.profilePicture)
    }
    localStorage.setItem(`adminName:${sidNow}`, profile.name)
    localStorage.setItem(`adminPhone:${sidNow}`, profile.phone)
    localStorage.setItem(`userEmail:${sidNow}`, profile.email)
    try {
      if (profile.logo) localStorage.setItem(`schoolLogo:${sidNow}`, profile.logo)
    } catch (e) {
      console.error('LocalStorage quota exceeded for school logo:', e)
    }
    window.dispatchEvent(new CustomEvent('adminProfile:change'))
    alert('Profile updated successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-text">Settings</h1>
        <p className="text-sm text-muted-text font-bold">Manage your account preferences and settings</p>
      </div>

      <Section title="Profile Information">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-light-bg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-300" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer">
              <Camera size={20} />
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = async () => {
                    const compressed = await compressImage(reader.result, 300, 300)
                    setProfile({ ...profile, profilePicture: compressed })
                  }
                  reader.readAsDataURL(file)
                }
              }} />
            </label>
          </div>
          <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mt-2">Profile Picture</div>
        </div>

        {role !== 'teacher' && (
          <div className="mb-6 flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-light-bg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {profile.logo ? (
                  <img src={profile.logo} alt="School Logo" className="w-full h-full object-contain" />
                ) : (
                  <Globe size={32} className="text-gray-300" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl cursor-pointer">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = async () => {
                      const compressed = await compressImage(reader.result, 300, 300)
                      setProfile({ ...profile, logo: compressed })
                    }
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
            <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mt-2">School Logo</div>
          </div>
        )}

        <SettingRow icon={User} label="Full Name" description="Your display name across the platform">
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-48"
          />
        </SettingRow>
        
        <SettingRow icon={User} label="Email" description="Your email address">
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-48"
          />
        </SettingRow>
        
        <SettingRow icon={User} label="Phone" description="Your contact number">
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-48"
          />
        </SettingRow>
        
        <SettingRow icon={User} label="Role" description="Your system role">
          <span className="text-sm font-bold text-primary-teal">{profile.role}</span>
        </SettingRow>
        
        <div className="flex justify-end pt-2">
          <button
            onClick={saveProfile}
            className="px-4 py-2 bg-primary-teal text-white text-sm font-bold rounded-lg hover:bg-teal-600"
          >
            Save Profile
          </button>
        </div>
      </Section>

      <Section title="Notifications">
        <SettingRow
          icon={Bell}
          label="Email Notifications"
          description="Receive notifications via email"
        >
          <Toggle
            checked={settings.notifications.email}
            onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
          />
        </SettingRow>
        
        <SettingRow
          icon={Bell}
          label="Push Notifications"
          description="Receive push notifications in browser"
        >
          <Toggle
            checked={settings.notifications.push}
            onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
          />
        </SettingRow>
        
        <SettingRow
          icon={Bell}
          label="SMS Notifications"
          description="Receive notifications via SMS"
        >
          <Toggle
            checked={settings.notifications.sms}
            onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
          />
        </SettingRow>
      </Section>

      <Section title="Privacy">
        <SettingRow
          icon={Eye}
          label="Profile Visibility"
          description="Make your profile visible to other users"
        >
          <Toggle
            checked={settings.privacy.profileVisible}
            onChange={(e) => updateSetting('privacy', 'profileVisible', e.target.checked)}
          />
        </SettingRow>
        
        <SettingRow
          icon={EyeOff}
          label="Show Phone Number"
          description="Display your phone number in profile"
        >
          <Toggle
            checked={settings.privacy.showPhone}
            onChange={(e) => updateSetting('privacy', 'showPhone', e.target.checked)}
          />
        </SettingRow>
        
        <SettingRow
          icon={Eye}
          label="Show Email"
          description="Display your email address in profile"
        >
          <Toggle
            checked={settings.privacy.showEmail}
            onChange={(e) => updateSetting('privacy', 'showEmail', e.target.checked)}
          />
        </SettingRow>
      </Section>

      <Section title="Security">
        <SettingRow
          icon={Lock}
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        >
          <Toggle
            checked={settings.security.twoFactor}
            onChange={(e) => updateSetting('security', 'twoFactor', e.target.checked)}
          />
        </SettingRow>
        
        <SettingRow
          icon={Lock}
          label="Login Alerts"
          description="Get notified when someone logs into your account"
        >
          <Toggle
            checked={settings.security.loginAlerts}
            onChange={(e) => updateSetting('security', 'loginAlerts', e.target.checked)}
          />
        </SettingRow>
    <div className="pt-2">
      <div className="text-sm font-extrabold text-dark-text mb-2">Change Password</div>
      <ChangePasswordForm />
    </div>
      </Section>

      <Section title="Appearance">
        <SettingRow
          icon={settings.appearance.theme === 'dark' ? Moon : Sun}
          label="Theme"
          description="Choose your preferred theme"
        >
          <select
            value={settings.appearance.theme}
            onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </SettingRow>
        
        <SettingRow
          icon={Globe}
          label="Language"
          description="Select your preferred language"
        >
          <select
            value={settings.appearance.language}
            onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </SettingRow>
      </Section>
    </div>
  )
}

export default UserSettings
