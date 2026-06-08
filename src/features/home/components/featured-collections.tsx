import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getPublicImageUrl } from '@/lib/supabase'
import { cn, formatPrice } from '@/lib/utils'
import { useFeaturedProducts } from '@/features/catalog/hooks/use-featured-products'
import type { ProductRow } from '@/types/product'

// Badge tuned for the dark red poster.
function ConditionBadge({ product }: { product: ProductRow }) {
  if (product.is_graded) {
    return (
      <Badge className="bg-gold text-label-bold uppercase text-on-gold hover:bg-gold">
        {product.grading_company} {product.grade}
      </Badge>
    )
  }
  return (
    <Badge className="border border-white/25 bg-white/10 text-label-bold uppercase text-white hover:bg-white/10">
      {product.product_type === 'single' ? product.condition : 'Sealed'}
    </Badge>
  )
}

function CardArt({ product, className }: { product: ProductRow; className?: string }) {
  const cover = product.image_paths[0]
  if (!cover) {
    return (
      <span className="material-symbols-outlined text-[56px] text-white/30">playing_cards</span>
    )
  }
  return (
    <img
      src={getPublicImageUrl(cover)}
      alt={product.name}
      loading="lazy"
      className={cn('object-contain', className)}
    />
  )
}

// One carousel slide — the bold red poster for a single product.
function FeaturedPoster({ product }: { product: ProductRow }) {
  return (
    <Link
      to={`/card/${product.id}`}
      className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl bg-primary text-on-primary md:min-h-[440px]"
    >
      <div aria-hidden className="absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10" />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-black/10"
      />

      <div className="relative grid flex-1 items-center gap-8 p-8 md:grid-cols-[1.15fr_1fr] md:p-12">
        <div className="flex flex-col items-start gap-5">
          <h3 className="line-clamp-3 text-headline-xl-mobile font-black leading-[0.95] md:text-headline-xl">
            {product.name}
          </h3>
          {product.set_name && (
            <p className="text-body-lg text-on-primary/80">{product.set_name}</p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <ConditionBadge product={product} />
            <p className="text-price-display text-gold">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-headline-md text-primary shadow-lg transition-transform active:translate-y-px">
            Shop this card
            <span className="material-symbols-outlined text-[22px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
        </div>

        <div className="flex items-center justify-center">
          <CardArt
            product={product}
            className="max-h-[240px] w-auto rotate-3 drop-shadow-2xl transition-transform duration-500 group-hover:rotate-0 md:max-h-[340px]"
          />
        </div>
      </div>
    </Link>
  )
}

function FeaturedCarousel({ products }: { products: ProductRow[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const multiple = products.length > 1

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(i, products.length - 1))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
  }

  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    setActive(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div key={p.id} className="w-full shrink-0 snap-center">
            <FeaturedPoster product={p} />
          </div>
        ))}
      </div>

      {multiple && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active === 0}
            aria-label="Previous featured card"
            className="absolute top-1/2 left-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-on-surface shadow-lg transition hover:text-primary disabled:pointer-events-none disabled:opacity-0"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active === products.length - 1}
            aria-label="Next featured card"
            className="absolute top-1/2 right-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-on-surface shadow-lg transition hover:text-primary disabled:pointer-events-none disabled:opacity-0"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="mt-5 flex justify-center gap-2">
            {products.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to featured card ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === active ? 'w-6 bg-primary' : 'w-2 bg-on-surface/20 hover:bg-on-surface/40',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
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

      {isPending ? (
        <Skeleton className="h-[440px] w-full rounded-3xl" />
      ) : (
        <FeaturedCarousel products={products!} />
      )}
    </section>
  )
}
