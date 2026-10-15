import fs from 'fs'

const files = fs.readdirSync('public/data/posts')
let externalImages = new Set()
let localImages = new Set()

for (const file of files) {
  const p = JSON.parse(fs.readFileSync('public/data/posts/' + file, 'utf8'))
  const content = p.content || ''
  const regex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = regex.exec(content)) !== null) {
    const src = match[1]
    if (src.startsWith('http')) externalImages.add(src)
    else localImages.add(src)
  }
}

console.log('Total files:', files.length)
console.log('Unique external image URLs in content:', externalImages.size)
console.log('Unique local image URLs in content:', localImages.size)
console.log('Sample local images:', Array.from(localImages).slice(0, 5))
console.log('Sample external images:', Array.from(externalImages).slice(0, 5))
