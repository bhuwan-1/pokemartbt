import { cn } from '@/lib/utils'

const OPTIONS = [
  {
    value: 'single',
    icon: 'playing_cards',
    title: 'Individual Card',
    description: 'A single card — condition, rarity, and optional grading.',
  },
  {
    value: 'sealed',
    icon: 'package_2',
    title: 'Sealed Set',
    description: 'Booster boxes, ETBs, tins — factory sealed product.',
  },
] as const

type ProductType = (typeof OPTIONS)[number]['value']

// Radio-cards driving the Zod discriminated union branch (design.md §6).
export function ProductTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: ProductType
  onChange: (value: ProductType) => void
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Product classification"
      className="grid gap-3 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              selected ? 'border-primary bg-surface-low' : 'border-border hover:border-outline',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                selected ? 'border-gold' : 'border-outline',
              )}
            >
              {/* Selected state: gold filled radio dot (design.md §6) */}
              {selected && <span className="size-2.5 rounded-full bg-gold" />}
            </span>
            <span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-primary">
                  {option.icon}
                </span>
                <span className="text-body-md font-bold text-foreground">{option.title}</span>
              </span>
              <span className="mt-1 block text-body-sm text-on-surface-variant">
                {option.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
