import { useEffect, useState } from 'react'
import { sendMessage, reportMessage } from '../services/api'
import { getErrorMessage } from '../utils/errors'
import { GlassCard } from '../components/GlassCard'
import { GlowButton } from '../components/GlowButton'
import { ReportModal } from '../components/ReportModal'
import { ErrorBanner } from '../components/ErrorBanner'
import { SuccessAlert } from '../components/SuccessAlert'

export default function Dashboard() {
  const [receiverInput, setReceiverInput] = useState('')
  const [messageBody, setMessageBody]     = useState('')
  const [msgType, setMsgType]             = useState('compliment')
  const [anonymous, setAnonymous]         = useState(true)
  const [loadingSend, setLoadingSend]     = useState(false)
  const [error, setError]                 = useState('')
  const [sendOk, setSendOk]               = useState('')

  const [reportOpen, setReportOpen]         = useState(false)
  const [reportTargetId, setReportTargetId] = useState(null)
  const [reportLoading, setReportLoading]   = useState(false)
  const [reportError, setReportError]       = useState('')

  useEffect(() => {
    if (!sendOk) return
    const t = setTimeout(() => setSendOk(''), 5000)
    return () => clearTimeout(t)
  }, [sendOk])

  async function handleSend(e) {
    e.preventDefault()
    setSendOk('')
    setError('')
    const input = receiverInput.trim()
    if (!input) {
      setError('Enter a college ID or email to send to.')
      return
    }
    if (!messageBody.trim()) {
      setError('Message cannot be empty.')
      return
    }
    const payload = {
      type: msgType,
      message: messageBody.trim(),
      isAnonymous: anonymous,
    }
    if (input.includes('@')) {
      payload.receiver_email = input.toLowerCase()
    } else {
      payload.receiver_college_id = input
    }
    setLoadingSend(true)
    try {
      await sendMessage(payload)
      setSendOk('Message sent successfully.')
      setMessageBody('')
      setReceiverInput('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send message.'))
    } finally {
      setLoadingSend(false)
    }
  }

  async function submitReport(reason) {
    if (reportTargetId == null) return
    setReportLoading(true)
    setReportError('')
    try {
      await reportMessage(reportTargetId, reason)
      setReportOpen(false)
      setSendOk('Report submitted. Thank you for helping keep the community safe.')
    } catch (err) {
      setReportError(getErrorMessage(err, 'Could not submit report.'))
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-cine-muted">
          Send a compliment or complaint to anyone on campus.
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={sendOk} onDismiss={() => setSendOk('')} />

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white">Send message</h2>
        <p className="mt-1 text-xs text-cine-muted">
          Enter a college ID or email address. Blocked accounts cannot send.
        </p>
        <form onSubmit={handleSend} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-cine-muted" htmlFor="recv">
              Receiver (college ID or email)
            </label>
            <input
              id="recv"
              type="text"
              className="mt-1 w-full rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              placeholder="College ID or email address"
              value={receiverInput}
              onChange={(e) => setReceiverInput(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-cine-muted" htmlFor="body">
              Message
            </label>
            <textarea
              id="body"
              rows={4}
              className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-cine-base/60 px-3 py-2 text-sm text-white focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              placeholder="Write something honest and kind…"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="rounded border-white/20 bg-cine-base text-cine-purple focus:ring-cine-purple/40"
              />
              Send anonymously
            </label>
            <div className="flex gap-2">
              {['compliment', 'complaint'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMsgType(t)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize ${
                    msgType === t
                      ? 'bg-cine-purple/30 text-white ring-1 ring-cine-purple/50'
                      : 'bg-white/5 text-cine-muted hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <GlowButton type="submit" variant="primary" disabled={loadingSend}>
            {loadingSend ? 'Sending…' : 'Send'}
          </GlowButton>
        </form>
      </GlassCard>

      <ReportModal
        key={reportOpen ? String(reportTargetId) : 'closed'}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
        loading={reportLoading}
        error={reportError}
      />
    </div>
  )
}
