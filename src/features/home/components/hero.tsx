import { useState } from 'react'
import { Link } from 'react-router'

// Signature dotted backdrop in brand red (design.md §1) — decorative only.
const DOT_PATTERN: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(188 1 0 / 0.08) 1px, transparent 0)',
  backgroundSize: '32px 32px',
}

// Static marketing art (design.md §7: hero art uses object-contain). Drop the file at
// public/hero.png; until then we fall back to a tasteful placeholder rather than a broken image.
const HERO_IMAGE_SRC = '/hero.png'

export function Hero() {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    // -mt-4 cancels the page-bg gap between the fixed 80px header and main's pt-24 (96px),
    // so the full-bleed hero band sits flush beneath the header.
    <section className="relative -mt-4 ml-[calc(50%-50vw)] w-screen overflow-hidden bg-surface-low">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={DOT_PATTERN} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:px-10 md:py-16">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-primary-container px-4 py-1 text-label-bold uppercase text-on-primary">
            Expansion Pack Live
          </span>
          <h1 className="text-headline-xl-mobile md:text-headline-xl max-w-lg text-on-surface">
            Catch the Latest Hits
          </h1>
          <p className="max-w-md text-body-lg text-on-surface-variant">
            Discover ultra-rare pulls, vintage grails, and the hottest new releases. Your ultimate
            TCG destination starts here.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/catalog?sort=newest"
              className="rounded-lg bg-primary px-8 py-4 text-headline-md text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-primary/20 active:translate-y-px"
            >
              Shop New Hits
            </Link>
            <Link
              to="/catalog"
              className="rounded-lg border-2 border-outline px-8 py-4 text-headline-md text-outline transition-colors hover:bg-outline/5"
            >
              View Catalog
            </Link>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
          {imgFailed ? (
            <div className="relative z-10 mx-auto flex aspect-[5/7] w-2/3 items-center justify-center rounded-xl bg-surface-high">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
                playing_cards
              </span>
            </div>
          ) : (
            <img
              src={HERO_IMAGE_SRC}
              alt="Featured Pokémon trading cards"
              onError={() => setImgFailed(true)}
              className="relative z-10 mx-auto h-[420px] w-full object-contain transition-transform duration-500 hover:rotate-2"
            />
          )}
        </div>
      </div>
    </section>
  )
}
