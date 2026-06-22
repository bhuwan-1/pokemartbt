// Discount math lives in one place. `price` on a product row is always the original;
// the discounted price is derived at render (like image URLs) — never persisted, so it
// can't drift. A product is "on sale" exactly when discount_percent > 0.

type Discountable = { price: number; discount_percent: number }

export function isOnSale(p: Discountable): boolean {
  return p.discount_percent > 0
}

/** Final price after applying the percentage discount, rounded to 2 decimals. */
export function discountedPrice(price: number, discountPercent: number): number {
  if (!discountPercent || discountPercent <= 0) return price
  const final = price * (1 - discountPercent / 100)
  return Math.round(final * 100) / 100
}

/** Convenience: the price a customer actually pays for this product. */
export function effectivePrice(p: Discountable): number {
  return discountedPrice(p.price, p.discount_percent)
}
