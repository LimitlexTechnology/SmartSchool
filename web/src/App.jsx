import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { hasPermission } from './utils/permissionUtils'

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
import OnlineCampus from './pages/OnlineCampus'
import SubjectDetails from './pages/SubjectDetails'
import LessonPlanner from './pages/LessonPlanner'
import Timetables from './pages/Timetables'
import Classroom from './pages/Classroom'
import ClassDetails from './pages/ClassDetails'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import LogoAnimationDemo from './pages/LogoAnimationDemo'
import StudentPortal from './pages/StudentPortal'
import StudentOnlineCampus from './pages/StudentOnlineCampus'
import StudentSubjectDetails from './pages/StudentSubjectDetails'
import TakeTest from './pages/TakeTest'
import CreateAssignment from './pages/CreateAssignment'
import QuestionPaperDashboard from './pages/QuestionPaperDashboard'
import QuestionPaperEditor from './pages/QuestionPaperEditor'
import AIAssistant from './pages/AIAssistant'
import ExamReports from './pages/ExamReports'
import ExamMarks from './pages/ExamMarks'
import ExamAnalytics from './pages/ExamAnalytics'
import ExamConfiguration from './pages/ExamConfiguration'
import ExamSettings from './pages/ExamSettings'
import Calendar from './pages/Calendar'

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
const ProtectedRoute = ({ children, perm }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (perm && !hasPermission(perm)) {
    return <Navigate to="/dashboard" replace />
  }
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

// Protected teacher route
const TeacherRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const role = localStorage.getItem('userRole')
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role !== 'teacher') return <Navigate to="/dashboard" replace />
  return children
}

// Protected student portal route
const StudentRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const role = localStorage.getItem('userRole')
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role !== 'student') return <Navigate to="/login" replace />
  return children
}

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logo-demo" element={<LogoAnimationDemo />} />

        {/* School Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="ai-lesson-notes" element={<AILessonNotes />} />
          <Route path="smart-id" element={<SmartID />} />
          <Route path="diary" element={<Diary />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="messages" element={<ComingSoon />} />
          <Route path="front-desk" element={<ComingSoon />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="classroom" element={<Classroom />} />
          <Route path="classroom/:id" element={<ClassDetails />} />
          <Route path="online-campus" element={<OnlineCampus />} />
          <Route path="online-campus/:subjectId" element={<SubjectDetails />} />
          <Route path="online-campus/create-assignment" element={<CreateAssignment />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="inventory" element={
            <ProtectedRoute perm="inventory_tracking">
              <ComingSoon />
            </ProtectedRoute>
          } />
          <Route path="question-bank" element={<QuestionPaperDashboard />} />
          <Route path="question-bank/:paperId" element={<QuestionPaperEditor />} />
          <Route path="exams/reports" element={<ExamReports />} />
          <Route path="exams/marks" element={
            <ProtectedRoute perm="enter_marks">
              <ExamMarks />
            </ProtectedRoute>
          } />
          <Route path="exams/analytics" element={<ExamAnalytics />} />
          <Route path="exams/config" element={<ExamConfiguration />} />
          <Route path="exams/settings" element={<ExamSettings />} />
          <Route path="students" element={
            <ProtectedRoute perm="view_students">
              <StudentsList />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute perm="manage_staff">
              <StaffList />
            </ProtectedRoute>
          } />
          <Route path="staff/course-allocation" element={<CourseAllocation />} />
          <Route path="staff/lesson-planner" element={<LessonPlanner />} />
          <Route path="staff/timetables" element={<Timetables />} />
          <Route path="student-groups" element={<StudentGroups />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="guardians" element={<Guardians />} />
          <Route path="virtual-class" element={<VirtualClass />} />
          <Route path="safety" element={<Safety />} />
          <Route path="security" element={<Security />} />
          <Route path="finance" element={
            <ProtectedRoute perm="fee_management">
              <Finance />
            </ProtectedRoute>
          } />
          <Route path="admin-settings" element={
            <ProtectedRoute perm="super_admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<Navigate to="/dashboard/admin-settings?tab=preferences" replace />} />
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

        {/* Teacher Dashboard */}
        <Route path="/teacher" element={
          <TeacherRoute><DashboardLayout /></TeacherRoute>
        }>
          <Route index element={<TeacherDashboard />} />
        </Route>

        {/* Student Portal */}
        <Route path="/portal" element={<StudentRoute><StudentPortal /></StudentRoute>}>
          <Route path="online-campus" element={<StudentOnlineCampus />} />
          <Route path="subject/:subjectId" element={<StudentSubjectDetails />} />
          <Route path="subject/:subjectId/take-test" element={<TakeTest />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
