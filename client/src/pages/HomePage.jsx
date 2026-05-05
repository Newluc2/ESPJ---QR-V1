import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, ShieldCheck, UserCircle2 } from 'lucide-react'
import { authService } from '../services/api'
import sessionManager from '../utils/sessionManager'

function HomePage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Device name is now generated server-side from IP
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez entrer le nom et le prénom')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await authService.login(
        firstName.trim(),
        lastName.trim()
      )

      const { deviceToken, user, expiresAt } = response.data
      sessionManager.saveSession(deviceToken, user, expiresAt)

      navigate('/scan')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || 'Connexion impossible, vérifiez vos informations')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-white/60 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <UserCircle2 className="text-indigo-700" size={34} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Connexion sécurisée</h1>
            <p className="text-slate-600 mt-2">
              Saisissez votre prénom et votre nom pour créer une session chiffrée. Votre appareil sera identifié automatiquement.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value)
                  setError('')
                }}
                placeholder="Votre prénom"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                autoComplete="given-name"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value)
                  setError('')
                }}
                placeholder="Votre nom"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                autoComplete="family-name"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-indigo-600 flex-shrink-0" />
            <p>
              La session est enregistrée localement avec un deviceToken, sans exposer votre identifiant.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
