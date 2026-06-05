import { useState } from 'react'
import { getPublicImageUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// Multi-image viewer: cover (image_paths[0]) + thumbnails to switch (SPEC §10.2).
export function ProductGallery({ paths, name }: { paths: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = paths[activeIndex]

  if (paths.length === 0) {
    return (
      <div className="flex aspect-[5/7] w-full items-center justify-center rounded-2xl bg-surface-high">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40">
          playing_cards
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="holo-sweep aspect-[5/7] w-full overflow-hidden rounded-2xl bg-surface-high">
        <img src={getPublicImageUrl(active)} alt={name} className="h-full w-full object-cover" />
      </div>
      {paths.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {paths.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'aspect-[5/7] w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex ? 'border-primary' : 'border-transparent hover:border-outline',
              )}
              aria-label={`Show image ${i + 1}`}
            >
              <img
                src={getPublicImageUrl(path)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
