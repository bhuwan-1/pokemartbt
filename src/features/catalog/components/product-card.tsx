import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { getPublicImageUrl } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { ProductRow } from '@/types/product'

export function ProductCard({ product }: { product: ProductRow }) {
  const cover = product.image_paths[0]

  return (
    <Link
      to={`/card/${product.id}`}
      className="holo-sweep card-lift block overflow-hidden rounded-xl bg-surface-high"
    >
      <div className="aspect-[5/7] w-full overflow-hidden bg-surface-low">
        {cover ? (
          <img
            src={getPublicImageUrl(cover)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
              playing_cards
            </span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="line-clamp-2 text-body-md font-bold text-foreground">{product.name}</p>
        {product.set_name && (
          <p className="line-clamp-1 text-body-sm text-on-surface-variant">{product.set_name}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-label-bold uppercase">
            {product.product_type === 'single' ? product.condition : 'Sealed'}
          </Badge>
          {product.is_graded && (
            <Badge className="bg-gold text-label-bold uppercase text-on-gold hover:bg-gold">
              {product.grading_company} {product.grade}
            </Badge>
          )}
        </div>
        <p className="text-price-display text-foreground">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  )
}
