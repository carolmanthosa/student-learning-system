import { useEffect, useState } from 'react'
import api from '../api/api'

interface Assignment {
  id: string
  title: string
  dueDate: string
}

interface Enrollment {
  id: string
  enrolledAt: string
  student: { id: string; name: string; email: string }
}

interface Course {
  id: string
  title: string
  code: string
  enrollments?: Enrollment[]
  assignments?: Assignment[]
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selected, setSelected] = useState<Course | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDueDate, setAssignmentDueDate] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const fetchCourses = () => api.get('/courses').then(r => setCourses(r.data))

  const fetchCourse = async (id: string) => {
    const res = await api.get(`/courses/${id}`)
    setSelected(res.data)
    setTitle(res.data.title)
    setCode(res.data.code)
    setEditMode(false)
    setShowAdd(false)
    setShowAddAssignment(false)
  }

  useEffect(() => { fetchCourses() }, [])

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg)
    setMsgType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleCreate = async () => {
    if (!title || !code) return flash('Title and code are required', 'error')
    try {
      const res = await api.post('/courses', { title, code })
      flash('Course created! Now add assignments below.')
      setTitle(''); setCode('')
      setShowAdd(false)
      await fetchCourses()
      await fetchCourse(res.data.id)
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    try {
      await api.put(`/courses/${selected.id}`, { title, code })
      flash('Course updated!')
      fetchCourses()
      fetchCourse(selected.id)
      setEditMode(false)
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This will also delete all its assignments.')) return
    try {
      await api.delete(`/courses/${id}`)
      setSelected(null)
      flash('Course deleted')
      fetchCourses()
    } catch (e: any) {
      flash('Error deleting course', 'error')
    }
  }

  const handleAddAssignment = async () => {
    if (!assignmentTitle || !assignmentDueDate || !selected)
      return flash('Title and due date are required', 'error')
    try {
      await api.post('/assignments', {
        title: assignmentTitle,
        dueDate: assignmentDueDate,
        courseId: selected.id,
      })
      flash('Assignment added!')
      setAssignmentTitle(''); setAssignmentDueDate('')
      setShowAddAssignment(false)
      fetchCourse(selected.id)
      fetchCourses()
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      await api.delete(`/assignments/${assignmentId}`)
      flash('Assignment deleted')
      if (selected) {
        fetchCourse(selected.id)
        fetchCourses()
      }
    } catch (e: any) {
      flash('Error deleting assignment', 'error')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginBottom: 8,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>

      {/* LEFT — Course List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Courses</span>
          <button
            onClick={() => { setShowAdd(true); setSelected(null); setTitle(''); setCode('') }}
            style={{ padding: '4px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
            + Add
          </button>
        </div>

        {courses.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20 }}>
            No courses yet. Click + Add to create one.
          </div>
        )}

        {courses.map(c => (
          <div key={c.id} onClick={() => fetchCourse(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: selected?.id === c.id ? '#ede9fe' : 'white',
              border: selected?.id === c.id ? '1px solid #a5b4fc' : '0.5px solid #e5e7eb',
            }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8,
              background: '#4f46e5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 600, fontSize: 10,
              color: 'white', flexShrink: 0
            }}>
              {c.code}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {c.enrollments?.length || 0} students · {c.assignments?.length || 0} assignments
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT — Detail Panel */}
      <div>
        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13,
            background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
            color: msgType === 'success' ? '#065f46' : '#b91c1c',
            border: `1px solid ${msgType === 'success' ? '#6ee7b7' : '#fca5a5'}`
          }}>
            {message}
          </div>
        )}

        {/* Add Course Form */}
        {showAdd && (
          <div style={{ background: 'white', padding: 24, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: 4, fontSize: 16 }}>New Course</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              After creating, you can immediately add assignments to this course.
            </p>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Course Title *</label>
            <input placeholder="e.g. Database Systems" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Course Code *</label>
            <input placeholder="e.g. CS101" value={code} onChange={e => setCode(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate}
                style={{ padding: '8px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                Create Course
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Course Detail */}
        {selected && !showAdd && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: '#4f46e5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 600, fontSize: 12, color: 'white'
              }}>
                {selected.code}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{selected.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Code: {selected.code}</div>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  padding: '6px 14px',
                  background: editMode ? '#e5e7eb' : '#4f46e5',
                  color: editMode ? '#374151' : 'white',
                  border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500
                }}>
                {editMode ? 'Cancel' : '✏️ Edit'}
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                🗑 Delete
              </button>
            </div>

            {/* Edit Form */}
            {editMode && (
              <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
                <input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} style={inputStyle} />
                <button onClick={handleUpdate}
                  style={{ padding: '8px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  Save Changes
                </button>
              </div>
            )}

            {/* Enrolled Students — Many-to-Many */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Enrolled Students
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>Many-to-Many</span>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                {selected.enrollments?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.enrollments.map(e => (
                      <span key={e.id} style={{ padding: '3px 12px', background: '#ede9fe', color: '#4f46e5', borderRadius: 20, fontSize: 13 }}>
                        {e.student.name}
                      </span>
                    ))}
                  </div>
                ) : <span style={{ fontSize: 13, color: '#6b7280' }}>No students enrolled yet</span>}
              </div>
            </div>

            {/* Assignments — One-to-Many */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Assignments
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>One-to-Many</span>
                <button
                  onClick={() => setShowAddAssignment(!showAddAssignment)}
                  style={{ marginLeft: 'auto', padding: '2px 10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  + Add
                </button>
              </div>

              {showAddAssignment && (
                <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, marginBottom: 10, border: '1px solid #6ee7b7' }}>
                  <input placeholder="Assignment title" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} style={inputStyle} />
                  <input type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} style={inputStyle} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleAddAssignment}
                      style={{ padding: '6px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                      Add Assignment
                    </button>
                    <button onClick={() => setShowAddAssignment(false)}
                      style={{ padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                {selected.assignments?.length ? selected.assignments.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #e5e7eb', fontSize: 14 }}>
                    <span style={{ flex: 1, fontWeight: 500 }}>{a.title}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Due: {a.dueDate.split('T')[0]}</span>
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      style={{ padding: '2px 8px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
                      🗑
                    </button>
                  </div>
                )) : (
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    No assignments yet — click + Add to create one
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {!selected && !showAdd && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14, background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb', gap: 8 }}>
            <div style={{ fontSize: 32 }}>📚</div>
            <div>Select a course to view details</div>
            <div style={{ fontSize: 12 }}>or click + Add to create a new course</div>
          </div>
        )}
      </div>
    </div>
  )
}