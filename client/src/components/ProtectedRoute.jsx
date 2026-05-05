import React from 'react'
import { Navigate } from 'react-router-dom'
import sessionManager from '../utils/sessionManager'

const ProtectedRoute = ({ children }) => {
  // Vérifier que le deviceToken existe et la session est valide
  if (!sessionManager.isSessionValid()) {
    sessionManager.clearSession()
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
