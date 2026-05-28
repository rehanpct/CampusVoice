import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlowButton } from './GlowButton'

export function ReportModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close modal"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="report-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md rounded-[20px] border border-white/15 bg-cine-card/95 p-6 shadow-2xl shadow-cine-purple/20 backdrop-blur-xl"
          >
            <h2 id="report-title" className="text-lg font-semibold text-white">
              Report message
            </h2>
            <p className="mt-1 text-sm text-cine-muted">
              Describe why this message should be reviewed. Reports are reviewed
              by moderators.
            </p>
            <textarea
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-cine-base/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-cine-purple/50 focus:outline-none focus:ring-1 focus:ring-cine-purple/40"
              rows={4}
              placeholder="Reason for report…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />
            {error ? (
              <p className="mt-2 text-sm text-cine-rose" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <GlowButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </GlowButton>
              <GlowButton
                type="button"
                variant="primary"
                disabled={loading || reason.trim().length < 3}
                onClick={() => onSubmit(reason.trim())}
              >
                {loading ? 'Sending…' : 'Submit report'}
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
