import fs from 'fs'
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

const CONCURRENCY = 4 // Safe concurrency for PocketBase SQLite

async function main() {
  console.log('--- INICIANDO MIGRACIÓN TOTAL A POCKETBASE ---')
  console.log('Autenticando en PocketBase...')
  await pb.collection('users').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  console.log('Autenticación exitosa!')

  // 1. Obtener todas las noticias existentes en BD para evitar duplicados
  console.log('Consultando registros existentes en la base de datos...')
  const existingRecords = await pb.collection('noticias').getFullList({
    fields: 'id,slug',
    requestKey: null
  })
  const existingSlugs = new Set(existingRecords.map(r => r.slug))
  console.log(`Registros encontrados en BD: ${existingRecords.length}`)

  // 2. Cargar índice de posts locales
  const allPosts = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf8'))
  const pendingPosts = allPosts.filter(p => !existingSlugs.has(p.slug))
  console.log(`Total de posts en archivo: ${allPosts.length}`)
  console.log(`Posts ya subidos: ${allPosts.length - pendingPosts.length}`)
  console.log(`Posts pendientes por subir: ${pendingPosts.length}`)

  if (pendingPosts.length === 0) {
    console.log('¡Todas las noticias ya están subidas en la base de datos!')
    return
  }

  let completed = 0
  let failed = 0
  const total = pendingPosts.length
  const startTime = Date.now()

  // Helper de subida para un post con reintentos
  async function uploadPost(item) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const fullPath = `public/data/posts/${item.id}.json`
        const imagePath = `public/images/posts/${item.id}.webp`

        let fullContent = item.excerpt || ''
        if (fs.existsSync(fullPath)) {
          const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
          fullContent = parsed.content || parsed.excerpt || ''
        }

        const fd = new FormData()
        fd.append('title', item.title)
        fd.append('slug', item.slug)
        fd.append('excerpt', item.excerpt || '')
        fd.append('content', fullContent)
        fd.append('category', item.categories?.[0]?.name || 'Actualidad')
        fd.append('author', item.author || 'Redacción Último Bastión')
        fd.append('date', item.date || new Date().toISOString())
        fd.append('featured', 'false')

        if (fs.existsSync(imagePath)) {
          const buffer = fs.readFileSync(imagePath)
          const blob = new Blob([buffer], { type: 'image/webp' })
          fd.append('image', blob, `${item.id}.webp`)
        }

        await pb.collection('noticias').create(fd)
        completed++
        if (completed % 25 === 0 || completed === total) {
          const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1)
          const percent = ((completed / total) * 100).toFixed(1)
          console.log(`[${completed}/${total}] (${percent}%) subidos en ${elapsedSec}s - Último: "${item.title.slice(0, 35)}..."`)
        }
        return true
      } catch (err) {
        if (attempt === 3) {
          console.error(`Fallo final en post ${item.id} (${item.slug}):`, err.message)
          failed++
          return false
        }
        await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
  }

  // Pool de concurrencia
  const queue = [...pendingPosts]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      if (item) await uploadPost(item)
    }
  })

  await Promise.all(workers)

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('--- MIGRACIÓN COMPLETADA ---')
  console.log(`Subidos exitosamente: ${completed}`)
  console.log(`Fallidos: ${failed}`)
  console.log(`Tiempo total: ${totalTime}s`)
}

main().catch(console.error)
