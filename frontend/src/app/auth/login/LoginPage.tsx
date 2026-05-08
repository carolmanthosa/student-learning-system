import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../../api/api'
import authService from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', { email, password })

      authService.saveSession(res.data.access_token, res.data.user)

      // ✅ ADDED FIX (ROLE-BASED REDIRECT)
      if (res.data.user.role === 'admin') {
        navigate('/students')
      } else {
        navigate('/courses')
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
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
            Student Learning System
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Sign in to continue</p>
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

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#64748b', marginBottom: 5
          }}>
            Email
          </label>
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

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#64748b', marginBottom: 5
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: 6,
              fontSize: 14, color: '#1e293b', background: '#f8fafc'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 500 }}>
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage