import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMyStats, getMe } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { GlassCard } from '../components/GlassCard'
import { GlowButton } from '../components/GlowButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBanner } from '../components/ErrorBanner'

const STATUS_STYLES = {
  active:  'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  blocked: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  banned:  'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
}

export default function ProfilePage() {
  const navigate = useNavigate()

  const [me, setMe]           = useState(null)
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true); setError('')
      try {
        const [meRes, statsRes] = await Promise.all([getMe(), getMyStats()])
        if (!cancelled) { setMe(meRes.data); setStats(statsRes) }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load profile.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const nickname = me?.nickname || '…'

  const infoRows = me
    ? [
        { label: 'Email',   value: me.email },
        { label: 'Role',    value: me.role },
      ]
    : []

  const statRows = stats
    ? [
        { label: 'Messages sent',        value: stats.sentCount },
        { label: 'Messages received',    value: stats.receivedCount },
        { label: 'Compliments received', value: stats.complimentsReceived },
        { label: 'Complaints received',  value: stats.complaintsReceived },
      ]
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-cine-muted">Your account and live activity stats.</p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identity card */}
        <GlassCard className="p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cine-purple/40 to-cine-rose/30 text-2xl font-bold text-white shadow-lg shadow-cine-purple/20">
              {nickname.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">{nickname}</h2>

            {/* Rating */}
            {me?.rating != null && (
              <p className="mt-2 text-3xl font-bold text-yellow-400">
                ⭐ {me.rating}
              </p>
            )}

            {/* Status badge */}
            {me?.status && (
              <span className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[me.status] ?? 'bg-white/10 text-zinc-300'}`}>
                {me.status}
              </span>
            )}

            {/* Info rows */}
            <ul className="mt-5 space-y-2 text-left">
              {infoRows.map((row) => (
                <li key={row.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-cine-base/50 px-3 py-2 text-sm">
                  <span className="text-cine-muted">{row.label}</span>
                  <span className="text-zinc-200 capitalize">{row.value}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </GlassCard>

        {/* Stats card */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cine-muted">Activity stats</h3>

          {loading ? (
            <div className="mt-6"><LoadingSpinner label="Loading stats…" /></div>
          ) : (
            <ul className="mt-6 space-y-3">
              {statRows.map((s) => (
                <li key={s.label} className="flex items-center justify-between rounded-xl border border-white/10 bg-cine-base/50 px-4 py-3">
                  <span className="text-sm text-cine-muted">{s.label}</span>
                  <span className="text-lg font-semibold text-white">{s.value ?? 0}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <GlowButton type="button" variant="primary" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </GlowButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
