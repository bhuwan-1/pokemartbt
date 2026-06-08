import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import { useProduct } from '@/features/catalog/hooks/use-product'
import { ProductGallery } from '@/features/catalog/components/product-gallery'
import { useCart } from '@/features/cart/use-cart'
import { buildWhatsappLink } from '@/features/whatsapp/build-whatsapp-link'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import type { ProductRow } from '@/types/product'

function AttributeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <dt className="text-body-sm text-on-surface-variant">{label}</dt>
      <dd className="text-body-sm font-bold text-foreground">{value}</dd>
    </div>
  )
}

function singleItemLink(product: ProductRow) {
  return buildWhatsappLink([
    {
      name: product.name,
      set_name: product.set_name,
      condition: product.condition,
      grade: product.grade,
      price: product.price,
      currency: product.currency,
      qty: 1,
    },
  ])
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isPending, isError } = useProduct(id)
  const { items, addToCart } = useCart()

  if (isPending) {
    return (
      <div className="grid gap-8 md:grid-cols-[320px_1fr] md:items-start md:gap-12">
        <Skeleton className="mx-auto aspect-[5/7] w-full max-w-[300px] rounded-2xl md:mx-0 md:max-w-none" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="rounded-2xl border border-border bg-panel p-10 text-center">
        <p className="text-headline-md text-foreground">Card not found</p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          It may have been sold or removed.
        </p>
        <Button asChild className="mt-4">
          <Link to="/catalog">Back to catalog</Link>
        </Button>
      </div>
    )
  }

  const isSingle = product.product_type === 'single'
  const soldOut = product.quantity === 0
  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0
  const atMax = !soldOut && inCart >= product.quantity

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-body-md font-bold text-on-surface-variant transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back
      </button>

      <div className="grid gap-8 md:grid-cols-[320px_1fr] md:items-start md:gap-12">
        <div className="mx-auto w-full max-w-[300px] md:mx-0 md:max-w-none">
          <ProductGallery paths={product.image_paths} name={product.name} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-label-bold uppercase text-primary">
              {isSingle ? 'Individual Card' : 'Sealed Set'}
            </p>
            <h1 className="text-headline-lg text-foreground">{product.name}</h1>
            {product.set_name && (
              <p className="text-body-lg text-on-surface-variant">{product.set_name}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-label-bold uppercase">
                {isSingle ? product.condition : 'Sealed'}
              </Badge>
              {product.is_graded && (
                <Badge className="bg-gold text-label-bold uppercase text-on-gold hover:bg-gold">
                  {product.grading_company} {product.grade}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-price-display text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {soldOut ? (
              <span
                aria-disabled="true"
                className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 py-3 text-body-md font-bold text-white opacity-50 shadow-md"
              >
                <WhatsAppIcon className="size-5" />
                Order via WhatsApp
              </span>
            ) : (
              <a
                href={singleItemLink(product)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-6 py-3 text-body-md font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:translate-y-px"
              >
                <WhatsAppIcon className="size-5" />
                Order via WhatsApp
              </a>
            )}
            <button
              type="button"
              disabled={soldOut || atMax}
              onClick={() => {
                addToCart(product)
                toast.success('Added to cart', { description: product.name })
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-body-md font-bold text-on-primary shadow-md transition-transform hover:scale-[1.02] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              {soldOut ? 'Sold out' : atMax ? 'Max in cart' : 'Add to cart'}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-panel p-5 shadow-sm">
            <p className="mb-2 text-label-bold uppercase text-primary">Details</p>
            <dl>
              <AttributeRow label="Type" value={isSingle ? 'Individual Card' : 'Sealed Set'} />
              {product.set_name && <AttributeRow label="Set" value={product.set_name} />}
              {isSingle && product.card_number && (
                <AttributeRow label="Card number" value={product.card_number} />
              )}
              {isSingle && product.rarity && <AttributeRow label="Rarity" value={product.rarity} />}
              <AttributeRow label="Condition" value={product.condition} />
              {product.is_graded && (
                <AttributeRow label="Grade" value={`${product.grading_company} ${product.grade}`} />
              )}
              <AttributeRow label="Language" value={product.language} />
              <AttributeRow label="Quantity available" value={String(product.quantity)} />
            </dl>
          </div>

          {product.description && (
            <div className="rounded-2xl border border-border bg-panel p-5 shadow-sm">
              <p className="mb-2 text-label-bold uppercase text-primary">Notes</p>
              <p className="whitespace-pre-wrap text-body-md text-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
