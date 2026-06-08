import { Link, useLocation, useSearchParams } from 'react-router'
import { STORE_NAME } from '@/lib/config'
import { cn } from '@/lib/utils'
import { useCart } from '@/features/cart/use-cart'

const NAV_LINKS = [
  { label: 'Home', to: '/', match: 'home' },
  { label: 'Catalog', to: '/catalog', match: 'catalog' },
  { label: 'Singles', to: '/catalog?type=single', match: 'single' },
  { label: 'Sealed', to: '/catalog?type=sealed', match: 'sealed' },
] as const

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { count } = useCart()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const onCatalog = location.pathname === '/catalog'
  const catalogType = onCatalog ? searchParams.get('type') : null
  const active: (typeof NAV_LINKS)[number]['match'] =
    location.pathname === '/'
      ? 'home'
      : onCatalog && catalogType === 'single'
        ? 'single'
        : onCatalog && catalogType === 'sealed'
          ? 'sealed'
          : onCatalog
            ? 'catalog'
            : 'home'

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-10">
        <Link to="/" className="text-headline-md font-black tracking-tighter text-primary">
          {STORE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.match
            return (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'text-body-md font-bold pb-1 border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCartClick}
            className="relative rounded-full p-2 text-foreground transition-colors  hover:text-primary"
            aria-label={`Open cart (${count} items)`}
          >
            <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 text-label-bold text-on-primary">
                {count}
              </span>
            )}
          </button>
          {/* Admin login entry point (CLAUDE.md rule 4 deviation — intentional, per request). */}
          <Link
            to="/admin/login"
            className="rounded-full p-2 text-foreground transition-colors hover:text-primary"
            aria-label="Admin login"
          >
            <span className="material-symbols-outlined text-[28px]">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
