import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { STORE_CURRENCY } from '@/lib/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  BTN: 'Nu.',
  USD: '$',
  INR: '₹',
}

export function formatPrice(price: number, currency: string = STORE_CURRENCY): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${symbol} ${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
