import { useEffect, useState } from 'react'
import api from '../api/api'
import authService from '../app/auth/services/authService'

interface Profile {
  id: number
  bio: string
  avatarUrl: string
  student?: { id: string; name: string; email: string }
}

interface Student {
  id: string
  name: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [studentId, setStudentId] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(true)

  const isAdmin = authService.isAdmin()
  const currentUser = authService.getUser()

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg); setMsgType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchProfiles = async () => {
    const r = await api.get('/profiles')
    setProfiles(r.data)
  }

  const fetchStudents = async () => {
    const r = await api.get('/students')
    setStudents(r.data)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        await fetchProfiles()
        if (isAdmin) await fetchStudents()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Student sees only their own profile
  const visibleProfiles = isAdmin
    ? profiles
    : profiles.filter(p => p.student?.id === currentUser?.id)

  const handleSelect = (p: Profile) => {
    setSelected(p); setBio(p.bio); setAvatarUrl(p.avatarUrl)
    setEditMode(false); setShowAdd(false)
  }

  const studentsWithoutProfile = students.filter(
    s => !profiles.find(p => p.student?.id === s.id)
  )

  const handleCreate = async () => {
    if (!bio || !studentId) return flash('Bio and student are required', 'error')
    try {
      await api.post('/profiles', { bio, avatarUrl, studentId })
      flash('Profile created!')
      setBio(''); setAvatarUrl(''); setStudentId('')
      setShowAdd(false); fetchProfiles()
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    try {
      await api.put(`/profiles/${selected.id}`, { bio, avatarUrl })
      flash('Profile updated!')
      setSelected({ ...selected, bio, avatarUrl })
      setEditMode(false); fetchProfiles()
    } catch (e: any) {
      flash(e.response?.data?.message?.join(', ') || 'Error', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this profile?')) return
    try {
      await api.delete(`/profiles/${id}`)
      setSelected(null); flash('Profile deleted'); fetchProfiles()
    } catch (e: any) {
      flash('Error deleting profile', 'error')
    }
  }

  const initials = (name: string) =>
    name.split(' ').map(x => x[0]).join('').toUpperCase()

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', fontSize: 14, marginBottom: 8,
    boxSizing: 'border-box' as const,
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>

      {/* LEFT */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>
            {isAdmin ? 'All Profiles' : 'My Profile'}
          </span>
          {/* ADMIN ONLY — Add Profile */}
          {isAdmin && studentsWithoutProfile.length > 0 && (
            <button
              onClick={() => { setShowAdd(true); setSelected(null); setBio(''); setAvatarUrl(''); setStudentId('') }}
              style={{ padding: '4px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              + Add
            </button>
          )}
        </div>

        {visibleProfiles.length === 0 && (
          <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', padding: 20 }}>
            {isAdmin ? 'No profiles yet.' : 'You don\'t have a profile yet.'}
          </div>
        )}

        {visibleProfiles.map(p => (
          <div key={p.id} onClick={() => handleSelect(p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              background: selected?.id === p.id ? '#ede9fe' : 'white',
              border: selected?.id === p.id ? '1px solid #a5b4fc' : '0.5px solid #e5e7eb'
            }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#ede9fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 500, fontSize: 12, color: '#4f46e5', flexShrink: 0
            }}>
              {p.student ? initials(p.student.name) : '?'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.student?.name || 'Unknown'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {p.bio?.length > 30 ? p.bio.slice(0, 30) + '...' : p.bio}
              </div>
            </div>
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
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>New Profile</h3>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Student *</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)} style={inputStyle}>
              <option value="">Select student...</option>
              {studentsWithoutProfile.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Bio *</label>
            <input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Avatar URL</label>
            <input placeholder="https://..." value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleCreate}
                style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                Create
              </button>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Detail */}
        {selected && !showAdd && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', background: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 500, fontSize: 15, color: '#4f46e5'
              }}>
                {selected.student ? initials(selected.student.name) : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 500 }}>{selected.student?.name || 'Unknown'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.student?.email || ''}</div>
              </div>
              {/* Both admin and student can edit their own profile */}
              <button onClick={() => setEditMode(!editMode)}
                style={{ padding: '6px 14px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                {editMode ? 'Cancel' : '✏️ Edit'}
              </button>
              {/* ADMIN ONLY — Delete */}
              {isAdmin && (
                <button onClick={() => handleDelete(selected.id)}
                  style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                  🗑 Delete
                </button>
              )}
            </div>

            {editMode && (
              <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Bio</label>
                <input value={bio} onChange={e => setBio(e.target.value)} style={inputStyle} />
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Avatar URL</label>
                <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} style={inputStyle} />
                <button onClick={handleUpdate}
                  style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, marginTop: 8, cursor: 'pointer', fontWeight: 500 }}>
                  Save Changes
                </button>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bio</div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 14 }}>{selected.bio || '—'}</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avatar URL</div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 14 }}>{selected.avatarUrl || '—'}</div>
            </div>
          </div>
        )}

        {!selected && !showAdd && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14, background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            {visibleProfiles.length === 0
              ? isAdmin ? 'No profiles yet — click + Add' : 'You don\'t have a profile yet. Contact admin.'
              : 'Select a profile to view details'}
          </div>
        )}
      </div>
    </div>
  )
}