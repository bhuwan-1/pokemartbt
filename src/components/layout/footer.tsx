import { Link } from 'react-router'
import { STORE_NAME } from '@/lib/config'
import { WhatsAppIcon } from '@/components/whatsapp-icon'
import { buildWhatsappChatLink } from '@/features/whatsapp/build-whatsapp-link'

// ── Footer background ────────────────────────────────────────────────
// Change this single value to restyle the footer (any CSS color string).
// Text below is tuned for a dark background.
const FOOTER_BG = '#0a0a0a'

const SHOP_LINKS = [
  { label: 'Catalog', to: '/catalog' },
  { label: 'Singles', to: '/catalog?type=single' },
  { label: 'Sealed', to: '/catalog?type=sealed' },
] as const

const linkClass = 'text-body-sm text-white/70 transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: FOOTER_BG }}>
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-28 md:px-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-headline-md font-black tracking-tighter text-primary-container">
              {STORE_NAME}
            </span>
            <p className="mt-4 text-body-sm text-white/60">
              Singles & sealed Pokémon products — vetted and shipped with care. Orders are confirmed
              over WhatsApp.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-4 text-label-bold uppercase text-white">Shop</h4>
            <ul className="flex flex-col gap-2">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-label-bold uppercase text-white">Support</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={buildWhatsappChatLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  WhatsApp Contact
                </a>
              </li>
              <li>
                <Link to="/admin/login" className={linkClass}>
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Get in touch (replaces the newsletter — single-seller WhatsApp handoff) */}
          <div>
            <h4 className="mb-4 text-label-bold uppercase text-white">Get in touch</h4>
            <p className="mb-4 text-body-sm text-white/60">
              Questions or ready to order? Message us on WhatsApp.
            </p>
            <a
              href={buildWhatsappChatLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-5 py-2.5 text-body-sm font-bold text-white transition-transform hover:scale-[1.02] active:translate-y-px"
            >
              <WhatsAppIcon className="size-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="mx-auto max-w-3xl text-body-sm leading-relaxed text-white/40">
            © {new Date().getFullYear()} {STORE_NAME}. Pokémon and Pokémon Trading Card Game are
            trademarks of Nintendo.
          </p>
        </div>
      </div>
    </footer>
  )
}
