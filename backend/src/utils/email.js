const SUFFIX = '@saintgits.org'

export function isSaintGitsEmail(email) {
  if (typeof email !== 'string') return false
  const normalized = email.trim().toLowerCase()
  return normalized.endsWith(SUFFIX) && normalized.length > SUFFIX.length
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}
