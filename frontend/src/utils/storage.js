const PROFILE_KEY = 'cv_profile'

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** @param {{ nickname?: string, userId?: number, communityScore?: number }} profile */
export function setStoredProfile(profile) {
  const prev = getStoredProfile() || {}
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...prev, ...profile }))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem(PROFILE_KEY)
}
