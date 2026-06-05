import { useSyncExternalStore } from 'react'
import {
  addToCart,
  clearCart,
  getCartSnapshot,
  removeFromCart,
  setCartQty,
  subscribe,
} from '@/features/cart/cart-store'

export function useCart() {
  const items = useSyncExternalStore(subscribe, getCartSnapshot)

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  return {
    items,
    count,
    total,
    addToCart,
    removeFromCart,
    setCartQty,
    clearCart,
  }
}
