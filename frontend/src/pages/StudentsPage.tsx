import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

interface Student {
  id: string
  name: string
  email: string
  role: string
  profile?: { id?: string; bio: string; avatarUrl: string }
  courses?: { id: string; title: string; code: string; assignments?: { id: string; title: string; dueDate: string }[] }[]
}

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: '1px solid #d1d5db', fontSize: 14, marginBottom: 8,
  boxSizing: 'border-box' as const,
}

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
    <div style={{
      width: 32, height: 32, border: '3px solid #e5e7eb',
      borderTop: '3px solid #4f46e5', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Student | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg); setMsgType(type)
    setTimeout(() => setMessage(''), 3500)
  }

  const fetchStudents = async () => {
    try {
      const r = await api.get('/students')
      setStudents(r.data)
    } catch {
      flash('Failed to load students', 'error')
    } finally {
      setListLoading(false)
    }
  }

  const fetchStudent = async (id: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/students/${id}`)
      const student = res.data

      // ✅ Fetch enrolled courses from enrollments API
      const enrollmentsRes = await api.get(`/enrollments/student/${id}`)
      const courses = enrollmentsRes.data.map((e: any) => e.course).filter(Boolean)

      const full = { ...student, courses }
      setSelected(full)
      setName(full.name)
      setEmail(full.email)
      setRole(full.role || 'student')
      setBio(full.profile?.bio || '')
      setAvatarUrl(full.profile?.avatarUrl || '')
      setEditMode(false)
      return full
    } catch {
      flash('Failed to load student details', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [])

  const handleCreate = async () => {
    if (!name || !email || !password) return flash('Name, email and password are required', 'error')
    setSaving(true)
    try {
      const res = await api.post('/students', { name, email, password, role })
      if (bio) await api.post('/profiles', { bio, avatarUrl, studentId: res.data.id })
      flash('Student created successfully!')
      setName(''); setEmail(''); setPassword(''); setBio(''); setAvatarUrl(''); setRole('STUDENT')
      setShowAdd(false)
      fetchStudents()
    } catch (e: any) {
      flash(e.response?.data?.message?.join?.(', ') || e.response?.data?.message || 'Error creating student', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await api.put(`/students/${selected.id}`, { name, email, role })
      if (selected.profile?.id) {
        await api.put(`/profiles/${selected.profile.id}`, { bio, avatarUrl })
      } else if (bio) {
        await api.post('/profiles', { bio, avatarUrl, studentId: selected.id })
      }
      flash('Student updated successfully!')
      fetchStudents()
      fetchStudent(selected.id)
      setEditMode(false)
    } catch (e: any) {
      flash(e.response?.data?.message?.join?.(', ') || 'Error updating student', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student? This cannot be undone.')) return
    try {
      await api.delete(`/students/${id}`)
      setSelected(null)
      flash('Student deleted successfully')
      fetchStudents()
    } catch {
      flash('Error deleting student', 'error')
    }
  }

  // ✅ Unenroll uses the enrollments endpoint
  const handleUnenroll = async (courseId: string) => {
    if (!selected) return
    if (!confirm('Remove this student from the course?')) return
    try {
      await api.delete(`/enrollments/${selected.id}/${courseId}`)
      flash('Unenrolled successfully!')
      await fetchStudent(selected.id)
      fetchStudents()
    } catch {
      flash('Error unenrolling from course', 'error')
    }
  }

  const initials = (n: string) => n.split(' ').map(x => x[0]).join('').toUpperCase()

  const allAssignments = selected?.courses?.flatMap(c =>
    (c.assignments || []).map(a => ({ ...a, courseTitle: c.title }))
  ) || []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>

      {/* LEFT - Student List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Students ({students.length})</span>
          <button onClick={() => { setShowAdd(true); setSelected(null); setName(''); setEmail(''); setPassword(''); setBio(''); setAvatarUrl(''); setRole('STUDENT') }}
            style={{ padding: '4px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
            + Add
          </button>
        </div>

        {listLoading && <Spinner />}

        {!listLoading && students.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20, background: 'white', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
            No students yet.<br />Click + Add to create one.
          </div>
        )}

        {students.map(s => (
          <div key={s.id} onClick={() => { setShowAdd(false); fetchStudent(s.id) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: selected?.id === s.id ? '#ede9fe' : 'white',
              border: selected?.id === s.id ? '1px solid #a5b4fc' : '0.5px solid #e5e7eb',
              transition: '0.15s',
            }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.role === 'admin' ? '#dc2626' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, color: 'white', flexShrink: 0 }}>
              {initials(s.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: s.role === 'admin' ? '#fee2e2' : '#ede9fe', color: s.role === 'admin' ? '#dc2626' : '#4f46e5', fontWeight: 600, textTransform: 'uppercase' }}>
              {s.role}
            </span>
          </div>
        ))}
      </div>

      {/* RIGHT - Detail Panel */}
      <div>
        {message && (
          <div style={{
            padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 13,
            background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
            color: msgType === 'success' ? '#065f46' : '#b91c1c',
            border: `1px solid ${msgType === 'success' ? '#6ee7b7' : '#fca5a5'}`,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            {msgType === 'success' ? '✓' : '✕'} {message}
          </div>
        )}

        {/* Add Student Form */}
        {showAdd && (
          <div style={{ background: 'white', padding: 24, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: 4, fontSize: 16 }}>New Student</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Fill in the details to create a new student.</p>

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Full Name *</label>
            <input placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Email *</label>
            <input placeholder="e.g. john@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Password *</label>
            <input placeholder="Min 6 characters" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Bio (optional)</label>
            <input placeholder="e.g. Computer Science Student" value={bio} onChange={e => setBio(e.target.value)} style={inputStyle} />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Avatar URL (optional)</label>
            <input placeholder="https://example.com/avatar.png" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={inputStyle} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} disabled={saving}
                style={{ padding: '8px 20px', background: saving ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
                {saving ? 'Creating...' : 'Create Student'}
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading && <Spinner />}

        {/* Student Detail */}
        {selected && !showAdd && !loading && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: selected.role === 'admin' ? '#dc2626' : '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, color: 'white' }}>
                {initials(selected.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selected.name}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: selected.role === 'admin' ? '#fee2e2' : '#ede9fe', color: selected.role === 'admin' ? '#dc2626' : '#4f46e5', fontWeight: 600, textTransform: 'uppercase' }}>
                    {selected.role}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.email}</div>
              </div>
              <button onClick={() => setEditMode(!editMode)}
                style={{ padding: '6px 14px', background: editMode ? '#e5e7eb' : '#4f46e5', color: editMode ? '#374151' : 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                {editMode ? 'Cancel' : '✏️ Edit'}
              </button>
              <button onClick={() => handleDelete(selected.id)}
                style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                🗑 Delete
              </button>
            </div>

            {/* Edit Form */}
            {editMode && (
              <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} style={inputStyle} />
                <input placeholder="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={inputStyle} />
                <button onClick={handleUpdate} disabled={saving}
                  style={{ padding: '8px 20px', background: saving ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Profile - 1:1 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Profile
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>1:1 One-to-One</span>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 14 }}>
                {selected.profile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div><span style={{ color: '#6b7280' }}>Bio: </span><strong>{selected.profile.bio}</strong></div>
                    <div><span style={{ color: '#6b7280' }}>Avatar: </span>{selected.profile.avatarUrl || '—'}</div>
                  </div>
                ) : <span style={{ color: '#6b7280', fontSize: 13 }}>No profile yet — click ✏️ Edit to add one</span>}
              </div>
            </div>

            {/* Enrolled Courses - N:M */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Enrolled Courses
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>N:M Many-to-Many</span>
                </div>
                {/* ✅ Link to Enrollments page to enroll student in new courses */}
                <button
                  onClick={() => navigate('/enrollments')}
                  style={{ fontSize: 12, padding: '4px 10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  + Manage Enrollments
                </button>
              </div>

              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                {selected.courses?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.courses.map(c => (
                      <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#ede9fe', color: '#4f46e5', borderRadius: 20, fontSize: 13 }}>
                        <span style={{ fontSize: 11, background: '#c4b5fd', color: '#3730a3', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{c.code}</span>
                        {c.title}
                        {/* ✅ Unenroll button calls enrollments endpoint */}
                        <button
                          onClick={() => handleUnenroll(c.id)}
                          title="Unenroll from this course"
                          style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, marginLeft: 2 }}>
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Not enrolled in any courses yet</span>
                    <button
                      onClick={() => navigate('/enrollments')}
                      style={{ fontSize: 12, padding: '4px 10px', background: '#f3f4f6', color: '#4f46e5', border: '1px solid #a5b4fc', borderRadius: 6, cursor: 'pointer' }}>
                      Go to Enrollments →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Assignments - 1:N */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Assignments from Enrolled Courses
                <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 10, padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>1:N One-to-Many</span>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                {allAssignments.length ? allAssignments.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #e5e7eb', fontSize: 14 }}>
                    <span style={{ flex: 1, fontWeight: 500 }}>{a.title}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Due: {a.dueDate?.split('T')[0]}</span>
                    <span style={{ padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 12 }}>{a.courseTitle}</span>
                  </div>
                )) : <span style={{ fontSize: 13, color: '#6b7280' }}>No assignments yet</span>}
              </div>
            </div>

          </div>
        )}

        {!selected && !showAdd && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14, background: 'white', borderRadius: 10, border: '0.5px dashed #e5e7eb', gap: 8 }}>
            <div style={{ fontSize: 32 }}>🎓</div>
            <div>Select a student to view details</div>
            <div style={{ fontSize: 12 }}>or click + Add to create a new student</div>
          </div>
        )}
      </div>
    </div>
  )
}