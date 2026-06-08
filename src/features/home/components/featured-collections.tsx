import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicImageUrl } from '@/lib/supabase'
import { cn, formatPrice } from '@/lib/utils'
import { useFeaturedProducts } from '@/features/catalog/hooks/use-featured-products'
import type { ProductRow } from '@/types/product'

function FeaturedTile({ product, large }: { product: ProductRow; large?: boolean }) {
  const cover = product.image_paths[0]
  return (
    <Link
      to={`/card/${product.id}`}
      className={cn(
        'holo-sweep card-lift group relative block overflow-hidden rounded-xl bg-surface-high',
        large ? 'md:col-span-2 md:row-span-2 min-h-[260px] md:min-h-[420px]' : 'min-h-[260px]',
      )}
    >
      {cover ? (
        <img
          src={getPublicImageUrl(cover)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
            playing_cards
          </span>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-5">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {product.is_graded ? (
            <Badge className="bg-gold text-label-bold uppercase text-on-gold hover:bg-gold">
              {product.grading_company} {product.grade}
            </Badge>
          ) : (
            <Badge className="bg-primary-container text-label-bold uppercase text-on-primary hover:bg-primary-container">
              {product.product_type === 'single' ? product.condition : 'Sealed'}
            </Badge>
          )}
        </div>
        <h3 className={cn('text-white', large ? 'text-headline-lg' : 'text-headline-md')}>
          {product.name}
        </h3>
        <p className="mt-1 text-body-md font-extrabold text-white/90">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  )
}

export function FeaturedCollections() {
  const { data: products, isPending } = useFeaturedProducts()

  // Nothing featured yet → hide the whole section (no empty-state clutter on the home page).
  if (!isPending && (!products || products.length === 0)) return null

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-label-bold uppercase text-primary">Featured</p>
          <h2 className="text-headline-lg text-on-surface">Featured Collections</h2>
          <p className="text-body-md text-on-surface-variant">
            Hand-picked highlights from the current inventory.
          </p>
        </div>
        <Link
          to="/catalog"
          className="group flex items-center gap-1 text-body-md font-bold text-primary"
        >
          Explore all
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:gap-6">
        {isPending
          ? Array.from({ length: 5 }, (_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  'min-h-[260px] rounded-xl',
                  i === 0 && 'md:col-span-2 md:row-span-2 md:min-h-[420px]',
                )}
              />
            ))
          : products!.map((p, i) => <FeaturedTile key={p.id} product={p} large={i === 0} />)}
      </div>
    </section>
  )
}
