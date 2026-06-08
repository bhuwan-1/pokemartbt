import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { productRowsSchema } from '@/types/product'

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc'

export const CATALOG_PAGE_SIZE = 10

export type CatalogFilters = {
  type?: 'single' | 'sealed'
  set?: string
  condition?: string
  graded?: boolean
  minPrice?: number
  maxPrice?: number
  sort: CatalogSort
}

// `page` is 0-indexed (TanStack infinite-query page param).
async function fetchProducts(filters: CatalogFilters, page: number) {
  // RLS already restricts anon to active rows; filtering here keeps admin sessions
  // (authenticated can read inactive) consistent with the public catalog.
  let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true)

  if (filters.type) query = query.eq('product_type', filters.type)
  if (filters.set) query = query.eq('set_name', filters.set)
  if (filters.condition) query = query.eq('condition', filters.condition)
  if (filters.graded) query = query.eq('is_graded', true)
  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)

  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = page * CATALOG_PAGE_SIZE
  query = query.range(from, from + CATALOG_PAGE_SIZE - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { items: productRowsSchema.parse(data), count: count ?? 0 }
}

export function useProducts(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0)
      return loaded < lastPage.count ? allPages.length : undefined
    },
  })
}

/** Distinct set names for the filter dropdown (PostgREST has no DISTINCT; dedupe client-side). */
export function useProductSets() {
  return useQuery({
    queryKey: ['products', 'sets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('set_name')
        .eq('is_active', true)
        .not('set_name', 'is', null)
      if (error) throw error
      const names = (data as { set_name: string }[]).map((r) => r.set_name)
      return [...new Set(names)].sort()
    },
  })
}
