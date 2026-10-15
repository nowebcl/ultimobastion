import sharp from 'sharp'

async function testComp() {
  const urls = [
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/DSC_0191-1024x678.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/casa-pauly-1024x427.jpg',
    'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/2026/06/FEST-MAR-BRAVA-223-1024x674.jpg'
  ]

  for (const url of urls) {
    console.log('Testing:', url.split('/').pop())
    const res = await fetch(url)
    const raw = Buffer.from(await res.arrayBuffer())
    console.log('  Original:', (raw.length / 1024).toFixed(1), 'KB')

    for (const q of [75, 68, 60]) {
      const b1000 = await sharp(raw)
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer()
      console.log(`  WebP Q=${q} (max 1000px, effort 6): ${(b1000.length / 1024).toFixed(1)} KB`)
    }
  }
}

testComp().catch(console.error)
