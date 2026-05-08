import api from '../../../api/api'
import authService from '../services/authService'

// Attach Bearer token to every request automatically
export function setupAxiosInterceptors() {
  api.interceptors.request.use((config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // If token expired or invalid — logout automatically
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authService.clearSession()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}