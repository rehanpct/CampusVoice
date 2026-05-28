import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getInbox, reportMessage } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { GlassCard }     from '../components/GlassCard'
import { GlowButton }    from '../components/GlowButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBanner }   from '../components/ErrorBanner'
import { EmptyState }    from '../components/EmptyState'
import { SuccessAlert }  from '../components/SuccessAlert'

const TYPE_STYLES = {
  compliment: 'bg-cine-purple/20 text-purple-300 ring-1 ring-cine-purple/30',
  complaint:  'bg-cine-rose/20 text-rose-300 ring-1 ring-cine-rose/30',
}

const STATUS_STYLES = {
  active:  'bg-emerald-500/15 text-emerald-400',
  blocked: 'bg-amber-500/15 text-amber-400',
  banned:  'bg-red-500/15 text-red-400',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function ReportModal({ open, messageId, onClose, onDone }) {
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => { if (open) { setReason(''); setErr('') } }, [open])

  async function submit(e) {
    e.preventDefault()
    if (!reason.trim()) { setErr('Please provide a reason.'); return }
    setLoading(true); setErr('')
    try {
      await reportMessage(messageId, reason.trim())
      onDone()
    } catch (error) {
      setErr(getErrorMessage(error, 'Report failed.'))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-white">Report message</h3>
        <p className="mt-1 text-xs text-cine-muted">Tell us why this message is inappropriate.</p>
        {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
        <form onSubmit={submit} className="mt-4 space-y-3">
          <textarea
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-cine-purple/50 focus:outline-none"
            placeholder="Reason…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <GlowButton type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit'}
            </GlowButton>
            <GlowButton type="button" variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </GlowButton>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

export default function InboxPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [reportTarget, setReportTarget] = useState(null) // message id

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true); setError('')
      try {
        const res = await getInbox()
        if (!cancelled) setMessages(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        if (!cancelled) { setMessages([]); setError(getErrorMessage(err, 'Could not load inbox.')) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  function handleReportDone() {
    setReportTarget(null)
    setSuccess('Report submitted. Thank you for keeping the community safe.')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Inbox</h1>
        <p className="mt-1 text-sm text-cine-muted">Messages you have received — newest first.</p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <LoadingSpinner label="Loading messages…" />
      ) : messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="When someone sends you a compliment or complaint, it will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((m, i) => (
            <motion.li
              key={m.id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <GlassCard className="p-5">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => m.otherId && navigate(`/chat/${m.otherId}`)}
                  onKeyDown={(e) => e.key === 'Enter' && m.otherId && navigate(`/chat/${m.otherId}`)}
                  className={`${m.otherId ? 'cursor-pointer' : ''}`}
                >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Sender */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cine-purple/40 to-cine-rose/30 text-xs font-bold text-white">
                      {m.isAnonymous ? '?' : (m.sender?.nickname ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {m.isAnonymous ? (
                          <span className="italic text-cine-muted">Anonymous</span>
                        ) : (
                          <>
                            {m.sender?.nickname ?? 'Unknown'}
                            {m.sender?.rating != null && (
                              <span className="ml-1.5 text-xs text-yellow-400">⭐ {m.sender.rating}</span>
                            )}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{formatDate(m.createdAt)}</p>
                    </div>
                  </div>

                  {/* Right side: type badge + report + open chat */}
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_STYLES[m.type] ?? 'bg-white/10 text-zinc-300'}`}>
                      {m.type}
                    </span>
                    {m.otherId && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${m.otherId}`) }}
                        className="rounded-lg px-2 py-1 text-xs text-cine-purple/70 hover:bg-cine-purple/15 hover:text-cine-purple transition-colors"
                      >
                        Open chat →
                      </button>
                    )}
                    <button
                      type="button"
                      title="Report this message"
                      onClick={(e) => { e.stopPropagation(); setReportTarget(m.id) }}
                      className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-cine-rose/15 hover:text-rose-400 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                </div>

                {/* Body */}
                <p className="mt-3 text-sm leading-relaxed text-zinc-200 line-clamp-2">{m.message}</p>
                </div>
              </GlassCard>
            </motion.li>
          ))}
        </ul>
      )}

      <ReportModal
        open={reportTarget !== null}
        messageId={reportTarget}
        onClose={() => setReportTarget(null)}
        onDone={handleReportDone}
      />
    </div>
  )
}
