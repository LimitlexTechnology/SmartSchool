import React, { useState, useEffect } from 'react'
import { Bell, Lock, User, Globe, Moon, Sun, Eye, EyeOff } from 'lucide-react'

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-extrabold text-muted-text mb-3">{title}</h3>
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
      {children}
    </div>
  </div>
)

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

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  })

  useEffect(() => {
    const name = localStorage.getItem('adminName') || 'Admin User'
    const email = localStorage.getItem('userEmail') || 'admin@school.com'
    const phone = localStorage.getItem('adminPhone') || localStorage.getItem('userPhone') || ''
    const role = localStorage.getItem('userRole') || 'System Admin'
    
    setProfile({ name, email, phone, role })

    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
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
    localStorage.setItem('adminName', profile.name)
    localStorage.setItem('adminPhone', profile.phone)
    localStorage.setItem('userEmail', profile.email)
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