import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProductInput } from '@/schemas/product-schema'
import { productRowSchema, type ProductRow } from '@/types/product'
import { deleteProductImages } from '@/features/admin/hooks/use-image-upload'

type ProductPayload = {
  product_type: 'single' | 'sealed'
  name: string
  set_name: string | null
  language: string
  price: number
  currency: string
  quantity: number
  is_active: boolean
  description: string | null
  image_paths: string[]
  condition: string
  is_graded: boolean
  card_number: string | null
  rarity: string | null
  grading_company: string | null
  grade: number | null
}

// Map validated form input → DB row payload, enforcing type coherence on submit
// (mirrors the DB CHECK constraints; SPEC §10.6).
export function toProductPayload(input: ProductInput, imagePaths: string[]): ProductPayload {
  const base = {
    product_type: input.product_type,
    name: input.name,
    set_name: input.set_name || null,
    language: input.language,
    price: input.price,
    currency: input.currency,
    quantity: input.quantity,
    is_active: input.is_active,
    description: input.description || null,
    image_paths: imagePaths,
  }

  if (input.product_type === 'sealed') {
    return {
      ...base,
      condition: 'SEALED',
      is_graded: false,
      card_number: null,
      rarity: null,
      grading_company: null,
      grade: null,
    }
  }

  return {
    ...base,
    condition: input.condition,
    card_number: input.card_number || null,
    rarity: input.rarity || null,
    is_graded: input.is_graded,
    grading_company: input.is_graded ? (input.grading_company ?? null) : null,
    grade: input.is_graded ? (input.grade ?? null) : null,
  }
}

export function useProductMutations() {
  const queryClient = useQueryClient()

  const invalidate = (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    if (id) void queryClient.invalidateQueries({ queryKey: ['product', id] })
  }

  const createProduct = useMutation({
    mutationFn: async (vars: { input: ProductInput; imagePaths: string[] }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(toProductPayload(vars.input, vars.imagePaths))
        .select()
        .single()
      if (error) throw error
      return productRowSchema.parse(data)
    },
    onSuccess: (row) => invalidate(row.id),
  })

  const updateProduct = useMutation({
    mutationFn: async (vars: { id: string; input: ProductInput; imagePaths: string[] }) => {
      const { data, error } = await supabase
        .from('products')
        .update(toProductPayload(vars.input, vars.imagePaths))
        .eq('id', vars.id)
        .select()
        .single()
      if (error) throw error
      return productRowSchema.parse(data)
    },
    onSuccess: (row) => invalidate(row.id),
  })

  /** Partial update for quick list actions (is_active toggle, quantity). */
  const patchProduct = useMutation({
    mutationFn: async (vars: {
      id: string
      patch: Partial<Pick<ProductRow, 'is_active' | 'quantity'>>
    }) => {
      const { error } = await supabase.from('products').update(vars.patch).eq('id', vars.id)
      if (error) throw error
      return vars.id
    },
    onSuccess: (id) => invalidate(id),
  })

  const deleteProduct = useMutation({
    mutationFn: async (product: ProductRow) => {
      // Storage objects first, then the row (SPEC §10.6).
      await deleteProductImages(product.image_paths)
      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error
      return product.id
    },
    onSuccess: (id) => invalidate(id),
  })

  return { createProduct, updateProduct, patchProduct, deleteProduct }
}
