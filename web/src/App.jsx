import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import SuperAdminLayout from './layouts/SuperAdminLayout'

// School Dashboard Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Assessments from './pages/Assessments'
import AILessonNotes from './pages/AILessonNotes'
import SmartID from './pages/SmartID'
import Diary from './pages/Diary'
import Finance from './pages/Finance'
import Attendance from './pages/Attendance'
import VirtualClass from './pages/VirtualClass'
import Safety from './pages/Safety'
import Security from './pages/Security'
import StudentsList from './pages/StudentsList'
import StudentGroups from './pages/StudentGroups'
import Admissions from './pages/Admissions'
import Guardians from './pages/Guardians'
import AdminSettings from './pages/AdminSettings'
import UserSettings from './pages/UserSettings'
import StaffList from './pages/StaffList'
import CourseAllocation from './pages/CourseAllocation'
import LessonPlanner from './pages/LessonPlanner'
import Timetables from './pages/Timetables'

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'
import SchoolsManager from './pages/superadmin/SchoolsManager'
import SubscriptionManager from './pages/superadmin/SubscriptionManager'
import PlatformAnalytics from './pages/superadmin/PlatformAnalytics'
import AuditLogs from './pages/superadmin/AuditLogs'
import PlatformSettings from './pages/superadmin/PlatformSettings'

const ComingSoon = () => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-bold">Coming Soon</h2>
    <p className="text-muted-text mt-2 italic font-medium">This module is part of our upcoming release.</p>
  </div>
)

// Protected school route
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

// Protected superadmin route
const SuperAdminRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const role = localStorage.getItem('userRole')
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role !== 'superadmin') return <Navigate to="/dashboard" replace />
  return children
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* School Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="ai-lesson-notes" element={<AILessonNotes />} />
          <Route path="smart-id" element={<SmartID />} />
          <Route path="diary" element={<Diary />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/course-allocation" element={<CourseAllocation />} />
          <Route path="staff/lesson-planner" element={<LessonPlanner />} />
          <Route path="staff/timetables" element={<Timetables />} />
          <Route path="student-groups" element={<StudentGroups />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="guardians" element={<Guardians />} />
          <Route path="virtual-class" element={<VirtualClass />} />
          <Route path="safety" element={<Safety />} />
          <Route path="security" element={<Security />} />
          <Route path="finance" element={<Finance />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>

        {/* SuperAdmin Control Room */}
        <Route path="/superadmin" element={
          <SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="schools" element={<SchoolsManager />} />
          <Route path="subscriptions" element={<SubscriptionManager />} />
          <Route path="users" element={<ComingSoon />} />
          <Route path="analytics" element={<PlatformAnalytics />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<PlatformSettings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
