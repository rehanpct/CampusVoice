import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getLeaderboard } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { GlassCard } from '../components/GlassCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBanner } from '../components/ErrorBanner'
import { EmptyState } from '../components/EmptyState'

function normalizeList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.leaderboard)) return res.leaderboard
  return []
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getLeaderboard()
        if (!cancelled) setRows(normalizeList(res))
      } catch (err) {
        if (!cancelled) {
          setRows([])
          setError(getErrorMessage(err, 'Could not load leaderboard.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Leaderboard</h1>
        <p className="mt-1 text-sm text-cine-muted">
          Top users by compliments received (live from the server).
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <GlassCard className="overflow-hidden p-0" hoverLift={false}>
        {loading ? (
          <LoadingSpinner label="Loading leaderboard…" />
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No rankings yet"
              description="Once people receive compliments, they will appear here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {rows.map((entry, i) => {
              const rank = entry.rank ?? i + 1
              const nick = entry.nickname ?? entry.name ?? `Member ${rank}`
              const score = entry.score ?? entry.points ?? '—'
              const top = rank <= 3
              return (
                <motion.li
                  key={`${rank}-${nick}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    top
                      ? 'bg-gradient-to-r from-cine-purple/25 via-cine-rose/10 to-transparent shadow-[inset_0_0_40px_rgba(155,93,229,0.12)]'
                      : 'bg-cine-card/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                        top
                          ? 'bg-cine-rose/30 text-white shadow-[0_0_16px_rgba(255,77,109,0.35)]'
                          : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      #{rank}
                    </span>
                    <span className="font-medium text-zinc-100">{nick}</span>
                  </div>
                  <span className="text-lg font-semibold text-cine-rose">{score}</span>
                </motion.li>
              )
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
