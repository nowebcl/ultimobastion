import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Compass, ChevronRight, ChevronLeft, Maximize2, 
  X, Download, BookOpen, Layers, ExternalLink,
  ChevronDown, CheckCircle2, Map as MapIcon, ArrowDown
} from 'lucide-react'

// ----------------------------------------------------
// AUTHENTIC CHAPTERS (FROM ORIGINAL WORDPRESS SITE)
// ----------------------------------------------------
const authenticChapters = [
  {
    id: 'c1',
    num: 'I',
    title: 'Contexto general de la cuenca del río Maullín',
    subtitle: 'Origen, recorrido y macrocuenca regional',
    paragraphs: [
      'El río Maullín es uno de los sistemas fluviales más importantes de la Región de Los Lagos y del sur de Chile. Tiene su origen como emisario del lago Llanquihue, el mayor lago de Chile continental, y recorre aproximadamente 85 km hacia el oeste-suroeste hasta desembocar en el Océano Pacífico, formando un estuario amplio y rico en humedales.',
      'La cuenca del Maullín pertenece a la macrocuenca denominada “Cuencas e Islas entre río Bueno y río Puelo”, que incluye diversas subcuencas y ríos de la región.',
      'La cuenca en su conjunto tiene una superficie considerable —cercana a 3 972–4 000 km² según diferentes inventarios hidrográficos— y drena grandes áreas de bosques, montañas, planicies fluviales y llanuras costeras.'
    ]
  },
  {
    id: 'c2',
    num: 'II',
    title: 'Estructura y dinámica física del sistema hidrográfico',
    subtitle: 'Nacimiento, afluentes, estuario y humedales',
    sections: [
      {
        heading: '🏞️ 1. Nacimiento y curso superior',
        items: [
          'Origen: El río Maullín nace en el extremo suroccidental del lago Llanquihue, a aproximadamente 70 m de altitud.',
          'En sus primeros kilómetros (curso superior), el río corre por terrenos relativamente planos, con un cauce más estrecho (60–100 m en muchos tramos), encajonado entre planicies y pequeños bosques ribereños.',
          'Tramo dominado por un régimen hídrico influido por precipitaciones y por el aporte estable del lago Llanquihue.'
        ]
      },
      {
        heading: '🌿 2. Desarrollo del cauce y afluentes principales',
        intro: 'A lo largo de su camino hacia el oeste, el río Maullín incrementa su volumen por varios tributarios menores y secundarios:',
        items: [
          'Río Cariquilda: nace al oeste de Puerto Montt y desemboca por la ribera sur del Maullín cerca de la ciudad de Maullín; históricamente la marea penetra varios km, siendo navegable por lanchas pequeñas en tramos inferiores.',
          'Río Negro, Río Calabozo, Gómez, Gato, Chaqueigua y otros esteros aportan caudal a lo largo del trayecto.',
          'Río Quenuir: desemboca en el bajo Maullín por la ribera norte, cerca de la desembocadura, formando meandros y zonas pantanosas.',
          'Río Palihue: contribuye a los humedales del Quenuir y al sistema fluvial inferior.'
        ]
      },
      {
        heading: '🌅 3. El estuario y humedales costeros',
        items: [
          'Amplios humedales mareales, lagunas, marismas y canales interconectados.',
          'Ecosistemas de hualves y pajonales ribereños, clave para aves acuáticas, peces y mamíferos como el huillín y el coipo.',
          'El conjunto fue declarado Santuario de la Naturaleza por el Estado de Chile en 2022, abarcando miles de hectáreas en varias comunas, incluida Maullín.'
        ]
      }
    ]
  },
  {
    id: 'c3',
    num: 'III',
    title: 'Influencia de las mareas y dinámica estuarina',
    subtitle: 'Zona de mezcla salino-dulce y productividad biológica',
    intro: 'En el tramo inferior, el río Maullín se convierte en un estuario de marea antes de su encuentro con el océano.',
    items: [
      'El nivel del agua y el sentido del flujo en brazos secundarios y humedales se ven influenciados por las mareas del Pacífico, que pueden penetrar varios kilómetros tierra adentro.',
      'La interacción entre aguas dulces fluviales y saladas marinas genera una zona de mezcla salino-dulce, clave para la productividad biológica y la biodiversidad.'
    ]
  },
  {
    id: 'c4',
    num: 'IV',
    title: 'Cambios geográficos y procesos luego del terremoto de 1960',
    subtitle: 'Impactos del tsunami en planicies costeras y canales estuarinos',
    intro: 'El terremoto y tsunami del 22 de mayo de 1960, el más potente registrado en la historia, tuvo impactos notables en la costa maulina:',
    items: [
      'El tsunami penetró la llanura costera y el tramo inferior del Maullín, generando inundaciones que llegaron varios kilómetros hacia el interior y alteraron la geomorfología de planicies costeras.',
      'Se han identificado depósitos sedimentarios de más de medio metro de espesor asociados con ese evento.',
      'Brechas en defensas naturales y cambios en canales estuarinos dieron lugar a nuevos humedales temporales o zonas inundadas que evolucionaron hacia marismas permanentes.'
    ]
  },
  {
    id: 'c5',
    num: 'V',
    title: 'Puntos poblados y uso humano del entorno del río',
    subtitle: 'Asentamientos ribereños y actividades tradicionales',
    intro: 'Dentro de la comuna de Maullín, los asentamientos humanos y actividades humanas se concentran principalmente a lo largo del tramo bajo y medio del río:',
    items: [
      'Ciudad de Maullín: centro urbano junto a la ribera baja, con actividades ligadas históricamente a pesca artesanal, comercio y transporte fluvial.',
      'Amortajado, Quenuir Bajo y Quenuir Alto: ecosistemas inundables usados tradicionalmente para pesca, caza y actividades campesinas; hoy con relevancia para aviturismo y conservación.',
      'Otros caseríos y pequeñas poblaciones se ubican a lo largo de tributarios y esteros, con densidades bajas y economías mixtas (agricultura, bosques y pesca).'
    ]
  },
  {
    id: 'c6',
    num: 'VI',
    title: 'Aportes pioneros: cartografía histórica y exploraciones tempranas',
    subtitle: 'Janequeo (1857) y Vidal Gormaz (siglo XIX)',
    intro: 'Los primeros levantamientos cartográficos detallados del río y sus alrededores fueron realizados por exploradores y oficiales del Ejército y la Armada Chilena en el siglo XIX:',
    items: [
      'El Plano del Río Maullín levantado en 1857 por oficiales del buque Janequeo es un testimonio temprano de la comprensión oficial del sistema fluvial y sus márgenes.',
      'Cartógrafos como el marino Francisco Vidal Gormaz documentaron la red hidrográfica y relieves asociados, aportando a una base histórica que permite comparar cambios a través del tiempo.'
    ],
    tip: 'Este capítulo funciona en estrecha relación con las láminas cartográficas y mapas antiguos expuestos a continuación, procedentes de la Biblioteca Nacional y material histórico municipal.'
  },
  {
    id: 'c7',
    num: 'VII',
    title: 'Conclusiones geográficas integradas',
    subtitle: 'Sistema fluvial-estuarino complejo y valor de manejo sustentable',
    intro: 'La cuenca del río Maullín, incluyendo su vasta red de tributarios y humedales, es un sistema fluvial-estuarino complejo que integra influencias dulceacuícolas, marinas y climáticas propias del sur lluvioso chileno.',
    items: [
      'Dentro de la comuna de Maullín, el río conforma redes de brazos de agua y humedales que estructuran identidad ecológica, económica y cultural del territorio.',
      'Mareas y estuarización generan zonas de mezcla salina/dulce con biodiversidad elevada y servicios ecosistémicos.',
      'Eventos extremos como el terremoto y tsunami de 1960 remodelaron el paisaje costero y estuarino, contribuyendo a la evolución de marismas actuales.',
      'La interacción entre sistemas naturales y presencia humana convierte a la cuenca en un objeto de estudio y manejo sustentable de alto valor.'
    ]
  }
]

// ----------------------------------------------------
// 15 AUTHENTIC CARTOGRAPHIC MAP IMAGES (ORIGINAL WORDPRESS ELEMENTOR PAGE)
// ----------------------------------------------------
const authenticMaps = [
  {
    id: 1,
    roman: 'I',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.14-PM.webp',
    title: 'Lámina I: Sistema Fluvial del Río Maullín',
    description: 'Levantamiento hidrográfico y cartográfico general del curso y estuario del Río Maullín.'
  },
  {
    id: 2,
    roman: 'II',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.14-PM-1.webp',
    title: 'Lámina II: Estructura Hidrográfica y Red de Afluentes',
    description: 'Detalle de tributarios, esteros y ramales fluviales en la cuenca baja e intermedia.'
  },
  {
    id: 3,
    roman: 'III',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.15-PM.webp',
    title: 'Lámina III: Carta Geográfica Costera y Desembocadura',
    description: 'Relieve de la desembocadura en el Océano Pacífico, barra arenosa y litoral comunal.'
  },
  {
    id: 4,
    roman: 'IV',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.16-PM.webp',
    title: 'Lámina IV: Humedales Mareales y Red Estuarina',
    description: 'Delimitación de áreas inundables, marismas y ecosistemas del estuario maulino.'
  },
  {
    id: 5,
    roman: 'V',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.16-PM-1.webp',
    title: 'Lámina V: Zonificación Territorial y Cobertura Ribereña',
    description: 'Uso de suelo, formaciones vegetales y distribución de planicies fluviales.'
  },
  {
    id: 6,
    roman: 'VI',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.17-PM.webp',
    title: 'Lámina VI: Dinámica de Mareas y Mezcla Salino-Dulce',
    description: 'Penetración de corrientes oceánicas y gradiente de salinidad a lo largo del cauce.'
  },
  {
    id: 7,
    roman: 'VII',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.18-PM.webp',
    title: 'Lámina VII: Geomorfología y Huella del Terremoto de 1960',
    description: 'Alteraciones del terreno, subsidencia tectónica y nuevas zonas anegadas posteriores al sismo.'
  },
  {
    id: 8,
    roman: 'VIII',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.19-PM.webp',
    title: 'Lámina VIII: Asentamientos y Caletas Tradicionales',
    description: 'Poblaciones ribereñas históricas: Maullín, Quenuir, Amortajado y caseríos aledaños.'
  },
  {
    id: 9,
    roman: 'IX',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.21-PM.webp',
    title: 'Lámina IX: Cartografía Histórica - Plano Janequeo 1857',
    description: 'Levantamiento temprano de oficiales de la Armada Chilena a bordo de la escampavía Janequeo.'
  },
  {
    id: 10,
    roman: 'X',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.21-PM-1.webp',
    title: 'Lámina X: Exploraciones Hidrográficas de Vidal Gormaz',
    description: 'Documentación del explorador Francisco Vidal Gormaz sobre las márgenes y sondas del río.'
  },
  {
    id: 11,
    roman: 'XI',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.23-PM.webp',
    title: 'Lámina XI: Registro Cartográfico Colonial y Republicano',
    description: 'Comparación histórica de topónimos, rutas fluviales y perfiles costeros de los siglos XIX y XX.'
  },
  {
    id: 12,
    roman: 'XII',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.25-PM.webp',
    title: 'Lámina XII: Cartas de Navegación del Seno y Río Maullín',
    description: 'Sondas batimétricas, bajos fondos y canales seguros de acceso marítimo-fluvial.'
  },
  {
    id: 13,
    roman: 'XIII',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.26-PM.webp',
    title: 'Lámina XIII: Carta Topográfica y Cuenca Superior',
    description: 'Conexión geográfica desde el desagüe del Lago Llanquihue hacia las llanuras occidentales.'
  },
  {
    id: 14,
    roman: 'XIV',
    image: '/images/mapas/WhatsApp-Image-2026-01-27-at-6.19.27-PM.webp',
    title: 'Lámina XIV: Mapa Físico Vertical del Litoral y Cuenca',
    description: 'Perspectiva cartográfica integral de la comarca maulina y su transición hacia el mar abierto.'
  },
  {
    id: 15,
    roman: 'XV',
    image: '/images/mapas/WhatsApp-Image-2026-03-18-at-7.03.31-PM.webp',
    title: 'Lámina XV: Archivo Cartográfico Patrimonial Comunal',
    description: 'Documento histórico complementario incorporado desde el fondo de difusión municipal y Biblioteca Nacional.'
  }
]

export default function MapasPage() {
  const [openChapters, setOpenChapters] = useState({ c1: true, c2: true })
  const [activeChapterId, setActiveChapterId] = useState('c1')
  const [readingProgress, setReadingProgress] = useState(0)
  const [activeModalMap, setActiveModalMap] = useState(null)
  const timelineRef = useRef(null)

  // Toggle chapter open/close
  const toggleChapter = (id) => {
    setOpenChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Scroll into view helper
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

      // Check which chapter is currently in view
      authenticChapters.forEach(ch => {
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

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activeModalMap) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalMap(null)
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (activeModalMap.id % authenticMaps.length)
        setActiveModalMap(authenticMaps[nextIdx])
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (activeModalMap.id - 2 + authenticMaps.length) % authenticMaps.length
        setActiveModalMap(authenticMaps[prevIdx])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModalMap])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-sky-600 selection:text-white">
      {/* ----------------------------------------------------
          BREADCRUMBS
      ---------------------------------------------------- */}
      <div className="bg-[#002238] border-b border-sky-950 py-2.5 px-4 text-xs text-sky-200">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-white font-medium">Mapas</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          HERO SECTION (IDENTICAL TO ORIGINAL ELEMENTOR MUB-MAPAS)
      ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 shadow-xs">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(980px_520px_at_8%_-10%,rgba(2,132,199,0.18),transparent_62%),radial-gradient(920px_520px_at_92%_0%,rgba(124,58,237,0.14),transparent_58%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 backdrop-blur-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>• <b>Mapas</b> • Cuenca del río Maullín</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl font-serif">
            Mapas y lectura geográfica de la cuenca
          </h1>

          <p className="mt-4 text-slate-600 text-sm sm:text-lg leading-relaxed max-w-3xl">
            Por capítulos para comprender el sistema fluvial-estuarino del Maullín: origen, estructura hidrográfica,
            humedales, mareas, cambios posteriores a 1960, presencia humana y cartografía histórica.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection('mubm-timeline')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ver capítulos</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('mubm-galeria')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Ver 15 láminas de cartografía</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold border border-sky-100">
                Río Maullín
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                Humedales
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100">
                Mareas
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-100">
                Cartografía
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
                Índice de Capítulos
              </h2>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                7 Capítulos
              </span>
            </div>

            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {authenticChapters.map(ch => {
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
                onClick={() => scrollToSection('mubm-galeria')}
                className="w-full text-left p-2 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-between transition-colors cursor-pointer border border-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ir a 15 Láminas de Mapas</span>
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
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Lectura geográfica de la cuenca</span>
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
            <div id="mubm-timeline" ref={timelineRef} className="space-y-4">
              {authenticChapters.map((ch) => {
                const isOpen = Boolean(openChapters[ch.id])
                return (
                  <article
                    key={ch.id}
                    id={`capitulo-${ch.id}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* Header */}
                    <div 
                      onClick={() => toggleChapter(ch.id)}
                      className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/70 to-white border-b border-slate-100 cursor-pointer select-none flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 uppercase tracking-wider bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full font-mono">
                          Capítulo {ch.num}
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
                      <div className="p-5 sm:p-6 space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed bg-white">
                        {/* If simple paragraphs */}
                        {ch.paragraphs && ch.paragraphs.map((para, idx) => (
                          <p key={idx} className="text-slate-700 leading-relaxed">
                            {para}
                          </p>
                        ))}

                        {/* If intro text */}
                        {ch.intro && (
                          <p className="font-medium text-slate-800 leading-relaxed">
                            {ch.intro}
                          </p>
                        )}

                        {/* If direct list items */}
                        {ch.items && (
                          <ul className="space-y-2.5 pl-2">
                            {ch.items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* If structured sub-sections (Chapter II) */}
                        {ch.sections && ch.sections.map((sec, secIdx) => (
                          <div key={secIdx} className="space-y-2 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                              {sec.heading}
                            </h3>
                            {sec.intro && (
                              <p className="text-sm text-slate-600 italic">
                                {sec.intro}
                              </p>
                            )}
                            <ul className="space-y-2 pl-2">
                              {sec.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2.5 text-slate-700 text-sm sm:text-base leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {/* Optional callout tip (e.g. Chapter VI) */}
                        {ch.tip && (
                          <div className="mt-4 p-4 rounded-xl bg-sky-50 border-l-4 border-sky-600 text-sky-950 text-xs sm:text-sm leading-relaxed">
                            <span className="font-bold">Tip de Cartografía: </span>
                            {ch.tip}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            {/* Official Sources Box */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <b className="text-slate-900">Fuentes oficiales del estudio:</b> Biblioteca Nacional de Chile (web y mapas antiguos históricos), Municipalidad de Maullín (material público de difusión territorial).
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ----------------------------------------------------
          AUTHENTIC CARTOGRAPHY GALLERY (15 REAL MAPS - FULL WIDTH STACKED)
      ---------------------------------------------------- */}
      <section id="mubm-galeria" className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 space-y-8">
        {/* Section Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full mb-2.5 border border-sky-100">
              <Layers className="w-3.5 h-3.5" />
              <span>Colección Cartográfica Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 font-serif tracking-tight">
              15 Láminas de Mapas y Cartografía Histórica
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              Exhibición completa de mapas históricos, cartas hidrográficas y levantamientos oficiales de la cuenca del Río Maullín en alta definición. Cada lámina se presenta a pantalla completa para facilitar su lectura y estudio detallado.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              15 Mapas Documentados
            </span>
          </div>
        </div>

        {/* QUICK JUMP PILLS (LÁMINAS I A XV) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>Navegación Rápida por Láminas:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal lowercase">haz clic para saltar al mapa</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {authenticMaps.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => scrollToSection(`mapa-lamina-${m.id}`)}
                className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer"
                title={m.title}
              >
                Lámina {m.roman}
              </button>
            ))}
          </div>
        </div>

        {/* 15 FULL-WIDTH MAP CARDS (ONE BELOW THE OTHER) */}
        <div className="space-y-12 sm:space-y-16">
          {authenticMaps.map((mapItem) => (
            <article
              key={mapItem.id}
              id={`mapa-lamina-${mapItem.id}`}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden scroll-mt-24"
            >
              {/* Card Header Bar */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full">
                      <MapIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Lámina {mapItem.roman}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      • Documento Cartográfico Oficial
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
                    {mapItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
                    {mapItem.description}
                  </p>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setActiveModalMap(mapItem)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer shadow-2xs"
                    title="Abrir en pantalla completa"
                  >
                    <Maximize2 className="w-4 h-4 text-sky-600" />
                    <span>Ampliar Pantalla Completa</span>
                  </button>

                  <a
                    href={mapItem.image}
                    download={`Maullin_Mapa_${mapItem.id}.webp`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-300 transition-all shadow-2xs"
                    title="Descargar lámina en alta resolución"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Descargar HD</span>
                  </a>
                </div>
              </div>

              {/* Full-Width Uncropped Map Frame */}
              <div
                onClick={() => setActiveModalMap(mapItem)}
                className="relative w-full bg-slate-950/5 flex items-center justify-center p-2 sm:p-5 group cursor-zoom-in overflow-hidden border-b border-slate-100"
              >
                <img
                  src={mapItem.image}
                  alt={mapItem.title}
                  loading="lazy"
                  className="w-full h-auto max-h-[88vh] object-contain rounded-xl sm:rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-[1.008]"
                />

                {/* Floating Cue on Hover */}
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-xs pointer-events-none">
                  <Maximize2 className="w-4 h-4 text-sky-400" />
                  <span>Click para ver en alta resolución</span>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="px-5 py-3 bg-slate-50/70 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Archivo Patrimonial • Cuenca del Río Maullín</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModalMap(mapItem)}
                  className="text-sky-700 hover:text-sky-900 font-bold font-sans flex items-center gap-1 cursor-pointer"
                >
                  <span>Explorar lámina interactiva</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------
          FULLSCREEN LIGHTBOX MODAL (WITH ZOOM & PREV/NEXT)
      ---------------------------------------------------- */}
      {activeModalMap && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          onClick={() => setActiveModalMap(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/80">
              <div className="min-w-0">
                <span className="text-[11px] font-mono font-bold text-sky-700 uppercase bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                  Lámina {activeModalMap.roman} de XV
                </span>
                <h3 className="text-base sm:text-xl font-bold font-serif text-slate-950 truncate mt-1">
                  {activeModalMap.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeModalMap.image}
                  download={`Maullin_Mapa_${activeModalMap.id}.webp`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Descargar imagen original"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Descargar HD</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalMap(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Frame with Prev / Next overlay buttons */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[50vh] max-h-[68vh] p-2 select-none">
              <img
                src={activeModalMap.image}
                alt={activeModalMap.title}
                className="max-h-full max-w-full object-contain rounded-md"
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={() => {
                  const prevIdx = (activeModalMap.id - 2 + authenticMaps.length) % authenticMaps.length
                  setActiveModalMap(authenticMaps[prevIdx])
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Lámina anterior (Flecha Izquierda)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (activeModalMap.id % authenticMaps.length)
                  setActiveModalMap(authenticMaps[nextIdx])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Lámina siguiente (Flecha Derecha)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
              <p className="leading-relaxed">
                {activeModalMap.description}
              </p>
              <div className="text-[11px] text-slate-400 font-mono shrink-0">
                Navega con flechas del teclado ← → o presiona Esc para salir
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
