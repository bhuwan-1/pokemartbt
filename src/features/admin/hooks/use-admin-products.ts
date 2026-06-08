import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowsSchema } from '@/types/product'

export const ADMIN_PAGE_SIZE = 10

// Admin list: authenticated RLS policy allows reading inactive rows too.
export function useAdminProducts(page = 1) {
  return useQuery({
    queryKey: ['admin-products', page],
    queryFn: async () => {
      const from = (page - 1) * ADMIN_PAGE_SIZE
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + ADMIN_PAGE_SIZE - 1)
      if (error) throw error
      return { items: productRowsSchema.parse(data), count: count ?? 0 }
    },
    placeholderData: keepPreviousData,
  })
}
