import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ToastProvider from './components/ToastProvider'
import Shell from './components/Shell'
import { HOME } from './data/nav'
import { useAuth } from './lib/auth'
import type { Role } from './lib/types'
import Login from './pages/Login'
import Home from './pages/member/Home'

const Register = lazy(() => import('./pages/Register'))
const Plans = lazy(() => import('./pages/admin/Plans'))
const Regions = lazy(() => import('./pages/admin/Regions'))
const Chapters = lazy(() => import('./pages/region/Chapters'))
const Meetings = lazy(() => import('./pages/region/Meetings'))
const RsvpAdmin = lazy(() => import('./pages/region/Rsvp'))
const Attendance = lazy(() => import('./pages/member/Attendance'))
const Directory = lazy(() => import('./pages/member/Directory'))
const Dues = lazy(() => import('./pages/member/Dues'))
const MemberView = lazy(() => import('./pages/member/MemberView'))
const MyProfile = lazy(() => import('./pages/member/MyProfile'))
const OfficeBearers = lazy(() => import('./pages/member/OfficeBearers'))
const RsvpMember = lazy(() => import('./pages/member/Rsvp'))
const Wishes = lazy(() => import('./pages/member/Wishes'))

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
      <Suspense fallback={null}>
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
      </Suspense>
    </ToastProvider>
  )
}
