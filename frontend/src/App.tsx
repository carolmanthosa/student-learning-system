import { useState } from 'react'
import StudentsPage from './pages/StudentsPage'
import CoursesPage from './pages/CoursesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import ProfilesPage from './pages/ProfilesPage'
import './App.css'

const tabs = ['Students', 'Courses', 'Assignments', 'Profiles']

function App() {
  const [activeTab, setActiveTab] = useState('Students')

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Student Learning System</h1>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              background: activeTab === tab ? '#4f46e5' : '#e5e7eb',
              color: activeTab === tab ? 'white' : 'black',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pages */}
      {activeTab === 'Students' && <StudentsPage />}
      {activeTab === 'Courses' && <CoursesPage />}
      {activeTab === 'Assignments' && <AssignmentsPage />}
      {activeTab === 'Profiles' && <ProfilesPage />}
    </div>
  )
}

export default App