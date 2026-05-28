import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getChat, sendMessage, reportMessage } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { getTokenPayload } from '../utils/auth'
import { GlassCard }     from '../components/GlassCard'
import { GlowButton }    from '../components/GlowButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorBanner }   from '../components/ErrorBanner'

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const TYPE_DOT = {
  compliment: 'bg-cine-purple/60',
  complaint:  'bg-cine-rose/60',
}

/* ─────────────────────────────────────────
   Reply preview bar
───────────────────────────────────────── */
function ReplyBar({ parent, onCancel }) {
  if (!parent) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="flex items-start justify-between gap-3 rounded-xl border border-cine-purple/30 bg-cine-purple/10 px-4 py-2.5 text-xs"
    >
      <div className="min-w-0">
        <p className="text-cine-purple font-medium">
          Replying to {parent.sender?.nickname ?? 'Anonymous'}
        </p>
        <p className="mt-0.5 text-zinc-400 truncate">{parent.message}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 text-zinc-500 hover:text-white transition-colors"
        aria-label="Cancel reply"
      >
        ✕
      </button>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Report modal (inline)
───────────────────────────────────────── */
function ReportModal({ messageId, onClose, onDone }) {
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!reason.trim()) { setErr('Please add a reason.'); return }
    setLoading(true); setErr('')
    try {
      await reportMessage(messageId, reason.trim())
      onDone()
    } catch (error) {
      setErr(getErrorMessage(error, 'Report failed.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-sm p-5">
        <h3 className="text-sm font-semibold text-white">Report message</h3>
        {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
        <form onSubmit={submit} className="mt-3 space-y-3">
          <textarea
            autoFocus
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-cine-purple/50 focus:outline-none"
            placeholder="Describe why this message is inappropriate…"
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

/* ─────────────────────────────────────────
   Single message bubble
───────────────────────────────────────── */
function MessageBubble({ msg, isMine, onReply, onReport, animDelay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: animDelay, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`group max-w-[78%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender label */}
        {!isMine && (
          <p className="px-1 text-xs text-cine-muted">
            {msg.isAnonymous ? 'Anonymous' : (msg.sender?.nickname ?? 'Unknown')}
            {!msg.isAnonymous && msg.sender?.rating != null && (
              <span className="ml-1 text-yellow-400">⭐ {msg.sender.rating}</span>
            )}
          </p>
        )}

        {/* Parent (reply preview) */}
        {msg.parent && (
          <div className={`rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 ${isMine ? 'self-end' : 'self-start'}`}>
            <span className="text-cine-purple font-medium">
              {msg.parent.sender?.nickname ?? 'Anonymous'}:{' '}
            </span>
            <span className="line-clamp-1">{msg.parent.message}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 shadow-md ${
            isMine
              ? 'rounded-br-sm bg-gradient-to-br from-cine-purple/50 to-cine-red/40 text-white'
              : 'rounded-bl-sm bg-cine-card/80 text-zinc-100 border border-white/10'
          }`}
        >
          {/* Type dot */}
          <span className={`absolute -top-1 ${isMine ? '-left-1' : '-right-1'} h-2 w-2 rounded-full ${TYPE_DOT[msg.type] ?? 'bg-white/20'}`} />

          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>

          <p className={`mt-1 text-right text-[10px] ${isMine ? 'text-white/40' : 'text-zinc-500'}`}>
            {fmtTime(msg.createdAt)}
          </p>
        </div>

        {/* Action row — fades in on hover */}
        <div className={`flex gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMine ? 'self-end' : 'self-start'}`}>
          <button
            type="button"
            onClick={() => onReply(msg)}
            className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-400 hover:bg-cine-purple/20 hover:text-cine-purple transition-colors"
          >
            ↩ Reply
          </button>
          {!isMine && (
            <button
              type="button"
              onClick={() => onReport(msg.id)}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-400 hover:bg-cine-rose/20 hover:text-rose-400 transition-colors"
            >
              ⚑ Report
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   Date separator
───────────────────────────────────────── */
function DateSep({ date }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-white/5" />
      <span className="text-[10px] text-zinc-500">{date}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  )
}

/* ─────────────────────────────────────────
   CHAT PAGE
───────────────────────────────────────── */
export default function ChatPage() {
  const { userId }   = useParams()
  const navigate     = useNavigate()
  const otherId      = Number(userId)
  const myId         = getTokenPayload()?.sub ?? getTokenPayload()?.userId

  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [sending, setSending]     = useState(false)

  const [text, setText]           = useState('')
  const [msgType, setMsgType]     = useState('compliment')
  const [anonymous, setAnonymous] = useState(false)

  const [replyTo, setReplyTo]     = useState(null) // full message object
  const [reportId, setReportId]   = useState(null) // message id to report

  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const pollingRef  = useRef(null)

  // Determine the other user's nickname from messages
  const otherUser = messages.find((m) => m.sentByMe === false)
  const otherNick = otherUser
    ? (otherUser.isAnonymous ? 'Anonymous' : (otherUser.sender?.nickname ?? `User ${otherId}`))
    : `User ${otherId}`

  /* ── Load chat ── */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getChat(otherId)
      setMessages(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (err) {
      if (!silent) setError(getErrorMessage(err, 'Could not load messages.'))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [otherId])

  useEffect(() => {
    if (!Number.isInteger(otherId) || otherId < 1) { navigate('/inbox'); return }
    load()
  }, [otherId, load, navigate])

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ── Poll every 8 s for new messages ── */
  useEffect(() => {
    pollingRef.current = setInterval(() => load(true), 8000)
    return () => clearInterval(pollingRef.current)
  }, [load])

  /* ── Send ── */
  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMessage({
        receiver_id:  otherId,
        type:         msgType,
        message:      text.trim(),
        isAnonymous:  anonymous,
        parent_id:    replyTo?.id ?? null,
      })
      setText('')
      setReplyTo(null)
      await load(true)
      inputRef.current?.focus()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send message.'))
    } finally {
      setSending(false)
    }
  }

  /* ── Group messages by date ── */
  const grouped = []
  let lastDate  = null
  for (const m of messages) {
    const d = fmtDate(m.createdAt)
    if (d !== lastDate) { grouped.push({ type: 'date', date: d }); lastDate = d }
    grouped.push({ type: 'msg', msg: m })
  }

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-cine-base/80 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate('/inbox')}
          className="rounded-xl bg-white/5 px-3 py-1.5 text-xs text-cine-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cine-purple/40 to-cine-rose/30 text-xs font-bold text-white">
          {otherNick.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{otherNick}</p>
          <p className="text-[10px] text-cine-muted">Private conversation</p>
        </div>
        <button
          type="button"
          onClick={() => load(false)}
          className="ml-auto rounded-full bg-white/5 px-3 py-1 text-xs text-cine-muted hover:bg-white/10 transition-colors"
        >
          ↻
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <LoadingSpinner label="Loading chat…" />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-cine-muted">No messages yet. Say something!</p>
          </div>
        ) : (
          <>
            {grouped.map((item, i) =>
              item.type === 'date' ? (
                <DateSep key={`d-${i}`} date={item.date} />
              ) : (
                <MessageBubble
                  key={item.msg.id}
                  msg={item.msg}
                  isMine={item.msg.sentByMe}
                  onReply={setReplyTo}
                  onReport={setReportId}
                  animDelay={0}
                />
              )
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      <div className="border-t border-white/10 bg-cine-base/80 px-4 py-3 backdrop-blur-xl space-y-2">
        <AnimatePresence>
          {replyTo && (
            <ReplyBar parent={replyTo} onCancel={() => setReplyTo(null)} />
          )}
        </AnimatePresence>

        <form onSubmit={handleSend} className="flex flex-col gap-2">
          {/* Options row */}
          <div className="flex flex-wrap items-center gap-2">
            {['compliment', 'complaint'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setMsgType(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                  msgType === t
                    ? 'bg-cine-purple/30 text-white ring-1 ring-cine-purple/50'
                    : 'bg-white/5 text-cine-muted hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-400 select-none ml-1">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-white/20 bg-cine-base text-cine-purple focus:ring-cine-purple/40"
              />
              Anonymous
            </label>
          </div>

          {/* Input + send */}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
              }}
              placeholder={replyTo ? 'Write your reply…' : 'Write a message… (Enter to send)'}
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-cine-card/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/30 backdrop-blur-sm"
            />
            <GlowButton
              type="submit"
              variant="primary"
              disabled={sending || !text.trim()}
              className="!px-5 !py-2.5 self-end"
            >
              {sending ? '…' : '↑'}
            </GlowButton>
          </div>
        </form>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {reportId !== null && (
          <ReportModal
            messageId={reportId}
            onClose={() => setReportId(null)}
            onDone={() => { setReportId(null); load(true) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
