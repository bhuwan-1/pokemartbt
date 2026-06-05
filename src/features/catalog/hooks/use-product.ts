import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowSchema } from '@/types/product'

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      // null = not found (or inactive — RLS hides it from anon)
      return data ? productRowSchema.parse(data) : null
    },
  })
}
