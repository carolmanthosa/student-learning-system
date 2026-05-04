import { useState } from 'react'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import ProfilesPage from './pages/ProfilesPage'
import './App.css'

const tabs = [
  { name: 'Students', icon: '🎓' },
  { name: 'Courses', icon: '📚' },
  { name: 'Assignments', icon: '📝' },
  { name: 'Profiles', icon: '👤' }
]

function App() {
  const [activeTab, setActiveTab] = useState('Students')

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: 220,
        background: '#1e293b',
        color: 'white',
        padding: 20,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: 30 }}>SLS</h2>

        {tabs.map(tab => (
          <div
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              padding: '12px 14px',
              marginBottom: 10,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: activeTab === tab.name ? '#4f46e5' : 'transparent',
              transition: '0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.name) {
                e.currentTarget.style.background = '#334155'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.name) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: 30,
        background: '#f8fafc',
        position: 'relative'
      }}>

       
        {/* Header */}
        <h1 style={{ marginBottom: 20 }}>{activeTab}</h1>

        {/* Page Content */}
        <div className="content-card">
          {activeTab === 'Students' && <StudentsPage />}
          {activeTab === 'Courses' && <CoursesPage />}
          {activeTab === 'Assignments' && <AssignmentsPage />}
          {activeTab === 'Profiles' && <ProfilesPage />}
        </div>

      </div>
    </div>
  )
}

export default App