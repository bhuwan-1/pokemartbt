import { Link } from 'react-router'

export function HomeCta() {
  return (
    <section className="relative overflow-hidden rounded-4xl bg-primary px-8 py-16 text-center md:px-20 md:py-20">
      <div aria-hidden className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/10" />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-black/10"
      />
      <h2 className="relative z-10 text-headline-xl-mobile md:text-headline-xl text-on-primary">
        Ready to complete your deck?
      </h2>
      <p className="relative z-10 mx-auto mt-6 max-w-xl text-body-lg text-on-primary/90">
        New singles and sealed product land regularly. Browse the full catalog and grab the pulls
        you've been chasing.
      </p>
      <div className="relative z-10 mt-10 flex justify-center">
        <Link
          to="/catalog"
          className="rounded-lg bg-white px-8 py-4 text-headline-md text-primary shadow-md transition-colors hover:bg-gold hover:text-on-gold"
        >
          Browse catalog
        </Link>
      </div>
    </section>
  )
}
