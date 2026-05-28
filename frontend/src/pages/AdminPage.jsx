import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  listAdminReports,
  adminResolveReport,
  adminRejectReport,
  adminDeleteReport,
  adminListUsers,
  adminBlockUser,
  adminBanUser,
  adminUnblockUser,
  adminUnbanUser,
} from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { GlassCard }     from '../components/GlassCard'
import { GlowButton }    from '../components/GlowButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBanner }   from '../components/ErrorBanner'
import { SuccessAlert }  from '../components/SuccessAlert'

/* ─────── constants ─────── */
const STATUS_COLOR = {
  active:   'text-emerald-400',
  blocked:  'text-amber-400',
  banned:   'text-red-400',
}
const REPORT_STATUS_BADGE = {
  pending:  'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
  rejected: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30',
}
const STATUS_BADGE = {
  active:  'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  blocked: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  banned:  'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
}
const TABS = ['Reports', 'Users']

/* ─────── tiny helpers ─────── */
function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-white">{children}</h2>
}

/* ═══════════════════════════════════════════════
   REPORTS TAB
═══════════════════════════════════════════════ */
function ReportsTab({ setGlobalError, setGlobalSuccess }) {
  const [reports, setReports]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [acting, setActing]         = useState(null) // report id being acted on

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAdminReports(statusFilter)
      setReports(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'Could not load reports.'))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, setGlobalError])

  useEffect(() => { load() }, [load])

  async function doAction(action, reportId, label) {
    if (action === 'delete') {
      if (!window.confirm(`Delete report #${reportId}? This cannot be undone.`)) return
    }
    setActing(reportId)
    try {
      if (action === 'resolve') await adminResolveReport(reportId)
      if (action === 'reject')  await adminRejectReport(reportId)
      if (action === 'delete')  await adminDeleteReport(reportId)
      setGlobalSuccess(`Report #${reportId} ${label}.`)
      await load()
    } catch (err) {
      setGlobalError(getErrorMessage(err, `Could not ${label} report.`))
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-cine-muted">Filter:</span>
        {['', 'pending', 'resolved', 'rejected'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === s
                ? 'bg-cine-purple/40 text-white ring-1 ring-cine-purple/60'
                : 'bg-white/5 text-cine-muted hover:bg-white/10'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ml-auto rounded-full bg-white/5 px-3 py-1 text-xs text-cine-muted transition hover:bg-white/10 disabled:opacity-50"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading reports…" />
      ) : reports.length === 0 ? (
        <p className="text-sm text-cine-muted">No reports found.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm transition hover:border-white/20">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Report #{r.id}</span>
                    <Badge
                      label={r.status}
                      cls={REPORT_STATUS_BADGE[r.status] ?? 'bg-white/10 text-zinc-300'}
                    />
                  </div>
                  {r.rating_penalty != null && (
                    <span className="text-xs text-yellow-400/80">Penalty: −{r.rating_penalty} ⭐</span>
                  )}
                </div>

                {/* Reason */}
                <p className="mt-2 text-xs text-zinc-300 line-clamp-2">{r.reason}</p>

                {/* Message preview */}
                {r.message?.message && (
                  <p className="mt-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-cine-muted line-clamp-2 italic">
                    "{r.message.message}"
                  </p>
                )}

                {/* Sender info */}
                {r.sender && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-cine-muted">Sender:</span>
                    <span className="font-medium text-white">{r.sender.nickname}</span>
                    <span className="text-yellow-400">⭐ {r.sender.rating ?? 100}</span>
                    <Badge
                      label={r.sender.status}
                      cls={STATUS_BADGE[r.sender.status] ?? 'bg-white/10 text-zinc-300'}
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === 'pending' && (
                    <>
                      <ActionBtn
                        label="Resolve"
                        loading={acting === r.id}
                        onClick={() => doAction('resolve', r.id, 'resolved')}
                        cls="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30"
                      />
                      <ActionBtn
                        label="Reject & Restore"
                        loading={acting === r.id}
                        onClick={() => doAction('reject', r.id, 'rejected')}
                        cls="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-500/30"
                      />
                    </>
                  )}
                  <ActionBtn
                    label="Delete"
                    loading={acting === r.id}
                    onClick={() => doAction('delete', r.id, 'deleted')}
                    cls="bg-red-500/20 text-red-300 hover:bg-red-500/30 ring-1 ring-red-500/30"
                  />
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* small pill button used in report/user rows */
function ActionBtn({ label, loading, onClick, cls }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-40 ${cls}`}
    >
      {loading ? '…' : label}
    </button>
  )
}

/* ═══════════════════════════════════════════════
   USERS TAB
═══════════════════════════════════════════════ */
function UsersTab({ setGlobalError, setGlobalSuccess }) {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(null) // user id being acted on

  // Inline reason input state: { userId, action }
  const [reasonPrompt, setReasonPrompt] = useState(null)
  const [reasonText, setReasonText]     = useState('')
  const reasonRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminListUsers()
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setGlobalError(getErrorMessage(err, 'Could not load users.'))
    } finally {
      setLoading(false)
    }
  }, [setGlobalError])

  useEffect(() => { load() }, [load])

  // Focus reason input when prompt appears
  useEffect(() => {
    if (reasonPrompt) {
      setTimeout(() => reasonRef.current?.focus(), 80)
    }
  }, [reasonPrompt])

  function openReasonPrompt(userId, action) {
    setReasonText('')
    setReasonPrompt({ userId, action })
  }

  async function submitAction(userId, action) {
    setActing(userId)
    try {
      if (action === 'block')   await adminBlockUser(userId, reasonText.trim())
      if (action === 'ban')     await adminBanUser(userId, reasonText.trim())
      if (action === 'unblock') await adminUnblockUser(userId)
      if (action === 'unban')   await adminUnbanUser(userId)
      setGlobalSuccess(`User ${action}${action.endsWith('e') ? 'd' : 'ned'}.`)
      setReasonPrompt(null)
      await load()
    } catch (err) {
      setGlobalError(getErrorMessage(err, `Could not ${action} user.`))
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-cine-muted">{users.length} users total</p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-full bg-white/5 px-3 py-1 text-xs text-cine-muted transition hover:bg-white/10 disabled:opacity-50"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading users…" />
      ) : users.length === 0 ? (
        <p className="text-sm text-cine-muted">No users found.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((u, i) => (
            <motion.li
              key={u.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.3 }}
            >
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4 backdrop-blur-sm transition hover:border-white/20">
                {/* User identity row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cine-purple/40 to-cine-rose/30 text-xs font-bold text-white">
                      {u.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {u.nickname}
                        <span className="ml-2 text-xs text-yellow-400">⭐ {u.rating ?? 100}</span>
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <Badge
                          label={u.status}
                          cls={STATUS_BADGE[u.status] ?? 'bg-white/10 text-zinc-300'}
                        />
                        <span className="text-xs text-cine-muted">
                          Abuse: <span className="text-zinc-300">{u.abuse_score ?? 0}</span>
                        </span>
                        <span className="text-xs text-zinc-500 capitalize">{u.role}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last admin action reason */}
                {u.lastReason && (
                  <p className="mt-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-cine-muted">
                    <span className="text-zinc-500">Last action: </span>
                    {u.lastReason}
                  </p>
                )}

                {/* Action buttons */}
                {u.role !== 'admin' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {u.status === 'active' && (
                      <>
                        <ActionBtn
                          label="Block"
                          loading={acting === u.id}
                          onClick={() => openReasonPrompt(u.id, 'block')}
                          cls="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-500/30"
                        />
                        <ActionBtn
                          label="Ban"
                          loading={acting === u.id}
                          onClick={() => openReasonPrompt(u.id, 'ban')}
                          cls="bg-red-500/20 text-red-300 hover:bg-red-500/30 ring-1 ring-red-500/30"
                        />
                      </>
                    )}
                    {u.status === 'blocked' && (
                      <>
                        <ActionBtn
                          label="Unblock"
                          loading={acting === u.id}
                          onClick={() => submitAction(u.id, 'unblock')}
                          cls="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30"
                        />
                        <ActionBtn
                          label="Ban"
                          loading={acting === u.id}
                          onClick={() => openReasonPrompt(u.id, 'ban')}
                          cls="bg-red-500/20 text-red-300 hover:bg-red-500/30 ring-1 ring-red-500/30"
                        />
                      </>
                    )}
                    {u.status === 'banned' && (
                      <ActionBtn
                        label="Unban"
                        loading={acting === u.id}
                        onClick={() => submitAction(u.id, 'unban')}
                        cls="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30"
                      />
                    )}
                  </div>
                )}

                {/* Inline reason input (appears after Block/Ban click) */}
                <AnimatePresence>
                  {reasonPrompt?.userId === u.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                        <p className="text-xs text-cine-muted capitalize">
                          Reason for <span className="text-white">{reasonPrompt.action}</span>:
                        </p>
                        <input
                          ref={reasonRef}
                          type="text"
                          value={reasonText}
                          onChange={(e) => setReasonText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && reasonText.trim()) {
                              submitAction(u.id, reasonPrompt.action)
                            }
                            if (e.key === 'Escape') setReasonPrompt(null)
                          }}
                          placeholder={`Why are you ${reasonPrompt.action}ning this user?`}
                          className="w-full rounded-lg border border-white/10 bg-cine-base/60 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-cine-purple/50 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={!reasonText.trim() || acting === u.id}
                            onClick={() => submitAction(u.id, reasonPrompt.action)}
                            className="rounded-full bg-cine-purple/30 px-3 py-1 text-xs font-medium text-white ring-1 ring-cine-purple/50 transition hover:bg-cine-purple/40 disabled:opacity-40"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setReasonPrompt(null)}
                            className="rounded-full bg-white/5 px-3 py-1 text-xs text-cine-muted hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ADMIN PAGE ROOT
═══════════════════════════════════════════════ */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Reports')
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Auto-clear success after 5 s
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(''), 5000)
    return () => clearTimeout(t)
  }, [success])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Admin</h1>
        <p className="mt-1 text-sm text-cine-muted">
          Moderate reports and manage user access with full audit trail.
        </p>
      </div>

      <ErrorBanner   message={error}   onDismiss={() => setError('')} />
      <SuccessAlert  message={success} onDismiss={() => setSuccess('')} />

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl bg-white/5 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-cine-purple/40 text-white shadow ring-1 ring-cine-purple/50'
                : 'text-cine-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <GlassCard className="p-6" hoverLift={false}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <SectionTitle>{activeTab}</SectionTitle>
            <div className="mt-5">
              {activeTab === 'Reports' && (
                <ReportsTab
                  setGlobalError={setError}
                  setGlobalSuccess={setSuccess}
                />
              )}
              {activeTab === 'Users' && (
                <UsersTab
                  setGlobalError={setError}
                  setGlobalSuccess={setSuccess}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </div>
  )
}
