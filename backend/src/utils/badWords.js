/**
 * Simple profanity filter: replaces known terms with asterisks (case-insensitive).
 */
const DEFAULT_LIST = [
  'damn',
  'hell',
  'stupid',
  'idiot',
  'hate',
  'kill',
  'suicide',
  'slur-placeholder',
]

const list = process.env.BAD_WORDS_LIST
  ? process.env.BAD_WORDS_LIST.split(',').map((w) => w.trim().toLowerCase()).filter(Boolean)
  : DEFAULT_LIST.filter((w) => !w.includes('placeholder'))

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * @param {string} text
 * @returns {{ filtered: string, hadMatch: boolean }}
 */
export function filterBadWords(text) {
  let filtered = text
  let hadMatch = false
  for (const word of list) {
    if (!word) continue
    const re = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')
    if (re.test(filtered)) {
      hadMatch = true
      filtered = filtered.replace(re, '*'.repeat(Math.min(word.length, 8)))
    }
  }
  return { filtered, hadMatch }
}
