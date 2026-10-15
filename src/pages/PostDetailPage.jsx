import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { 
  Calendar, User, Clock, Share2, 
  MessageCircle, Link as LinkIcon, Check, ArrowLeft, 
  ArrowRight, Bookmark, ThumbsUp, Tag, ChevronRight, ChevronLeft, Eye,
  Play, Pause, Square, Volume2, VolumeX, RotateCcw,
  BookmarkCheck, Heart, Sparkles, BookOpen, X,
  Camera, Maximize2
} from 'lucide-react'
import { FacebookIcon, TwitterIcon } from '../components/SocialIcons'
import { 
  getPostBySlug, 
  getPostIndexBySlug,
  getRelatedPosts, 
  getAllPostsIndex, 
  formatDate, 
  formatTimeAgo,
  getPostUrl
} from '../utils/postsService'
import NewsCard from '../components/NewsCard'
import { useRadio } from '../context/RadioContext'

// Helper to extract clean speakable text from post title, excerpt, and body
function extractReadableText(post) {
  if (!post) return ''
  const parts = []
  if (post.title) parts.push(post.title)
  if (post.excerpt) parts.push(post.excerpt)
  if (post.content) {
    const cleanContent = post.content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
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

// Split text into digestible sentence chunks for uninterrupted browser speech
function splitTextIntoSentences(text) {
  if (!text) return []
  const rawSentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]
  const chunks = []
  for (const s of rawSentences) {
    const trimmed = s.trim()
    if (!trimmed) continue
    if (trimmed.length <= 200) {
      chunks.push(trimmed)
    } else {
      const parts = trimmed.match(/.{1,180}(\s|$)/g) || [trimmed]
      for (const p of parts) {
        const pt = p.trim()
        if (pt) chunks.push(pt)
      }
    }
  }
  return chunks
}

// Format seconds into MM:SS
function formatAudioTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function PostDetailPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const rawSlug = params.slug || searchParams.get('p') || searchParams.get('id') || searchParams.get('post')
  const slug = rawSlug ? rawSlug.replace(/\/$/, '') : ''
  const navigate = useNavigate()

  const { isPlaying: isRadioPlaying, togglePlay: toggleRadio } = useRadio()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState('font-size-base')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(48)
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState(null)
  
  // 100% REAL HUMAN NEURAL MP3 AUDIO STATE
  const [hasMp3Audio, setHasMp3Audio] = useState(false)
  const [mp3Playing, setMp3Playing] = useState(false)
  const [mp3Duration, setMp3Duration] = useState(0)
  const [mp3CurrentTime, setMp3CurrentTime] = useState(0)
  const audioRef = useRef(null)

  // BROWSER TEXT-TO-SPEECH (LECTOR EN VOZ ALTA SINTETIZADOR) STATE
  const [speechStatus, setSpeechStatus] = useState('idle') // 'idle' | 'playing' | 'paused'
  const [speechRate, setSpeechRate] = useState(1.0)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const chunksRef = useRef([])
  const currentChunkIndexRef = useRef(0)
  const speechRateRef = useRef(1.0)
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const articleContentRef = useRef(null)
  const allPosts = useMemo(() => getAllPostsIndex(), [])

  // Check if article has human neural MP3 pre-rendered
  useEffect(() => {
    if (!slug) return
    let active = true
    const testUrl = `/audio/posts/${slug}.mp3`
    
    fetch(testUrl, { method: 'HEAD' })
      .then(res => {
        const cType = res.headers.get('content-type') || ''
        // In Vite / SPAs, non-existent assets return 200 with text/html fallback
        const isAudio = res.ok && !cType.includes('text/html') && (cType.includes('audio') || cType.includes('mpeg') || cType === '')
        if (active) {
          setHasMp3Audio(Boolean(isAudio))
        }
      })
      .catch(() => {
        if (active) setHasMp3Audio(false)
      })

    return () => {
      active = false
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [slug])

  // Keep speech rate ref in sync
  useEffect(() => {
    speechRateRef.current = speechRate
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate
    }
  }, [speechRate])

  // Preload voices and cancel speech on unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Reading scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (windowHeight > 0) {
        const progress = (totalScroll / windowHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Graceful fallback for broken inline images
  useEffect(() => {
    if (!articleContentRef.current) return
    const imgs = articleContentRef.current.querySelectorAll('img')
    imgs.forEach(img => {
      img.onerror = () => {
        const figure = img.closest('figure')
        if (figure) figure.style.display = 'none'
        else img.style.display = 'none'
      }
    })
  }, [post])

  // Instant 0ms Load Post: First render instantly from memory, then enrich with ~8KB content
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setSelectedLightboxIndex(null)

    // Stop and reset audio reader on navigation
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeechStatus('idle')
    setCurrentChunkIndex(0)
    currentChunkIndexRef.current = 0

    // 1. Instant synchronous render (0 milliseconds!)
    const instantPost = getPostIndexBySlug(slug)
    if (instantPost) {
      setPost(instantPost)
      setLoading(false)
    } else {
      setLoading(true)
    }

    // 2. Fetch lightweight JSON body in parallel
    let cancelled = false
    getPostBySlug(slug).then((full) => {
      if (!cancelled && full) {
        setPost(full)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [slug])

  // Separate textual article from trailing image stacks to keep article neat and not overly stretched
  const { cleanTextHtml, galleryImages } = useMemo(() => {
    if (!post || !post.content) {
      return { cleanTextHtml: post?.excerpt ? `<p>${post.excerpt}</p>` : '', galleryImages: [] }
    }

    const rawContent = post.content

    // Helper to optimize image URLs on the fly (Jetpack photon WebP conversion & 75% quality compression)
    const optimizeImageUrl = (url, targetWidth = 800) => {
      if (!url) return ''
      if (url.includes('wp-content') || url.includes('maullinultimobastion.cl')) {
        const clean = url.replace(/https?:\/\/i\d\.wp\.com\//, 'https://').split('?')[0]
        const domainPath = clean.replace(/^https?:\/\//, '')
        return `https://i0.wp.com/${domainPath}?w=${targetWidth}&strip=all&quality=75`
      }
      return url
    }

    // Extract all non-emoji image URLs from content
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    const images = []
    const seen = new Set()

    while ((match = imgRegex.exec(rawContent)) !== null) {
      const rawSrc = match[1]
      if (rawSrc && !rawSrc.includes('emoji.php')) {
        const src = optimizeImageUrl(rawSrc, 800)
        if (!seen.has(src)) {
          seen.add(src)
          images.push(src)
        }
      }
    }

    // Include post.gallery images (e.g. additional uploaded images from PocketBase)
    if (post.gallery && Array.isArray(post.gallery)) {
      post.gallery.forEach(rawSrc => {
        if (rawSrc) {
          const src = optimizeImageUrl(rawSrc, 800)
          if (!seen.has(src)) {
            seen.add(src)
            images.push(src)
          }
        }
      })
    }

    let textHtml = rawContent

    // If story is plain text (pasted without HTML tags), wrap into clean paragraphs
    if (!/<[a-z][\s\S]*>/i.test(textHtml)) {
      textHtml = textHtml
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
        .join('')
    } else {
      // Remove giant consecutive <figure> blocks and standalone img tags so textual article reads smoothly and compactly
      textHtml = textHtml
        .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
        .replace(/<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>/gi, '')
        .replace(/<img[^>]+>/gi, '')
        .trim()

      // Fallback if removing figures stripped all content
      if (!textHtml || textHtml.replace(/<[^>]+>/g, '').trim().length === 0) {
        textHtml = rawContent
      }
    }

    return { cleanTextHtml: textHtml, galleryImages: images }
  }, [post])

  // Lightbox keyboard controls (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (selectedLightboxIndex === null) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedLightboxIndex(null)
      else if (e.key === 'ArrowRight') {
        setSelectedLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowLeft') {
        setSelectedLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedLightboxIndex, galleryImages.length])

  // Previous and next post calculation
  const { prevPost, nextPost } = useMemo(() => {
    if (!post) return { prevPost: null, nextPost: null }
    const idx = allPosts.findIndex(p => p.id === post.id)
    return {
      prevPost: idx > 0 ? allPosts[idx - 1] : null,
      nextPost: idx < allPosts.length - 1 ? allPosts[idx + 1] : null
    }
  }, [post, allPosts])

  // Deterministic reads counter
  const readViews = useMemo(() => {
    if (!post) return '450'
    const base = ((post.id * 17) % 850) + 220
    return base > 999 ? `${(base / 1000).toFixed(1)}K` : `${base}`
  }, [post])

  // ----------------------------------------------------
  // REAL WEB SPEECH API (LECTURA EN VOZ ALTA) HANDLERS
  // ----------------------------------------------------
  const speakChunk = useCallback((index) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const chunks = chunksRef.current
    if (index >= chunks.length) {
      setSpeechStatus('idle')
      setCurrentChunkIndex(0)
      currentChunkIndexRef.current = 0
      return
    }

    currentChunkIndexRef.current = index
    setCurrentChunkIndex(index)
    setSpeechStatus('playing')

    window.speechSynthesis.cancel()

    const textToSpeak = chunks[index]
    const utter = new SpeechSynthesisUtterance(textToSpeak)
    utter.lang = 'es-CL'
    utter.rate = speechRateRef.current

    // Detect best voice in Spanish (prioritizing Natural/Neural human voices over robotic desktop voices)
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      const spanishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'))
      
      const naturalVoice = spanishVoices.find(v => 
        v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')
      )
      const googleVoice = spanishVoices.find(v => 
        v.name.toLowerCase().includes('google')
      )
      const chileanVoice = spanishVoices.find(v => v.lang === 'es-CL')
      const latamVoice = spanishVoices.find(v => v.lang === 'es-419' || v.lang === 'es-MX' || v.lang === 'es-US')
      const anySpanish = spanishVoices[0]

      const chosenVoice = naturalVoice || googleVoice || chileanVoice || latamVoice || anySpanish
      if (chosenVoice) {
        utter.voice = chosenVoice
      }
    }

    utter.onend = () => {
      const nextIndex = index + 1
      if (nextIndex < chunksRef.current.length) {
        speakChunk(nextIndex)
      } else {
        setSpeechStatus('idle')
        setCurrentChunkIndex(0)
        currentChunkIndexRef.current = 0
      }
    }

    utter.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e)
        setSpeechStatus('idle')
      }
    }

    window.speechSynthesis.speak(utter)
  }, [])

  const handleToggleSpeech = () => {
    // 1. If real human MP3 audio is available, control HTML5 audio element
    if (hasMp3Audio && audioRef.current) {
      if (isRadioPlaying && toggleRadio) {
        toggleRadio()
      }
      if (mp3Playing) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(e => console.warn('Audio play error:', e))
      }
      return
    }

    // 2. Fallback to Web Speech API
    if (!isSpeechSupported || !post) return

    // Pause online radio if playing to avoid audio conflict
    if (isRadioPlaying && toggleRadio) {
      toggleRadio()
    }

    if (speechStatus === 'playing') {
      window.speechSynthesis.pause()
      setSpeechStatus('paused')
      return
    }

    if (speechStatus === 'paused') {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        setSpeechStatus('playing')
      } else {
        speakChunk(currentChunkIndexRef.current)
      }
      return
    }

    // Start from beginning
    const fullText = extractReadableText(post)
    const chunks = splitTextIntoSentences(fullText)
    if (chunks.length === 0) return

    chunksRef.current = chunks
    setTotalChunks(chunks.length)
    speakChunk(0)
  }

  const handleStopSpeech = () => {
    if (hasMp3Audio && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setMp3Playing(false)
      setMp3CurrentTime(0)
      return
    }

    if (!isSpeechSupported) return
    window.speechSynthesis.cancel()
    setSpeechStatus('idle')
    setCurrentChunkIndex(0)
    currentChunkIndexRef.current = 0
  }

  const handleCycleSpeed = () => {
    const nextSpeed = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0
    setSpeechRate(nextSpeed)
    speechRateRef.current = nextSpeed
    if (hasMp3Audio && audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    } else if (speechStatus === 'playing') {
      speakChunk(currentChunkIndexRef.current)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#05a353] border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 font-medium text-sm">Cargando artículo...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 font-serif">Noticia no encontrada</h2>
          <p className="text-sm text-slate-500 mb-6">
            La noticia solicitada no existe o fue movida en el archivo.
          </p>
          <Link
            to="/noticias"
            className="inline-flex items-center gap-2 bg-[#002845] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-sky-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Ver Archivo de Noticias
          </Link>
        </div>
      </div>
    )
  }

  const mainCategory = post.categories?.[0] || { name: 'Comunidad', slug: 'cultura-comunidad' }
  const relatedPosts = getRelatedPosts(post, 4)
  const mostReadSidebar = allPosts.slice(0, 5)
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${getPostUrl(post)}`
    : getPostUrl(post)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${post.title} - ${currentUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank')
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(post.title)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank')
  }

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikesCount(c => c + 1)
    } else {
      setLiked(false)
      setLikesCount(c => c - 1)
    }
  }

  // Reading time approximation
  const wordCount = (post.content || post.excerpt || '').replace(/<[^>]+>/g, '').split(/\s+/).length
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <article className="min-h-screen bg-slate-50 pb-24 relative selection:bg-[#05a353] selection:text-white">
      
      {/* 1. SLIM READING PROGRESS BAR (STICKY AT TOP) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-[#05a353] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. BREADCRUMBS BAR */}
      <div className="bg-white border-b border-slate-200 py-2.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-emerald-700 flex items-center gap-1 shrink-0">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <Link to="/noticias" className="hover:text-emerald-700 text-slate-600 font-medium shrink-0">
            Noticias Publicadas
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <Link to={`/categoria/${mainCategory.slug}`} className="hover:text-emerald-700 text-[#05a353] font-bold uppercase shrink-0">
            {mainCategory.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-slate-400 truncate max-w-[240px] sm:max-w-md">
            {post.title}
          </span>
        </div>
      </div>

      {/* 3. MAIN ARTICLE CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MAIN ARTICLE CONTENT (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-8 lg:p-10 space-y-6">
            
            {/* Category badge, Date & Reading Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(post.categories && post.categories.length > 0 ? post.categories : [mainCategory]).map((cat) => (
                  <Link
                    key={cat.slug || cat.name}
                    to={`/categoria/${cat.slug}`}
                    className="bg-[#05a353] hover:bg-[#048a46] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors shadow-2xs"
                  >
                    {cat.name}
                  </Link>
                ))}
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium ml-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(post.date)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {readMinutes} min de lectura
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {readViews} lecturas
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold text-slate-900 leading-[1.22] font-serif tracking-tight">
              {post.title}
            </h1>

            {/* Lead paragraph / Bajada destacada */}
            {post.excerpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-l-4 border-[#05a353] text-slate-700 font-serif text-base sm:text-lg leading-relaxed italic">
                {post.excerpt}
              </div>
            )}

            {/* Author Bar & Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#002845] text-white font-bold flex items-center justify-center text-xs shadow-2xs font-serif">
                  UB
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {post.author || 'Redacción Último Bastión'}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      Oficial
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {formatTimeAgo(post.date)} • Maullín, Región de Los Lagos
                  </span>
                </div>
              </div>

              {/* Share & Reading actions */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline font-medium">Compartir:</span>
                
                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  aria-label="Compartir en WhatsApp"
                  title="Compartir en WhatsApp"
                  className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-emerald-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>

                {/* Facebook */}
                <button
                  onClick={shareFacebook}
                  aria-label="Compartir en Facebook"
                  title="Compartir en Facebook"
                  className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-blue-700 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs"
                >
                  <FacebookIcon className="w-4 h-4" />
                </button>

                {/* X */}
                <button
                  onClick={shareTwitter}
                  aria-label="Compartir en X"
                  title="Compartir en X"
                  className="w-8 h-8 rounded-full bg-black hover:bg-slate-800 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-2xs"
                >
                  <TwitterIcon className="w-4 h-4" />
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  aria-label="Copiar enlace"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-2xs ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                  title={copied ? '¡Copiado!' : 'Copiar enlace'}
                >
                  {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* REAL ACCESSIBLE AUDIO PLAYER WIDGET (SÍNTESIS DE VOZ Y LOCUCIÓN HUMANA) */}
            {(hasMp3Audio || isSpeechSupported) && (
              <div className="bg-gradient-to-r from-emerald-50/90 via-slate-50 to-emerald-50/50 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all">
                {/* Hidden HTML5 Audio Element for Real Neural MP3 */}
                {hasMp3Audio && (
                  <audio
                    ref={audioRef}
                    src={`/audio/posts/${slug}.mp3`}
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      const dur = e.currentTarget.duration
                      if (!isNaN(dur) && dur > 0) {
                        setMp3Duration(dur)
                      } else {
                        setHasMp3Audio(false)
                      }
                    }}
                    onError={() => {
                      setHasMp3Audio(false)
                    }}
                    onTimeUpdate={(e) => setMp3CurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => {
                      setMp3Playing(false)
                      setMp3CurrentTime(0)
                    }}
                    onPlay={() => setMp3Playing(true)}
                    onPause={() => setMp3Playing(false)}
                    className="hidden"
                  />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Play button & Information */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleSpeech}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 cursor-pointer ${
                        (hasMp3Audio ? mp3Playing : speechStatus === 'playing')
                          ? 'bg-emerald-600 text-white shadow-emerald-200 ring-4 ring-emerald-100'
                          : (!hasMp3Audio && speechStatus === 'paused')
                          ? 'bg-amber-500 text-white shadow-amber-200 ring-4 ring-amber-100'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105'
                      }`}
                      aria-label="Reproducir o pausar audio de la noticia"
                      title={
                        (hasMp3Audio ? mp3Playing : speechStatus === 'playing')
                          ? 'Pausar audio'
                          : 'Escuchar toda la noticia'
                      }
                    >
                      {(hasMp3Audio ? mp3Playing : speechStatus === 'playing') ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {hasMp3Audio ? (
                            mp3Playing ? 'Reproduciendo audio...' : 'Escuchar esta noticia'
                          ) : (
                            speechStatus === 'playing'
                              ? 'Leyendo noticia en voz alta...'
                              : speechStatus === 'paused'
                              ? 'Lectura en pausa'
                              : 'Escuchar esta noticia completa'
                          )}
                        </span>
                        
                        {/* Audio Badge */}
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <Volume2 className="w-3 h-3" />
                          <span>{hasMp3Audio ? 'Audio disponible' : 'Lectura en voz alta'}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {hasMp3Audio ? (
                          <span>
                            {formatAudioTime(mp3CurrentTime)} / {formatAudioTime(mp3Duration)} • El Último Bastión
                          </span>
                        ) : speechStatus === 'playing' ? (
                          <span>
                            Párrafo {currentChunkIndex + 1} de {totalChunks} • Lectura continua
                          </span>
                        ) : speechStatus === 'paused' ? (
                          <span>Pulsa reproducir para reanudar donde quedaste</span>
                        ) : (
                          <span>
                            Lectura asistida • Duración aprox: ~{readMinutes} min
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Soundwave equalizer animation & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                    
                    {/* Animated equalizer waves while playing */}
                    {((hasMp3Audio && mp3Playing) || (!hasMp3Audio && speechStatus === 'playing')) && (
                      <div className="flex items-end gap-0.5 h-4 text-emerald-600 px-1">
                        <span className="w-1 bg-emerald-600 rounded-full h-4 animate-pulse" />
                        <span className="w-1 bg-emerald-600 rounded-full h-2 animate-pulse delay-75" />
                        <span className="w-1 bg-emerald-600 rounded-full h-3.5 animate-pulse delay-150" />
                        <span className="w-1 bg-emerald-600 rounded-full h-2.5 animate-pulse delay-100" />
                      </div>
                    )}

                    {/* Speed toggle button */}
                    <button
                      onClick={handleCycleSpeed}
                      className="text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs transition-colors cursor-pointer"
                      title="Cambiar velocidad de lectura"
                    >
                      {speechRate}x
                    </button>

                    {/* Stop button */}
                    {((hasMp3Audio && (mp3Playing || mp3CurrentTime > 0)) || (!hasMp3Audio && speechStatus !== 'idle')) && (
                      <button
                        onClick={handleStopSpeech}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="Detener lectura y volver al inicio"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span className="text-[11px]">Detener</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Progress bar */}
                {hasMp3Audio && mp3Duration > 0 ? (
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-150 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((mp3CurrentTime / mp3Duration) * 100))}%` }}
                    />
                  </div>
                ) : speechStatus !== 'idle' && totalChunks > 0 ? (
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${Math.round(((currentChunkIndex + 1) / totalChunks) * 100)}%` }}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Featured Lead Image (WebP) */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200 aspect-[16/10] max-h-[520px]">
              <img
                src={post.image}
                alt={post.title}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onError={(e) => {
                  if (e.currentTarget.dataset.failed) return
                  e.currentTarget.dataset.failed = "true"
                  e.currentTarget.src = '/images/default-news.webp'
                }}
                className="w-full h-full object-cover mx-auto"
              />
              <div className="py-2.5 px-4 bg-slate-50 text-slate-500 text-xs italic text-center border-t border-slate-200">
                {post.title} — Archivo Fotográfico Oficial de Maullín
              </div>
            </div>

            {/* Reading Size Adjuster Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-b border-slate-100 pb-2">
              <span className="flex items-center gap-1 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Lectura cómoda
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] mr-1 hidden sm:inline">Tamaño:</span>
                <button
                  onClick={() => setFontSize('font-size-sm')}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    fontSize === 'font-size-sm'
                      ? 'bg-[#002845] text-white border-[#002845] shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Letra pequeña (15px)"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('font-size-base')}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    fontSize === 'font-size-base'
                      ? 'bg-[#002845] text-white border-[#002845] shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Letra normal (17px)"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('font-size-lg')}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    fontSize === 'font-size-lg'
                      ? 'bg-[#002845] text-white border-[#002845] shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Letra grande (20px)"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('font-size-xl')}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                    fontSize === 'font-size-xl'
                      ? 'bg-[#002845] text-white border-[#002845] shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Letra muy grande (23px)"
                >
                  A++
                </button>
              </div>
            </div>

            {/* Article Formatted Body with Dynamic Font Scaling */}
            <div 
              ref={articleContentRef}
              className={`article-content max-w-none text-slate-800 font-sans transition-all duration-200 ${fontSize}`}
              dangerouslySetInnerHTML={{ 
                __html: cleanTextHtml || `<p>${post.excerpt}</p>` 
              }}
            />

            {/* Compact Photo Gallery below text */}
            {galleryImages.length > 0 && (
              <section className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#05a353] flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 leading-tight">
                        Galería Fotográfica de la Noticia
                      </h3>
                      <p className="text-xs text-slate-500">
                        {galleryImages.length} {galleryImages.length === 1 ? 'fotografía registrada' : 'fotografías registradas'} • Clic en cualquier imagen para ampliar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {galleryImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedLightboxIndex(idx)}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all"
                    >
                      <img
                        src={imgSrc}
                        alt={`${post.title} - Foto ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          if (e.currentTarget.dataset.failed) return
                          e.currentTarget.dataset.failed = "true"
                          e.currentTarget.src = '/images/default-news.webp'
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/35 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-slate-900 p-2 rounded-full shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-900" />
                        </span>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {idx + 1}/{galleryImages.length}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Like and Reactions Bar */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    liked 
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600' : ''}`} />
                  <span>Me gusta ({likesCount})</span>
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    bookmarked 
                      ? 'bg-emerald-50 text-[#05a353] border-emerald-200 shadow-2xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#05a353]' : ''}`} />
                  <span>{bookmarked ? 'Guardado' : 'Guardar noticia'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="text-xs text-sky-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {copied ? '¡Enlace copiado al portapapeles!' : 'Copiar enlace'}
                </button>
              </div>
            </div>

            {/* Tags / Categories Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-sky-600" /> Etiquetas:
              </span>
              {post.categories?.map((c) => (
                <Link
                  key={c.id}
                  to={`/categoria/${c.slug}`}
                  className="bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs px-2.5 py-1 rounded-lg transition-colors font-medium"
                >
                  #{c.name}
                </Link>
              ))}
            </div>

            {/* Previous & Next Article Navigation Cards */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  to={getPostUrl(prevPost)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#05a353] bg-slate-50/70 hover:bg-emerald-50/30 transition-all group block text-left"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 flex items-center gap-1 mb-1">
                    <ArrowLeft className="w-3 h-3" /> Noticia Anterior
                  </span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    {prevPost.title}
                  </h4>
                </Link>
              ) : <div />}

              {nextPost && (
                <Link
                  to={getPostUrl(nextPost)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#05a353] bg-slate-50/70 hover:bg-emerald-50/30 transition-all group block text-right sm:text-right"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 flex items-center justify-end gap-1 mb-1">
                    Siguiente Noticia <ArrowRight className="w-3 h-3" />
                  </span>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                    {nextPost.title}
                  </h4>
                </Link>
              )}
            </div>

          </div>

          {/* RIGHT: MODERN EDITORIAL SIDEBAR (lg:col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Interactive Calendar CTA */}
            <div className="bg-gradient-to-br from-[#002845] to-[#001728] text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Archivo Interactivo</span>
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                Revisa noticias por fecha con nuestro calendario
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Selecciona cualquier día histórico para ver al instante las publicaciones emitidas en Maullín.
              </p>
              <Link
                to="/noticias"
                className="inline-flex items-center justify-center gap-2 w-full bg-[#05a353] hover:bg-[#048a46] text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-2xs"
              >
                <span>Abrir Calendario de Noticias</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Widget 2: Lo Más Leído Hoy (Ranked 1-5) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#05a353] rounded-full" />
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Lo Más Leído Hoy
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Tendencias
                </span>
              </div>

              <div className="space-y-3.5 divide-y divide-slate-100">
                {mostReadSidebar.map((item, idx) => (
                  <article key={item.id} className="pt-3 first:pt-0 flex items-start gap-3 group cursor-pointer">
                    <span className="font-serif font-extrabold text-2xl text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0 w-5 text-center leading-none mt-1">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link to={getPostUrl(item)}>
                        <h4 className="font-serif font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{formatTimeAgo(item.date)}</span>
                        <span>•</span>
                        <span>{((item.id * 19) % 800) + 210} lecturas</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Widget 3: Noticias Relacionadas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-sky-600 rounded-full" />
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Relacionadas con {mainCategory.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {relatedPosts.map((rel) => (
                  <article key={rel.id} className="flex items-start gap-3 group">
                    <Link
                      to={getPostUrl(rel)}
                      className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100"
                    >
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => { e.currentTarget.src = '/images/default-news.webp' }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={getPostUrl(rel)}>
                        <h4 className="font-serif font-bold text-xs text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                      </Link>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatTimeAgo(rel.date)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Widget 4: Radio Pangal 88.3 FM */}
            <div 
              onClick={toggleRadio}
              className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors group select-none"
              title={isRadioPlaying ? 'Pausar Radio Pangal' : 'Activar Radio Pangal en vivo'}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRadioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">Radio Pangal 88.3 FM</h4>
                  <span className="text-[10px] text-slate-400">
                    {isRadioPlaying ? 'Transmitiendo en vivo' : 'En silencio • Clic para activar'}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleRadio() }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 transition-all ${
                  isRadioPlaying ? 'bg-[#05a353] text-white' : 'bg-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950'
                }`}
              >
                {isRadioPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                <span>{isRadioPlaying ? 'Pausar' : 'Activar'}</span>
              </button>
            </div>

          </aside>

        </div>
      </div>

      {/* 4. MOBILE STICKY BOTTOM ACTION BAR (APP-LIKE FEEL) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 z-40 flex items-center justify-between shadow-lg">
        <Link 
          to="/noticias" 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al archivo</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>
          
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full border ${liked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. FULL-SCREEN LIGHTBOX MODAL */}
      {selectedLightboxIndex !== null && galleryImages[selectedLightboxIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          onClick={() => setSelectedLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter badge */}
          <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold">
            {selectedLightboxIndex + 1} de {galleryImages.length}
          </div>

          {/* Prev button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Anterior (Flecha izquierda)"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Siguiente (Flecha derecha)"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {/* Main image container */}
          <div 
            className="relative max-w-5xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[selectedLightboxIndex]}
              alt={`${post.title} - Fotografía ${selectedLightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </article>
  )
}
