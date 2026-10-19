import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Play, Calendar, Eye, Clock, ArrowRight, X, ChevronLeft, ChevronRight 
} from 'lucide-react'
import BreakingTicker from '../components/BreakingTicker'
import { 
  getAllPostsIndex,
  formatDate,
  formatTimeAgo,
  getPostUrl
} from '../utils/postsService'

// Static data for multimedia and gallery from Maullín (Real YouTube videos from Maullín)
const VIDEO_ITEMS = [
  {
    id: 'rwJjTbPWQ74',
    title: 'Terremoto y Maremoto 1960 - Historia Cultural de Maullín (Cap. 5)',
    duration: '14:20',
    timeAgo: 'Maullín Histórico',
    author: 'Sintonízate Maullín',
    image: '/images/videos/rwJjTbPWQ74.webp',
  },
  {
    id: 'SR1t4FMkFIU',
    title: 'Recomiendo Chile | Maullín: Tradición y Sabor Costero',
    duration: '52:10',
    timeAgo: 'Canal 13',
    author: 'Recomiendo Chile',
    image: '/images/videos/SR1t4FMkFIU.webp',
  },
  {
    id: 'PDgFD4lDaX4',
    title: 'Lugares Que Hablan: Bellezas y Gente de Maullín',
    duration: '45:30',
    timeAgo: 'Canal 13',
    author: 'Lugares Que Hablan',
    image: '/images/videos/PDgFD4lDaX4.webp',
  },
  {
    id: 'AaGCswu-yEw',
    title: 'Historia Cultural de Maullín - Capítulo 4',
    duration: '18:15',
    timeAgo: 'Patrimonio Cultural',
    author: 'Sintonízate Maullín',
    image: '/images/videos/AaGCswu-yEw.webp',
  }
]

const GALLERY_ITEMS = [
  { id: 1, image: '/images/site/gallery-1.webp' },
  { id: 2, image: '/images/site/gallery-2.webp' },
  { id: 3, image: '/images/site/gallery-3.webp' },
  { id: 4, image: '/images/site/gallery-4.webp' },
  { id: 5, image: '/images/site/gallery-5.webp' },
  { id: 6, image: '/images/site/gallery-6.webp' }
]

// Helper for getting primary journalistic category
const getDisplayCategory = (post) => {
  if (!post || !post.categories || post.categories.length === 0) return 'Comuna'
  const prioritySlugs = [
    'salud', 'educacion', 'deporte', 'turismo', 'proyectos', 
    'fomento', 'seguridad', 'cultura-comunidad', 'conectividad', 'medio-ambiente'
  ]
  for (const slug of prioritySlugs) {
    const found = post.categories.find(c => c.slug === slug)
    if (found) return found.name
  }
  const nonGeneric = post.categories.find(c => 
    c.slug !== 'agrupaciones-comunitarias' && c.slug !== 'desarrollo-social-y-comunitario'
  )
  return nonGeneric ? nonGeneric.name : post.categories[0].name
}

// Deterministic views counter based on post ID (supports both numeric and string PocketBase IDs)
const getDisplayViews = (post) => {
  if (!post) return '450'
  const numId = typeof post.id === 'number' && !isNaN(post.id)
    ? post.id
    : String(post.id || '').split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0)
  const base = ((numId * 19) % 900) + 210
  return base > 999 ? `${(base / 1000).toFixed(1)}K` : `${base}`
}

// Category text colors for secondary items (matches mockup style)
const getCategoryColor = (post, index) => {
  const cat = (getDisplayCategory(post) || '').toLowerCase()
  if (cat.includes('proyect') || cat.includes('infraestruct') || cat.includes('obras')) return 'text-sky-600'
  if (cat.includes('salud')) return 'text-rose-600'
  if (cat.includes('deport') || cat.includes('comunid') || cat.includes('organizac')) return 'text-[#05a353]'
  if (cat.includes('turism') || cat.includes('medio')) return 'text-teal-600'
  if (cat.includes('cultur')) return 'text-purple-600'
  if (cat.includes('educac')) return 'text-amber-600'
  if (cat.includes('foment') || cat.includes('rural')) return 'text-blue-600'
  
  const palette = ['text-sky-600', 'text-[#05a353]', 'text-teal-600', 'text-purple-600']
  return palette[index % palette.length]
}

export default function HomePage() {
  const [activeVideo, setActiveVideo] = useState(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [, setVersion] = useState(0)

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1)
    window.addEventListener('bastion:posts-updated', handleUpdate)
    return () => window.removeEventListener('bastion:posts-updated', handleUpdate)
  }, [])

  const allPosts = getAllPostsIndex()
  const heroSlides = allPosts.slice(0, 5)
  const safeHeroIndex = heroSlides.length > 0 ? heroIndex % heroSlides.length : 0
  const featuredLead = heroSlides[safeHeroIndex] || allPosts[0]

  // Auto-advance hero cover through the latest 5 news every 6 seconds
  useEffect(() => {
    if (heroPaused || heroSlides.length <= 1) return
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [heroPaused, heroSlides.length])

  // Latest news for the right-hand "Últimas noticias" column (chronological order)
  const secondaryFeatured = allPosts.slice(1, 5)

  // Track used post IDs from top 5 so lower sections never duplicate them
  const usedIds = new Set(allPosts.slice(0, 5).map(p => p.id).filter(Boolean))

  const hasCat = (post, keywords) =>
    post.categories?.some(c => {
      const s = (c.slug || '').toLowerCase()
      return keywords.some(k => s.includes(k))
    })

  const findPost = (predicate, fallbackIdx) => {
    const found = allPosts.find(p => !usedIds.has(p.id) && predicate(p))
    if (found) {
      usedIds.add(found.id)
      return found
    }
    const fallback = allPosts[fallbackIdx] || allPosts.find(p => !usedIds.has(p.id))
    if (fallback) usedIds.add(fallback.id)
    return fallback
  }

  // Row 1: 3 News Cards (Cultura, Proyectos, Fomento - exact match with original site)
  const row1Cultura = findPost(p => hasCat(p, ['cultur', 'patrimonio']), 5)
  const row1Proyectos = findPost(p => hasCat(p, ['proyect', 'obras', 'secplan', 'infraestruct']), 6)
  const row1Fomento = findPost(p => hasCat(p, ['foment', 'omil', 'rural', 'pesca']), 7)

  // Row 2: 4 Category Cards (Salud, Turismo, Comunidad, Medio Ambiente)
  const row2Salud = findPost(p => hasCat(p, ['salud', 'cesfam']), 8)
  const row2Turismo = findPost(p => hasCat(p, ['turism']), 9)
  const row2Comunidad = findPost(p => p.title?.toLowerCase().includes('adulto') || p.title?.toLowerCase().includes('comunitari') || hasCat(p, ['comunitari', 'dideco', 'organizac']), 10)
  const row2MedioAmbiente = findPost(p => p.title?.toLowerCase().includes('humedal') || p.title?.toLowerCase().includes('costero') || p.title?.toLowerCase().includes('limpieza') || p.title?.toLowerCase().includes('rio') || hasCat(p, ['medio-ambiente']), 11)

  // Row 3: Más Noticias (5 items), Destacado (1 item), Visita
  const row3MasNoticias = []
  for (let i = 0; i < 5; i++) {
    const p = findPost(() => true, 12 + i)
    if (p) row3MasNoticias.push(p)
  }
  const row3Destacado = findPost(p => p.title?.toLowerCase().includes('costa') || p.title?.toLowerCase().includes('desarrollo') || p.title?.toLowerCase().includes('proyecto') || p.title?.toLowerCase().includes('iniciativa'), 18)

  // Row 4: Deporte, Educación, Videos
  const row4Deportes = findPost(p => hasCat(p, ['deport']), 19)
  const row4Educacion = findPost(p => hasCat(p, ['educac', 'daem']), 20)

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 1. BREAKING TICKER */}
      <BreakingTicker posts={allPosts} />

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-12">
        {/* 2. HERO NEWS SECTION - KEPT INTACT AS REQUESTED */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: Large Featured Story (lg:col-span-8) */}
          <div className="lg:col-span-8 flex">
            <div 
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              className="relative rounded-2xl overflow-hidden shadow-md group w-full min-h-[460px] lg:min-h-[520px] flex flex-col justify-end p-6 sm:p-8 bg-slate-900 border border-slate-200/60"
            >
              
              {/* Background Image of real post */}
              <img
                key={featuredLead?.id || 'hero-img'}
                src={featuredLead?.image || '/images/site/hero-mockup.webp'}
                alt={featuredLead?.title || 'Noticia destacada'}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                onError={(e) => {
                  if (e.currentTarget.dataset.failed) return
                  e.currentTarget.dataset.failed = 'true'
                  e.currentTarget.src = '/images/site/hero-mockup.webp'
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Dark Gradient Overlay for crystal clarity */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />

              {/* Top-Right Carousel Controls for Latest News in Portada */}
              {heroSlides.length > 1 && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                  <div className="flex items-center gap-1.5 mr-1">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id || idx}
                        type="button"
                        onClick={() => setHeroIndex(idx)}
                        aria-label={`Ver noticia reciente ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === safeHeroIndex
                            ? 'w-5 bg-[#05a353]'
                            : 'w-1.5 bg-white/45 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                    aria-label="Noticia anterior"
                    className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroIndex(prev => (prev + 1) % heroSlides.length)}
                    aria-label="Siguiente noticia"
                    className="text-white/80 hover:text-white transition-colors cursor-pointer p-0.5"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Foreground Content */}
              <div className="relative z-10 space-y-3">
                {/* Green Category Pill */}
                <div className="flex items-center gap-2">
                  <span className="bg-[#05a353] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-xs inline-block">
                    {getDisplayCategory(featuredLead)}
                  </span>
                  <span className="bg-white/15 backdrop-blur-xs text-white/90 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-white/15">
                    {formatTimeAgo(featuredLead?.date)}
                  </span>
                </div>

                {/* Title */}
                <Link to={featuredLead ? getPostUrl(featuredLead) : '#'}>
                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white font-serif leading-[1.25] tracking-tight group-hover:text-amber-200 transition-colors drop-shadow-sm line-clamp-3">
                    {featuredLead?.title}
                  </h1>
                </Link>

                {/* Excerpt */}
                {featuredLead?.excerpt && (
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl drop-shadow-xs line-clamp-3">
                    {featuredLead.excerpt}
                  </p>
                )}

                {/* Footer Meta Row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(featuredLead?.date)}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {getDisplayViews(featuredLead)} visualizaciones
                    </span>
                  </div>

                  <Link
                    to={featuredLead ? getPostUrl(featuredLead) : '#'}
                    className="rounded-full border border-white/50 bg-black/25 hover:bg-white hover:text-slate-900 text-white px-5 py-2 text-xs font-semibold flex items-center gap-2 backdrop-blur-xs transition-all shadow-xs"
                  >
                    <span>Leer más</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Últimas noticias Card (lg:col-span-4) */}
          <div className="lg:col-span-4 flex">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between w-full space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#05a353] rounded-full inline-block" />
                  <h2 className="font-serif font-bold text-xl text-slate-900 tracking-tight">
                    Últimas noticias
                  </h2>
                </div>
                <Link 
                  to="/noticias" 
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                >
                  Ver todas <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Real News Items List */}
              <div className="space-y-3.5 divide-y divide-slate-100">
                {secondaryFeatured.map((item, index) => (
                  <article key={item.id || index} className="pt-3.5 first:pt-0 flex items-start gap-3.5 group cursor-pointer">
                    <Link 
                      to={getPostUrl(item)}
                      className="w-24 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative shadow-2xs"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        decoding={index < 2 ? 'sync' : 'async'}
                        onError={(e) => {
                          if (e.currentTarget.dataset.failed) return
                          e.currentTarget.dataset.failed = 'true'
                          e.currentTarget.src = '/images/default-news.webp'
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${getCategoryColor(item, index)}`}>
                        {getDisplayCategory(item)}
                      </span>
                      <Link to={getPostUrl(item)}>
                        <h3 className="font-serif font-bold text-xs sm:text-[13px] text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {formatTimeAgo(item.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" /> {getDisplayViews(item)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* SITIOS RECOMENDADOS (Fiel al sitio original) */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#05a353] animate-pulse" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-serif">
                Sitios recomendados
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="https://www.goreloslagos.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Gobierno Regional
              </a>
              <a href="https://www.munimaullin.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Municipalidad de Maullín
              </a>
              <a href="https://comunasmagicas.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Comunas Mágicas
              </a>
              <a href="https://patagoniacosta.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Patagonia Costa
              </a>
              <a href="https://radiopangalfm.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Radio Pangal FM
              </a>
              <a href="https://radiosanfranciscofm.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Radio San Francisco FM
              </a>
              <a href="https://alejandrogallardo.cl/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#05a353] hover:bg-[#048844] text-white shadow-xs transition-all tracking-wide">
                Alejandro Gallardo.cl
              </a>
            </div>
          </div>
        </section>

        {/* 3. SECTION 1: TRI-COLUMN NEWS CARDS (CULTURA, PROYECTOS, FOMENTO) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CULTURA */}
          <article className="group cursor-pointer">
            <Link to={getPostUrl(row1Cultura)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 shadow-2xs">
              <img
                src={row1Cultura?.image}
                alt={row1Cultura?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to="/categoria/cultura-comunidad" className="text-[11px] font-bold text-[#05a353] hover:text-[#048a46] uppercase tracking-wider block mt-3 mb-1">
              CULTURA
            </Link>
            <Link to={getPostUrl(row1Cultura)}>
              <h3 className="font-serif font-bold text-base sm:text-[17px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                {row1Cultura?.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 line-clamp-3">
              {row1Cultura?.excerpt}
            </p>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              {formatTimeAgo(row1Cultura?.date)} • Maullín
            </div>
          </article>

          {/* Card 2: PROYECTOS */}
          <article className="group cursor-pointer">
            <Link to={getPostUrl(row1Proyectos)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 shadow-2xs">
              <img
                src={row1Proyectos?.image}
                alt={row1Proyectos?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to="/categoria/proyectos" className="text-[11px] font-bold text-[#05a353] hover:text-[#048a46] uppercase tracking-wider block mt-3 mb-1">
              PROYECTOS
            </Link>
            <Link to={getPostUrl(row1Proyectos)}>
              <h3 className="font-serif font-bold text-base sm:text-[17px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                {row1Proyectos?.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 line-clamp-3">
              {row1Proyectos?.excerpt}
            </p>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              {formatTimeAgo(row1Proyectos?.date)} • Maullín
            </div>
          </article>

          {/* Card 3: FOMENTO */}
          <article className="group cursor-pointer">
            <Link to={getPostUrl(row1Fomento)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 shadow-2xs">
              <img
                src={row1Fomento?.image}
                alt={row1Fomento?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to="/categoria/fomento" className="text-[11px] font-bold text-[#05a353] hover:text-[#048a46] uppercase tracking-wider block mt-3 mb-1">
              FOMENTO
            </Link>
            <Link to={getPostUrl(row1Fomento)}>
              <h3 className="font-serif font-bold text-base sm:text-[17px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                {row1Fomento?.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 line-clamp-3">
              {row1Fomento?.excerpt}
            </p>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              {formatTimeAgo(row1Fomento?.date)} • Maullín
            </div>
          </article>
        </section>

        {/* 4. SECTION 2: 4-COLUMN CATEGORY GRID (SALUD, TURISMO, COMUNIDAD, MEDIO AMBIENTE) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Col 1: SALUD */}
          <article className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <Link to="/categoria/salud" className="text-[11px] font-bold text-slate-900 hover:text-sky-700 uppercase tracking-wider font-serif">
                SALUD
              </Link>
            </div>
            <Link to={getPostUrl(row2Salud)} className="aspect-[16/10] rounded-lg overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
              <img
                src={row2Salud?.image}
                alt={row2Salud?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to={getPostUrl(row2Salud)}>
              <h4 className="font-serif font-bold text-[13px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                {row2Salud?.title}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
              {row2Salud?.excerpt}
            </p>
            <span className="text-[10px] text-slate-400 font-medium block">
              {formatTimeAgo(row2Salud?.date)} • Maullín
            </span>
          </article>

          {/* Col 2: MEDIO AMBIENTE */}
          <article className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-serif">MEDIO AMBIENTE</h3>
            </div>
            <Link to={getPostUrl(row2MedioAmbiente)} className="aspect-[16/10] rounded-lg overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
              <img
                src={row2MedioAmbiente?.image}
                alt={row2MedioAmbiente?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to={getPostUrl(row2MedioAmbiente)}>
              <h4 className="font-serif font-bold text-[13px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                {row2MedioAmbiente?.title}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
              {row2MedioAmbiente?.excerpt}
            </p>
            <span className="text-[10px] text-slate-400 font-medium block">
              {formatTimeAgo(row2MedioAmbiente?.date)} • Maullín
            </span>
          </article>

          {/* Col 3: COMUNIDAD */}
          <article className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-serif">COMUNIDAD</h3>
            </div>
            <Link to={getPostUrl(row2Comunidad)} className="aspect-[16/10] rounded-lg overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
              <img
                src={row2Comunidad?.image}
                alt={row2Comunidad?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to={getPostUrl(row2Comunidad)}>
              <h4 className="font-serif font-bold text-[13px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                {row2Comunidad?.title}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
              {row2Comunidad?.excerpt}
            </p>
            <span className="text-[10px] text-slate-400 font-medium block">
              {formatTimeAgo(row2Comunidad?.date)} • Maullín
            </span>
          </article>

          {/* Col 4: TURISMO */}
          <article className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider font-serif">TURISMO</h3>
            </div>
            <Link to={getPostUrl(row2Turismo)} className="aspect-[16/10] rounded-lg overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
              <img
                src={row2Turismo?.image}
                alt={row2Turismo?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
              />
            </Link>
            <Link to={getPostUrl(row2Turismo)}>
              <h4 className="font-serif font-bold text-[13px] text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                {row2Turismo?.title}
              </h4>
            </Link>
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
              {row2Turismo?.excerpt}
            </p>
            <span className="text-[10px] text-slate-400 font-medium block">
              {formatTimeAgo(row2Turismo?.date)} • Maullín
            </span>
          </article>
        </section>

        {/* 5. SECTION 3: MÁS NOTICIAS (4 cols), DESTACADO (5 cols), VISITA (3 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Col 1: MÁS NOTICIAS (5 items list) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                MÁS NOTICIAS
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {row3MasNoticias.map((item) => (
                <article key={item.id} className="pt-3 first:pt-0 pb-3 flex items-start gap-3 group cursor-pointer">
                  <Link 
                    to={getPostUrl(item)}
                    className="w-16 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative shadow-2xs"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={getPostUrl(item)}>
                      <h4 className="font-serif font-bold text-xs text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                    </Link>
                    <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                      {formatTimeAgo(item.date)} • Maullín
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Col 2: DESTACADO */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                DESTACADO
              </h3>
            </div>
            <article className="group cursor-pointer">
              <Link to={getPostUrl(row3Destacado)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 mb-3 shadow-2xs">
                <img
                  src={row3Destacado?.image}
                  alt={row3Destacado?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
                />
              </Link>
              <Link to={getPostUrl(row3Destacado)}>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-sky-700 transition-colors mb-2">
                  {row3Destacado?.title}
                </h3>
              </Link>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-2.5">
                {row3Destacado?.excerpt}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                {formatTimeAgo(row3Destacado?.date)} • Maullín
              </span>
            </article>
          </div>

          {/* Col 3: VISITA (Card Promocional) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                VISITA
              </h3>
            </div>
            <div className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#003444] via-[#002a36] to-[#001f28] text-white p-5 flex flex-col justify-between min-h-[380px] shadow-sm relative group">
              <div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-slate-800 shadow-sm">
                  <img
                    src="/images/site/gallery-5.webp"
                    alt="Descubre Maullín"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/maps/map-2.webp' }}
                  />
                </div>
                <h4 className="font-serif font-extrabold text-2xl text-white leading-tight">
                  Descubre Maullín
                </h4>
                <p className="text-xs text-teal-200/90 mt-1">
                  Naturaleza, Cultura y Tradición
                </p>
              </div>

              <Link
                to="/mapas"
                className="mt-6 w-full bg-[#05a353] hover:bg-[#048a46] text-white font-bold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Conocer más</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </section>

        {/* 6. SECTION 4: DEPORTES, EDUCACIÓN, VIDEOS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Col 1: DEPORTES */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <Link to="/categoria/deporte" className="text-xs font-bold text-slate-900 hover:text-sky-700 uppercase tracking-wider font-serif">
                DEPORTES
              </Link>
            </div>
            <article className="group cursor-pointer">
              <Link to={getPostUrl(row4Deportes)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
                <img
                  src={row4Deportes?.image}
                  alt={row4Deportes?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
                />
              </Link>
              <Link to={getPostUrl(row4Deportes)}>
                <h4 className="font-serif font-bold text-sm text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                  {row4Deportes?.title}
                </h4>
              </Link>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-2">
                {row4Deportes?.excerpt}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                {formatTimeAgo(row4Deportes?.date)} • Maullín
              </span>
            </article>
          </div>

          {/* Col 2: EDUCACIÓN */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <Link to="/categoria/educacion" className="text-xs font-bold text-slate-900 hover:text-sky-700 uppercase tracking-wider font-serif">
                EDUCACIÓN
              </Link>
            </div>
            <article className="group cursor-pointer">
              <Link to={getPostUrl(row4Educacion)} className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 mb-2.5 shadow-2xs">
                <img
                  src={row4Educacion?.image}
                  alt={row4Educacion?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-news.webp' }}
                />
              </Link>
              <Link to={getPostUrl(row4Educacion)}>
                <h4 className="font-serif font-bold text-sm text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2 mb-1">
                  {row4Educacion?.title}
                </h4>
              </Link>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-2">
                {row4Educacion?.excerpt}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                {formatTimeAgo(row4Educacion?.date)} • Maullín
              </span>
            </article>
          </div>

          {/* Col 3: VIDEOS */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <span className="w-1 h-3.5 bg-[#05a353] rounded-full inline-block" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
                VIDEOS
              </h3>
            </div>
            
            {/* Featured Video Card */}
            <div 
              onClick={() => setActiveVideo(VIDEO_ITEMS[0])}
              className="aspect-[16/10] rounded-xl overflow-hidden relative group bg-slate-900 mb-2 shadow-2xs cursor-pointer"
            >
              <img
                src={VIDEO_ITEMS[0].image}
                alt={VIDEO_ITEMS[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://img.youtube.com/vi/${VIDEO_ITEMS[0].id}/hqdefault.jpg` }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {VIDEO_ITEMS[0].duration}
              </span>
            </div>

            <div className="mb-3">
              <h4 
                onClick={() => setActiveVideo(VIDEO_ITEMS[0])}
                className="font-serif font-bold text-xs sm:text-[13px] text-slate-900 hover:text-sky-700 cursor-pointer transition-colors leading-tight"
              >
                {VIDEO_ITEMS[0].title}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                {VIDEO_ITEMS[0].timeAgo} • Maullín
              </span>
            </div>

            {/* 3 Mini Video Items */}
            <div className="space-y-2.5 divide-y divide-slate-100">
              {VIDEO_ITEMS.slice(1).map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => setActiveVideo(v)}
                  className="pt-2 first:pt-0 flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-14 h-10 rounded-md overflow-hidden shrink-0 bg-slate-800 relative">
                    <img
                      src={v.image}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-3 h-3 fill-white text-white opacity-80" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-serif font-bold text-[11px] text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1 leading-snug">
                      {v.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 block">
                      {v.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* 7. SECTION 5: WIDE PANORAMIC BANNER */}
        <section className="rounded-2xl overflow-hidden relative min-h-[180px] sm:min-h-[220px] md:min-h-[240px] flex items-center p-6 sm:p-10 shadow-md border border-slate-200/60 group bg-slate-900">
          <img
            src="/images/site/banner-panorama.webp?v=5"
            alt="Maullín: Un destino por descubrir"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/site/hero-mockup.webp' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent max-w-xl" />
          <div className="relative z-10 max-w-lg space-y-1.5">
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-white drop-shadow-md">
              Maullín
            </h2>
            <p className="text-slate-200 text-sm sm:text-base font-medium drop-shadow-sm">
              Un destino por descubrir
            </p>
            <div className="pt-3">
              <Link
                to="/mapas"
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shadow-md hover:scale-105"
              >
                <span>Explora nuestra comuna</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 8. SECTION 6: PHOTO STRIP GALLERY */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
            {GALLERY_ITEMS.map((g) => (
              <div
                key={g.id}
                className="aspect-[16/10] rounded-xl overflow-hidden block bg-slate-100 group shadow-xs hover:shadow-md relative border border-slate-200/60"
              >
                <img
                  src={g.image}
                  alt="Banner Maullín"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* VIDEO MODAL PLAYER */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="font-serif font-bold text-white text-sm sm:text-base">
                {activeVideo.title}
              </h4>
              <button 
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
              <span>Maullín • Reportajes & Audiovisual Territorial</span>
              <button 
                onClick={() => setActiveVideo(null)}
                className="text-sky-400 hover:underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
