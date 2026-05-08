import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import authService from './app/auth/services/authService'
import PrivateRoute from './app/auth/guards/PrivateRoute'
import LoginPage from './app/auth/login/LoginPage'
import RegisterPage from './app/auth/login/RegisterPage'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import ProfilesPage from './pages/ProfilesPage'
import EnrollmentsPage from './pages/EnrollmentsPage'
import './App.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser()
  const isAdmin = authService.isAdmin()

  const tabs = [
    { name: 'Courses', path: '/courses', icon: '📚', show: true },
    { name: 'Assignments', path: '/assignments', icon: '📝', show: true },
    { name: 'Enrollments', path: '/enrollments', icon: '🔗', show: true },
    { name: 'Students', path: '/students', icon: '🎓', show: isAdmin },
    { name: 'Profile', path: '/profile', icon: '👤', show: !isAdmin },
  ]

  function handleLogout() {
    authService.clearSession()
    navigate('/login')
  }

  return (
    <div style={{
      width: 220,
      background: '#1e293b',
      color: 'white',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <h2 style={{ marginBottom: 6, fontSize: '1rem' }}>
          Student Learning System
        </h2>
        <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 30 }}>
          {isAdmin ? 'Admin Portal' : 'Student Portal'}
        </p>

        {tabs.filter(t => t.show).map(tab => (
          <div
            key={tab.name}
            onClick={() => navigate(tab.path)}
            style={{
              padding: '12px 14px',
              marginBottom: 6,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              background: location.pathname === tab.path ? '#4f46e5' : 'transparent',
              transition: '0.2s'
            }}
            onMouseEnter={e => {
              if (location.pathname !== tab.path)
                e.currentTarget.style.background = '#334155'
            }}
            onMouseLeave={e => {
              if (location.pathname !== tab.path)
                e.currentTarget.style.background = 'transparent'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </div>
        ))}
      </div>

      {/* User info + logout */}
      <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#334155'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#94a3b8'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 30, background: '#f8fafc', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected — all roles */}
      <Route path="/courses" element={
        <PrivateRoute>
          <Layout><CoursesPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="/assignments" element={
        <PrivateRoute>
          <Layout><AssignmentsPage /></Layout>

        </PrivateRoute>
      } />
      <Route path="/enrollments" element={
        <PrivateRoute>
          <Layout><EnrollmentsPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout><ProfilesPage /></Layout>
        </PrivateRoute>
      } />

      {/* Protected — admin only */}
      <Route path="/students" element={
        <PrivateRoute adminOnly>
          <Layout><StudentsPage /></Layout>
        </PrivateRoute>
      } />

      {/* Default */}
      <Route path="/" element={
        <PrivateRoute>
          <Layout><CoursesPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><CoursesPage /></Layout>
        </PrivateRoute>
      } />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  )
}

export default App