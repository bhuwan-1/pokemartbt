import { STORE_NAME } from '@/lib/config'

export function Footer() {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-center md:px-10">
        <p className="text-body-md font-bold text-foreground">{STORE_NAME}</p>
        <p className="text-body-sm text-on-surface-variant">
          Singles & sealed Pokémon products. Orders are confirmed over WhatsApp.
        </p>
        <p className="text-body-sm text-on-surface-variant">
          © {new Date().getFullYear()} {STORE_NAME}
        </p>
      </div>
    </footer>
  )
}
