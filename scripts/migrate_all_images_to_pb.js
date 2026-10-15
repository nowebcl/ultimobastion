import fs from 'fs'
import PocketBase from 'pocketbase'
import sharp from 'sharp'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

const CACHE_FILE = 'scripts/image_migration_cache.json'
const PROGRESS_FILE = 'scripts/migration_progress.json'

// Load or initialize cache
let urlCache = {}
if (fs.existsSync(CACHE_FILE)) {
  try {
    urlCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    console.log(`Cache cargado con ${Object.keys(urlCache).length} imágenes ya migradas.`)
  } catch (e) {
    urlCache = {}
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(urlCache, null, 2))
}

async function processImage(rawUrl, postId) {
  // Normalize URL
  const cleanUrl = rawUrl.replace(/https?:\/\/[a-z0-9]+\.wp\.com\//i, 'https://').split('?')[0]

  if (urlCache[cleanUrl]) {
    return urlCache[cleanUrl]
  }

  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!res.ok) {
      // Si falla sin www o con https, intentar con wp proxy
      const wpProxyUrl = `https://i0.wp.com/${cleanUrl.replace(/^https?:\/\//, '')}`
      const retryRes = await fetch(wpProxyUrl)
      if (!retryRes.ok) {
        console.warn(`[SKIP] No se pudo descargar (HTTP ${res.status}): ${cleanUrl}`)
        return null
      }
      return await compressAndUpload(retryRes, cleanUrl, postId)
    }

    return await compressAndUpload(res, cleanUrl, postId)
  } catch (err) {
    console.warn(`[ERROR] Fallo al descargar ${cleanUrl}:`, err.message)
    return null
  }
}

async function compressAndUpload(res, cleanUrl, postId) {
  const arrayBuf = await res.arrayBuffer()
  const rawBuf = Buffer.from(arrayBuf)

  // Max compression: width 960, quality 65, effort 6, smartSubsample
  const webpBuf = await sharp(rawBuf)
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 65, effort: 6, smartSubsample: true })
    .toBuffer()

  const originalName = cleanUrl.split('/').pop().replace(/\.[a-z0-9]+$/i, '')
  const safeName = (originalName || 'img').replace(/[^a-zA-Z0-9_-]/g, '_') + '.webp'

  const fd = new FormData()
  const blob = new Blob([webpBuf], { type: 'image/webp' })
  fd.append('archivo', blob, safeName)
  fd.append('url_original', cleanUrl)
  if (postId) fd.append('noticia_id', postId)

  const rec = await pb.collection('imagenes_noticias').create(fd)
  const pbUrl = pb.files.getURL(rec, rec.archivo)

  const result = {
    pb_url: pbUrl,
    rec_id: rec.id,
    orig_kb: (rawBuf.length / 1024).toFixed(1),
    webp_kb: (webpBuf.length / 1024).toFixed(1)
  }

  urlCache[cleanUrl] = result
  return result
}

async function main() {
  console.log('=== INICIANDO MIGRACIÓN ULTRA-OPTIMIZADA DE IMÁGENES A POCKETBASE ===')
  console.log('Autenticando en PocketBase...')
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  console.log('¡Autenticado con éxito!')

  // Obtener posts que tengan imágenes de wp-content en su contenido
  console.log('Consultando posts en PocketBase...')
  const allPosts = await pb.collection('noticias').getFullList({
    fields: 'id,slug,title,content',
    requestKey: null
  })

  const postsWithWpImages = allPosts.filter(p => (p.content || '').includes('wp-content/uploads/'))
  console.log(`Total de posts en BD: ${allPosts.length}`)
  console.log(`Posts que contienen imágenes de WordPress pendientes: ${postsWithWpImages.length}`)

  let processedCount = 0
  let totalBytesSaved = 0
  let totalImagesUploaded = 0
  const startTime = Date.now()

  for (let i = 0; i < postsWithWpImages.length; i++) {
    const post = postsWithWpImages[i]
    let content = post.content || ''

    // Extraer todas las imágenes <img ... src="..."> del contenido
    const imgTagRegex = /<img([^>]+)>/gi
    let newContent = content
    let match
    let postHadChanges = false

    // Extraer todas las etiquetas <img>
    const imgTags = []
    while ((match = imgTagRegex.exec(content)) !== null) {
      imgTags.push(match[0])
    }

    for (const tag of imgTags) {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i)
      if (!srcMatch) continue
      const src = srcMatch[1]

      if (!src.includes('wp-content/uploads/')) continue

      const processed = await processImage(src, post.id)
      if (processed && processed.pb_url) {
        // Reemplazar la etiqueta <img> completa limpiando los srcsets viejos de WordPress
        // Creamos una etiqueta limpia, con lazy loading, async decoding y la URL de la BD
        let cleanedTag = tag
          // Eliminar srcset para que no intente descargar archivos viejos
          .replace(/\s*srcset=["'][^"']*["']/gi, '')
          .replace(/\s*sizes=["'][^"']*["']/gi, '')
          // Reemplazar el src por la URL de la BD
          .replace(/src=["'][^"']+["']/i, `src="${processed.pb_url}" loading="lazy" decoding="async"`)

        newContent = newContent.replace(tag, cleanedTag)
        postHadChanges = true
        totalImagesUploaded++
        totalBytesSaved += (parseFloat(processed.orig_kb) - parseFloat(processed.webp_kb)) * 1024
      }
    }

    if (postHadChanges) {
      await pb.collection('noticias').update(post.id, {
        content: newContent
      })
      // Guardar también copia local si existe el archivo
      const localFile = `public/data/posts/${post.id}.json`
      if (fs.existsSync(localFile)) {
        try {
          const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'))
          localData.content = newContent
          fs.writeFileSync(localFile, JSON.stringify(localData, null, 2))
        } catch (e) {}
      }
    }

    processedCount++

    // Guardar cache periódicamente
    if (processedCount % 5 === 0 || processedCount === postsWithWpImages.length) {
      saveCache()
      const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1)
      const mbSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2)
      console.log(`[${processedCount}/${postsWithWpImages.length}] posts procesados (${elapsedMin} min) | Imágenes subidas: ${totalImagesUploaded} | Ahorro peso: ${mbSaved} MB`)
    }
  }

  saveCache()
  const totalMin = ((Date.now() - startTime) / 60000).toFixed(1)
  const mbSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2)
  console.log(`\n=== MIGRACIÓN COMPLETADA CON ÉXITO ===`)
  console.log(`Tiempo total: ${totalMin} minutos`)
  console.log(`Posts actualizados: ${processedCount}`)
  console.log(`Imágenes en base de datos: ${totalImagesUploaded}`)
  console.log(`Ahorro total de peso logrado: ${mbSaved} MB`)
}

main().catch(console.error)
