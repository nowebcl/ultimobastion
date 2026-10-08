import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Calendar, User, Clock, Share2, 
  MessageCircle, Link as LinkIcon, Check, ArrowLeft, 
  ArrowRight, Bookmark, ThumbsUp, Tag, ChevronRight, ChevronLeft, Eye,
  Volume2, VolumeX, Play, Pause, BookmarkCheck, Heart, Sparkles, BookOpen, X,
  Camera, Maximize2
} from 'lucide-react'
import { FacebookIcon, TwitterIcon } from '../components/SocialIcons'
import { 
  getPostBySlug, 
  getPostIndexBySlug,
  getRelatedPosts, 
  getAllPostsIndex, 
  formatDate, 
  formatTimeAgo 
} from '../utils/postsService'
import NewsCard from '../components/NewsCard'
import { useRadio } from '../context/RadioContext'

export default function PostDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { isPlaying: isRadioPlaying, togglePlay: toggleRadio } = useRadio()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState('text-base sm:text-lg') // comfortable sizes
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(48)
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState(null)
  
  const articleContentRef = useRef(null)
  const allPosts = useMemo(() => getAllPostsIndex(), [])

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
    setIsAudioPlaying(false)
    setSelectedLightboxIndex(null)

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

    // Extract all non-emoji image URLs from content
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    const images = []
    const seen = new Set()

    while ((match = imgRegex.exec(rawContent)) !== null) {
      const src = match[1]
      if (src && !src.includes('emoji.php') && !seen.has(src)) {
        seen.add(src)
        images.push(src)
      }
    }

    // Remove giant consecutive <figure> blocks and standalone img tags so textual article reads smoothly and compactly
    let textHtml = rawContent
      .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
      .replace(/<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>/gi, '')
      .replace(/<img[^>]+>/gi, '')
      .trim()

    // Fallback if removing figures stripped all content
    if (!textHtml || textHtml.replace(/<[^>]+>/g, '').trim().length === 0) {
      textHtml = rawContent
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
  const currentUrl = window.location.href

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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Link
                  to={`/categoria/${mainCategory.slug}`}
                  className="bg-[#05a353] hover:bg-[#048a46] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full transition-colors shadow-2xs"
                >
                  {mainCategory.name}
                </Link>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
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

            {/* Audio Widget ("Escuchar noticia") */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  className="w-8 h-8 rounded-full bg-[#05a353] hover:bg-[#048a46] text-white flex items-center justify-center transition-all shadow-2xs shrink-0"
                  aria-label="Reproducir audio"
                >
                  {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div>
                  <span className="font-bold text-slate-900 block">
                    {isAudioPlaying ? 'Reproduciendo resumen hablado...' : 'Escuchar esta noticia'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Audio accesible de Último Bastión • Duración: ~{readMinutes} min
                  </span>
                </div>
              </div>

              {/* Sound equalizer animation */}
              <div className="flex items-end gap-0.5 h-4 text-emerald-700 shrink-0">
                <span className={`w-1 bg-[#05a353] rounded-full transition-all duration-200 ${isAudioPlaying ? 'h-4 animate-pulse' : 'h-1.5'}`} />
                <span className={`w-1 bg-[#05a353] rounded-full transition-all duration-200 ${isAudioPlaying ? 'h-2 animate-pulse delay-75' : 'h-3'}`} />
                <span className={`w-1 bg-[#05a353] rounded-full transition-all duration-200 ${isAudioPlaying ? 'h-3.5 animate-pulse delay-150' : 'h-2'}`} />
                <span className={`w-1 bg-[#05a353] rounded-full transition-all duration-200 ${isAudioPlaying ? 'h-2.5 animate-pulse delay-100' : 'h-1'}`} />
              </div>
            </div>

            {/* Featured Lead Image (WebP) */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-slate-100 border border-slate-200">
              <img
                src={post.image}
                alt={post.title}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/default-news.webp'
                }}
                className="w-full h-auto max-h-[520px] object-cover mx-auto"
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
                <span className="text-[11px] mr-1">Tamaño:</span>
                <button
                  onClick={() => setFontSize('text-sm sm:text-base')}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold ${fontSize === 'text-sm sm:text-base' ? 'bg-[#002845] text-white border-[#002845]' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('text-base sm:text-lg')}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold ${fontSize === 'text-base sm:text-lg' ? 'bg-[#002845] text-white border-[#002845]' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('text-lg sm:text-xl')}
                  className={`px-2.5 py-0.5 rounded-lg border font-bold ${fontSize === 'text-lg sm:text-xl' ? 'bg-[#002845] text-white border-[#002845]' : 'bg-slate-100 text-slate-700 border-slate-200'}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Article Formatted Body with Drop Cap on first paragraph */}
            <div 
              ref={articleContentRef}
              className={`article-content max-w-none text-slate-800 leading-relaxed font-sans ${fontSize}`}
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null
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
                  to={`/noticia/${prevPost.slug}`}
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
                  to={`/noticia/${nextPost.slug}`}
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
                      <Link to={`/noticia/${item.slug}`}>
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
                      to={`/noticia/${rel.slug}`}
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
                      <Link to={`/noticia/${rel.slug}`}>
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
