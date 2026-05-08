import { useEffect, useState } from 'react'
import api from '../api/api'
import authService from '../app/auth/services/authService'

interface Assignment {
  id: string
  title: string
  dueDate: string
  course?: { id: string; title: string }
}

interface Course {
  id: string
  title: string
  code: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const isAdmin = authService.isAdmin()

  const fetchAll = async () => {
    const [a, c] = await Promise.all([api.get('/assignments'), api.get('/courses')])
    setAssignments(a.data)
    setCourses(c.data)
  }

  useEffect(() => { fetchAll() }, [])

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg); setMsgType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSelect = (a: Assignment) => {
    setSelected(a); setTitle(a.title)
    setDueDate(a.dueDate.split('T')[0])
    setCourseId(a.course?.id || '')
    setEditMode(false); setShowAdd(false)
  }

  const handleCreate = async () => {
    if (!title || !dueDate || !courseId) return flash('All fields are required', 'error')
    try {
      await api.post('/assignments', { title, dueDate, courseId })
      flash('Assignment created!')
      setTitle(''); setDueDate(''); setCourseId('')
      setShowAdd(false); fetchAll()
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    try {
      await api.put(`/assignments/${selected.id}`, { title, dueDate, courseId })
      flash('Assignment updated!')
      setEditMode(false); fetchAll()
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      await api.delete(`/assignments/${id}`)
      setSelected(null); flash('Assignment deleted'); fetchAll()
    } catch (e: any) {
      flash('Error deleting assignment', 'error')
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', fontSize: 14, marginBottom: 8,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>

      {/* LEFT */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Assignments</span>
          {/* ADMIN ONLY */}
          {isAdmin && (
            <button
              onClick={() => { setShowAdd(true); setSelected(null); setTitle(''); setDueDate(''); setCourseId('') }}
              style={{ padding: '4px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              + Add
            </button>
          )}
        </div>

        {assignments.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20 }}>No assignments yet.</div>
        )}

        {assignments.map(a => (
          <div key={a.id} onClick={() => handleSelect(a)}
            style={{
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: selected?.id === a.id ? '#ede9fe' : 'white',
              border: selected?.id === a.id ? '1px solid #a5b4fc' : '0.5px solid #e5e7eb',
            }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Due: {a.dueDate.split('T')[0]}</div>
            {a.course && (
              <span style={{ fontSize: 11, padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 20 }}>
                {a.course.title}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div>
        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13,
            background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
            color: msgType === 'success' ? '#065f46' : '#b91c1c',
            border: `1px solid ${msgType === 'success' ? '#6ee7b7' : '#fca5a5'}`
          }}>{message}</div>
        )}

        {/* Add Form — ADMIN ONLY */}
        {showAdd && isAdmin && (
          <div style={{ background: 'white', padding: 24, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: 4, fontSize: 16 }}>New Assignment</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Assignments belong to a course — One-to-Many.</p>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Title *</label>
            <input placeholder="e.g. Homework 1" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Due Date *</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Course *</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} style={inputStyle}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleCreate}
                style={{ padding: '8px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                Create Assignment
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Detail View */}
        {selected && !showAdd && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{selected.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Due: {selected.dueDate.split('T')[0]}</div>
              </div>
              {/* ADMIN ONLY */}
              {isAdmin && (
                <>
                  <button onClick={() => setEditMode(!editMode)}
                    style={{ padding: '6px 14px', background: editMode ? '#e5e7eb' : '#4f46e5', color: editMode ? '#374151' : 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                    {editMode ? 'Cancel' : '✏️ Edit'}
                  </button>
                  <button onClick={() => handleDelete(selected.id)}
                    style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </>
              )}
            </div>

            {/* Edit Form — ADMIN ONLY */}
            {editMode && isAdmin && (
              <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Course</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} style={inputStyle}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                </select>
                <button onClick={handleUpdate}
                  style={{ padding: '8px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  Save Changes
                </button>
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Course
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>One-to-Many</span>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <span style={{ padding: '3px 12px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 13 }}>
                  {selected.course?.title || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {!selected && !showAdd && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14, background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb', gap: 8 }}>
            <div style={{ fontSize: 32 }}>📝</div>
            <div>Select an assignment to view details</div>
            {isAdmin && <div style={{ fontSize: 12 }}>or click + Add to create a new one</div>}
          </div>
        )}
      </div>
    </div>
  )
}