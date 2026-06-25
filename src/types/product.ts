import { z } from 'zod'

// Runtime-validated shape of a `products` row as returned by Supabase.
// Zod is the source of types — don't hand-write a parallel interface.
export const productRowSchema = z.object({
  id: z.uuid(),
  product_type: z.enum(['single', 'sealed']),
  name: z.string(),
  set_name: z.string().nullable(),
  card_number: z.string().nullable(),
  rarity: z.string().nullable(),
  language: z.string(),
  condition: z.enum(['GM', 'M', 'NM', 'LP', 'MP', 'HP', 'DMG', 'SEALED']),
  is_graded: z.boolean(),
  grading_company: z.enum(['PSA', 'CGC', 'BGS', 'SGC', 'TAG']).nullable(),
  grade: z.number().nullable(),
  price: z.number(),
  discount_percent: z.number(),
  currency: z.string(),
  quantity: z.number().int(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  image_paths: z.array(z.string()),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type ProductRow = z.infer<typeof productRowSchema>

export const productRowsSchema = z.array(productRowSchema)
