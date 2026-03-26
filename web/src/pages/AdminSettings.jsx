import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Building, 
  Shield, 
  Lock, 
  Settings, 
  Camera, 
  Save, 
  MoreHorizontal, 
  ShieldCheck, 
  RefreshCw, 
  RotateCcw, 
  Database, 
  Download, 
  History, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  X, 
  Check, 
  ChevronRight, 
  UserPlus, 
  Users as UsersIcon, 
  Bell, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Layout, 
  Wallet, 
  FileText, 
  CreditCard, 
  Stethoscope, 
  LogOut,
  Globe,
  Moon,
  Sun,
  Eye,
  EyeOff
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { createPortal } from 'react-dom'
import { hasPermission } from '../utils/permissionUtils'

const ActionRow = ({ icon: Icon, title, desc, button, onClick, tone='default' }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 rounded-lg bg-light-bg text-primary-teal"><Icon size={16} /></div>
      <div>
        <div className="text-sm font-extrabold text-dark-text">{title}</div>
        <div className="text-xs text-muted-text font-bold">{desc}</div>
      </div>
    </div>
    <button onClick={onClick} className={`px-3 py-2 rounded-lg text-xs font-bold border ${tone==='danger' ? 'bg-error text-white border-error' : 'border-gray-200 text-dark-text hover:bg-light-bg'}`}>{button}</button>
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

const Avatar = ({ name, src, size = 'sm' }) => {
  const initials = useMemo(() => {
    const parts = (name || '').trim().split(' ')
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }, [name])
  
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
  }

  if (src) return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border border-gray-100 bg-white`}>
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  )
  
  const colors = ['#0ea5b7', '#ef4444', '#f59e0b', '#10b981', '#6366f1']
  const bg = colors[(name?.length || 0 + initials.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold`} style={{ backgroundColor: bg }}>
      {initials || '?'}
    </div>
  )
}

const PERMISSION_CATEGORIES = [
  {
    id: 'general',
    title: 'General & Notifications',
    icon: Bell,
    permissions: [
      { id: 'super_admin', label: 'Super Admin Rights' },
      { id: 'notify_payments', label: 'Payment Notifications' },
      { id: 'notify_lesson_plans', label: 'Lesson Plan Alerts' },
      { id: 'notify_diary', label: 'Diary Entry Alerts' },
      { id: 'notify_attendance', label: 'Attendance Alerts' }
    ]
  },
  {
    id: 'school_staff',
    title: 'School & Staff',
    icon: Building,
    permissions: [
      { id: 'manage_terms', label: 'Manage Academic Terms' },
      { id: 'manage_classes', label: 'Manage Classes & Subjects' },
      { id: 'manage_staff', label: 'Staff Profile Management' },
      { id: 'course_allocation', label: 'Course Allocations' },
      { id: 'staff_attendance', label: 'Staff Attendance Tracking' }
    ]
  },
  {
    id: 'students',
    title: 'Students',
    icon: UsersIcon,
    permissions: [
      { id: 'view_students', label: 'View Student Lists' },
      { id: 'manage_groups', label: 'Student Groups' },
      { id: 'manage_admissions', label: 'Admissions Management' },
      { id: 'student_attendance', label: 'Student Attendance' },
      { id: 'guardians_info', label: 'Guardian Information' }
    ]
  },
  {
    id: 'exams',
    title: 'Exams',
    icon: GraduationCap,
    permissions: [
      { id: 'enter_marks', label: 'Enter/Edit Marks' },
      { id: 'approve_assessments', label: 'Approve Assessments' },
      { id: 'grading_systems', label: 'Manage Grading Systems' },
      { id: 'publish_reports', label: 'Publish Exam Reports' },
      { id: 'exam_config', label: 'Exam Configuration' }
    ]
  },
  {
    id: 'timetable_messaging',
    title: 'Timetable & Messaging',
    icon: Calendar,
    permissions: [
      { id: 'edit_schedules', label: 'Create/Edit Schedules' },
      { id: 'send_messages', label: 'Send Broadcast Messages' },
      { id: 'view_messages', label: 'View Scheduled Messages' },
      { id: 'messaging_logs', label: 'Messaging Audit Logs' }
    ]
  },
  {
    id: 'diary_planner',
    title: 'Diary & Lesson Planner',
    icon: BookOpen,
    permissions: [
      { id: 'review_reports', label: 'Review Daily Reports' },
      { id: 'approve_lesson_plans', label: 'Approve Lesson Plans' },
      { id: 'edit_planner', label: 'Edit Class Planners' },
      { id: 'view_all_plans', label: 'View All Staff Plans' }
    ]
  },
  {
    id: 'classroom',
    title: 'Classroom',
    icon: Layout,
    permissions: [
      { id: 'classroom_admin', label: 'Classroom Admin Access' },
      { id: 'view_all_courses', label: 'View All Courses' },
      { id: 'classroom_settings', label: 'Edit Classroom Settings' }
    ]
  },
  {
    id: 'accounting',
    title: 'Accounting & E-wallet',
    icon: Wallet,
    permissions: [
      { id: 'transactions', label: 'Financial Transactions' },
      { id: 'student_billing', label: 'Student Billing' },
      { id: 'fee_management', label: 'Fee Management' },
      { id: 'wallet_topups', label: 'E-wallet Top-ups' }
    ]
  },
  {
    id: 'payroll_inventory',
    title: 'Payroll & Inventory',
    icon: FileText,
    permissions: [
      { id: 'salary_management', label: 'Staff Salary Management' },
      { id: 'inventory_tracking', label: 'School Stock Tracking' },
      { id: 'procurement', label: 'Procurement Requests' }
    ]
  },
  {
    id: 'smart_services',
    title: 'Smart Services & Canteen',
    icon: CreditCard,
    permissions: [
      { id: 'id_management', label: 'ID Card Management' },
      { id: 'canteen_collection', label: 'Canteen Fee Collection' },
      { id: 'service_billing', label: 'Smart Service Billing' }
    ]
  },
  {
    id: 'visitor_clinic',
    title: 'Visitor Log & Clinic',
    icon: Stethoscope,
    permissions: [
      { id: 'security_logs', label: 'Security Visitor Logs' },
      { id: 'health_records', label: 'Student Health Records' },
      { id: 'clinic_inventory', label: 'Clinic Stock Management' }
    ]
  }
]

const AdminSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'school'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // App Preferences State (Consolidated from UserSettings)
  const [appPrefs, setAppPreferences] = useState({
    notifications: { email: true, push: false, sms: false },
    appearance: { theme: 'light', language: 'en' },
    security: { twoFactor: false, loginAlerts: true }
  })

  // Roles State
  const [roles, setRoles] = useState([])
  const [editingRole, setEditingRole] = useState(null)
  const [staffList, setStaffList] = useState([])
  const [permSearch, setPermSearch] = useState('')
  const [expandedCategory, setExpandedCategory] = useState('general')

  const crestInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Mirekua International Community School',
    shortName: 'MICS',
    email: 'mirekuaics@gmail.com',
    phone: '055 147 7222, 055 144 3777',
    location: 'Sisi Mirekua Street, Opah (near Amasaman) Accra. (GW-0203-2246)',
    motto: 'Cornerstone of Excellence',
    crest: null,
    banner: null
  })

  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'school')
  }, [searchParams])

  const handleTabChange = (id) => {
    setActiveTab(id)
    setSearchParams({ tab: id })
  }

  // Load from localStorage on mount
  useEffect(() => {
    const sid = localStorage.getItem('schoolId') || 'local'
    const stored = localStorage.getItem(`schoolInfo:${sid}`)
    if (stored) {
      try {
        setSchoolInfo(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse schoolInfo', e)
      }
    }

    // Load Roles
    const storedRoles = localStorage.getItem(`schoolRoles:${sid}`)
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles))
    } else {
      // Default Roles
      const defaultRoles = [
        { id: '1', name: 'Academic Head', permissions: ['review_reports', 'approve_lesson_plans', 'enter_marks'], staffIds: [] },
        { id: '2', name: 'Administrators', permissions: ['super_admin'], staffIds: [] },
        { id: '3', name: 'Facilitators', permissions: ['enter_marks', 'view_students'], staffIds: [] },
        { id: '4', name: 'Principal', permissions: ['super_admin'], staffIds: [] },
        { id: '5', name: 'System Admin', permissions: ['super_admin'], staffIds: [] },
      ]
      setRoles(defaultRoles)
      localStorage.setItem(`schoolRoles:${sid}`, JSON.stringify(defaultRoles))
    }

    // Load Staff for assignment
    fetch('/api/teachers').then(r => r.json()).then(data => {
      setStaffList(data.data || [])
    }).catch(() => setStaffList([]))

    // Load App Prefs
    const storedPrefs = localStorage.getItem(`appPrefs:${sid}`)
    if (storedPrefs) setAppPreferences(JSON.parse(storedPrefs))

    // Fetch profile to cache the avatar
    if (sid !== 'local') {
      const role = localStorage.getItem('userRole') || 'admin'
      if (role === 'teacher') {
        fetch('/api/teacher-auth/profile').then(r => r.ok ? r.json() : null).then(j => {
          if (j && j.profilePicture) {
            localStorage.setItem(`userAvatar:${sid}`, j.profilePicture)
            window.dispatchEvent(new CustomEvent('adminProfile:change'))
          }
        }).catch(() => {})
      } else if (role !== 'superadmin') {
        fetch('/api/school-auth/profile').then(r => r.ok ? r.json() : null).then(j => {
          if (j && j.profilePicture) {
            localStorage.setItem(`userAvatar:${sid}`, j.profilePicture)
            window.dispatchEvent(new CustomEvent('adminProfile:change'))
          }
        }).catch(() => {})
      }
    }
  }, [])

  const handleInputChange = (field, value) => {
    setSchoolInfo(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handlePrefsChange = (cat, field, val) => {
    setAppPreferences(prev => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: val }
    }))
    setHasChanges(true)
  }

  const compressImage = (base64Str, maxWidth, maxHeight, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  }

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (inform user if too large, e.g. > 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please choose an image smaller than 10MB.');
        return;
      }

      const reader = new FileReader()
      reader.onloadend = async () => {
        const maxWidth = type === 'banner' ? 1200 : 800;
        const maxHeight = type === 'banner' ? 600 : 800;
        const compressed = await compressImage(reader.result, maxWidth, maxHeight);
        handleInputChange(type, compressed)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    const sid = localStorage.getItem('schoolId') || 'local'
    
    try {
      // Persist all data
      localStorage.setItem(`schoolInfo:${sid}`, JSON.stringify(schoolInfo))
      localStorage.setItem(`appPrefs:${sid}`, JSON.stringify(appPrefs))
      
      // Also update separate logo storage if crest changed to keep UI in sync
      if (schoolInfo.crest) {
        localStorage.setItem(`schoolLogo:${sid}`, schoolInfo.crest)
        window.dispatchEvent(new CustomEvent('adminProfile:change'))
      }

      setTimeout(() => {
        setIsSaving(false)
        setHasChanges(false)
        alert('Settings saved successfully!')
      }, 800)
    } catch (error) {
      console.error('Save failed:', error);
      setIsSaving(false);
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        alert('Storage limit exceeded. Please try using smaller or fewer images.');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    }
  }

  const handleSaveRole = () => {
    const sid = localStorage.getItem('schoolId') || 'local'
    let newRoles
    if (editingRole.id === 'new') {
      const newRole = { ...editingRole, id: String(Date.now()) }
      newRoles = [...roles, newRole]
    } else {
      newRoles = roles.map(r => r.id === editingRole.id ? editingRole : r)
    }
    setRoles(newRoles)
    localStorage.setItem(`schoolRoles:${sid}`, JSON.stringify(newRoles))
    setEditingRole(null)
    
    // Notify application that permissions might have changed
    window.dispatchEvent(new CustomEvent('admin:permissions:update'))
  }

  const togglePermission = (permId) => {
    const current = editingRole.permissions || []
    if (current.includes(permId)) {
      setEditingRole({ ...editingRole, permissions: current.filter(id => id !== permId) })
    } else {
      setEditingRole({ ...editingRole, permissions: [...current, permId] })
    }
  }

  const toggleStaffAssignment = (staffId) => {
    const current = editingRole.staffIds || []
    if (current.includes(staffId)) {
      setEditingRole({ ...editingRole, staffIds: current.filter(id => id !== staffId) })
    } else {
      setEditingRole({ ...editingRole, staffIds: [...current, staffId] })
    }
  }

  const tabs = [
    { 
      id: 'school', 
      title: 'School Details', 
      desc: 'View/edit school name, address, etc.',
      icon: Building,
      perm: 'super_admin'
    },
    { 
      id: 'roles', 
      title: 'Roles & Permissions', 
      desc: 'Add/edit roles and related permissions',
      icon: Lock,
      perm: 'super_admin'
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      desc: 'System themes and user settings',
      icon: Settings,
      perm: '*'
    },
    { 
      id: 'tasks', 
      title: 'Administrative Tasks', 
      desc: 'Manage other admin tasks',
      icon: Shield,
      perm: 'super_admin'
    }
  ].filter(t => t.perm === '*' || hasPermission(t.perm))

  const updatePermissions = () => {
    window.dispatchEvent(new CustomEvent('admin:permissions:update'))
    alert('Permissions updated')
  }
  const quickRefresh = () => {
    window.dispatchEvent(new CustomEvent('students:refresh'))
    window.dispatchEvent(new CustomEvent('dashboard:refresh'))
    alert('Quick refresh triggered')
  }
  const deepRefresh = () => {
    const keep = ['isLoggedIn', 'userPhone', 'userRole', 'adminName', 'adminPhone', 'academicBaseYear', 'academicYearLabel', 'academicTermLabel']
    Object.keys(localStorage).forEach(k => { if (!keep.includes(k)) localStorage.removeItem(k) })
    window.dispatchEvent(new CustomEvent('students:refresh'))
    alert('Deep refresh complete')
  }
  const resetApp = () => {
    localStorage.clear()
    alert('App reset, redirecting to login')
    window.location.href = '/login'
  }
  const syncAll = async () => {
    try {
      await fetch('/api/students?includeArchived=true&page=1&pageSize=1').catch(()=>{})
      alert('Sync requested')
    } catch {
      alert('Sync failed')
    }
  }
  const installApp = () => {
    alert('For installation, use your browser’s “Install App”/“Add to Home screen”.')
  }
  const releaseHistory = () => {
    alert('Release history is not set up yet.')
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-dark-text tracking-tight">
          {tabs.find(t => t.id === activeTab)?.title}
        </h1>
        <p className="text-sm text-muted-text font-medium opacity-60 uppercase tracking-wider">
          {tabs.find(t => t.id === activeTab)?.desc}
        </p>
      </div>

      {/* Tabs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left
              ${activeTab === tab.id 
                ? 'bg-white border-primary-teal shadow-lg shadow-primary-teal/10 scale-[1.02]' 
                : 'bg-white border-transparent hover:border-gray-200 opacity-60 hover:opacity-100'}
            `}
          >
            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${activeTab === tab.id ? 'text-dark-text' : 'text-muted-text'}`}>{tab.title}</h3>
              <p className="text-[11px] text-muted-text leading-tight">{tab.desc}</p>
            </div>
            <div className={`
              p-2.5 rounded-xl transition-colors
              ${activeTab === tab.id ? 'bg-primary-teal/5 text-primary-teal' : 'bg-gray-50 text-muted-text'}
            `}>
              <tab.icon size={18} strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>

      {/* Action Bar */}
      {(activeTab === 'school' || activeTab === 'preferences') && (
        <div className="flex justify-start">
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
              hasChanges 
                ? 'bg-primary-teal text-white border-primary-teal hover:bg-secondary-teal cursor-pointer' 
                : 'bg-gray-50 text-muted-text border-gray-100 opacity-50 cursor-not-allowed'
            }`}
          >
            <Save size={14} className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="flex justify-start">
          <button 
            onClick={() => setEditingRole({ id: 'new', name: '', permissions: [], staffIds: [] })}
            className="flex items-center gap-2 px-4 py-2 bg-white text-primary-teal border-2 border-primary-teal/20 rounded-xl text-xs font-bold hover:bg-primary-teal hover:text-white transition-all shadow-sm"
          >
            <Plus size={14} strokeWidth={3} />
            Create New Role
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <Card className="overflow-hidden border border-gray-100 shadow-soft-lg min-h-[500px]">
        {activeTab === 'school' && (
          <div className="space-y-8 pb-10">
            {/* Banner Section */}
            <div className="relative h-48 w-full bg-[#F0F7F7] rounded-xl overflow-hidden group/banner">
              {schoolInfo.banner ? (
                <img src={schoolInfo.banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-teal/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-teal/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                  </div>
                  <div className="absolute top-4 left-10 flex gap-4 opacity-20">
                    <div className="w-8 h-32 bg-primary-teal/20 rounded-full rotate-12"></div>
                    <div className="w-6 h-24 bg-secondary-teal/20 rounded-full -rotate-12 mt-8"></div>
                  </div>
                </>
              )}
              
              <input 
                type="file" 
                ref={bannerInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'banner')}
              />
              
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur shadow-lg rounded-xl text-primary-teal opacity-0 group-hover/banner:opacity-100 transition-opacity hover:scale-105 active:scale-95"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            {/* School Profile Header */}
            <div className="px-10 -mt-16 flex items-end justify-between relative z-10">
              <div className="flex items-end gap-6">
                <div className="relative group/crest">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
                    {schoolInfo.crest ? (
                      <img src={schoolInfo.crest} alt="Crest" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-24 h-24 bg-[#9B1D2C] rounded-2xl flex items-center justify-center p-2">
                        <div className="border-2 border-white/30 rounded-full w-full h-full flex items-center justify-center text-white font-bold text-xs text-center leading-none">
                          MIREKUA<br/>EST 1995
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    ref={crestInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'crest')}
                  />
                  
                  <button 
                    onClick={() => crestInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-dark-text text-white rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-90"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                
                <div className="mb-2 space-y-1">
                  <h2 className="text-2xl font-bold text-dark-text tracking-tight">{schoolInfo.name}</h2>
                  <p className="text-sm text-muted-text font-semibold italic">{schoolInfo.motto}</p>
                </div>
              </div>

              <div className="mb-4">
                <Button 
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={`flex items-center gap-2 h-10 px-6 rounded-xl transition-all text-xs font-bold ${
                    hasChanges 
                      ? 'bg-primary-teal text-white border-primary-teal shadow-lg shadow-primary-teal/20' 
                      : 'bg-gray-50 text-muted-text border-gray-100 hover:bg-white hover:text-primary-teal'
                  }`}
                >
                  <Save size={14} className={isSaving ? 'animate-spin' : ''} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-10 max-w-4xl space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">School Name</label>
                  <input 
                    type="text" 
                    value={schoolInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">School Short Name</label>
                  <input 
                    type="text" 
                    value={schoolInfo.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Contact Email Address</label>
                  <input 
                    type="email" 
                    value={schoolInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Primary Phone Number</label>
                  <input 
                    type="text" 
                    value={schoolInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Location</label>
                  <input 
                    type="text" 
                    value={schoolInfo.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-muted-text uppercase tracking-widest px-1">Motto</label>
                  <input 
                    type="text" 
                    value={schoolInfo.motto}
                    onChange={(e) => handleInputChange('motto', e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-dark-text text-sm font-bold focus:border-primary-teal focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map((role) => (
                <button 
                  key={role.id}
                  onClick={() => setEditingRole({ ...role })}
                  className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:shadow-lg hover:border-primary-teal/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">{role.staffIds?.length || 0} users</span>
                    <div className="flex -space-x-2 overflow-hidden">
                      {(role.staffIds || []).slice(0, 3).map(id => {
                        const s = staffList.find(st => st.id === id)
                        return <Avatar key={id} name={s?.name || 'User'} src={s?.avatar} />
                      })}
                      {role.staffIds?.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-light-bg border border-white flex items-center justify-center text-[8px] font-bold text-muted-text">
                          +{role.staffIds.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-dark-text group-hover:text-primary-teal transition-colors">{role.name}</h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="p-10 space-y-10">
            <div className="grid gap-8">
              <section className="space-y-4">
                <h3 className="text-sm font-black text-dark-text uppercase tracking-widest flex items-center gap-2">
                  <Bell size={16} className="text-primary-teal" /> Notifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-dark-text">Email Alerts</p>
                      <p className="text-xs text-muted-text">Receive system updates via email</p>
                    </div>
                    <Toggle checked={appPrefs.notifications.email} onChange={(e) => handlePrefsChange('notifications', 'email', e.target.checked)} />
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-dark-text">Push Notifications</p>
                      <p className="text-xs text-muted-text">Desktop and mobile push alerts</p>
                    </div>
                    <Toggle checked={appPrefs.notifications.push} onChange={(e) => handlePrefsChange('notifications', 'push', e.target.checked)} />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-dark-text uppercase tracking-widest flex items-center gap-2">
                  <Layout size={16} className="text-primary-teal" /> Appearance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-primary-teal shadow-sm"><Sun size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-dark-text">System Theme</p>
                        <p className="text-xs text-muted-text">Choose your visual style</p>
                      </div>
                    </div>
                    <select 
                      value={appPrefs.appearance.theme} 
                      onChange={(e) => handlePrefsChange('appearance', 'theme', e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 outline-none"
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-primary-teal shadow-sm"><Globe size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-dark-text">Language</p>
                        <p className="text-xs text-muted-text">System display language</p>
                      </div>
                    </div>
                    <select 
                      value={appPrefs.appearance.language} 
                      onChange={(e) => handlePrefsChange('appearance', 'language', e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 outline-none"
                    >
                      <option value="en">English (US)</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-dark-text uppercase tracking-widest flex items-center gap-2">
                  <Lock size={16} className="text-primary-teal" /> Security & Privacy
                </h3>
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-dark-text">Login Alerts</p>
                    <p className="text-xs text-muted-text">Notify me when my account is accessed from a new device</p>
                  </div>
                  <Toggle checked={appPrefs.security.loginAlerts} onChange={(e) => handlePrefsChange('security', 'loginAlerts', e.target.checked)} />
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-10 space-y-6">
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-primary-teal/5 text-primary-teal rounded-3xl flex items-center justify-center mx-auto">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-text">Administrative Tasks</h3>
                <p className="text-sm text-muted-text font-medium">Perform system maintenance and sync actions</p>
              </div>
            </div>

            <div className="divide-y divide-gray-50 border-t border-gray-50">
              <ActionRow icon={RefreshCw} title="Update my permissions" desc="Use this if your permissions have changed but are not reflecting" button="Update Permissions" onClick={updatePermissions} />
              <ActionRow icon={RotateCcw} title="Deep Refresh" desc="Pulls in data from a longer period and clears stale caches" button="Deep Refresh" onClick={deepRefresh} />
              <ActionRow icon={Database} title="Sync All Data" desc="Completely sync all data from the server" button="Sync All Data" onClick={syncAll} />
              <ActionRow icon={Database} title="Complete Reset" desc="Completely reset the application. Use only as a last resort" button="Reset App" onClick={resetApp} tone="danger" />
              <ActionRow icon={Download} title="Install SchoolDesk" desc="Install as a desktop app for quicker access" button="Install" onClick={installApp} />
              <ActionRow icon={History} title="Release History" desc="View release notes for recent versions" button="View" onClick={releaseHistory} />
            </div>
          </div>
        )}
      </Card>

      {/* Role Editor Drawer */}
      {editingRole && createPortal(
        <div className="fixed inset-0 z-[5000] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingRole(null)} />
          <div className="relative w-full max-w-2xl bg-white h-screen overflow-hidden flex flex-col shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <button onClick={() => setEditingRole(null)} className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:opacity-70">
                <X size={16} /> Close
              </button>
              <h3 className="text-lg font-bold text-dark-text">Edit Role</h3>
              <button onClick={handleSaveRole} className="flex items-center gap-2 px-6 py-2 bg-primary-teal text-white rounded-xl text-xs font-bold hover:bg-secondary-teal transition-all shadow-lg shadow-primary-teal/20">
                <Save size={16} /> Save
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-24">
              <div className="space-y-1">
                <p className="text-xs text-muted-text font-medium">Provided a name for the role, add the appropriate permissions and then assign staff to the role you have created.</p>
              </div>

              {/* Identity */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest px-1">Role Name</label>
                  <input 
                    value={editingRole.name}
                    onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                    placeholder="e.g. Academic Head"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 bg-white text-sm font-bold focus:border-primary-teal outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-muted-text uppercase tracking-widest px-1">Staff Assignment</label>
                    {editingRole.staffIds?.length > 0 && (
                      <button onClick={() => setEditingRole({ ...editingRole, staffIds: [] })} className="text-[10px] font-bold text-rose-500 flex items-center gap-1 hover:underline">
                        <X size={12} /> Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="min-h-[50px] p-2 rounded-xl border-2 border-gray-50 bg-gray-50/30 flex flex-wrap gap-2">
                    {editingRole.staffIds?.length === 0 ? (
                      <span className="text-xs text-muted-text italic p-2">No staff assigned yet…</span>
                    ) : (
                      editingRole.staffIds.map(id => {
                        const s = staffList.find(st => st.id === id)
                        return (
                          <div key={id} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <Avatar name={s?.name} src={s?.avatar} />
                            <span className="text-xs font-bold text-dark-text">{s?.name}</span>
                            <button onClick={() => toggleStaffAssignment(id)} className="text-muted-text hover:text-rose-500">
                              <X size={14} />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={14} />
                    <select 
                      className="w-full pl-9 pr-4 h-11 rounded-xl border-2 border-gray-50 bg-white text-xs font-bold focus:border-primary-teal outline-none appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          toggleStaffAssignment(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">Select staff to add…</option>
                      {staffList.filter(s => !editingRole.staffIds?.includes(s.id)).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Privileges */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-sm font-black text-dark-text uppercase tracking-widest">Privileges</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={14} />
                    <input 
                      value={permSearch}
                      onChange={e => setPermSearch(e.target.value)}
                      placeholder="Filter permissions…"
                      className="pl-9 pr-4 h-9 w-48 rounded-lg border border-gray-100 bg-gray-50 text-[11px] font-bold focus:bg-white focus:border-primary-teal outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {/* Category Side-nav */}
                  <div className="w-1/3 bg-gray-50 border-r border-gray-100 flex flex-col">
                    {PERMISSION_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setExpandedCategory(cat.id)}
                        className={`px-4 py-4 text-left text-[11px] font-bold transition-all border-l-4 flex items-center gap-3
                          ${expandedCategory === cat.id 
                            ? 'bg-white border-primary-teal text-primary-teal' 
                            : 'border-transparent text-muted-text hover:bg-gray-100'}
                        `}
                      >
                        <cat.icon size={16} />
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  {/* Permissions List */}
                  <div className="w-2/3 p-6 space-y-4">
                    {PERMISSION_CATEGORIES.find(c => c.id === expandedCategory)?.permissions
                      .filter(p => !permSearch || p.label.toLowerCase().includes(permSearch.toLowerCase()))
                      .map(perm => (
                        <label 
                          key={perm.id} 
                          className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer
                            ${editingRole.permissions?.includes(perm.id) 
                              ? 'border-primary-teal/30 bg-primary-teal/5' 
                              : 'border-transparent hover:bg-gray-50'}
                          `}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                            ${editingRole.permissions?.includes(perm.id)
                              ? 'bg-primary-teal border-primary-teal text-white'
                              : 'border-gray-200 bg-white'}
                          `}>
                            {editingRole.permissions?.includes(perm.id) && <Check size={12} strokeWidth={4} />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={editingRole.permissions?.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <span className={`text-xs font-bold ${editingRole.permissions?.includes(perm.id) ? 'text-dark-text' : 'text-muted-text'}`}>
                            {perm.label}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default AdminSettings

