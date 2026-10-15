import fs from 'fs'

const html = fs.readFileSync('homepage_dump.html', 'utf8')
const ytMatches = html.match(/(?:youtube\.com|youtu\.be)[^\s"'>]+/gi) || []
console.log('YouTube matches in homepage_dump:', ytMatches)

const iframeMatches = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi) || []
console.log('Iframe matches:', iframeMatches)

// Also search for "videos" section or header in homepage_dump.html
const videoSections = []
const lines = html.split('\n')
for (let i = 0; i < lines.length; i++) {
  if (/videos|video/i.test(lines[i])) {
    videoSections.push({ line: i, text: lines[i].slice(0, 150) })
  }
}
console.log('Video lines found:', videoSections.slice(0, 10))
