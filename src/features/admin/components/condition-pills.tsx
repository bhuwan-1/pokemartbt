import { cn } from '@/lib/utils'

// Label "D" maps to stored value DMG (design.md §6).
const PILLS = [
  { label: 'GM', value: 'GM' },
  { label: 'M', value: 'M' },
  { label: 'NM', value: 'NM' },
  { label: 'LP', value: 'LP' },
  { label: 'MP', value: 'MP' },
  { label: 'HP', value: 'HP' },
  { label: 'D', value: 'DMG' },
] as const

type Condition = (typeof PILLS)[number]['value']

export function ConditionPills({
  value,
  onChange,
}: {
  value: Condition
  onChange: (value: Condition) => void
}) {
  return (
    <div role="radiogroup" aria-label="Condition" className="flex flex-wrap gap-2">
      {PILLS.map((pill) => {
        const selected = value === pill.value
        return (
          <button
            key={pill.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(pill.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-label-bold uppercase transition-colors',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              selected
                ? 'bg-primary text-on-primary'
                : 'border border-outline/40 text-on-surface-variant hover:border-primary hover:text-primary',
            )}
          >
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
