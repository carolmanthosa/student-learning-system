import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../../api/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!name || !email || !password) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc'
    }}>
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: 6 }}>
            Create Account
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Register as a student</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 16
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#64748b', marginBottom: 5
          }}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            disabled={loading}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: 6,
              fontSize: 14, color: '#1e293b', background: '#f8fafc'
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#64748b', marginBottom: 5
          }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: 6,
              fontSize: 14, color: '#1e293b', background: '#f8fafc'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#64748b', marginBottom: 5
          }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: 6,
              fontSize: 14, color: '#1e293b', background: '#f8fafc'
            }}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', padding: 11,
            background: loading ? '#94a3b8' : '#1e293b',
            color: 'white', border: 'none', borderRadius: 6,
            fontSize: 14, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 16
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage