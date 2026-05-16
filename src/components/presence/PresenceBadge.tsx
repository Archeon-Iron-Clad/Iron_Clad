type Props = {
  label: string
}

/** Compact status chip for live presence (expand in Phase 3). */
export function PresenceBadge({ label }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
      {label}
    </span>
  )
}
