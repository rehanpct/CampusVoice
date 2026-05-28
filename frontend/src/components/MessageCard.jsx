import { motion } from 'framer-motion'
import { formatRelativeTime } from '../utils/formatDate'
import { GlowButton } from './GlowButton'

export function MessageCard({
  messageId,
  message,
  senderLabel,
  isAnonymous = false,
  createdAt,
  type,
  onReport,
  likes = 0,
  loves = 0,
  onToggleLike,
  onToggleLove,
}) {
  const time = formatRelativeTime(createdAt)
  const fromLabel = isAnonymous ? 'Anonymous' : senderLabel

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="rounded-[18px] bg-gradient-to-br from-cine-purple/50 via-cine-rose/30 to-cine-purple/50 p-px opacity-60 transition-opacity duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_24px_rgba(155,93,229,0.25)]">
        <div className="rounded-2xl border border-white/10 bg-cine-card/85 p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                type === 'complaint'
                  ? 'bg-cine-red/30 text-rose-200'
                  : 'bg-cine-purple/25 text-purple-200'
              }`}
            >
              {type === 'complaint' ? 'Complaint' : 'Compliment'}
            </span>
            <span className="text-cine-muted">{time}</span>
          </div>
          <p className="text-[15px] leading-relaxed text-zinc-100">{message}</p>
          <p className="mt-3 text-sm text-cine-muted">
            From{' '}
            <span className="font-medium text-zinc-300">{fromLabel}</span>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onToggleLike}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-cine-purple/40 hover:bg-cine-purple/10"
            >
              Like {likes > 0 ? `· ${likes}` : ''}
            </button>
            <button
              type="button"
              onClick={onToggleLove}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-cine-rose/40 hover:bg-cine-rose/10"
            >
              Love {loves > 0 ? `· ${loves}` : ''}
            </button>
            {typeof messageId === 'number' ? (
              <GlowButton
                type="button"
                variant="ghost"
                className="!px-3 !py-1.5 !text-xs"
                onClick={() => onReport?.(messageId)}
              >
                Report
              </GlowButton>
            ) : (
              <span className="text-xs text-cine-muted/80" title="Preview">
                Report unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
