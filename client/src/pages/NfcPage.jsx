import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Loader2, Smartphone, ArrowRight } from 'lucide-react'
import sessionManager from '../utils/sessionManager'

function NfcPage() {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionManager.isSessionValid()) {
      navigate('/scan', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSaving(true)
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Smartphone className="text-indigo-700" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Continuer vers la connexion</h1>
            <p className="text-slate-600 mt-2">
              L'appareil est identifié automatiquement par votre IP. Cliquez sur le bouton pour continuer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Continuer vers la connexion
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-indigo-600 flex-shrink-0" />
            <p>
              Votre appareil est identifié de manière unique et irréversible par son adresse IP encryptée en base64.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NfcPage
