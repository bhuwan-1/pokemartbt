import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaginationControls } from '@/components/pagination-controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { getPublicImageUrl } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { ADMIN_PAGE_SIZE, useAdminProducts } from '@/features/admin/hooks/use-admin-products'
import { useProductMutations } from '@/features/admin/hooks/use-product-mutations'
import type { ProductRow } from '@/types/product'

export function InventoryPage() {
  const [page, setPage] = useState(1)
  const { data, isPending } = useAdminProducts(page)
  const { patchProduct, deleteProduct } = useProductMutations()
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null)

  const products = data?.items
  const pageCount = data ? Math.ceil(data.count / ADMIN_PAGE_SIZE) : 0

  const goToPage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteProduct.mutate(pendingDelete, {
      onSuccess: () => {
        toast.success('Product deleted (images included)')
        // If that was the only row on this page, step back so we don't land on an empty page.
        if (products && products.length === 1 && page > 1) setPage(page - 1)
      },
      onError: (e) => toast.error('Delete failed', { description: e.message }),
      onSettled: () => setPendingDelete(null),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-label-bold uppercase text-primary">Inventory</p>
          <h1 className="text-headline-lg text-foreground">Products</h1>
        </div>
        <Button asChild>
          <Link to="/admin/new">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New product
          </Link>
        </Button>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-10 text-center">
          <p className="text-body-md font-bold text-foreground">No products yet</p>
          <p className="text-body-sm text-on-surface-variant">
            Create your first product to populate the catalog.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-panel p-3 shadow-sm"
            >
              <div className="aspect-[5/7] w-12 shrink-0 overflow-hidden rounded-lg bg-surface-low">
                {p.image_paths[0] ? (
                  <img
                    src={getPublicImageUrl(p.image_paths[0])}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant/40">
                      image
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-bold text-foreground">{p.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="text-label-bold uppercase">
                    {p.product_type === 'single' ? 'Card' : 'Sealed'}
                  </Badge>
                  <Badge variant="outline" className="text-label-bold uppercase">
                    {p.condition}
                  </Badge>
                  {p.is_graded && (
                    <Badge className="bg-gold text-label-bold uppercase text-on-gold hover:bg-gold">
                      {p.grading_company} {p.grade}
                    </Badge>
                  )}
                  {!p.is_active && (
                    <Badge variant="secondary" className="text-label-bold uppercase">
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>

              <p className="w-28 text-right text-body-md font-extrabold text-foreground">
                {formatPrice(p.price, p.currency)}
              </p>

              <div className="flex items-center gap-1.5">
                <span className="text-body-sm text-on-surface-variant">Qty</span>
                <Input
                  type="number"
                  min={0}
                  className="w-20"
                  defaultValue={p.quantity}
                  onBlur={(e) => {
                    const qty = Number(e.target.value)
                    if (Number.isInteger(qty) && qty >= 0 && qty !== p.quantity) {
                      patchProduct.mutate(
                        { id: p.id, patch: { quantity: qty } },
                        {
                          onError: (err) =>
                            toast.error('Update failed', { description: err.message }),
                        },
                      )
                    }
                  }}
                  aria-label={`Quantity for ${p.name}`}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-body-sm text-on-surface-variant">Active</span>
                <Switch
                  checked={p.is_active}
                  onCheckedChange={(checked) =>
                    patchProduct.mutate(
                      { id: p.id, patch: { is_active: checked } },
                      {
                        onError: (err) =>
                          toast.error('Update failed', { description: err.message }),
                      },
                    )
                  }
                  aria-label={`Toggle visibility for ${p.name}`}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-body-sm text-on-surface-variant">Featured</span>
                <Switch
                  checked={p.is_featured}
                  onCheckedChange={(checked) =>
                    patchProduct.mutate(
                      { id: p.id, patch: { is_featured: checked } },
                      {
                        onError: (err) =>
                          toast.error('Update failed', { description: err.message }),
                      },
                    )
                  }
                  aria-label={`Toggle featured for ${p.name}`}
                />
              </div>

              <div className="flex items-center gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/${p.id}/edit`}>Edit</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:text-error"
                  onClick={() => setPendingDelete(p)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isPending && (
        <PaginationControls page={page} pageCount={pageCount} onPageChange={goToPage} />
      )}

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.name}”?</DialogTitle>
            <DialogDescription>
              This permanently removes the product and all {pendingDelete?.image_paths.length ?? 0}{' '}
              of its images from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? 'Deleting…' : 'Delete product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
