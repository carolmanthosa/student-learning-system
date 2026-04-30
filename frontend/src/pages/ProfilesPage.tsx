import { useEffect, useState } from 'react'
import api from '../api/api'

interface Profile {
  id: number
  bio: string
  avatarUrl: string
  student?: { id: number; name: string }
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [studentId, setStudentId] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const fetchProfiles = async () => {
    const res = await api.get('/profiles')
    setProfiles(res.data)
  }

  useEffect(() => { fetchProfiles() }, [])

  const handleSubmit = async () => {
    if (!bio || !studentId) return setMessage('Bio and Student ID are required')
    try {
      if (editId) {
        await api.put(`/profiles/${editId}`, { bio, avatarUrl })
        setMessage('Profile updated successfully')
      } else {
        await api.post('/profiles', { bio, avatarUrl, studentId: +studentId })
        setMessage('Profile created successfully')
      }
      setBio(''); setAvatarUrl(''); setStudentId(''); setEditId(null)
      fetchProfiles()
    } catch (e: any) {
      setMessage(e.response?.data?.message?.join(', ') || 'Error')
    }
  }

  const handleEdit = (p: Profile) => {
    setEditId(p.id)
    setBio(p.bio)
    setAvatarUrl(p.avatarUrl)
    setStudentId(String(p.student?.id || ''))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this profile?')) return
    await api.delete(`/profiles/${id}`)
    setMessage('Profile deleted')
    fetchProfiles()
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Profiles</h2>

      {message && (
        <div style={{ padding: 10, background: '#e0f2fe', borderRadius: 6, marginBottom: 12 }}>
          {message}
        </div>
      )}

      <div style={{ background: 'white', padding: 16, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 12 }}>{editId ? 'Edit Profile' : 'Add Profile'}</h3>
        <input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
        <input placeholder="Avatar URL" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
        {!editId && (
          <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 6 }}>
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setBio(''); setAvatarUrl(''); setStudentId('') }}
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
              <th>Bio</th>
              <th>Avatar URL</th>
              <th>Student</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.bio}</td>
                <td>{p.avatarUrl}</td>
                <td>{p.student?.name || '—'}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(p)}
                    style={{ padding: '4px 10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 4 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
