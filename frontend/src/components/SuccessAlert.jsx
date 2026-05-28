export function SuccessAlert({ message, onDismiss }) {
  if (!message) return null
  return (
    <div
      className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100"
      role="status"
    >
      <span>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2 py-0.5 text-cine-muted hover:text-white"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  )
}
