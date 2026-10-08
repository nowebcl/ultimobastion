import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Search, Filter, Newspaper, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, X, Check, Clock, Eye, Sparkles, RotateCcw
} from 'lucide-react'
import { getCategories, getAllPostsIndex, formatDate, formatTimeAgo } from '../utils/postsService'
import NewsCard from '../components/NewsCard'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAYS_SHORT = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialCat = searchParams.get('cat') || ''
  const initialDate = searchParams.get('fecha') || ''

  const allPosts = useMemo(() => getAllPostsIndex(), [])
  const categories = useMemo(() => getCategories(), [])

  // Filters state
  const [query, setQuery] = useState(initialQuery)
  const [selectedCat, setSelectedCat] = useState(initialCat)
  const [selectedDate, setSelectedDate] = useState(initialDate) // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState(1)
  const [calendarOpen, setCalendarOpen] = useState(true) // Collapsible on mobile

  // Calendar navigation state (defaults to October 2026, where newest news are)
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(9) // 0-indexed: 9 = October

  // Group posts by date (YYYY-MM-DD) for 0ms instant lookups
  const postsByDate = useMemo(() => {
    const map = {}
    for (const p of allPosts) {
      if (p.date) {
        const d = p.date.slice(0, 10)
        if (!map[d]) map[d] = []
        map[d].push(p)
      }
    }
    return map
  }, [allPosts])

  // Sync state with URL params
  useEffect(() => {
    if (initialQuery !== query) setQuery(initialQuery)
    if (initialCat !== selectedCat) setSelectedCat(initialCat)
    if (initialDate !== selectedDate) setSelectedDate(initialDate)
  }, [initialQuery, initialCat, initialDate])

  // If a date is selected, auto-navigate calendar to that month/year
  useEffect(() => {
    if (selectedDate && selectedDate.length === 10) {
      const [y, m] = selectedDate.split('-').map(Number)
      setCalYear(y)
      setCalMonth(m - 1)
    }
  }, [selectedDate])

  // Filter posts in memory (instant 0ms filtering)
  const filteredPosts = useMemo(() => {
    let result = allPosts

    // 1. Date filter
    if (selectedDate) {
      result = result.filter(p => p.date && p.date.startsWith(selectedDate))
    }

    // 2. Category filter
    if (selectedCat) {
      result = result.filter(p => 
        p.categories && p.categories.some(c => c.slug === selectedCat)
      )
    }

    // 3. Search query filter
    if (query.trim()) {
      const q = query.toLowerCase().trim()
      result = result.filter(p => {
        const titleMatch = p.title && p.title.toLowerCase().includes(q)
        const excerptMatch = p.excerpt && p.excerpt.toLowerCase().includes(q)
        const catMatch = p.categories && p.categories.some(c => c.name.toLowerCase().includes(q))
        return titleMatch || excerptMatch || catMatch
      })
    }

    return result
  }, [allPosts, selectedDate, selectedCat, query])

  // Pagination
  const perPage = 16
  const total = filteredPosts.length
  const totalPages = Math.ceil(total / perPage)
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, currentPage * perPage)
  }, [filteredPosts, currentPage])

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query, selectedCat, selectedDate])

  // Calendar math
  const daysInCurrentMonth = useMemo(() => {
    return new Date(calYear, calMonth + 1, 0).getDate()
  }, [calYear, calMonth])

  const firstDayOffset = useMemo(() => {
    const day = new Date(calYear, calMonth, 1).getDay()
    return (day + 6) % 7 // Monday = 0, Sunday = 6
  }, [calYear, calMonth])

  // Calendar navigation
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear(y => y - 1)
      setCalMonth(11)
    } else {
      setCalMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear(y => y + 1)
      setCalMonth(0)
    } else {
      setCalMonth(m => m + 1)
    }
  }

  // Quick Date presets
  const handleSelectDay = (dayNum) => {
    const padM = String(calMonth + 1).padStart(2, '0')
    const padD = String(dayNum).padStart(2, '0')
    const dateKey = `${calYear}-${padM}-${padD}`
    
    if (selectedDate === dateKey) {
      setSelectedDate('') // Toggle off
    } else {
      setSelectedDate(dateKey)
    }
  }

  const clearAllFilters = () => {
    setQuery('')
    setSelectedCat('')
    setSelectedDate('')
    setCurrentPage(1)
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* 1. TOP EDITORIAL BANNER */}
      <div className="bg-[#002845] text-white pt-8 pb-10 px-4 border-b-4 border-[#05a353]">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <span className="text-emerald-400 font-bold">Noticias Publicadas</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif tracking-tight text-white">
                Noticias Publicadas en Maullín
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Archivo histórico interactivo con las <strong>701 noticias</strong> oficiales. Revisa las notas por día con el calendario o busca por palabras clave al instante.
              </p>
            </div>

            {/* Total counter badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/15 text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>{total}</strong> notas encontradas</span>
            </div>
          </div>

          {/* 2. MINIMALIST INSTANT SEARCH BAR */}
          <div className="pt-2 max-w-3xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Búsqueda instantánea (ej: humedales, carelmapu, salud, quenuir, dideco)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white text-slate-900 text-sm pl-11 pr-10 py-3 rounded-2xl border border-slate-200 shadow-md outline-hidden focus:ring-2 focus:ring-[#05a353] focus:border-[#05a353] transition-all placeholder:text-slate-400"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* 3. INTERACTIVE CALENDAR & DATE PICKER SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          
          {/* Header of Calendar Section with Toggle on Mobile */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-[#05a353] flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-slate-900 leading-tight">
                  Calendario Interactivo de Publicaciones
                </h2>
                <p className="text-[11px] text-slate-500">
                  Haz clic en cualquier día para filtrar automáticamente las noticias de esa fecha
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Quitar filtro de día
                </button>
              )}
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold sm:hidden"
              >
                {calendarOpen ? 'Ocultar calendario' : 'Mostrar calendario'}
              </button>
            </div>
          </div>

          {/* Quick Date Shortcut Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase mr-1 shrink-0">
              Accesos rápidos:
            </span>
            <button
              onClick={() => setSelectedDate('')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                !selectedDate ? 'bg-[#002845] text-white shadow-2xs font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas las fechas (701)
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-06')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedDate === '2026-10-06' ? 'bg-[#05a353] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              6 de Octubre (4 notas)
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-04')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedDate === '2026-10-04' ? 'bg-[#05a353] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              4 de Octubre (2 notas)
            </button>
            <button
              onClick={() => setSelectedDate('2026-10-03')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedDate === '2026-10-03' ? 'bg-[#05a353] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              3 de Octubre (6 notas)
            </button>
            <button
              onClick={() => setSelectedDate('2026-09-30')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedDate === '2026-09-30' ? 'bg-[#05a353] text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              30 de Septiembre (2 notas)
            </button>
          </div>

          {/* Interactive Calendar Grid */}
          {calendarOpen && (
            <div className="pt-2">
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
                
                {/* Month & Year Navigation Bar */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-2xs"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <span className="font-serif font-bold text-sm sm:text-base text-slate-900 block">
                      {MONTH_NAMES[calMonth]} {calYear}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Días marcados tienen noticias publicadas
                    </span>
                  </div>

                  <button
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors shadow-2xs"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day of Week Headers (Lun - Dom) */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[11px] font-bold text-slate-500 uppercase">
                  {DAYS_SHORT.map((d, i) => (
                    <div key={i} className="py-1">{d}</div>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Empty cells for offset */}
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`offset-${i}`} className="h-9 sm:h-10" />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                    const dayNum = i + 1
                    const padM = String(calMonth + 1).padStart(2, '0')
                    const padD = String(dayNum).padStart(2, '0')
                    const dateKey = `${calYear}-${padM}-${padD}`
                    const postsOnDay = postsByDate[dateKey] || []
                    const hasPosts = postsOnDay.length > 0
                    const isSelected = selectedDate === dateKey

                    return (
                      <button
                        key={dayNum}
                        onClick={() => hasPosts && handleSelectDay(dayNum)}
                        disabled={!hasPosts}
                        title={hasPosts ? `${postsOnDay.length} noticia(s) el ${dayNum} de ${MONTH_NAMES[calMonth]}` : 'Sin publicaciones'}
                        className={`h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center relative text-xs transition-all ${
                          isSelected
                            ? 'bg-[#05a353] text-white font-extrabold shadow-sm scale-105 z-10'
                            : hasPosts
                            ? 'bg-emerald-500/10 text-emerald-800 font-bold border border-emerald-500/30 hover:bg-[#05a353] hover:text-white cursor-pointer shadow-2xs'
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <span className="leading-none text-xs">{dayNum}</span>
                        {hasPosts && (
                          <span className={`text-[9px] font-semibold px-1 rounded-full leading-none mt-0.5 ${
                            isSelected ? 'text-white' : 'text-emerald-700'
                          }`}>
                            {postsOnDay.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* 4. CATEGORY PILLS FILTER */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              !selectedCat ? 'bg-[#002845] text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Todas las Categorías
          </button>
          {categories.map((c) => {
            const active = selectedCat === c.slug
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(active ? '' : c.slug)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#05a353] text-white font-bold shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {c.name} ({c.count})
              </button>
            )
          })}
        </div>

        {/* 5. ACTIVE FILTERS SUMMARY BAR */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600">Filtros activos:</span>
            {selectedDate && (
              <span className="bg-[#05a353] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                📅 {selectedDate}
                <button onClick={() => setSelectedDate('')} className="hover:text-black">×</button>
              </span>
            )}
            {selectedCat && (
              <span className="bg-[#002845] text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                🏷️ {categories.find(c => c.slug === selectedCat)?.name || selectedCat}
                <button onClick={() => setSelectedCat('')} className="hover:text-red-300">×</button>
              </span>
            )}
            {query && (
              <span className="bg-sky-700 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                🔍 "{query}"
                <button onClick={() => setQuery('')} className="hover:text-red-300">×</button>
              </span>
            )}
            {!selectedDate && !selectedCat && !query && (
              <span className="text-slate-500">Mostrando todas las noticias por orden cronológico</span>
            )}
          </div>

          {(selectedDate || selectedCat || query) && (
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:underline flex items-center gap-1 font-bold text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restablecer filtros
            </button>
          )}
        </div>

        {/* 6. RESULTS GRID */}
        {displayedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              No se encontraron noticias
            </h3>
            <p className="text-xs text-slate-500">
              No hay publicaciones que coincidan con la fecha o criterio seleccionado.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-2 bg-[#002845] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-sky-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ver todas las 701 noticias
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayedPosts.map((post) => (
                <NewsCard key={post.id} post={post} variant="default" />
              ))}
            </div>

            {/* Load More Button if remaining */}
            {displayedPosts.length < total && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="bg-[#002845] hover:bg-sky-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>Cargar más noticias ({total - displayedPosts.length} restantes)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
