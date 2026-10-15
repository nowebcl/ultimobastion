import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Landmark, BookOpen, Search, ArrowUpDown, 
  ChevronRight, ChevronDown, CheckCircle2, 
  Maximize2, X, Download, ChevronLeft, Calendar, 
  User, Layers, MapPin, ArrowDown
} from 'lucide-react'
import chaptersData from '../data/historiaChapters.json'
import alcaldesRawData from '../data/alcaldesData.json'

// Month map for parsing periods into dates
const monthMap = {
  "enero": 1, "january": 1,
  "febrero": 2,
  "marzo": 3, "march": 3,
  "abril": 4,
  "mayo": 5, "may": 5,
  "junio": 6, "june": 6,
  "julio": 7, "july": 7,
  "agosto": 8,
  "septiembre": 9, "sept": 9,
  "octubre": 10, "oct": 10,
  "noviembre": 11, "nov": 11,
  "diciembre": 12, "december": 12
}

function parsePoint(raw) {
  const t = (raw || '').toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, "").replace(/\s+/g, " ").trim()
  const yearMatch = t.match(/\b(18|19|20)\d{2}\b/)
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 0
  const token = t.split(" ").find(w => monthMap[w] != null)
  const month = token ? monthMap[token] : 1
  const key = year ? (year * 100 + month) : 0
  return { year, month, key, label: (raw || '').trim() }
}

function parsePeriod(period) {
  const clean = (period || '').replace(/[()]/g, '')
  const parts = clean.split('-').map(s => s.trim()).filter(Boolean)
  const startRaw = parts[0] || ''
  const endRaw = parts[1] || ''
  const start = parsePoint(startRaw)
  const end = parsePoint(endRaw)
  return { startRaw, endRaw, startKey: start.key, endKey: end.key }
}

const alcaldesList = alcaldesRawData.map((r, i) => {
  const p = parsePeriod(r.period)
  return {
    idx: i + 1,
    name: r.name,
    period: r.period,
    start: p.startRaw,
    end: p.endRaw,
    startKey: p.startKey,
    endKey: p.endKey
  }
})

export default function HistoriaPage() {
  const [openChapters, setOpenChapters] = useState({ cap1: true, cap2: true })
  const [activeChapterId, setActiveChapterId] = useState('cap1')
  const [readingProgress, setReadingProgress] = useState(0)
  
  // Search and sort for Alcaldes table
  const [alcaldeSearch, setAlcaldeSearch] = useState('')
  const [sortField, setSortField] = useState('idx')
  const [sortDir, setSortDir] = useState('asc')

  // Lightbox for historical photos
  const [activePhoto, setActivePhoto] = useState(null)
  const [currentGalleryPhotos, setCurrentGalleryPhotos] = useState([])
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0)

  const timelineRef = useRef(null)

  const toggleChapter = (id) => {
    setOpenChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Scroll listener for reading progress & active chapter
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const viewH = window.innerHeight || document.documentElement.clientHeight
      const p = Math.max(0, Math.min(1, (viewH - rect.top) / (rect.height + viewH)))
      setReadingProgress(Math.round(p * 100))

      chaptersData.forEach(ch => {
        const el = document.getElementById(`capitulo-${ch.id}`)
        if (el) {
          const r = el.getBoundingClientRect()
          if (r.top <= 240 && r.bottom >= 100) {
            setActiveChapterId(ch.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Open photo in lightbox
  const handleOpenPhoto = (photos, idx) => {
    setCurrentGalleryPhotos(photos)
    setCurrentPhotoIdx(idx)
    setActivePhoto(photos[idx])
  }

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    if (!activePhoto) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePhoto(null)
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentPhotoIdx + 1) % currentGalleryPhotos.length
        setCurrentPhotoIdx(nextIdx)
        setActivePhoto(currentGalleryPhotos[nextIdx])
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (currentPhotoIdx - 1 + currentGalleryPhotos.length) % currentGalleryPhotos.length
        setCurrentPhotoIdx(prevIdx)
        setActivePhoto(currentGalleryPhotos[prevIdx])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePhoto, currentPhotoIdx, currentGalleryPhotos])

  // Filter and sort Alcaldes
  const filteredAlcaldes = useMemo(() => {
    const q = alcaldeSearch.toLowerCase().trim()
    let list = alcaldesList.filter(a => {
      return a.name.toLowerCase().includes(q) || 
             a.period.toLowerCase().includes(q) ||
             a.start.toLowerCase().includes(q) ||
             a.end.toLowerCase().includes(q)
    })

    list.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      if (typeof valA === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortDir === 'asc' ? valA - valB : valB - valA
    })

    return list
  }, [alcaldeSearch, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-sky-600 selection:text-white">
      {/* ----------------------------------------------------
          BREADCRUMBS
      ---------------------------------------------------- */}
      <div className="bg-[#002238] border-b border-sky-950 py-2.5 px-4 text-xs text-sky-200">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-white font-medium">Historia</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          HERO SECTION (COPIA EXACTA DE LA WEB ORIGINAL)
      ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 shadow-xs">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(980px_520px_at_8%_-10%,rgba(2,132,199,0.18),transparent_62%),radial-gradient(920px_520px_at_92%_0%,rgba(124,58,237,0.14),transparent_58%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 backdrop-blur-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Maullín Último Bastión • <b>Reseña histórica</b></span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl font-serif">
            Historia de Maullín
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-lg leading-relaxed max-w-3xl">
            Línea de tiempo por capítulos con relatos, contexto y galerías fotográficas. Usa el botón HISTORIA para ir directamente a la cronología.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection('mubh-timeline')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>HISTORIA</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('mub-alcaldes')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-sky-600" />
                <span>ALCALDES (1885 - 2028)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-100">
                Fuerte Colonial
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                Monte Verde
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100">
                Terremoto 1960
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-100">
                Oro Verde
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          MAIN CONTENT: 7 AUTHENTIC CHAPTERS (TIMELINE + SIDENAV)
      ---------------------------------------------------- */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
          
          {/* STICKY SIDENAV */}
          <aside className="lg:sticky lg:top-20 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 font-sans">
                Capítulos Históricos
              </h2>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                7 Capítulos
              </span>
            </div>

            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {chaptersData.map(ch => {
                const isActive = activeChapterId === ch.id
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(`capitulo-${ch.id}`)
                      setOpenChapters(prev => ({ ...prev, [ch.id]: true }))
                    }}
                    className={`text-left p-2.5 rounded-xl text-xs transition-all shrink-0 lg:shrink cursor-pointer border ${
                      isActive
                        ? 'bg-sky-50 border-sky-200 text-sky-950 font-bold shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-transparent text-slate-700'
                    }`}
                  >
                    <div className="font-extrabold text-[12px] flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono ${
                        isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ch.num}
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5 pl-6.5 truncate">
                      {ch.subtitle}
                    </div>
                  </button>
                )
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => scrollToSection('mub-alcaldes')}
                className="w-full text-left p-2 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-between transition-colors cursor-pointer border border-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-sky-600" />
                  <span>Nómina de Alcaldes</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </aside>

          {/* MAIN COLUMN */}
          <main className="space-y-6">
            {/* Reading progress bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>Progreso de lectura histórica</span>
                </span>
                <span className="font-mono text-sky-700 font-bold">{readingProgress}% leído</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            {/* TIMELINE CONTAINER */}
            <div id="mubh-timeline" ref={timelineRef} className="space-y-6">
              {chaptersData.map((ch) => {
                const isOpen = Boolean(openChapters[ch.id])
                return (
                  <article
                    key={ch.id}
                    id={`capitulo-${ch.id}`}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300 scroll-mt-24"
                  >
                    {/* Header */}
                    <div 
                      onClick={() => toggleChapter(ch.id)}
                      className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/70 to-white border-b border-slate-100 cursor-pointer select-none flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full font-mono">
                          Capítulo {ch.num} • Línea de tiempo
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-slate-950 font-serif leading-snug">
                          {ch.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-1">
                        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {isOpen ? 'Cerrar' : 'Leer capítulo'}
                        </span>
                        <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform duration-200 ${isOpen ? 'rotate-180 bg-sky-50 text-sky-700' : 'bg-white text-slate-600'}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    {isOpen && (
                      <div className="p-5 sm:p-7 space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed bg-white">
                        {/* Authentic HTML text */}
                        <div 
                          className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-a:text-sky-600 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-50/60 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700"
                          dangerouslySetInnerHTML={{ __html: ch.bodyHtml }}
                        />

                        {/* Chapter Historical Photo Gallery */}
                        {ch.images && ch.images.length > 0 && (
                          <div className="pt-4 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-sky-600" />
                                <span>Galería del capítulo ({ch.images.length} imágenes)</span>
                              </h4>
                              <span className="text-[11px] text-slate-400">Clic para ampliar en alta resolución</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {ch.images.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  onClick={() => handleOpenPhoto(ch.images, imgIdx)}
                                  className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 relative group cursor-pointer border border-slate-200 shadow-2xs"
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`${ch.title} - Imagen ${imgIdx + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </main>
        </div>
      </div>

      {/* ----------------------------------------------------
          ALCALDES DE MAULLÍN: LÍNEA HISTÓRICA (TABLA INTERACTIVA)
      ---------------------------------------------------- */}
      <section id="mub-alcaldes" className="max-w-6xl mx-auto px-4 pt-20 space-y-8">
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full mb-2.5 border border-sky-100">
              <Landmark className="w-3.5 h-3.5" />
              <span>Nómina oficial desde el inicio hasta hoy</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 font-serif tracking-tight">
              Alcaldes de Maullín: línea histórica
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              Tabla interactiva oficial de los 43 alcaldes que han encabezado la administración comunal desde 1885 hasta el período 2024-2028. Puedes buscar por nombre o año, y ordenar haciendo clic en los encabezados de columna.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Total: {filteredAlcaldes.length} de {alcaldesList.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={alcaldeSearch}
              onChange={(e) => setAlcaldeSearch(e.target.value)}
              placeholder="Buscar por alcalde o período (ej: Nabih, 1960, Robbe)..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
            />
          </div>

          {alcaldeSearch && (
            <button
              onClick={() => setAlcaldeSearch('')}
              className="text-xs text-sky-600 font-bold hover:underline shrink-0"
            >
              Limpiar búsqueda
            </button>
          )}

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Tip: haz clic en cualquier columna para ordenar
          </div>
        </div>

        {/* Alcaldes Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] font-mono tracking-wider select-none">
                <tr>
                  <th 
                    onClick={() => handleSort('idx')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>#</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Alcalde</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('startKey')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Inicio</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('endKey')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Término</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <span>Período Oficial</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAlcaldes.map((row) => (
                  <tr key={row.idx} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-bold text-xs">
                      {row.idx}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-serif text-sm">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 text-xs">
                      {row.start || '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 text-xs">
                      {row.end || '—'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-sky-800 font-semibold">
                      {row.period}
                    </td>
                  </tr>
                ))}
                {filteredAlcaldes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron alcaldes coincidentes con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contexto Político y Municipal Card */}
        <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full">
            <Landmark className="w-3.5 h-3.5" />
            <span>Memoria Institucional</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
            Contexto político y municipal
          </h3>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Como era tradicional en las comunas rurales del sur de Chile, el Partido Conservador (derecha actualmente) gozaba de una hegemonía solo desafiada parcialmente por el Partido Radical en la naciente clase media. En Maullín los alcaldes <b>José Nabih Soza K.</b> (Partido Nacional) y <b>Eduardo Atala Barahona</b> (Partido Radical) reflejaban esa influencia.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            También el alcalde <b>José Montealegre</b> de la DC era el que se encontraba en funciones desde las elecciones de 1971 y hasta el 11 de septiembre de 1973. Con el Golpe Militar de 1973 se impuso un sistema de toque de queda y de estados de sitio que facilitó la represión y el amedrentamiento de la población.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            El primer Alcalde designado por la Junta Militar fue <b>Walterio Gebauer</b> hasta mayo de 1981 cuando fue reemplazado por <b>Berta Reyes Manzano</b>, quien ejerció por 11 años su gestión hasta mayo de 1992.
          </p>
        </article>

        {/* Bibliografía Oficial Card */}
        <div className="bg-slate-100 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 text-xs sm:text-sm text-slate-600">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base font-serif flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-700" />
            <span>Bibliografía y Fuentes Históricas Oficiales</span>
          </h4>
          <p className="leading-relaxed">
            <b>Programa de Recuperación de Barrios “Quiero Mi Barrio”</b> • www.minvu.cl • Ministerio de Vivienda y Urbanismo, Secretaría Regional Ministerial de Los Lagos • Gobierno de Chile.
          </p>
          <p className="leading-relaxed text-slate-500">
            Tiraje: 500 ejemplares • Fecha: Abril de 2019 • Autor: Ministerio de Vivienda y Urbanismo.<br />
            Colaboradores: Equipo Comunal Programa Quiero Mi Barrio de Maullín (Barrio Centro Histórico de Maullín). Equipo Regional Programa Quiero Mi Barrio, Seremi Minvu Región de Los Lagos. Consejo Vecinal de Desarrollo (CVD - 2019).
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
          LIGHTBOX MODAL FOR HISTORICAL PHOTOS
      ---------------------------------------------------- */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
              <span className="text-xs font-mono font-bold text-sky-700 uppercase bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                Fotografía Histórica {currentPhotoIdx + 1} de {currentGalleryPhotos.length}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={activePhoto}
                  download={`Maullin_Historia_${currentPhotoIdx + 1}.jpeg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200 text-xs font-bold flex items-center gap-1.5"
                  title="Descargar foto original"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Frame */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[50vh] max-h-[70vh] p-2 select-none">
              <img
                src={activePhoto}
                alt="Fotografía Histórica de Maullín"
                className="max-h-full max-w-full object-contain rounded-md"
              />

              {currentGalleryPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const prevIdx = (currentPhotoIdx - 1 + currentGalleryPhotos.length) % currentGalleryPhotos.length
                      setCurrentPhotoIdx(prevIdx)
                      setActivePhoto(currentGalleryPhotos[prevIdx])
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (currentPhotoIdx + 1) % currentGalleryPhotos.length
                      setCurrentPhotoIdx(nextIdx)
                      setActivePhoto(currentGalleryPhotos[nextIdx])
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-100 text-center text-xs text-slate-500 font-mono">
              Archivo fotográfico histórico patrimonial • Comuna de Maullín
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
