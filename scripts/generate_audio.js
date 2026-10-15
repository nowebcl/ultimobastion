import fs from 'fs'
import path from 'path'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const AUDIO_DIR = path.resolve(process.cwd(), 'public/audio/posts')
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

// Available 100% FREE Neural Voices (Locutores Profesionales)
export const VOICES = {
  catalina: 'es-CL-CatalinaNeural', // Locutora Chilena (Voz femenina natural)
  lorenzo: 'es-CL-LorenzoNeural',   // Locutor Chileno (Voz masculina natural)
  dalia: 'es-MX-DaliaNeural',       // Locutora Latina (Voz femenina neutra)
  jorge: 'es-MX-JorgeNeural'        // Locutor Latino (Voz masculina neutra)
}

/**
 * Extract clean, speakable text from post object
 */
export function extractCleanText(post) {
  if (!post) return ''
  const parts = []
  if (post.title) parts.push(post.title.trim())
  if (post.excerpt) {
    const cleanExcerpt = post.excerpt.replace(/<[^>]+>/g, '').trim()
    if (cleanExcerpt) parts.push(cleanExcerpt)
  }
  if (post.content) {
    const cleanContent = post.content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
      .replace(/<img[^>]+>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#8211;|&#8212;/g, '—')
      .replace(/&#8220;|&#8221;/g, '"')
      .replace(/&#8216;|&#8217;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
    if (cleanContent) parts.push(cleanContent)
  }
  return parts.join('. ')
}

/**
 * Generate MP3 audio using Microsoft Edge Neural TTS (100% Free & Human)
 */
export async function generatePostAudio(post, voiceKey = 'catalina') {
  const voice = VOICES[voiceKey] || VOICES.catalina
  const outPath = path.join(AUDIO_DIR, `${post.slug}.mp3`)

  const text = extractCleanText(post)
  if (!text) {
    throw new Error('El artículo no contiene texto para locutar.')
  }

  const tts = new MsEdgeTTS()
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

  const { audioStream } = tts.toStream(text)
  const out = fs.createWriteStream(outPath)

  await new Promise((resolve, reject) => {
    audioStream.pipe(out)
    out.on('finish', resolve)
    audioStream.on('error', reject)
    out.on('error', reject)
  })

  return {
    filePath: outPath,
    url: `/audio/posts/${post.slug}.mp3`,
    size: fs.statSync(outPath).size
  }
}

// CLI Execution support
if (process.argv[1] && process.argv[1].endsWith('generate_audio.js')) {
  const args = process.argv.slice(2)
  const postsIndex = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf-8'))

  const voiceArg = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : 'catalina'

  let targetPosts = []
  if (args.includes('--latest')) {
    const count = parseInt(args[args.indexOf('--latest') + 1] || '5', 10)
    targetPosts = postsIndex.slice(0, count)
  } else if (args[0] && !args[0].startsWith('--')) {
    const slug = args[0]
    const found = postsIndex.find(p => p.slug === slug || String(p.id) === slug)
    if (found) targetPosts = [found]
    else console.error('No se encontró el artículo:', slug)
  } else {
    // Default: generate latest 3
    targetPosts = postsIndex.slice(0, 3)
  }

  ;(async () => {
    console.log(`🎙️ Generando locución humana con voz: ${voiceArg.toUpperCase()} (${targetPosts.length} artículos)...`)
    for (const post of targetPosts) {
      try {
        console.log(`- Locutando: "${post.title.slice(0, 40)}..."`)
        const res = await generatePostAudio(post, voiceArg)
        console.log(`  ✓ Guardado: ${res.url} (${Math.round(res.size / 1024)} KB)`)
      } catch (err) {
        console.error(`  ✗ Error en "${post.slug}":`, err.message)
      }
    }
    console.log('✅ Proceso completado.')
    process.exit(0)
  })().catch(err => {
    console.error('Error fatal:', err)
    process.exit(1)
  })
}
