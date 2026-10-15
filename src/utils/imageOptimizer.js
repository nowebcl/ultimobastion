/**
 * E-Commerce & Editorial Asset Optimizer
 * Implements Standard 4 of the ecommerce-asset-optimizer skill:
 * Client-side ingestion compression to ultra-lightweight WebP.
 */

/**
 * Compresses any image (JPEG, PNG, HEIC, WebP, etc.) in the browser via HTML5 Canvas.
 * - Resizes proportionally to maxDimension (default 1200px)
 * - Encodes to modern WebP with optimal compression (default quality 0.80)
 * - Strips heavy EXIF/camera metadata
 * - Reduces file size by typically 80% to 95% (e.g. 5 MB -> 45 KB)
 *
 * @param {File} file - Original file from user input
 * @param {number} maxDimension - Max width/height in px
 * @param {number} quality - Quality from 0.0 to 1.0
 * @returns {Promise<{ file: File, originalSize: number, optimizedSize: number, savingsPercent: number, previewUrl: string }>}
 */
export async function compressImageToWebP(file, maxDimension = 1200, quality = 0.80) {
  if (!file || !file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file?.size || 0,
      optimizedSize: file?.size || 0,
      savingsPercent: 0,
      previewUrl: file ? URL.createObjectURL(file) : ''
    }
  }

  // If already WebP and already very small (<= 50 KB), preserve as is
  if (file.type === 'image/webp' && file.size <= 50 * 1024) {
    return {
      file,
      originalSize: file.size,
      optimizedSize: file.size,
      savingsPercent: 0,
      previewUrl: URL.createObjectURL(file)
    }
  }

  return new Promise((resolve) => {
    const originalSize = file.size
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img

      // Scale proportionally if exceeding maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { alpha: true })

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              file,
              originalSize,
              optimizedSize: originalSize,
              savingsPercent: 0,
              previewUrl: URL.createObjectURL(file)
            })
          }

          const baseName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 50)
          const cleanName = `${baseName || 'imagen'}.webp`
          const optimizedFile = new File([blob], cleanName, { type: 'image/webp' })
          const optimizedSize = blob.size
          const savingsPercent = Math.max(
            0,
            Math.round(((originalSize - optimizedSize) / originalSize) * 100)
          )

          resolve({
            file: optimizedFile,
            originalSize,
            optimizedSize,
            savingsPercent,
            previewUrl: URL.createObjectURL(optimizedFile)
          })
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({
        file,
        originalSize,
        optimizedSize: originalSize,
        savingsPercent: 0,
        previewUrl: URL.createObjectURL(file)
      })
    }

    img.src = objectUrl
  })
}

/**
 * Format bytes into human-readable string (e.g. "48 KB", "1.2 MB")
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`
}
