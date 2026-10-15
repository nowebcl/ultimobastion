import fs from 'fs'

const files = fs.readdirSync('public/data/posts')
let basePhotos = new Set()
let allImgTags = 0

for (const file of files) {
  const p = JSON.parse(fs.readFileSync('public/data/posts/' + file, 'utf8'))
  const content = p.content || ''
  const regex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = regex.exec(content)) !== null) {
    allImgTags++
    let src = match[1]
    if (src.includes('wp-content/uploads/')) {
      // Normalize base name by stripping dimension suffixes like -1024x683, -300x200, etc.
      let clean = src.replace(/https?:\/\/[a-z0-9]+\.wp\.com\//i, 'https://').split('?')[0]
      let base = clean.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1')
      basePhotos.add(base)
    }
  }
}

console.log('Total tags <img> en todos los posts:', allImgTags)
console.log('Fotos REALES únicas (sin sufijos redundantes -1024x768, -300x200, etc.):', basePhotos.size)
