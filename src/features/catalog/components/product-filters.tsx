import { useSearchParams } from 'react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { CatalogSort } from '@/features/catalog/hooks/use-products'

const TYPE_TABS = [
  { label: 'All', value: null },
  { label: 'Singles', value: 'single' },
  { label: 'Sealed', value: 'sealed' },
] as const

const CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG'] as const

const SORTS: { label: string; value: CatalogSort }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low → high', value: 'price-asc' },
  { label: 'Price: high → low', value: 'price-desc' },
]

const ALL = '__all__'

// Filter state lives in URL search params so catalog views are shareable (SPEC §10.1).
export function ProductFilters({ sets }: { sets: string[] }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const update = (key: string, value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value == null || value === '' || value === ALL) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  const type = searchParams.get('type')
  const isSealed = type === 'sealed'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Product type tabs */}
        <div className="flex gap-2">
          {TYPE_TABS.map((tab) => {
            const isActive = type === tab.value
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => update('type', tab.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-label-bold uppercase transition-colors',
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline/40 text-on-surface-variant hover:border-primary hover:text-primary',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <Select
          value={(searchParams.get('sort') as CatalogSort) ?? 'newest'}
          onValueChange={(v) => update('sort', v === 'newest' ? null : v)}
        >
          <SelectTrigger className="w-44" aria-label="Sort by">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-label-bold uppercase text-on-surface-variant">Set</Label>
          <Select value={searchParams.get('set') ?? ALL} onValueChange={(v) => update('set', v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All sets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All sets</SelectItem>
              {sets.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isSealed && (
          <div className="space-y-1">
            <Label className="text-label-bold uppercase text-on-surface-variant">Condition</Label>
            <Select
              value={searchParams.get('condition') ?? ALL}
              onValueChange={(v) => update('condition', v)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any</SelectItem>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="min-price" className="text-label-bold uppercase text-on-surface-variant">
            Min price
          </Label>
          <Input
            id="min-price"
            type="number"
            min={0}
            className="w-28"
            placeholder="0"
            defaultValue={searchParams.get('min') ?? ''}
            onBlur={(e) => update('min', e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="max-price" className="text-label-bold uppercase text-on-surface-variant">
            Max price
          </Label>
          <Input
            id="max-price"
            type="number"
            min={0}
            className="w-28"
            placeholder="Any"
            defaultValue={searchParams.get('max') ?? ''}
            onBlur={(e) => update('max', e.target.value || null)}
          />
        </div>

        {!isSealed && (
          <div className="flex items-center gap-2 pb-2">
            <Switch
              id="graded-only"
              checked={searchParams.get('graded') === 'true'}
              onCheckedChange={(checked) => update('graded', checked ? 'true' : null)}
            />
            <Label htmlFor="graded-only" className="text-body-sm text-on-surface-variant">
              Graded only
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}
