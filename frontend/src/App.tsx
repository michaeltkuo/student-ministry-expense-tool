import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import StudentSubmit from './pages/StudentSubmit'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import SubmissionList from './pages/admin/SubmissionList'
import SubmissionDetail from './pages/admin/SubmissionDetail'
import Ministries from './pages/admin/Ministries'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentSubmit />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/submissions" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="submissions" element={<SubmissionList />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="ministries" element={<Ministries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
