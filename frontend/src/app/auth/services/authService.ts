const TOKEN_KEY = 'sls_token'
const USER_KEY = 'sls_user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'student'
}

const authService = {
  // Store token and user after login
  saveSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Remove everything on logout
  clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin'
  },

  isStudent(): boolean {
    return this.getUser()?.role === 'student'
  },

  getCurrentUserId(): number | null {
    return this.getUser()?.id ?? null
  }
}

export default authService