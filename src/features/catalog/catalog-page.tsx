import { useSearchParams } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useProducts,
  useProductSets,
  type CatalogFilters,
  type CatalogSort,
} from '@/features/catalog/hooks/use-products'
import { CatalogBanner } from '@/features/catalog/components/catalog-banner'
import { ProductCard } from '@/features/catalog/components/product-card'
import { ProductFilters } from '@/features/catalog/components/product-filters'

function parseFilters(params: URLSearchParams): CatalogFilters {
  const type = params.get('type')
  const sort = params.get('sort')
  const min = Number(params.get('min'))
  const max = Number(params.get('max'))
  return {
    type: type === 'single' || type === 'sealed' ? type : undefined,
    set: params.get('set') ?? undefined,
    condition: params.get('condition') ?? undefined,
    graded: params.get('graded') === 'true' || undefined,
    minPrice: params.get('min') && Number.isFinite(min) ? min : undefined,
    maxPrice: params.get('max') && Number.isFinite(max) ? max : undefined,
    sort: (['newest', 'price-asc', 'price-desc'] as CatalogSort[]).includes(sort as CatalogSort)
      ? (sort as CatalogSort)
      : 'newest',
  }
}

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const filters = parseFilters(searchParams)
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useProducts(filters)
  const { data: sets } = useProductSets()

  const products = data?.pages.flatMap((p) => p.items) ?? []
  const total = data?.pages[0]?.count ?? 0

  return (
    <div className="space-y-6">
      <CatalogBanner type={filters.type} />

      <ProductFilters sets={sets ?? []} />

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[5/7] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-panel p-10 text-center">
          <p className="text-body-md text-on-surface-variant">
            Couldn't load the catalog. Please try again in a moment.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
            search_off
          </span>
          <p className="mt-2 text-body-md font-bold text-foreground">No cards match</p>
          <p className="text-body-sm text-on-surface-variant">
            Try clearing a filter or check back soon — inventory changes often.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-body-sm text-on-surface-variant">
              Showing {products.length} of {total}
            </p>
            {hasNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-lg border-2 border-outline/30 px-8 py-3 text-label-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
