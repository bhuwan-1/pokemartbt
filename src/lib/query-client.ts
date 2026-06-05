import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalog changes infrequently; avoid refetch storms while browsing.
      staleTime: 60_000,
      retry: 1,
    },
  },
})
