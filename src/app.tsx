import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/features/auth/auth-context'
import { RequireAuth } from '@/features/auth/require-auth'
import { PublicLayout } from '@/components/layout/public-layout'
import { AdminLayout } from '@/components/layout/admin-layout'
import { CatalogPage } from '@/features/catalog/catalog-page'
import { ProductDetailPage } from '@/features/catalog/product-detail-page'
import { AdminLoginPage } from '@/features/admin/admin-login-page'
import { InventoryPage } from '@/features/admin/inventory-page'
import { ProductFormPage } from '@/features/admin/product-form'
import { Toaster } from '@/components/ui/sonner'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <CatalogPage /> },
      { path: '/card/:id', element: <ProductDetailPage /> },
    ],
  },
  // /admin* is intentionally unlinked from the public UI (CLAUDE.md rule 4).
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <InventoryPage /> },
          { path: '/admin/new', element: <ProductFormPage /> },
          { path: '/admin/:id/edit', element: <ProductFormPage /> },
        ],
      },
    ],
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}
