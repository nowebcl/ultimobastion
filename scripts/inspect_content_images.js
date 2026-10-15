import fs from 'fs'

const files = fs.readdirSync('public/data/posts')
let domains = {}
let sampleUrls = []
let totalImgTags = 0
let urlsSet = new Set()
let postsWithImages = 0
let imagesPerPost = []

for (const file of files) {
  const p = JSON.parse(fs.readFileSync('public/data/posts/' + file, 'utf8'))
  const content = p.content || ''
  const regex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  let countThisPost = 0
  while ((match = regex.exec(content)) !== null) {
    totalImgTags++
    countThisPost++
    const src = match[1]
    urlsSet.add(src)
    try {
      const u = new URL(src)
      domains[u.hostname] = (domains[u.hostname] || 0) + 1
    } catch (e) {}
    if (sampleUrls.length < 15) sampleUrls.push(src)
  }
  if (countThisPost > 0) {
    postsWithImages++
    imagesPerPost.push(countThisPost)
  }
}

console.log('Posts revisados:', files.length)
console.log('Posts que contienen imágenes en el texto:', postsWithImages)
console.log('Total etiquetas <img> encontradas:', totalImgTags)
console.log('URLs únicas de imágenes:', urlsSet.size)
console.log('Dominios:', domains)
console.log('\nPrimeras 10 URLs de muestra:\n', sampleUrls.slice(0, 10).join('\n'))

// Estadísticas de cantidad por post
imagesPerPost.sort((a, b) => b - a)
console.log('\nTop 5 posts con más imágenes:', imagesPerPost.slice(0, 5))
console.log('Mediana de imágenes en posts que tienen:', imagesPerPost[Math.floor(imagesPerPost.length / 2)])
