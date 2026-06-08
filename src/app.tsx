import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { queryClient } from '@/lib/query-client'
import { AuthProvider } from '@/features/auth/auth-context'
import { RequireAuth } from '@/features/auth/require-auth'
import { PublicLayout } from '@/components/layout/public-layout'
import { AdminLayout } from '@/components/layout/admin-layout'
import { HomePage } from '@/features/home/home-page'
import { CatalogPage } from '@/features/catalog/catalog-page'
import { ProductDetailPage } from '@/features/catalog/product-detail-page'
import { AdminLoginPage } from '@/features/admin/admin-login-page'
import { InventoryPage } from '@/features/admin/inventory-page'
import { ProductFormPage } from '@/features/admin/product-form'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorPage } from '@/components/error-page'

const router = createBrowserRouter([
  {
    // Pathless root: its errorElement catches route/render errors and 404s app-wide.
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/catalog', element: <CatalogPage /> },
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
    ],
  },
])

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}
