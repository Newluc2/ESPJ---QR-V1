const COOKIE_NAME = 'espj_user_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const BIRTH_DATE_PREFIX = 'espj_birth_date_'

export const normalizeUserInput = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const getCookie = (name) => {
  if (typeof document === 'undefined') return null

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))

  if (!cookieValue) return null

  return decodeURIComponent(cookieValue.split('=')[1] || '')
}

export const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

export const getStoredUserId = () => getCookie(COOKIE_NAME)

export const saveStoredUserId = (userId) => {
  setCookie(COOKIE_NAME, userId)
}

export const clearStoredUserId = () => {
  if (typeof document === 'undefined') return

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

export const normalizeBirthDate = (value = '') =>
  value
    .toString()
    .trim()
    .replace(/\D/g, '')

export const getStoredBirthDate = (userId) => {
  if (typeof window === 'undefined' || !userId) return null

  return window.localStorage.getItem(`${BIRTH_DATE_PREFIX}${userId}`)
}

export const saveStoredBirthDate = (userId, birthDate) => {
  if (typeof window === 'undefined' || !userId || !birthDate) return

  window.localStorage.setItem(`${BIRTH_DATE_PREFIX}${userId}`, birthDate)
}

export const clearStoredBirthDate = (userId) => {
  if (typeof window === 'undefined' || !userId) return

  window.localStorage.removeItem(`${BIRTH_DATE_PREFIX}${userId}`)
}
