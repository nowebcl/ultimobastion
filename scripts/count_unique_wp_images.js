import fs from 'fs'

const files = fs.readdirSync('public/data/posts')
let wpUrls = new Set()

for (const file of files) {
  const p = JSON.parse(fs.readFileSync('public/data/posts/' + file, 'utf8'))
  const content = p.content || ''
  const regex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = regex.exec(content)) !== null) {
    const src = match[1]
    if (src.includes('maullinultimobastion.cl/wp-content/uploads/')) {
      // Normalize URL: remove i0.wp.com/ query params etc.
      let clean = src.replace(/https?:\/\/[a-z0-9]+\.wp\.com\//i, 'https://')
      clean = clean.split('?')[0]
      wpUrls.add(clean)
    }
  }
}

console.log('Total URLs únicas limpias de WordPress:', wpUrls.size)
const list = Array.from(wpUrls)
console.log('Primeras 5:', list.slice(0, 5))
