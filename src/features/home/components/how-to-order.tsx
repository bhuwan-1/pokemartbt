import { buildWhatsappChatLink } from '@/features/whatsapp/build-whatsapp-link'

const STEPS = [
  {
    icon: 'grid_view',
    title: 'Browse the catalog',
    body: 'Find singles, graded slabs, and sealed product from the live inventory.',
  },
  {
    icon: 'chat',
    title: 'Order via WhatsApp',
    body: 'Add to cart and tap "Order via WhatsApp" — your list and total come prefilled. Ask for extra photos anytime.',
  },
  {
    icon: 'local_shipping',
    title: 'Secure shipping',
    body: 'Once payment is confirmed in chat, items ship in protective, top-loader packaging.',
  },
] as const

export function HowToOrder() {
  return (
    <section className="ml-[calc(50%-50vw)] w-screen border-y border-border bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-label-bold uppercase text-primary">How it works</p>
          <h2 className="mt-2 text-headline-lg text-on-surface">Direct collector support</h2>
          <p className="mt-3 text-body-lg text-on-surface-variant">
            Ordering is personal — we use{' '}
            <a
              href={buildWhatsappChatLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              WhatsApp
            </a>{' '}
            so every collector gets high-res photos and safe shipping updates.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="flex flex-col items-center rounded-2xl border border-border bg-panel p-8 text-center shadow-sm transition-colors hover:border-primary/30"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[32px]">{step.icon}</span>
              </div>
              <h3 className="mb-3 text-headline-md text-on-surface">{step.title}</h3>
              <p className="text-body-md text-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>

        {/* <div className="mt-12 flex justify-center">
          <a
            href={buildWhatsappChatLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg bg-whatsapp px-8 py-4 text-headline-md text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <WhatsAppIcon className="size-6" />
            Start a chat on WhatsApp
          </a>
        </div> */}
      </div>
    </section>
  )
}
