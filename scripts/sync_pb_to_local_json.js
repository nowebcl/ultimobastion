import fs from 'fs'
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function syncLocalFiles() {
  console.log('Autenticando en PocketBase...')
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  console.log('Obteniendo todas las noticias de PocketBase con su contenido migrado...')
  const allNoticias = await pb.collection('noticias').getFullList({
    fields: 'id,slug,title,content',
    requestKey: null
  })

  console.log(`Descargadas ${allNoticias.length} noticias de la base de datos.`)
  const bySlug = new Map()
  for (const n of allNoticias) {
    if (n.slug) bySlug.set(n.slug, n.content)
  }

  // Cargar índice
  const postsIndex = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf8'))
  let updatedCount = 0

  for (const item of postsIndex) {
    const filePath = `public/data/posts/${item.id}.json`
    if (!fs.existsSync(filePath)) continue

    const dbContent = bySlug.get(item.slug)
    if (!dbContent) continue

    const localPost = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (localPost.content !== dbContent) {
      localPost.content = dbContent
      fs.writeFileSync(filePath, JSON.stringify(localPost, null, 2))
      updatedCount++
    }
  }

  console.log(`¡Archivos locales sincronizados con la base de datos: ${updatedCount}/${postsIndex.length}!`)
}

syncLocalFiles().catch(console.error)
