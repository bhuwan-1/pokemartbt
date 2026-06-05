import { useState } from 'react'
import { PRODUCT_IMAGES_BUCKET, supabase } from '@/lib/supabase'
import { imageFileSchema } from '@/schemas/product-schema'

function extensionFor(file: File): string {
  switch (file.type) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

/** Upload a validated image File to storage; returns the storage PATH (never a URL). */
export async function uploadProductImage(file: File): Promise<string> {
  const parsed = imageFileSchema.safeParse(file)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid image')
  }
  const path = `${crypto.randomUUID()}.${extensionFor(file)}`
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
  })
  if (error) throw error
  return path
}

/** Delete storage objects for the given paths (used on image remove + product delete). */
export async function deleteProductImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)
  if (error) throw error
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploading(true)
    try {
      const paths: string[] = []
      for (const file of files) {
        paths.push(await uploadProductImage(file))
      }
      return paths
    } finally {
      setUploading(false)
    }
  }

  return { uploading, uploadImages, deleteProductImages }
}
