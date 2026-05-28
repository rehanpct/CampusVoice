export function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-cine-purple/30 border-t-cine-rose"
        aria-hidden
      />
      <span className="text-sm text-cine-muted">{label}</span>
    </div>
  )
}
