import type { ProductRow } from '@/types/product'
import { effectivePrice } from '@/lib/pricing'

// Client-only cart: lives entirely in localStorage by design (SPEC §10.3).
// No server persistence — the order itself happens in WhatsApp.

export type CartItem = {
  id: string
  name: string
  set_name: string | null
  condition: string
  grade: number | null
  price: number
  currency: string
  qty: number
  maxQty: number // available stock at add time; cart qty is capped to this
  image: string | null // cover storage path (image_paths[0]); URL derived at render
}

// v2: added maxQty (stock cap) + image (cover path) to CartItem; bump clears stale v1 carts.
const STORAGE_KEY = 'pokemartbt.cart.v2'

type Listener = () => void

let listeners: Listener[] = []
let snapshot: CartItem[] = load()

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

function commit(next: CartItem[]) {
  snapshot = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full/unavailable — keep the in-memory cart working.
  }
  for (const l of listeners) l()
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function getCartSnapshot(): CartItem[] {
  return snapshot
}

export function addToCart(product: ProductRow, qty = 1) {
  const existing = snapshot.find((i) => i.id === product.id)
  if (existing) {
    commit(
      snapshot.map((i) =>
        i.id === product.id
          ? { ...i, qty: Math.min(i.qty + qty, product.quantity), maxQty: product.quantity }
          : i,
      ),
    )
    return
  }
  commit([
    ...snapshot,
    {
      id: product.id,
      name: product.name,
      set_name: product.set_name,
      condition: product.condition,
      grade: product.grade,
      // Store the discounted unit price so cart totals and the WhatsApp message
      // reflect what the customer actually pays.
      price: effectivePrice(product),
      currency: product.currency,
      qty: Math.min(qty, product.quantity),
      maxQty: product.quantity,
      image: product.image_paths[0] ?? null,
    },
  ])
}

export function removeFromCart(id: string) {
  commit(snapshot.filter((i) => i.id !== id))
}

export function setCartQty(id: string, qty: number) {
  if (qty < 1) {
    removeFromCart(id)
    return
  }
  // Never exceed available stock (maxQty); `?? qty` keeps any pre-existing items safe.
  commit(snapshot.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.maxQty ?? qty) } : i)))
}

export function clearCart() {
  commit([])
}

// Cross-tab sync: another tab wrote the cart — refresh our snapshot.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    snapshot = load()
    for (const l of listeners) l()
  }
})
