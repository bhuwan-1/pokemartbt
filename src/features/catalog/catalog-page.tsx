import { useSearchParams } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { STORE_NAME } from '@/lib/config'
import {
  useProducts,
  useProductSets,
  type CatalogFilters,
  type CatalogSort,
} from '@/features/catalog/hooks/use-products'
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
  const { data: products, isPending, isError } = useProducts(filters)
  const { data: sets } = useProductSets()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-label-bold uppercase text-primary">Catalog</p>
        <h1 className="text-headline-xl-mobile md:text-headline-xl text-foreground">
          {STORE_NAME}
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Singles & sealed Pokémon products — order via WhatsApp.
        </p>
      </div>

      <ProductFilters sets={sets ?? []} />

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
