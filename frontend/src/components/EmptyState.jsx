export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-cine-card/30 px-6 py-14 text-center">
      <p className="text-base font-medium text-zinc-200">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-cine-muted">{description}</p>
      ) : null}
    </div>
  )
}
