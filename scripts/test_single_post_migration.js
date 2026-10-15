import PocketBase from 'pocketbase'
import sharp from 'sharp'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function testSinglePost() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  // Find a post with wp-content images
  const posts = await pb.collection('noticias').getList(1, 20, {
    filter: 'content ~ "wp-content/uploads"',
    fields: 'id,title,slug,content'
  })

  if (posts.items.length === 0) {
    console.log('No posts with wp-content/uploads found in first batch')
    return
  }

  const post = posts.items[0]
  console.log(`Testing with post: "${post.title}" (ID: ${post.id})`)

  const regex = /https?:\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]+/gi
  const matches = post.content.match(regex) || []
  const uniqueUrls = [...new Set(matches.map(u => u.replace(/[,\)]+$/, '')))]

  console.log(`Found ${uniqueUrls.length} unique images in this post.`)

  let updatedContent = post.content
  let totalSaved = 0

  for (const url of uniqueUrls) {
    try {
      console.log(`Downloading: ${url.split('/').pop()}`)
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`Skip (HTTP ${res.status}): ${url}`)
        continue
      }
      const raw = Buffer.from(await res.arrayBuffer())

      const webp = await sharp(raw)
        .resize({ width: 960, withoutEnlargement: true })
        .webp({ quality: 65, effort: 6, smartSubsample: true })
        .toBuffer()

      const fd = new FormData()
      const blob = new Blob([webp], { type: 'image/webp' })
      const filename = url.split('/').pop().replace(/\.[a-z0-9]+$/i, '') + '.webp'
      fd.append('archivo', blob, filename)
      fd.append('url_original', url)
      fd.append('noticia_id', post.id)

      const rec = await pb.collection('imagenes_noticias').create(fd)
      const newUrl = pb.files.getURL(rec, rec.archivo)

      console.log(`  ✓ Subida a BD: ${raw.length / 1024 | 0}KB -> ${webp.length / 1024 | 0}KB (-${((1 - webp.length / raw.length) * 100) | 0}%)`)
      console.log(`    Nueva URL PocketBase: ${newUrl}`)

      totalSaved += (raw.length - webp.length)

      // Replace both raw URL and i0.wp.com proxy versions of it in content
      const baseClean = url.replace(/^https?:\/\/[^\/]+/, '')
      const replaceRegex = new RegExp(`https?:\\/\\/[^\\s"'<>]+${baseClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi')
      updatedContent = updatedContent.replace(replaceRegex, newUrl)
    } catch (e) {
      console.error(`Error processing ${url}:`, e.message)
    }
  }

  // Update post in PocketBase
  await pb.collection('noticias').update(post.id, {
    content: updatedContent
  })

  console.log(`¡Post actualizado con éxito en PocketBase!`)
  console.log(`Ahorro total en este post: ${(totalSaved / 1024).toFixed(1)} KB`)
}

testSinglePost().catch(console.error)
