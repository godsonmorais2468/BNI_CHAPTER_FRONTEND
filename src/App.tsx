import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ToastProvider from './components/ToastProvider'
import Shell from './components/Shell'
import { HOME } from './data/nav'
import { useAuth } from './lib/auth'
import type { Role } from './lib/types'
import Login from './pages/Login'
import Register from './pages/Register'
import Plans from './pages/admin/Plans'
import Regions from './pages/admin/Regions'
import Chapters from './pages/region/Chapters'
import Meetings from './pages/region/Meetings'
import RsvpAdmin from './pages/region/Rsvp'
import Attendance from './pages/member/Attendance'
import Directory from './pages/member/Directory'
import Dues from './pages/member/Dues'
import Home from './pages/member/Home'
import MemberView from './pages/member/MemberView'
import MyProfile from './pages/member/MyProfile'
import OfficeBearers from './pages/member/OfficeBearers'
import RsvpMember from './pages/member/Rsvp'
import Wishes from './pages/member/Wishes'

function RequireAuth({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const location = useLocation()
  if (!role) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

/** Sends people to their own area when they open a page meant for another role. */
function Only({ role, children }: { role: Role; children: ReactNode }) {
  const auth = useAuth()
  if (auth.role !== role) return <Navigate to={auth.role ? HOME[auth.role] : '/login'} replace />
  return children
}

function RoleHome() {
  const { role } = useAuth()
  if (role && role !== 'member') return <Navigate to={HOME[role]} replace />
  return <Home />
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route index element={<RoleHome />} />

          <Route path="directory" element={<Only role="member"><Directory /></Only>} />
          <Route path="directory/:id" element={<Only role="member"><MemberView /></Only>} />
          <Route path="attendance" element={<Only role="member"><Attendance /></Only>} />
          <Route path="office-bearers" element={<Only role="member"><OfficeBearers /></Only>} />
          <Route path="rsvp" element={<Only role="member"><RsvpMember /></Only>} />
          <Route path="dues" element={<Only role="member"><Dues /></Only>} />
          <Route path="wishes" element={<Only role="member"><Wishes /></Only>} />
          <Route path="profile" element={<Only role="member"><MyProfile /></Only>} />

          <Route path="admin/regions" element={<Only role="super_admin"><Regions /></Only>} />
          <Route path="admin/plans" element={<Only role="super_admin"><Plans /></Only>} />

          <Route path="region/chapters" element={<Only role="region_admin"><Chapters /></Only>} />
          <Route path="region/meetings" element={<Only role="region_admin"><Meetings /></Only>} />
          <Route path="region/rsvp" element={<Only role="region_admin"><RsvpAdmin /></Only>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
