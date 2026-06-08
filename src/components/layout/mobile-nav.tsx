import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/utils'
import { useCart } from '@/features/cart/use-cart'

const ITEMS = [
  { label: 'Home', icon: 'home', to: '/', match: 'home' },
  { label: 'Shop', icon: 'storefront', to: '/catalog', match: 'catalog' },
] as const

// Customer-facing nav only — no Admin destination here (CLAUDE.md rule 4).
export function MobileNav({ onCartClick }: { onCartClick: () => void }) {
  const { count } = useCart()
  const location = useLocation()
  const active = location.pathname.startsWith('/catalog')
    ? 'catalog'
    : location.pathname === '/'
      ? 'home'
      : ''

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-xl border-t border-border bg-background/95 shadow-[0_-4px_12px_rgb(0_0_0/0.06)] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-3">
        {ITEMS.map((item) => {
          const isActive = active === item.match
          return (
            <Link key={item.label} to={item.to} className="flex flex-col items-center gap-1 py-2.5">
              <span
                className={cn(
                  'material-symbols-outlined rounded-full px-4 py-0.5 text-[22px]',
                  isActive ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant',
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  'text-label-bold uppercase',
                  isActive ? 'text-primary' : 'text-on-surface-variant',
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
        <button
          type="button"
          onClick={onCartClick}
          className="relative flex flex-col items-center gap-1 py-2.5"
          aria-label={`Open cart (${count} items)`}
        >
          <span className="material-symbols-outlined relative px-4 py-0.5 text-[22px] text-on-surface-variant">
            shopping_cart
            {count > 0 && (
              <span className="absolute -top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 font-sans text-[10px] font-bold text-on-primary">
                {count}
              </span>
            )}
          </span>
          <span className="text-label-bold uppercase text-on-surface-variant">Cart</span>
        </button>
      </div>
    </nav>
  )
}
