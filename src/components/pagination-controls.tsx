import { cn } from '@/lib/utils'

// Windowed page list: first, last, current ±1, with ellipses between.
function buildPages(page: number, pageCount: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = []
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  pages.push(1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < pageCount - 1) pages.push('ellipsis')
  if (pageCount > 1) pages.push(pageCount)
  return pages
}

const arrowClass =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-on-surface transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-on-surface'

export function PaginationControls({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  if (pageCount <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className={arrowClass}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {buildPages(page, pageCount).map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-on-surface-variant">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-9 min-w-9 rounded-lg px-3 text-body-md font-bold transition-colors',
              p === page
                ? 'bg-primary text-on-primary'
                : 'border border-border text-on-surface hover:border-primary hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={arrowClass}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </nav>
  )
}
