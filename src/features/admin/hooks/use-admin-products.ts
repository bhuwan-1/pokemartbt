import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowsSchema } from '@/types/product'

export const ADMIN_PAGE_SIZE = 10

export type AdminFilters = {
  search?: string
  type?: 'single' | 'sealed'
  set?: string
  featured?: boolean
}

// Admin list: authenticated RLS policy allows reading inactive rows too.
export function useAdminProducts(page = 1, filters: AdminFilters = {}) {
  return useQuery({
    queryKey: ['admin-products', page, filters],
    queryFn: async () => {
      let query = supabase.from('products').select('*', { count: 'exact' })

      const term = filters.search?.trim()
      if (term) {
        // Strip PostgREST or-filter metacharacters before interpolating into the OR string.
        const esc = term.replace(/[,()*]/g, ' ')
        query = query.or(`name.ilike.*${esc}*,card_number.ilike.*${esc}*`)
      }
      if (filters.type) query = query.eq('product_type', filters.type)
      if (filters.set) query = query.eq('set_name', filters.set)
      if (filters.featured) query = query.eq('is_featured', true)

      const from = (page - 1) * ADMIN_PAGE_SIZE
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, from + ADMIN_PAGE_SIZE - 1)
      if (error) throw error
      return { items: productRowsSchema.parse(data), count: count ?? 0 }
    },
    placeholderData: keepPreviousData,
  })
}

/**
 * Distinct set names for the admin filter dropdown. Unlike the public
 * `useProductSets`, this includes inactive rows (admin can read them via RLS).
 */
export function useAdminProductSets() {
  return useQuery({
    queryKey: ['admin-products', 'sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('set_name')
        .not('set_name', 'is', null)
      if (error) throw error
      const names = (data as { set_name: string }[]).map((r) => r.set_name)
      return [...new Set(names)].sort()
    },
  })
}
