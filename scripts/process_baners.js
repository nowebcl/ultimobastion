import sharp from 'sharp'
import fs from 'fs'

const files = [
  'WhatsApp Image 2026-10-15 at 14.21.33.jpeg',
  '2.jpeg',
  '3.jpeg',
  '4.jpeg',
  '5.jpeg',
  '6.jpeg'
]

async function processBaners() {
  for (let i = 0; i < files.length; i++) {
    const inputPath = `public/images/BANERS/${files[i]}`
    const outSitePath = `public/images/site/gallery-${i + 1}.webp`
    const outBanerPath = `public/images/BANERS/baner-${i + 1}.webp`

    await sharp(inputPath)
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outSitePath)

    fs.copyFileSync(outSitePath, outBanerPath)

    const size = (fs.statSync(outSitePath).size / 1024).toFixed(1)
    console.log(`✓ Processed BANER ${i + 1} (${files[i]}): ${size} KB -> ${outSitePath}`)
  }
}

processBaners().catch(console.error)
