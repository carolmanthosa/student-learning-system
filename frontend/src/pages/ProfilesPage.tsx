import { useEffect, useState } from 'react'
import api from '../api/api'

interface Profile {
  id: number
  bio: string
  avatarUrl: string
  student?: { id: number; name: string; email: string }
}

interface Student {
  id: number
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

  const fetchProfiles = () => api.get('/profiles').then(r => setProfiles(r.data))
  const fetchStudents = () => api.get('/students').then(r => setStudents(r.data))

  useEffect(() => { fetchProfiles(); fetchStudents() }, [])

  const handleSelect = (p: Profile) => {
    setSelected(p)
    setBio(p.bio)
    setAvatarUrl(p.avatarUrl)
    setEditMode(false)
    setShowAdd(false)
  }

  const studentsWithoutProfile = students.filter(
    s => !profiles.find(p => p.student?.id === s.id)
  )

  const handleCreate = async () => {
    if (!bio || !studentId) return setMessage('Bio and student are required')
    try {
      await api.post('/profiles', { bio, avatarUrl, studentId: +studentId })
      setMessage('Profile created!')
      setBio(''); setAvatarUrl(''); setStudentId('')
      setShowAdd(false)
      fetchProfiles()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    try {
      await api.put(`/profiles/${selected.id}`, { bio, avatarUrl })
      setMessage('Profile updated!')
      setSelected({ ...selected, bio, avatarUrl })
      setEditMode(false)
      fetchProfiles()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return
    await api.delete(`/profiles/${id}`)
    setSelected(null)
    setMessage('Profile deleted')
    fetchProfiles()
  }

  const initials = (name: string) => name.split(' ').map(x => x[0]).join('').toUpperCase()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>
      {/* Left */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 500, fontSize: 15 }}>Profiles</span>
          {studentsWithoutProfile.length > 0 && (
            <button onClick={() => { setShowAdd(true); setSelected(null); setBio(''); setAvatarUrl(''); setStudentId('') }}
              style={{ padding: '4px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
              + Add
            </button>
          )}
        </div>

        {profiles.map(p => (
          <div key={p.id} onClick={() => handleSelect(p)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4, background: selected?.id === p.id ? '#ede9fe' : 'white', border: '0.5px solid #e5e7eb' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 12, color: '#4f46e5', flexShrink: 0 }}>
              {p.student ? initials(p.student.name) : '?'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.student?.name || 'Unknown'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{p.bio.length > 30 ? p.bio.slice(0, 30) + '...' : p.bio}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right */}
      <div>
        {message && <div style={{ padding: 10, background: '#e0f2fe', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{message}</div>}

        {/* Add form */}
        {showAdd && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #adafb4' }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>New Profile</h3>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', border: '1px solid #b9bbbf', borderRadius: '4px', fontSize: '14px' }}>
              <option value="">Select student...</option>
              {studentsWithoutProfile.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
            <input placeholder="Avatar URL (optional)" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={handleCreate} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Detail */}
        {selected && !showAdd && (
          <div style={{ background: 'white', padding: 20, borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 15, color: '#4f46e5' }}>
                {selected.student ? initials(selected.student.name) : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 500 }}>{selected.student?.name || 'Unknown'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selected.student?.email || ''}</div>
              </div>
              <button onClick={() => setEditMode(!editMode)} style={{ padding: '6px 14px', background: '#f3f4f6', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={() => handleDelete(selected.id)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                Delete
              </button>
            </div>

            {editMode && (
              <div style={{background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
                <input placeholder="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                <button onClick={handleUpdate} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6, marginTop: 8, cursor: 'pointer' }}>
                  Save changes
                </button>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Bio</div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 14 }}>
                {selected.bio}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avatar URL</div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, fontSize: 14 }}>
                {selected.avatarUrl || '—'}
              </div>
            </div>
          </div>
        )}

        {!selected && !showAdd && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6b7280', fontSize: 14, background: 'white', borderRadius: 10, border: '0.5px solid #e5e7eb' }}>
            Select a profile to view details
          </div>
        )}
      </div>
    </div>
  )
}