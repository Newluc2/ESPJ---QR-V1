import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2, Smartphone, ArrowRight } from 'lucide-react'
import { getStoredUserId, saveStoredUserId } from '../utils/userSession'

function NfcPage() {
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUserId = getStoredUserId()

    if (storedUserId) {
      navigate(`/scan?userId=${encodeURIComponent(storedUserId)}`, { replace: true })
    }
  }, [navigate])

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedUserId = userId.trim()

    if (!trimmedUserId) {
      setError('Veuillez entrer votre UserID')
      return
    }

    setSaving(true)
    saveStoredUserId(trimmedUserId)
    navigate(`/scan?userId=${encodeURIComponent(trimmedUserId)}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Smartphone className="text-indigo-700" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Connexion NFC</h1>
            <p className="text-slate-600 mt-2">
              Entrez votre UserID une seule fois. Il sera gardé sur cet appareil pour les prochaines connexions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">UserID</label>
              <input
                type="text"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value)
                  setError('')
                }}
                placeholder="Ex. 12345"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                autoComplete="off"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  Enregistrer et continuer
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-indigo-600 flex-shrink-0" />
            <p>
              Si un cookie de session existe déjà, vous serez redirigé automatiquement vers la page de scan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NfcPage
