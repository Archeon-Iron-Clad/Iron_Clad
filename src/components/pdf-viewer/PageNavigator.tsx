import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'

type Props = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function PageNavigator({ page, totalPages, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-600">
      <Button
        variant="ghost"
        className="size-8 p-0"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[5rem] text-center tabular-nums">
        {page} / {totalPages || '—'}
      </span>
      <Button
        variant="ghost"
        className="size-8 p-0"
        disabled={totalPages === 0 || page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
