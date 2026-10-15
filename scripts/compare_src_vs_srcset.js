import fs from 'fs'

const files = fs.readdirSync('public/data/posts')
let imgSrcUrls = new Set()
let allWpUrls = new Set()

for (const file of files) {
  const p = JSON.parse(fs.readFileSync('public/data/posts/' + file, 'utf8'))
  const content = p.content || ''
  
  // 1. Only src attribute
  const srcRegex = /<img[^>]+src=["']([^"']+)["']/gi
  let match
  while ((match = srcRegex.exec(content)) !== null) {
    if (match[1].includes('wp-content/uploads/')) {
      imgSrcUrls.add(match[1].replace(/https?:\/\/[a-z0-9]+\.wp\.com\//i, 'https://').split('?')[0])
    }
  }

  // 2. All URLs including srcset
  const allRegex = /https?:\/\/[^\s"'<>]+\/wp-content\/uploads\/[^\s"'<>]+/gi
  const allMatches = content.match(allRegex) || []
  for (const m of allMatches) {
    allWpUrls.add(m.replace(/https?:\/\/[a-z0-9]+\.wp\.com\//i, 'https://').split('?')[0])
  }
}

console.log('URLs que son SRC directo de etiquetas <img>:', imgSrcUrls.size)
console.log('URLs totales (incluyendo srcset):', allWpUrls.size)
