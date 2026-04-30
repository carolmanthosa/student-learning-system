import { useEffect, useState } from 'react'
import api from '../api/api'

interface Assignment {
  id: number
  title: string
  dueDate: string
  student?: { id: number; name: string }
  course?: { id: number; title: string }
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const fetchAssignments = async () => {
    const res = await api.get('/assignments')
    setAssignments(res.data)
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleSubmit = async () => {
    if (!title || !dueDate || !studentId || !courseId)
      return setMessage('All fields are required')
    try {
      if (editId) {
        await api.put(`/assignments/${editId}`, { title, dueDate })
        setMessage('Assignment updated successfully')
      } else {
        await api.post('/assignments', {
          title,
          dueDate,
          studentId: +studentId,
          courseId: +courseId,
        })
        setMessage('Assignment created successfully')
      }
      setTitle(''); setDueDate(''); setStudentId(''); setCourseId(''); setEditId(null)
      fetchAssignments()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleEdit = (a: Assignment) => {
    setEditId(a.id)
    setTitle(a.title)
    setDueDate(a.dueDate.split('T')[0])
    setStudentId(String(a.student?.id || ''))
    setCourseId(String(a.course?.id || ''))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    await api.delete(`/assignments/${id}`)
    setMessage('Assignment deleted')
    fetchAssignments()
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Assignments</h2>

      {message && (
        <div style={{ padding: 10, background: '#e0f2fe', borderRadius: 6, marginBottom: 12 }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12 }}>{editId ? 'Edit Assignment' : 'Add Assignment'}</h3>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        {!editId && (
          <>
            <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
            <input placeholder="Course ID" value={courseId} onChange={e => setCourseId(e.target.value)} />
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6 }}>
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setTitle(''); setDueDate(''); setStudentId(''); setCourseId('') }}
              style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 6 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Due Date</th>
              <th>Student</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.title}</td>
                <td>{a.dueDate.split('T')[0]}</td>
                <td>{a.student?.name || '—'}</td>
                <td>{a.course?.title || '—'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(a)}
                    style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 4 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)}
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