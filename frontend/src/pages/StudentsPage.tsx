import { useEffect, useState } from 'react'
import api from '../api/api'

interface Student {
  id: number
  name: string
  email: string
  profile?: { bio: string; avatarUrl: string }
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [message, setMessage] = useState('')

  const fetchStudents = async () => {
    const res = await api.get('/students')
    setStudents(res.data)
  }

  useEffect(() => { fetchStudents() }, [])

  const handleSubmit = async () => {
    if (!name || !email) return setMessage('Name and email are required')
    try {
      if (editId) {
        await api.put(`/students/${editId}`, { name, email })
        setMessage('Student updated successfully')
      } else {
        await api.post('/students', { name, email })
        setMessage('Student created successfully')
      }
      setName(''); setEmail(''); setEditId(null)
      fetchStudents()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleEdit = (s: Student) => {
    setEditId(s.id); setName(s.name); setEmail(s.email)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    await api.delete(`/students/${id}`)
    setMessage('Student deleted')
    fetchStudents()
  }

  const handleEnroll = async () => {
    if (!enrollStudentId || !enrollCourseId) return setMessage('Enter both student and course ID')
    try {
      await api.post(`/students/${enrollStudentId}/enroll/${enrollCourseId}`)
      setMessage(`Student ${enrollStudentId} enrolled in course ${enrollCourseId}`)
      setEnrollStudentId(''); setEnrollCourseId('')
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Enrollment failed')
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Students</h2>

      {message && (
        <div style={{ padding: 10, background: '#e0f2fe', borderRadius: 6, marginBottom: 12 }}>
          {message}
        </div>
      )}

      {/* Form */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12 }}>{editId ? 'Edit Student' : 'Add Student'}</h3>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6 }}>
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setName(''); setEmail('') }}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 6 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Enroll */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12 }}>Enroll Student in Course</h3>
        <input placeholder="Student ID" value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)} />
        <input placeholder="Course ID" value={enrollCourseId} onChange={e => setEnrollCourseId(e.target.value)} />
        <button onClick={handleEnroll} style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 6 }}>
          Enroll
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.profile?.bio || '—'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(s)}
                    style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 4 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    style={{ padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4 }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}