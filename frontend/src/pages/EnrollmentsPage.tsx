import { useEffect, useState } from 'react'
import api from '../api/api'
import authService from '../app/auth/services/authService'

interface Course {
  id: string
  title: string
  code: string
  assignments?: { id: string; title: string; dueDate: string }[]
}

interface Student {
  id: string
  name: string
  email: string
}

interface Enrollment {
  id: string
  enrolledAt: string
  student: Student
  course: Course
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const isAdmin = authService.isAdmin()
  const currentUser = authService.getUser()

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg)
    setMsgType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const fetchEnrollments = async () => {
    if (isAdmin) {
      const res = await api.get('/enrollments')
      setEnrollments(res.data)
    } else {
      const res = await api.get(`/enrollments/student/${currentUser?.id}`)
      setEnrollments(res.data)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      await fetchEnrollments()
      const c = await api.get('/courses')
      setCourses(c.data)
      if (isAdmin) {
        const s = await api.get('/students')
        setStudents(s.data)
      }
    } catch {
      flash('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Courses student is NOT yet enrolled in
  const enrolledCourseIds = enrollments.map(e => e.course?.id)
  const availableCourses = courses.filter(c => !enrolledCourseIds.includes(c.id))

  // Toggle course selection
  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleEnroll = async () => {
    const studentId = isAdmin ? selectedStudentId : currentUser?.id

    if (selectedCourseIds.length === 0) return flash('Please select at least one course', 'error')
    if (isAdmin && !studentId) return flash('Please select a student', 'error')

    setEnrolling(true)
    let successCount = 0
    let failCount = 0

    for (const courseId of selectedCourseIds) {
      try {
        await api.post(`/enrollments/${studentId}/${courseId}`, {})
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) flash(`Successfully enrolled in ${successCount} course(s)! 🎉`)
    if (failCount > 0) flash(`${failCount} course(s) failed — already enrolled`, 'error')

    setSelectedCourseIds([])
    setSelectedStudentId('')
    setEnrolling(false)
    fetchEnrollments()
  }

  const handleUnenroll = async (studentId: string, courseId: string) => {
    if (!confirm('Remove this enrollment?')) return
    try {
      await api.delete(`/enrollments/${studentId}/${courseId}`)
      flash('Enrollment removed')
      fetchEnrollments()
    } catch {
      flash('Error removing enrollment', 'error')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14 }}>
        Loading enrollments...
      </div>
    )
  }

  const courseList = isAdmin ? courses : availableCourses

  return (
    <div style={{ maxWidth: 820 }}>

      {/* Flash */}
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13,
          background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
          color: msgType === 'success' ? '#065f46' : '#b91c1c',
          border: `1px solid ${msgType === 'success' ? '#6ee7b7' : '#fca5a5'}`
        }}>
          {message}
        </div>
      )}

      {/* ── Enroll Form ─────────────────────────────── */}
      <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          {isAdmin ? '🔗 Enroll a Student' : '🔗 Enroll in Courses'}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          {isAdmin
            ? 'Select a student and one or more courses.'
            : 'Select one or more courses to enroll in.'}
        </p>

        {/* Admin — select student */}
        {isAdmin && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
              Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}>
              <option value="">Select student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
        )}

        {/* Multi-select courses */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
            Courses * — click to select multiple
          </label>

          {courseList.length === 0 ? (
            <div style={{ padding: '12px 14px', background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#059669' }}>
              ✅ {isAdmin ? 'No courses available.' : 'You are enrolled in all available courses!'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {courseList.map(c => {
                const isSelected = selectedCourseIds.includes(c.id)
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCourse(c.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      border: isSelected ? '2px solid #4f46e5' : '1.5px solid #e5e7eb',
                      background: isSelected ? '#ede9fe' : 'white',
                      color: isSelected ? '#4f46e5' : '#374151',
                      transition: '0.15s',
                      userSelect: 'none',
                    }}>
                    {isSelected ? '✓ ' : ''}{c.code} — {c.title}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected count */}
        {selectedCourseIds.length > 0 && (
          <p style={{ fontSize: 12, color: '#4f46e5', marginBottom: 12 }}>
            {selectedCourseIds.length} course(s) selected
          </p>
        )}

        <button
          onClick={handleEnroll}
          disabled={enrolling || selectedCourseIds.length === 0}
          style={{
            padding: '9px 24px',
            background: enrolling || selectedCourseIds.length === 0 ? '#94a3b8' : '#4f46e5',
            color: 'white', border: 'none', borderRadius: 6,
            fontSize: 14, fontWeight: 500,
            cursor: enrolling || selectedCourseIds.length === 0 ? 'not-allowed' : 'pointer'
          }}>
          {enrolling ? 'Enrolling...' : `Enroll in ${selectedCourseIds.length || ''} Course(s)`}
        </button>
      </div>

      {/* ── Enrollments Table ───────────────────────── */}
      <div style={{ background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>

        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {isAdmin ? 'All Enrollments' : 'My Enrollments'}
            </span>
            <span style={{ padding: '2px 10px', borderRadius: 20, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
              Many-to-Many
            </span>
          </div>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {enrollments.length} total
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔗</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>No enrollments yet</div>
            <div style={{ fontSize: 13 }}>
              {isAdmin ? 'Use the form above to enroll students.' : 'Select courses above to enroll.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
                {isAdmin && (
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student
                  </th>
                )}
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Course
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Assignments
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enrolled At
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id}
                  style={{ borderBottom: '0.5px solid #f3f4f6' }}
                  onMouseEnter={el => (el.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={el => (el.currentTarget.style.background = 'white')}>

                  {isAdmin && (
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{e.student?.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{e.student?.email}</div>
                    </td>
                  )}

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '2px 10px', background: '#ede9fe', color: '#4f46e5', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {e.course?.code}
                      </span>
                      <span>{e.course?.title}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {e.course?.assignments?.length ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {e.course.assignments.map(a => (
                          <span key={a.id} style={{ padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 20, fontSize: 11 }}>
                            {a.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>No assignments</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>
                    {new Date(e.enrolledAt).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleUnenroll(e.student?.id, e.course?.id)}
                      style={{
                        padding: '4px 12px', background: '#fee2e2',
                        color: '#b91c1c', border: '1px solid #fca5a5',
                        borderRadius: 6, fontSize: 12, cursor: 'pointer'
                      }}>
                      Unenroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}