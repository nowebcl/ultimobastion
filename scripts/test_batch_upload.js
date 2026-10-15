import fs from 'fs'
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function testBatch() {
  console.log('Authenticating...')
  await pb.collection('users').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')
  console.log('Authenticated!')

  const index = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf8'))
  const sample = index.slice(0, 3)

  for (const item of sample) {
    const existing = await pb.collection('noticias').getList(1, 1, {
      filter: `slug = "${item.slug}"`
    })

    if (existing.totalItems > 0) {
      console.log(`Post ${item.id} (${item.slug}) already exists in DB`)
      continue
    }

    const fullPost = JSON.parse(fs.readFileSync(`public/data/posts/${item.id}.json`, 'utf8'))
    const imagePath = `public/images/posts/${item.id}.webp`
    const imageBuffer = fs.readFileSync(imagePath)
    const imageBlob = new Blob([imageBuffer], { type: 'image/webp' })

    const fd = new FormData()
    fd.append('title', fullPost.title)
    fd.append('slug', fullPost.slug)
    fd.append('excerpt', fullPost.excerpt || '')
    fd.append('content', fullPost.content || '')
    fd.append('category', fullPost.categories?.[0]?.name || 'Actualidad')
    fd.append('author', fullPost.author || 'Redacción Último Bastión')
    fd.append('date', fullPost.date || new Date().toISOString())
    fd.append('image', imageBlob, `${item.id}.webp`)

    const res = await pb.collection('noticias').create(fd)
    console.log(`Uploaded ${item.id}:`, res.id, res.title.slice(0, 40), 'Image:', res.image)
  }

  console.log('Test batch complete!')
}

testBatch().catch(console.error)
