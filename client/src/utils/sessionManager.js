/**
 * Gestion de la session utilisateur côté client
 * Stocke et récupère le deviceToken et les infos utilisateur
 */

const SESSION_KEY = 'deviceSession'
const TOKEN_KEY = 'deviceToken'
const USER_KEY = 'user'

export const sessionManager = {
  /**
   * Sauvegarder une session après login réussi
   */
  saveSession: (deviceToken, user, expiresAt) => {
    localStorage.setItem(TOKEN_KEY, deviceToken)
    localStorage.setItem(USER_KEY, JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      loginTime: new Date().toISOString(),
      expiresAt,
    }))
  },

  /**
   * Récupérer le deviceToken stocké
   */
  getDeviceToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Récupérer les infos utilisateur
   */
  getUser: () => {
    const userJson = localStorage.getItem(USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  },

  /**
   * Vérifier si une session est valide
   */
  isSessionValid: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = localStorage.getItem(USER_KEY)
    
    if (!token || !user) {
      return false
    }
    
    try {
      const userData = JSON.parse(user)
      const expiresAt = new Date(userData.expiresAt)
      
      // Vérifier que le token n'a pas expiré
      return expiresAt > new Date()
    } catch {
      return false
    }
  },

  /**
   * Obtenir le temps avant expiration (en secondes)
   */
  getTimeBeforeExpiry: () => {
    const user = sessionManager.getUser()
    if (!user) return -1
    
    const expiresAt = new Date(user.expiresAt)
    const now = new Date()
    const diffMs = expiresAt - now
    
    return Math.floor(diffMs / 1000)
  },

  /**
   * Supprimer la session (logout)
   */
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Récupérer toutes les infos de session pour debug
   */
  getSessionInfo: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = sessionManager.getUser()
    
    return {
      hasToken: !!token,
      user,
      isValid: sessionManager.isSessionValid(),
      timeBeforeExpiry: sessionManager.getTimeBeforeExpiry(),
    }
  },
}

export default sessionManager
