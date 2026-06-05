import { STORE_NAME, WHATSAPP_NUMBER } from '@/lib/config'

export type CartLine = {
  name: string
  set_name?: string | null
  condition: string
  grade?: number | null
  price: number
  currency: string
  qty: number
}

// Very large carts can exceed practical URL limits and get truncated (SPEC §10.4).
const MAX_MESSAGE_CHARS = 1500

export function buildWhatsappMessage(lines: CartLine[]): string {
  const body = lines
    .map((l) => {
      const grade = l.grade ? ` (Graded ${l.grade})` : ''
      const set = l.set_name ? ` — ${l.set_name}` : ''
      return `• ${l.qty}× ${l.name}${set} [${l.condition}]${grade} — ${l.currency} ${l.price.toFixed(2)}`
    })
    .join('\n')

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const currency = lines[0]?.currency ?? ''
  const totalLine = `Total: ${currency} ${total.toFixed(2)}`

  const full = `Hi! I'd like to order from ${STORE_NAME}:\n\n${body}\n\n${totalLine}`
  if (full.length <= MAX_MESSAGE_CHARS) return full

  // Summarized fallback: item count + total + a note to discuss details in chat.
  const itemCount = lines.reduce((s, l) => s + l.qty, 0)
  return `Hi! I'd like to order ${itemCount} items from ${STORE_NAME}.\n\n${totalLine}\n\n(The cart is too large to list here — I'll share the details in chat.)`
}

export function buildWhatsappLink(lines: CartLine[]): string {
  const message = buildWhatsappMessage(lines)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
