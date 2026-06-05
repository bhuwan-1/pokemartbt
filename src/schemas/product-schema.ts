import { z } from 'zod'
import { STORE_CURRENCY } from '@/lib/config'

const conditionSingle = z.enum(['NM', 'LP', 'MP', 'HP', 'DMG'])
const gradingCompany = z.enum(['PSA', 'CGC', 'BGS', 'SGC'])

const baseFields = {
  name: z.string().min(1, 'Title is required'),
  set_name: z.string().trim().optional().nullable(),
  language: z.string().default('EN'),
  price: z.coerce.number().nonnegative('Price must be ≥ 0'),
  currency: z.string().default(STORE_CURRENCY),
  quantity: z.coerce.number().int().nonnegative().default(1),
  is_active: z.boolean().default(true),
  description: z.string().trim().optional().nullable(),
}

export const singleSchema = z
  .object({
    product_type: z.literal('single'),
    ...baseFields,
    card_number: z.string().trim().optional().nullable(),
    rarity: z.string().trim().optional().nullable(),
    condition: conditionSingle,
    is_graded: z.boolean().default(false),
    grading_company: gradingCompany.optional().nullable(),
    grade: z.coerce.number().min(1).max(10).optional().nullable(),
  })
  .refine((v) => !v.is_graded || (v.grading_company != null && v.grade != null), {
    message: 'Graded cards require a grading company and grade',
    path: ['grade'],
  })

export const sealedSchema = z.object({
  product_type: z.literal('sealed'),
  ...baseFields,
  // condition is forced to "SEALED" and is_graded=false on submit; not user fields
})

export const productSchema = z.discriminatedUnion('product_type', [singleSchema, sealedSchema])
export type ProductInput = z.infer<typeof productSchema>
export type ProductFormInput = z.input<typeof productSchema>

// Image files are validated separately (File objects, pre-upload)
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_IMAGE_BYTES, 'Max 10MB')
  .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), 'PNG, JPG, or WEBP only')
