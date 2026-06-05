import { Link, useLocation, useSearchParams } from 'react-router'
import { STORE_NAME } from '@/lib/config'
import { cn } from '@/lib/utils'
import { useCart } from '@/features/cart/use-cart'

const NAV_LINKS = [
  { label: 'Home', to: '/', type: null },
  { label: 'Singles', to: '/?type=single', type: 'single' },
  { label: 'Sealed', to: '/?type=sealed', type: 'sealed' },
] as const

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { count } = useCart()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activeType = location.pathname === '/' ? searchParams.get('type') : undefined

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-20 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-10">
        <Link to="/" className="text-headline-md tracking-tight">
          <span className="text-foreground">{STORE_NAME.split(' ')[0]}</span>{' '}
          <span className="text-primary">{STORE_NAME.split(' ').slice(1).join(' ')}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeType === link.type
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

        <button
          type="button"
          onClick={onCartClick}
          className="relative rounded-full p-2 text-foreground transition-colors hover:bg-surface-low hover:text-primary"
          aria-label={`Open cart (${count} items)`}
        >
          <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-1 text-label-bold text-on-primary">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
