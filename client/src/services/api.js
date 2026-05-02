import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (password) => api.post('/auth/login', { password }),
  verify: (token) => api.post('/auth/verify', { token }),
}

export const userService = {
  getUser: (userId) => api.get(`/users/${userId}`),
  getAllUsers: () => api.get('/users'),
}

export const attendanceService = {
  register: (userId) => api.post('/attendance/register', { userId }),
  getTodayAttendance: (userId) => api.get(`/attendance/today/${userId}`),
}

export const adminService = {
  getTodayAttendance: () => api.get('/admin/attendance/today'),
  getAllUsers: () => api.get('/admin/users'),
  generateQRCode: (userId) => api.get(`/admin/qrcode/${userId}`),
  addUser: (userData) => api.post('/admin/users', userData),
}

export default api
