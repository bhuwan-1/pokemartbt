import { useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import { getPublicImageUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { imageFileSchema } from '@/schemas/product-schema'
import { deleteProductImages, useImageUpload } from '@/features/admin/hooks/use-image-upload'

// Ordered storage paths; index 0 = cover. Paths only — URLs derived at render (SPEC §10.7).
export function ImageUploader({
  paths,
  onChange,
}: {
  paths: string[]
  onChange: (paths: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploading, uploadImages } = useImageUpload()
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = async (files: File[]) => {
    const valid: File[] = []
    for (const file of files) {
      const parsed = imageFileSchema.safeParse(file)
      if (parsed.success) valid.push(file)
      else
        toast.error(`${file.name} skipped`, {
          description: parsed.error.issues[0]?.message,
        })
    }
    if (valid.length === 0) return
    try {
      const newPaths = await uploadImages(valid)
      onChange([...paths, ...newPaths])
    } catch (e) {
      toast.error('Upload failed', { description: e instanceof Error ? e.message : undefined })
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void handleFiles(Array.from(e.dataTransfer.files))
  }

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= paths.length) return
    const next = [...paths]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const remove = async (index: number) => {
    const path = paths[index]
    try {
      // Delete the storage object AND drop its path from the array (SPEC §10.7).
      await deleteProductImages([path])
      onChange(paths.filter((_, i) => i !== index))
    } catch (e) {
      toast.error('Could not remove image', {
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={cn(
          'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
          dragOver
            ? 'border-primary bg-surface-low'
            : 'border-outline-variant hover:border-primary',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-[24px] text-primary">upload</span>
        </span>
        <span className="text-body-md font-bold text-foreground">
          {uploading ? 'Uploading…' : 'Click to upload or drag and drop'}
        </span>
        <span className="text-body-sm text-on-surface-variant">
          High-res PNG, JPG or WEBP (Max 10MB)
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />

      {paths.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {paths.map((path, i) => (
            <li key={path} className="group relative">
              <div className="aspect-[5/7] w-full overflow-hidden rounded-lg bg-surface-low">
                <img
                  src={getPublicImageUrl(path)}
                  alt={i === 0 ? 'Cover image' : `Image ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-gold px-2 py-0.5 text-label-bold uppercase text-on-gold">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-full bg-panel/90 p-1 shadow disabled:opacity-40"
                  aria-label="Move image left"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <button
                  type="button"
                  onClick={() => void remove(i)}
                  className="rounded-full bg-panel/90 p-1 text-error shadow"
                  aria-label="Remove image"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === paths.length - 1}
                  className="rounded-full bg-panel/90 p-1 shadow disabled:opacity-40"
                  aria-label="Move image right"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
