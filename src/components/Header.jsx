import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Calendar, Search, Menu, X, ChevronDown, 
  ExternalLink, CloudSun, Radio, Sparkles,
  Play, Pause, Volume2, VolumeX
} from 'lucide-react'
import { InstagramIcon, YoutubeIcon } from './SocialIcons'
import { getCategories, searchPosts } from '../utils/postsService'
import { useRadio } from '../context/RadioContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [currentDateFormatted, setCurrentDateFormatted] = useState('Lunes 6 de Octubre, 2025')
  const [weatherTemp, setWeatherTemp] = useState(14)
  
  const searchContainerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Global Radio Pangal state (starts in SILENCE upon entering)
  const {
    isPlaying: isRadioPlaying,
    isLoading: isRadioLoading,
    isMuted,
    togglePlay: toggleRadio,
    toggleMute
  } = useRadio()

  // Chilean date format: "Lunes 6 de Octubre, 2025"
  useEffect(() => {
    try {
      const today = new Date()
      const weekday = today.toLocaleDateString('es-CL', { weekday: 'long' })
      const day = today.getDate()
      const month = today.toLocaleDateString('es-CL', { month: 'long' })
      const year = today.getFullYear()
      const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
      const capMonth = month.charAt(0).toUpperCase() + month.slice(1)
      setCurrentDateFormatted(`${capWeekday} ${day} de ${capMonth}, ${year}`)
    } catch (e) {}

    // Live weather for Maullín
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-41.6167&longitude=-73.6&current_weather=true'
        )
        if (res.ok) {
          const data = await res.json()
          if (data.current_weather?.temperature) {
            setWeatherTemp(Math.round(data.current_weather.temperature))
          }
        }
      } catch (e) {}
    }
    fetchWeather()
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSearchOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Click outside search listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim().length >= 2) {
      const results = searchPosts(q, 1, 5)
      setSearchResults(results.posts)
      setSearchOpen(true)
    } else {
      setSearchResults([])
      setSearchOpen(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      setMobileSearchOpen(false)
      navigate(`/noticias?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }


  const isActive = (path) => location.pathname === path

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">
      
      {/* 1. DESKTOP TOP BAR (WHITE) - HIDDEN ON MOBILE TO PREVENT VERTICAL EXPANSION */}
      <div className="hidden lg:block bg-white border-b border-slate-200 py-2 px-4 text-slate-700 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-y-2 gap-x-4">
          
          {/* Left section: Date, Weather, Search Pill */}
          <div className="flex items-center gap-4 xl:gap-5">
            {/* Date */}
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 shrink-0">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 shrink-0">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-900 text-xs">{weatherTemp}°C</span>
                <span className="text-[10px] text-slate-400 font-medium">Maullín, Los Lagos, Chile</span>
              </div>
            </div>

            {/* Search Pill Input */}
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Buscar noticias, temas..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchResults.length > 0) setSearchOpen(true) }}
                  className="rounded-full border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white text-xs pl-8 pr-4 py-1.5 w-60 xl:w-72 outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-200 transition-all placeholder:text-slate-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </form>

              {/* Instant Search Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-3">
                    <span>Resultados rápidos</span>
                    <Link 
                      to={`/noticias?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchOpen(false)}
                      className="text-sky-600 hover:underline flex items-center gap-0.5"
                    >
                      Ver todas <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        to={`/noticia/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={p.image}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover shrink-0 bg-slate-200"
                          onError={(e) => { e.currentTarget.src = '/images/default-news.webp' }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase font-bold text-sky-600 block">
                            {p.categories?.[0]?.name || 'Noticia'}
                          </span>
                          <h4 className="text-xs font-medium text-slate-800 line-clamp-1 leading-snug">
                            {p.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right section: Economic Indicators & Radio Pangal 88.3 FM */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Economic indicators */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span><strong className="font-bold text-slate-900">UF</strong> $37.912,40</span>
              <span><strong className="font-bold text-slate-900">UTM</strong> $66.628</span>
            </div>

            {/* Radio Pangal Streaming Widget - ENTERS IN SILENCE, USER ACTIVATES SOUND */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isRadioPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <div className="flex flex-col leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">
                      Radio Pangal 88.3 FM
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider ${
                      isRadioPlaying ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isRadioPlaying ? 'En Vivo' : 'En Silencio'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {isRadioPlaying ? 'Transmitiendo en vivo desde Maullín' : 'Haz clic para activar el sonido'}
                  </span>
                </div>
              </div>

              {/* Sound equalizer bars when playing */}
              {isRadioPlaying && (
                <div className="flex items-end gap-0.5 h-3.5 text-emerald-600 shrink-0">
                  <span className="w-0.5 bg-[#05a353] rounded-full h-3.5 animate-pulse" />
                  <span className="w-0.5 bg-[#05a353] rounded-full h-2 animate-pulse delay-75" />
                  <span className="w-0.5 bg-[#05a353] rounded-full h-3 animate-pulse delay-150" />
                  <span className="w-0.5 bg-[#05a353] rounded-full h-2.5 animate-pulse delay-100" />
                </div>
              )}

              {/* Action Button: Activar Sonido / Pausar */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleRadio}
                  disabled={isRadioLoading}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                    isRadioPlaying
                      ? 'bg-slate-800 hover:bg-slate-900 text-white'
                      : 'bg-[#05a353] hover:bg-[#048a46] text-white hover:scale-105'
                  }`}
                  title={isRadioPlaying ? 'Pausar transmisión' : 'Activar transmisión en vivo'}
                >
                  {isRadioLoading ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isRadioPlaying ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-white" />
                  )}
                  <span>{isRadioLoading ? 'Conectando...' : isRadioPlaying ? 'Pausar' : 'Activar Sonido'}</span>
                </button>

                {isRadioPlaying && (
                  <button
                    onClick={toggleMute}
                    className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                    title={isMuted ? 'Activar audio' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN NAV: DEEP NAVY #002845 (CLEAN & APP-LIKE ON MOBILE) */}
      <nav className="bg-[#002845] text-white py-2 sm:py-2.5 px-3 sm:px-4 border-t border-sky-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo on Left */}
          <Link to="/" className="flex items-center shrink-0 py-1">
            <img 
              src="/images/site/logo.webp" 
              alt="Maullín Último Bastión Continental" 
              className="h-9 sm:h-10 md:h-11 lg:h-14 xl:h-16 w-auto object-contain hover:brightness-105 transition-all drop-shadow-xs"
            />
          </Link>

          {/* DESKTOP NAVIGATION LINKS */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-semibold uppercase tracking-wider">
            
            {/* SERVICIOS with dropdown */}
            <div className="relative group">
              <button className="text-white hover:text-emerald-400 transition-colors py-2 flex items-center gap-1 cursor-pointer">
                SERVICIOS <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
              </button>
              <div className="absolute left-0 top-full hidden group-hover:block bg-[#001728] border border-slate-700/80 rounded-xl shadow-2xl p-2.5 w-60 space-y-1 z-50">
                <Link to="/emprendimientos" className="block p-2 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white normal-case text-xs transition-colors">
                  Directorio Comercial de Maullín
                </Link>
                <Link to="/mapas" className="block p-2 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white normal-case text-xs transition-colors">
                  Mapas & Conectividad Fluvial
                </Link>
                <Link to="/contacto" className="block p-2 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white normal-case text-xs transition-colors">
                  Atención Ciudadana & Denuncias
                </Link>
              </div>
            </div>

            {/* INICIO */}
            <Link 
              to="/" 
              className={`py-2 transition-colors relative ${
                isActive('/') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              INICIO
            </Link>

            {/* NUEVA SECCIÓN: NOTICIAS (Noticias Publicadas & Calendario) */}
            <div className="relative group">
              <Link 
                to="/noticias" 
                className={`py-2 transition-colors relative flex items-center gap-1 ${
                  isActive('/noticias') 
                    ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                    : 'text-white hover:text-emerald-400'
                }`}
              >
                <span>NOTICIAS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block bg-[#001728] border border-slate-700/80 rounded-xl shadow-2xl p-2.5 w-64 space-y-1 z-50">
                <Link to="/noticias" className="block p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-white normal-case text-xs hover:bg-emerald-500/25 transition-colors">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Noticias Publicadas
                  </div>
                  <span className="text-[11px] text-slate-300">Archivo interactivo, calendario por día y buscador</span>
                </Link>
                <div className="border-t border-slate-800 my-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block">Categorías</span>
                <Link to="/categoria/salud" className="block px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white normal-case text-xs">
                  Salud
                </Link>
                <Link to="/categoria/deporte" className="block px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white normal-case text-xs">
                  Deportes
                </Link>
                <Link to="/categoria/cultura-comunidad" className="block px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white normal-case text-xs">
                  Cultura & Comunidad
                </Link>
                <Link to="/categoria/proyectos" className="block px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white normal-case text-xs">
                  Proyectos & Obras
                </Link>
              </div>
            </div>

            {/* HISTORIA */}
            <Link 
              to="/historia" 
              className={`py-2 transition-colors relative ${
                isActive('/historia') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              HISTORIA
            </Link>

            {/* MAPAS */}
            <Link 
              to="/mapas" 
              className={`py-2 transition-colors relative ${
                isActive('/mapas') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              MAPAS
            </Link>

            {/* EMPRENDIMIENTOS */}
            <Link 
              to="/emprendimientos" 
              className={`py-2 transition-colors relative ${
                isActive('/emprendimientos') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              EMPRENDIMIENTOS
            </Link>

            {/* QUIENES SOMOS */}
            <Link 
              to="/quienes-somos" 
              className={`py-2 transition-colors relative ${
                isActive('/quienes-somos') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              QUIENES SOMOS
            </Link>

            {/* CONTACTOS */}
            <Link 
              to="/contacto" 
              className={`py-2 transition-colors relative ${
                isActive('/contacto') 
                  ? 'text-emerald-400 font-bold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-emerald-400 after:rounded-full' 
                  : 'text-white hover:text-emerald-400'
              }`}
            >
              CONTACTOS
            </Link>

            {/* Separator | */}
            <span className="text-slate-500 font-light select-none mx-0.5">|</span>

            {/* Social Icons (Instagram & YouTube) */}
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="Instagram"
                className="text-white hover:text-pink-400 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="YouTube"
                className="text-white hover:text-red-500 transition-colors"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* MOBILE ACTIONS BAR (APP-LIKE: COMPACT, NEAT & ORDERED) */}
          <div className="lg:hidden flex items-center gap-2">
            
            {/* Mobile Radio Pangal Mini Button */}
            <button
              onClick={toggleRadio}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                isRadioPlaying 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm' 
                  : 'bg-white/10 text-emerald-300 border-white/20 hover:bg-white/20'
              }`}
              title={isRadioPlaying ? 'Pausar Radio Pangal' : 'Activar Radio Pangal en vivo'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isRadioPlaying ? 'bg-slate-950 animate-ping' : 'bg-slate-400'}`} />
              {isRadioPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Radio className="w-3 h-3" />}
              <span>{isRadioPlaying ? '88.3 FM Vivo' : '88.3 FM Activar'}</span>
            </button>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                if (mobileMenuOpen) setMobileMenuOpen(false)
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </nav>

      {/* MOBILE EXPANDABLE SEARCH BAR (TIGHT & MINIMAL) */}
      {mobileSearchOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-700 p-3 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar noticias en Maullín..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-slate-800 text-white text-xs pl-9 pr-20 py-2.5 rounded-xl border border-slate-700 outline-hidden focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-sky-600 text-white font-bold text-[11px] rounded-lg"
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* MOBILE APP-LIKE DRAWER (CLEAN, TIDY, NOT BULKY) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#001728] text-white p-4 space-y-4 border-b border-slate-700 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-3 duration-200">
          
          {/* Main Navigation Links */}
          <div className="space-y-1.5">
            <Link 
              to="/" 
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                isActive('/') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <span>INICIO</span>
            </Link>

            {/* NOTICIAS & NOTICIAS PUBLICADAS HIGHLIGHT */}
            <Link 
              to="/noticias" 
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                isActive('/noticias') ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>NOTICIAS PUBLICADAS</span>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-sans lowercase">
                calendario
              </span>
            </Link>

            <Link 
              to="/historia" 
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold uppercase bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <span>HISTORIA</span>
            </Link>

            <Link 
              to="/mapas" 
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold uppercase bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <span>MAPAS & CUENCA</span>
            </Link>

            <Link 
              to="/emprendimientos" 
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold uppercase bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <span>EMPRENDIMIENTOS</span>
            </Link>

            <Link 
              to="/quienes-somos" 
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold uppercase bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <span>QUIENES SOMOS</span>
            </Link>

            <Link 
              to="/contacto" 
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold uppercase bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <span>CONTACTOS</span>
            </Link>
          </div>

          {/* Radio Pangal Live Player Card inside Drawer */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isRadioPlaying ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-emerald-300'}`}>
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Radio Pangal 88.3 FM</span>
                <span className="text-[10px] text-slate-300">
                  {isRadioPlaying ? 'Transmitiendo en vivo' : 'En silencio • Clic para activar'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleRadio}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                isRadioPlaying 
                  ? 'bg-white text-slate-950 hover:bg-slate-200' 
                  : 'bg-[#05a353] text-white hover:bg-[#048a46]'
              }`}
            >
              {isRadioPlaying ? 'Pausar' : 'Activar Sonido'}
            </button>
          </div>

          {/* Compact Weather & Date Card inside drawer */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-white">{weatherTemp}°C</span>
                <span className="text-[10px] text-slate-400 block">Maullín, Los Lagos</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <span>{currentDateFormatted}</span>
            </div>
          </div>

          {/* Economic Indicators */}
          <div className="flex items-center justify-around py-2 px-3 rounded-lg bg-black/25 text-[11px] text-slate-300 border border-white/5">
            <span><strong>UF:</strong> $37.912</span>
            <span>•</span>
            <span><strong>UTM:</strong> $66.628</span>
          </div>

          {/* Social Icons row */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Síguenos:</span>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-pink-400">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-red-500">
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      )}

    </header>
  )
}
