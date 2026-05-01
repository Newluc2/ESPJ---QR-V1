import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { userService, attendanceService } from '../services/api'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

function ScanPage() {
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [submitted, setSubmitted] = useState(false)

  const userId = searchParams.get('userId')

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!userId) {
          setError('ID utilisateur manquant')
          setLoading(false)
          return
        }

        const response = await userService.getUser(userId)
        setUser(response.data)
      } catch (err) {
        setError('Utilisateur non trouvé')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [userId])

  const handleSubmit = async () => {
    if (!userId || submitted) return

    try {
      setSubmitted(true)
      const response = await attendanceService.register(userId)
      
      setMessage({
        type: 'success',
        text: `${response.data.type} enregistrée à ${response.data.time}`
      })

      setTimeout(() => {
        setMessage(null)
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erreur lors de l\'enregistrement'
      })
      setSubmitted(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full">
        {error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
            <p className="text-red-700 text-lg">{error}</p>
            <p className="text-red-600 text-sm mt-4">Veuillez scanner un QR Code valide</p>
          </div>
        ) : user ? (
          <div className="bg-white rounded-lg shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-indigo-600">{user.firstName.charAt(0)}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {user.firstName} {user.lastName}
              </h1>
            </div>

            {/* Current Time */}
            <div className="bg-indigo-50 rounded-lg p-6 mb-8 text-center">
              <div className="flex items-center justify-center text-indigo-600 mb-2">
                <Clock size={20} className="mr-2" />
                <span className="text-sm font-semibold">HEURE ACTUELLE</span>
              </div>
              <div className="text-5xl font-bold text-indigo-900">
                {currentTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-lg mb-4"
            >
              {submitted ? 'Enregistrement...' : 'VALIDER'}
            </button>

            {/* Message */}
            {message && (
              <div className={`rounded-lg p-4 flex items-start ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <CheckCircle 
                  size={20} 
                  className={`mr-3 flex-shrink-0 ${
                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`} 
                />
                <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message.text}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
              <p>Système de pointage automatique</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ScanPage
