import { useEffect, useState } from 'react'
import api from '../api/api'

interface Assignment {
  id: number
  title: string
  dueDate: string
}

interface Course {
  id: number
  title: string
  code: string
  students?: { id: number; name: string }[]
  assignments?: Assignment[]
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const fetchCourses = async () => {
    const res = await api.get('/courses')
    setCourses(res.data)
  }

  useEffect(() => { fetchCourses() }, [])

  const handleSubmit = async () => {
    if (!title || !code) return setMessage('Title and code are required')
    try {
      if (editId) {
        await api.put(`/courses/${editId}`, { title, code })
        setMessage('Course updated successfully')
      } else {
        await api.post('/courses', { title, code })
        setMessage('Course created successfully')
      }
      setTitle(''); setCode(''); setEditId(null)
      fetchCourses()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleEdit = (c: Course) => {
    setEditId(c.id); setTitle(c.title); setCode(c.code)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    await api.delete(`/courses/${id}`)
    setMessage('Course deleted')
    fetchCourses()
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Courses</h2>

      {message && (
        <div style={{ padding: 10, background: '#e0f2fe', borderRadius: 6, marginBottom: 12 }}>
          {message}
        </div>
      )}

      {/* Form */}
      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12 }}>{editId ? 'Edit Course' : 'Add Course'}</h3>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Code (e.g. CS101)" value={code} onChange={e => setCode(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6 }}>
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setTitle(''); setCode('') }}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 6 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Code</th>
              <th>Students</th>
              <th>Assignments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td>{c.code}</td>
                <td>{c.students?.map(s => s.name).join(', ') || '—'}</td>
                <td>{c.assignments?.map(a => a.title).join(', ') || '—'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(c)}
                    style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 4 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)}
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