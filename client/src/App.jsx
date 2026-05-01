import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ScanPage from './pages/ScanPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<ScanPage />} />
      </Routes>
    </Router>
  )
}

export default App
