// Single source for store identity & env-driven config.
// Branding is undecided (trademark review pending) — never hardcode the name elsewhere.
export const STORE_NAME = 'PokéMarbT'

export const WHATSAPP_NUMBER: string = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

export const STORE_CURRENCY: string = import.meta.env.VITE_STORE_CURRENCY ?? 'BTN'
