import { useEffect, useState } from 'react'
import api from '../api/api'
import authService from '../app/auth/services/authService'

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

export default function ProfilesPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  const currentUser = authService.getUser()

  const flash = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg); setMsgType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await api.get('/profiles')
      const myProfile = res.data.find((p: any) => p.student?.id === currentUser?.id)
      setProfile(myProfile || null)
      setBio(myProfile?.bio || '')
      setAvatarUrl(myProfile?.avatarUrl || '')
    } catch {
      flash('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async () => {
    if (!bio) return flash('Bio is required', 'error')
    setSaving(true)
    try {
      if (profile?.id) {
        await api.put(`/profiles/${profile.id}`, { bio, avatarUrl })
        flash('Profile updated! ✓')
      } else {
        await api.post('/profiles', {
          bio,
          avatarUrl,
          studentId: currentUser?.id
        })
        flash('Profile created! ✓')
      }
      setEditMode(false)
      fetchProfile()
    } catch (e: any) {
      flash(e.response?.data?.message || 'Error saving profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profile?.id) return
    if (!confirm('Delete your profile?')) return
    try {
      await api.delete(`/profiles/${profile.id}`)
      setProfile(null)
      setBio('')
      setAvatarUrl('')
      flash('Profile deleted')
    } catch {
      flash('Error deleting profile', 'error')
    }
  }

  const initials = (n: string) =>
    n?.split(' ').map(x => x[0]).join('').toUpperCase() || '?'

  if (loading) return <Spinner />

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Flash */}
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13,
          background: msgType === 'success' ? '#d1fae5' : '#fee2e2',
          color: msgType === 'success' ? '#065f46' : '#b91c1c',
          border: `1px solid ${msgType === 'success' ? '#6ee7b7' : '#fca5a5'}`
        }}>
          {msgType === 'success' ? '✓' : '✕'} {message}
        </div>
      )}

      <div style={{
        background: 'white', padding: 28, borderRadius: 10,
        border: '0.5px solid #e5e7eb'
      }}>

        {/* ── Avatar + Name + Email ──────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#4f46e5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: 22, color: 'white',
            flexShrink: 0, overflow: 'hidden'
          }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : initials(currentUser?.name || '')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {currentUser?.name}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
              {currentUser?.email}
            </div>
            <span style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: '#ede9fe', color: '#4f46e5',
              fontWeight: 600, textTransform: 'uppercase'
            }}>
              Student
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setEditMode(!editMode)
                setBio(profile?.bio || '')
                setAvatarUrl(profile?.avatarUrl || '')
              }}
              style={{
                padding: '7px 14px',
                background: editMode ? '#e5e7eb' : '#4f46e5',
                color: editMode ? '#374151' : 'white',
                border: 'none', borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontWeight: 500
              }}>
              {editMode ? 'Cancel' : '✏️ Edit'}
            </button>
            {profile?.id && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '7px 12px', background: '#fee2e2',
                  color: '#b91c1c', border: '1px solid #fca5a5',
                  borderRadius: 6, fontSize: 13, cursor: 'pointer'
                }}>
                🗑
              </button>
            )}
          </div>
        </div>

        {/* ── Edit Form ──────────────────────────── */}
        {editMode && (
          <div style={{
            background: '#f9fafb', padding: 16, borderRadius: 8,
            marginBottom: 20, border: '1px solid #e5e7eb'
          }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
              Bio *
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>
              Avatar URL
            </label>
            <input
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              style={inputStyle}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 20px',
                background: saving ? '#a5b4fc' : '#4f46e5',
                color: 'white', border: 'none', borderRadius: 6,
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500
              }}>
              {saving ? 'Saving...' : profile?.id ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        )}

        {/* ── View Mode ──────────────────────────── */}
        {!editMode && (
          <>
            {/* Bio */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6
              }}>
                Bio
              </div>
              <div style={{
                background: '#f9fafb', padding: 12, borderRadius: 8,
                fontSize: 14, color: '#374151', lineHeight: 1.6
              }}>
                {profile?.bio || (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No bio yet — click ✏️ Edit to add one
                  </span>
                )}
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6
              }}>
                Avatar URL
              </div>
              <div style={{
                background: '#f9fafb', padding: 12, borderRadius: 8,
                fontSize: 14, color: '#374151',
                wordBreak: 'break-all'
              }}>
                {profile?.avatarUrl || (
                  <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No avatar URL set
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}