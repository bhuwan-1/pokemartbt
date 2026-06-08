// Catalog hero banner. We have no "collections" concept (single-seller, flat catalog),
// so the banner reflects the active type filter instead of a set/collection.
const COPY = {
  all: {
    title: 'Browse the Catalog',
    desc: 'Every single and sealed Pokémon product in stock — reserve any card over WhatsApp.',
    tag: 'Live inventory',
  },
  single: {
    title: 'Single Cards',
    desc: 'Raw and graded singles, conditions from Near Mint to played — ready to ship.',
    tag: 'Singles',
  },
  sealed: {
    title: 'Sealed Product',
    desc: 'Booster boxes, elite trainer boxes and more — factory sealed and order-ready.',
    tag: 'Sealed',
  },
} as const

// White-dot texture on the dark banner — decorative only.
const DOT_PATTERN: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.06) 1px, transparent 0)',
  backgroundSize: '28px 28px',
}

export function CatalogBanner({ type }: { type?: 'single' | 'sealed' }) {
  const copy = COPY[type ?? 'all']

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-on-surface to-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={DOT_PATTERN} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl"
      />

      <div className="relative px-6 py-12 md:px-12 md:py-16">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gold px-3 py-1 text-label-bold uppercase text-on-gold">
            Pokémon TCG
          </span>
          <span className="rounded-full bg-primary-container px-3 py-1 text-label-bold uppercase text-on-primary">
            {copy.tag}
          </span>
        </div>
        <h1 className="mt-5 text-headline-xl-mobile font-black md:text-headline-xl">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-xl text-body-lg text-white/70">{copy.desc}</p>
      </div>
    </section>
  )
}
