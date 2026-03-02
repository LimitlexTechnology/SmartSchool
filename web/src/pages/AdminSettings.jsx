import React from 'react'
import { RefreshCw, RotateCcw, Database, ShieldCheck, Download, History } from 'lucide-react'

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

const AdminSettings = () => {
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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="text-lg font-extrabold text-dark-text">Settings & Quick Actions</div>
        </div>
        <div className="p-6">
          <div className="text-xs font-extrabold text-muted-text mb-2 flex items-center gap-2"><ShieldCheck size={14}/> Troubleshooting</div>
          <div className="divide-y divide-gray-50">
            <ActionRow icon={RefreshCw} title="Update my permissions" desc="Use this if your permissions have changed but are not reflecting" button="Update Permissions" onClick={updatePermissions} />
            <ActionRow icon={RefreshCw} title="Quick Refresh" desc="Manually pull in recently changed data" button="Quick Refresh" onClick={quickRefresh} />
            <ActionRow icon={RotateCcw} title="Deep Refresh" desc="Pulls in data from a longer period and clears stale caches" button="Deep Refresh" onClick={deepRefresh} />
            <ActionRow icon={Database} title="Complete Reset" desc="Completely reset the application. Use only as a last resort" button="Reset App" onClick={resetApp} tone="danger" />
            <ActionRow icon={Database} title="Sync All Data" desc="Completely sync all data from the server" button="Sync All Data" onClick={syncAll} />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="text-xs font-extrabold text-muted-text">Installation and Updates</div>
        </div>
        <div className="p-6">
          <div className="divide-y divide-gray-50">
            <ActionRow icon={Download} title="Install SchoolDesk on your computer" desc="Install as a desktop app for quicker access" button="Install" onClick={installApp} />
            <ActionRow icon={History} title="Release History" desc="View release notes for recent versions" button="View Release History" onClick={releaseHistory} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings

