import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill it in.',
  )
}

// Anon key only. All access control lives in RLS — never use the service-role key here.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const PRODUCT_IMAGES_BUCKET = 'product-images'

/** Derive a public URL from a stored storage path (we persist paths, never URLs). */
export function getPublicImageUrl(path: string): string {
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}
