import axios from 'axios'
import sessionManager from '../utils/sessionManager'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const deviceToken = localStorage.getItem('deviceToken')
  if (deviceToken) {
    config.headers.Authorization = `Bearer ${deviceToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionManager.clearSession()
      localStorage.removeItem('adminToken')

      const isAdminRoute = window.location.pathname.startsWith('/admin')
      const targetPath = isAdminRoute ? '/admin/login' : '/'

      if (window.location.pathname !== targetPath) {
        window.location.href = targetPath
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (firstName, lastName, deviceName) =>
    api.post('/auth/login', { firstName, lastName, deviceName }),
  verify: (deviceToken) =>
    api.post('/auth/verify', { deviceToken }),
  logout: (deviceToken) =>
    api.post('/auth/logout', { deviceToken }),
}

export const userService = {
  getMe: () => api.get('/users/me'),
}

export const attendanceService = {
  register: (deviceToken) =>
    api.post('/attendance/register', { deviceToken }),
  getTodayAttendance: () =>
    api.post('/attendance/today'),
}

export const adminService = {
  getTodayAttendance: () => api.get('/admin/attendance/today'),
  getAllUsers: () => api.get('/admin/users'),
  getConnectedDevices: () => api.get('/admin/devices'),
  generateQRCode: (userId) => api.post('/admin/qrcode', { userId }),
  addUser: (userData) => api.post('/admin/users', userData),
  getSessions: () => api.get('/admin/sessions'),
}

export default api
