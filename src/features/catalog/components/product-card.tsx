import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { getPublicImageUrl } from '@/lib/supabase'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductRow } from '@/types/product'

// Stock status uses on-brand tokens: whatsapp-green (in stock), gold (low), error-red (out).
function stockStatus(quantity: number) {
  if (quantity === 0) return { label: 'Sold out', dot: 'bg-error' }
  if (quantity <= 3) return { label: 'Low stock', dot: 'bg-gold' }
  return { label: 'In stock', dot: 'bg-whatsapp' }
}

export function ProductCard({ product }: { product: ProductRow }) {
  const cover = product.image_paths[0]
  const status = stockStatus(product.quantity)
  const subtitle = product.card_number ?? product.set_name ?? null

  return (
    <Link
      to={`/card/${product.id}`}
      className="card-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-sm"
    >
      {/* Card art contained on a tinted pedestal — the whole card shows, never cropped. */}
      <div className="holo-sweep relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-b from-surface-low to-surface-high p-5">
        {cover ? (
          <img
            src={getPublicImageUrl(cover)}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain drop-shadow-xl"
          />
        ) : (
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
            playing_cards
          </span>
        )}
        <div className="absolute top-3 right-3">
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
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col items-center gap-1.5 px-4 py-4 text-center">
        {subtitle && (
          <p className="line-clamp-1 text-[11px] tracking-wide text-on-surface-variant">
            {subtitle}
          </p>
        )}
        <h3 className="line-clamp-2 text-body-md font-bold text-on-surface">{product.name}</h3>
        <p className="text-body-lg font-extrabold text-primary">
          {formatPrice(product.price, product.currency)}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', status.dot)} />
          <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
            {status.label}
          </span>
        </div>
      </div>
    </Link>
  )
}
