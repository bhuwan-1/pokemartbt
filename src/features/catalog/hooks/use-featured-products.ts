import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowsSchema } from '@/types/product'

/**
 * Active + featured products for the home page "Featured Collections" bento.
 * Newest first; capped — the bento layout only shows a handful.
 */
export function useFeaturedProducts(limit = 5) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return productRowsSchema.parse(data)
    },
  })
}
