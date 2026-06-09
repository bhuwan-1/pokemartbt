import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { STORE_CURRENCY } from '@/lib/config'
import { productSchema, singleSchema, type ProductInput } from '@/schemas/product-schema'
import { useProduct } from '@/features/catalog/hooks/use-product'
import { useProductMutations } from '@/features/admin/hooks/use-product-mutations'
import { ProductTypeSelector } from '@/features/admin/components/product-type-selector'
import { ConditionPills } from '@/features/admin/components/condition-pills'
import { ImageUploader } from '@/features/admin/components/image-uploader'
import type { ProductRow } from '@/types/product'

// The single branch carries every field, so its input shape works for both branches;
// the resolver still validates against the discriminated union.
type ProductFormValues = Omit<z.input<typeof singleSchema>, 'product_type'> & {
  product_type: 'single' | 'sealed'
}

const GRADING_COMPANIES = ['PSA', 'CGC', 'BGS', 'SGC', 'TAG' ] as const

const emptyToUndefined = (v: unknown) => (v === '' || v == null ? undefined : v)

const CREATE_DEFAULTS: ProductFormValues = {
  product_type: 'single',
  name: '',
  set_name: '',
  language: 'EN',
  price: undefined,
  currency: STORE_CURRENCY,
  quantity: 1,
  is_active: true,
  is_featured: false,
  description: '',
  card_number: '',
  rarity: '',
  condition: 'NM',
  is_graded: false,
  grading_company: undefined,
  grade: undefined,
}

function rowToFormValues(row: ProductRow): ProductFormValues {
  return {
    product_type: row.product_type,
    name: row.name,
    set_name: row.set_name ?? '',
    language: row.language,
    price: row.price,
    currency: row.currency,
    quantity: row.quantity,
    is_active: row.is_active,
    is_featured: row.is_featured,
    description: row.description ?? '',
    card_number: row.card_number ?? '',
    rarity: row.rarity ?? '',
    condition: row.condition === 'SEALED' ? 'NM' : row.condition,
    is_graded: row.is_graded,
    grading_company: row.grading_company ?? undefined,
    grade: row.grade ?? undefined,
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-body-sm text-error" role="alert">
      <span className="material-symbols-outlined text-[16px]">error</span>
      {message}
    </p>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-panel p-5 shadow-sm">
      <h2 className="text-label-bold uppercase text-primary">{title}</h2>
      {children}
    </section>
  )
}

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { data: product, isPending: productLoading } = useProduct(isEdit ? id : undefined)
  const { createProduct, updateProduct } = useProductMutations()
  const [imagePaths, setImagePaths] = useState<string[]>([])

  const resolver = zodResolver(productSchema) as unknown as Resolver<
    ProductFormValues,
    unknown,
    ProductInput
  >

  const form = useForm<ProductFormValues, unknown, ProductInput>({
    resolver,
    defaultValues: CREATE_DEFAULTS,
  })
  const { register, handleSubmit, watch, setValue, reset, formState } = form
  const { errors } = formState

  useEffect(() => {
    if (isEdit && product) {
      reset(rowToFormValues(product))
      setImagePaths(product.image_paths)
    }
  }, [isEdit, product, reset])

  const productType = watch('product_type')
  const condition = watch('condition')
  const isGraded = watch('is_graded')
  const gradingCompany = watch('grading_company')
  const isActive = watch('is_active')
  const isFeatured = watch('is_featured')
  const isSingle = productType === 'single'
  const saving = createProduct.isPending || updateProduct.isPending

  const onSubmit = (input: ProductInput) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(isEdit ? 'Product saved' : 'Product published')
        navigate('/admin')
      },
      onError: (e: Error) => toast.error('Save failed', { description: e.message }),
    }
    if (isEdit) updateProduct.mutate({ id: id!, input, imagePaths }, callbacks)
    else createProduct.mutate({ input, imagePaths }, callbacks)
  }

  if (isEdit && productLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (isEdit && !productLoading && !product) {
    return (
      <div className="rounded-2xl border border-border bg-panel p-10 text-center">
        <p className="text-headline-md text-foreground">Product not found</p>
        <Button className="mt-4" onClick={() => navigate('/admin')}>
          Back to inventory
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-foreground">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            {isEdit
              ? 'Update inventory details — changes go live immediately.'
              : 'Add a card or sealed product to the catalog.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save' : 'Publish Product'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          <Panel title="Product Classification">
            <ProductTypeSelector
              value={productType}
              onChange={(v) => setValue('product_type', v, { shouldValidate: false })}
            />
          </Panel>

          <Panel title="General">
            <div className="space-y-1.5">
              <Label htmlFor="name">Title</Label>
              <Input
                id="name"
                placeholder="Charizard GX — Hidden Fates SV49/SV94"
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Freeform notes — centering, whitening, print line…"
                {...register('description')}
              />
            </div>
          </Panel>

          {isSingle && (
            <Panel title="Card Attributes">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="card_number">Card number</Label>
                  <Input id="card_number" placeholder="4/102" {...register('card_number')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Input id="rarity" placeholder="Holo Rare" {...register('rarity')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Condition</Label>
                <ConditionPills
                  value={condition ?? 'NM'}
                  onChange={(v) => setValue('condition', v, { shouldValidate: true })}
                />
                <FieldError message={errors.condition?.message} />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_graded"
                  checked={!!isGraded}
                  onCheckedChange={(checked) => {
                    setValue('is_graded', checked, { shouldValidate: true })
                    if (!checked) {
                      setValue('grading_company', undefined)
                      setValue('grade', undefined)
                    }
                  }}
                />
                <Label htmlFor="is_graded">Graded card</Label>
              </div>

              {isGraded && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Grading company</Label>
                    <Select
                      value={(gradingCompany as string | undefined) ?? ''}
                      onValueChange={(v) =>
                        setValue('grading_company', v as (typeof GRADING_COMPANIES)[number], {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADING_COMPANIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="grade">Grade (1–10)</Label>
                    <Input
                      id="grade"
                      type="number"
                      step="0.5"
                      min={1}
                      max={10}
                      {...register('grade', { setValueAs: emptyToUndefined })}
                    />
                    <FieldError message={errors.grade?.message as string | undefined} />
                  </div>
                </div>
              )}
            </Panel>
          )}

          <Panel title="Pricing & Stock">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price ({STORE_CURRENCY})</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register('price', { setValueAs: emptyToUndefined })}
                />
                <FieldError message={errors.price?.message as string | undefined} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  {...register('quantity', { setValueAs: emptyToUndefined })}
                />
                <FieldError message={errors.quantity?.message as string | undefined} />
              </div>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Panel title="Media Assets">
            <ImageUploader paths={imagePaths} onChange={setImagePaths} />
          </Panel>

          <Panel title="Metadata">
            <div className="space-y-1.5">
              <Label htmlFor="set_name">Set / expansion</Label>
              <Input id="set_name" placeholder="Obsidian Flames" {...register('set_name')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input id="language" {...register('language')} />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="is_active"
                checked={!!isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Visible in store</Label>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_featured"
                  checked={!!isFeatured}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Feature on home page</Label>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Shows this product in the Featured Collections grid on the home page.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  )
}
