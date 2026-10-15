import fs from 'fs'
import sharp from 'sharp'

const videos = [
  {
    id: 'rwJjTbPWQ74',
    title: 'Terremoto y Maremoto 1960 - Historia Cultural de Maullín (Cap. 5)',
    duration: '14:20',
    timeAgo: 'Maullín Histórico',
    author: 'Sintonízate Maullín'
  },
  {
    id: 'SR1t4FMkFIU',
    title: 'Recomiendo Chile | Maullín: Tradición y Sabor Costero',
    duration: '52:10',
    timeAgo: 'El 13',
    author: 'Recomiendo Chile'
  },
  {
    id: 'PDgFD4lDaX4',
    title: 'Lugares Que Hablan: Bellezas y Gente de Maullín',
    duration: '45:30',
    timeAgo: 'El 13',
    author: 'Lugares Que Hablan'
  },
  {
    id: 'AaGCswu-yEw',
    title: 'Historia Cultural de Maullín - Capítulo 4',
    duration: '18:15',
    timeAgo: 'Patrimonio Local',
    author: 'Sintonízate Maullín'
  },
  {
    id: 'SqyLTgMsNWk',
    title: 'Historia Cultural de Maullín - Primer Capítulo (Año 2008)',
    duration: '16:40',
    timeAgo: 'Archivo Histórico',
    author: 'Sintonízate Maullín'
  },
  {
    id: 'PnZ4dBcjbaI',
    title: 'Historia Cultural de Maullín - Patrimonio Arquitectónico',
    duration: '12:05',
    timeAgo: 'Arquitectura & Identidad',
    author: 'Sintonízate Maullín'
  }
]

async function run() {
  if (!fs.existsSync('public/images/videos')) {
    fs.mkdirSync('public/images/videos', { recursive: true })
  }

  for (const v of videos) {
    const url = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`
    const res = await fetch(url)
    if (res.ok) {
      const raw = Buffer.from(await res.arrayBuffer())
      const outPath = `public/images/videos/${v.id}.webp`
      await sharp(raw)
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath)
      console.log(`Saved thumbnail: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`)
    }
  }
}

run().catch(console.error)
