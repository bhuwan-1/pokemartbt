import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowsSchema } from '@/types/product'

// Admin list: authenticated RLS policy allows reading inactive rows too.
export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return productRowsSchema.parse(data)
    },
  })
}
