import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="ai-lesson-notes" element={<AILessonNotes />} />
          <Route path="smart-id" element={<SmartID />} />
          <Route path="diary" element={<Diary />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="virtual-class" element={<VirtualClass />} />
          <Route path="safety" element={<Safety />} />
          <Route path="security" element={<Security />} />
          <Route path="finance" element={<Finance />} />
          <Route path="*" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">Coming Soon</h2><p className="text-muted-text mt-2 italic font-medium">This module is part of our upcoming release.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App
