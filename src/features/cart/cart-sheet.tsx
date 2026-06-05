import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/features/cart/use-cart'
import { buildWhatsappLink } from '@/features/whatsapp/build-whatsapp-link'
import { formatPrice } from '@/lib/utils'

type CartSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, count, total, setCartQty, removeFromCart, clearCart } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-headline-md">Your Cart</SheetTitle>
          <SheetDescription>
            {count === 0 ? 'Nothing here yet.' : `${count} item${count === 1 ? '' : 's'}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
              shopping_cart
            </span>
            <p className="text-body-md text-on-surface-variant">
              Browse the catalog and add cards to get started.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-panel p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body-md font-bold text-foreground">{item.name}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {[item.set_name, item.condition, item.grade ? `Grade ${item.grade}` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-on-surface-variant transition-colors hover:text-error"
                      aria-label={`Remove ${item.name}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setCartQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-body-md font-bold">{item.qty}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setCartQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-body-md font-extrabold text-foreground">
                      {formatPrice(item.price * item.qty, item.currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter className="gap-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface-variant">Total</span>
                <span className="text-price-display text-foreground">{formatPrice(total)}</span>
              </div>
              <a
                href={buildWhatsappLink(items)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-body-md font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:translate-y-px"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Order via WhatsApp
              </a>
              <Button variant="ghost" onClick={clearCart} className="text-on-surface-variant">
                Clear cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
