import PocketBase from 'pocketbase'
import sharp from 'sharp'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function testBatch() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  const urls = [
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/DSC_0191-1024x678.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/casa-pauly-1024x427.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/molino-machmar-1024x418.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/FEST-MAR-BRAVA-223-1024x674.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/FEST-MAR-BRAVA-232-1024x674.jpg'
  ]

  console.log('Testing batch optimization and upload...')
  const t0 = Date.now()

  const createdIds = []

  async function processOne(url) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = Buffer.from(await res.arrayBuffer())
      
      const webp = await sharp(raw)
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 68, effort: 6, smartSubsample: true })
        .toBuffer()

      const fd = new FormData()
      const blob = new Blob([webp], { type: 'image/webp' })
      const filename = url.split('/').pop().replace(/\.[a-z0-9]+$/i, '') + '.webp'
      fd.append('archivo', blob, filename)
      fd.append('url_original', url)

      const rec = await pb.collection('imagenes_noticias').create(fd)
      createdIds.push(rec.id)
      console.log(`✓ Uploaded ${filename}: ${raw.length / 1024 | 0}KB -> ${webp.length / 1024 | 0}KB (ID: ${rec.id})`)
    } catch (e) {
      console.error(`✗ Error on ${url}:`, e.message)
    }
  }

  await Promise.all(urls.map(u => processOne(u)))

  console.log(`Completed in ${((Date.now() - t0) / 1000).toFixed(2)}s`)

  // Cleanup test records
  console.log('Cleaning up test records...')
  for (const id of createdIds) {
    await pb.collection('imagenes_noticias').delete(id)
  }
  console.log('Cleaned up!')
}

testBatch().catch(console.error)
