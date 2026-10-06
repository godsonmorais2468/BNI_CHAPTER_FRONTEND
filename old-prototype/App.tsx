import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import ToastProvider from './components/ToastProvider'
import Shell from './components/Shell'
import { useAuth } from './lib/auth'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Members from './pages/Members'
import Meeting from './pages/Meeting'
import Attendance from './pages/Attendance'
import Referrals from './pages/Referrals'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Shell />
              </RequireAuth>
            }
          >
            <Route index element={<Overview />} />
            <Route path="members" element={<Members />} />
            <Route path="meeting" element={<Meeting />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="referrals" element={<Referrals />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
