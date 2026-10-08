import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Compass, Map as MapIcon, ChevronRight, Layers, 
  Maximize2, X, Download, Info, CheckCircle2 
} from 'lucide-react'

const mapChapters = [
  {
    id: 1,
    title: "Estructura Hidrográfica General de la Cuenca",
    category: "cuenca",
    image: "/images/maps/map-1.webp",
    description: "Visión panorámica de la cuenca del Río Maullín desde su nacimiento en el Lago Llanquihue hasta su desembocadura en el Océano Pacífico, abarcando más de 112 km de curso de agua continuo."
  },
  {
    id: 2,
    title: "Subcuencas Tributarias y Red de Afluentes",
    category: "cuenca",
    image: "/images/maps/map-2.webp",
    description: "Detalle de los principales afluentes tributarios: Río Calabozo, Río Gómez, Río Negro y esteros que alimentan el caudal permanente del sistema estuarino."
  },
  {
    id: 3,
    title: "Santuario de la Naturaleza Humedales del Maullín",
    category: "humedales",
    image: "/images/maps/map-3.webp",
    description: "Delimitación del área protegida oficial de humedales costeros y marismas protegidas bajo la categoría de Santuario de la Naturaleza (Decreto MMA)."
  },
  {
    id: 4,
    title: "Ecosistemas de Bosque Hundido y Marismas",
    category: "humedales",
    image: "/images/maps/map-4.webp",
    description: "Mapa biogeográfico de los bosques pantanosos de pitra (Myrceugenia exsucca) y temo, sumergidos parcialmente tras el terremoto de 1960."
  },
  {
    id: 5,
    title: "Dinámica Estuarina y Penetración de Mareas",
    category: "mareas",
    image: "/images/maps/map-5.webp",
    description: "Zona de mezcla fluvio-marina. La marea del Océano Pacífico penetra más de 40 kilómetros río arriba, condicionando la salinidad y la vida biológica."
  },
  {
    id: 6,
    title: "Zonificación de Corrientes en Boca Maullín",
    category: "mareas",
    image: "/images/maps/map-6.webp",
    description: "Carta de navegación y batimetría preliminar del acceso marítimo entre Carelmapu, la Barra del Maullín y Punta Amortajado."
  },
  {
    id: 7,
    title: "Topografía Costera y Elevación de la Comuna",
    category: "geomorfologia",
    image: "/images/maps/map-7.webp",
    description: "Modelo de elevación digital del relieve costero, mesetas terrazadas y planicies de inundación que configuran el paisaje habitado."
  },
  {
    id: 8,
    title: "Efectos Geomorfológicos del Terremoto de 1960",
    category: "geomorfologia",
    image: "/images/maps/map-8.webp",
    description: "Registro comparativo de hundimiento tectónico (-1.8 a -2.0 metros) y la formación de nuevas lagunas estuarinas en Quenuir y Lepihué."
  },
  {
    id: 9,
    title: "Asentamientos Tradicionales y Localidades",
    category: "comunidad",
    image: "/images/maps/map-9.webp",
    description: "Distribución demográfica territorial: Maullín Urbano, Carelmapu, Quenuir, Lepihué, Peñol, La Pasada, Olmopulli y Lolcura."
  },
  {
    id: 10,
    title: "Rutas Fluviales y Caletas de Pesca Artesanal",
    category: "comunidad",
    image: "/images/maps/map-10.webp",
    description: "Conectividad marítima, varaderos, caletas ribereñas y zonas de extracción de recursos bentónicos y cultivo de pelillo (Gracilaria chilensis)."
  },
  {
    id: 11,
    title: "Cartografía de Sitios Arqueológicos Costeros",
    category: "historico",
    image: "/images/maps/map-11.webp",
    description: "Localización de conchales prehistóricos, corrales de pesca indígenas y vestigios del poblamiento temprano en el litoral de Carelmapu."
  },
  {
    id: 12,
    title: "Plano Español del Fuerte San Antonio (Siglo XVIII)",
    category: "historico",
    image: "/images/maps/map-12.webp",
    description: "Reproducción histórica de la planta militar del baluarte defensivo de Carelmapu, custodio del paso de naves hacia Chiloé."
  },
  {
    id: 13,
    title: "Carta de Navegación Histórica de Moraleda (1795)",
    category: "historico",
    image: "/images/maps/map-13.webp",
    description: "Levantamiento hidrográfico colonial realizado por el piloto José de Moraleda y Montero por orden del Virreinato del Perú."
  },
  {
    id: 14,
    title: "Vuelo Aerofotogramétrico Histórico Hycon 1961",
    category: "historico",
    image: "/images/maps/map-14.webp",
    description: "Fotografía aérea oficial tomada tras la catástrofe de 1960 para evaluar el colapso de las defensas fluviales y el rediseño urbano."
  },
  {
    id: 15,
    title: "Cartografía Geográfica Oficial IGM Maullín",
    category: "historico",
    image: "/images/maps/map-15.webp",
    description: "Carta topográfica escala 1:50.000 del Instituto Geográfico Militar con toponimia tradicional y división predial territorial."
  }
]

export default function MapasPage() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [activeModalMap, setActiveModalMap] = useState(null)

  const categories = [
    { id: 'todos', name: 'Todos los Capítulos' },
    { id: 'cuenca', name: 'Río Maullín & Cuenca' },
    { id: 'humedales', name: 'Humedales & Santuario' },
    { id: 'mareas', name: 'Mareas & Océano' },
    { id: 'geomorfologia', name: 'Geología & 1960' },
    { id: 'comunidad', name: 'Localidades & Caletas' },
    { id: 'historico', name: 'Cartografía Histórica' }
  ]

  const filteredMaps = selectedCategory === 'todos' 
    ? mapChapters 
    : mapChapters.filter(m => m.category === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#002b49] text-white py-12 px-4 border-b-4 border-sky-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Atlas Territorial</span>
          </div>
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight">
              Mapas de la Cuenca del Río Maullín
            </h1>
          </div>
          <p className="text-sky-200 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Atlas cartográfico interactivo por capítulos para comprender el sistema fluvial-estuarino del Maullín: origen hidrográfico, santuario de humedales, dinámicas mareales, huella del terremoto de 1960 y cartografía histórica.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-10 space-y-10">
        {/* INTERACTIVE GEOGRAPHIC EMBED */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block">
                Visualizador Satelital
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Ubicación Georreferenciada de la Comuna de Maullín
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Coordenadas: 41°37'00"S 73°36'00"W
            </span>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
            <iframe
              title="Mapa de Maullín"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.95%2C-41.78%2C-73.30%2C-41.45&layer=mapnik&marker=-41.6167%2C-73.6000"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </section>

        {/* CATEGORY TABS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all shadow-xs ${
                  selectedCategory === c.id
                    ? 'bg-[#002b49] text-white scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* GRID OF 15 MAP CHAPTERS (Optimized WebP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.map((mapItem) => (
              <div 
                key={mapItem.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div 
                    onClick={() => setActiveModalMap(mapItem)}
                    className="aspect-[16/10] overflow-hidden bg-slate-900 relative cursor-pointer"
                  >
                    <img
                      src={mapItem.image}
                      alt={mapItem.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/images/default-news.webp' }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar Mapa
                      </span>
                    </div>
                    <span className="absolute top-2.5 left-2.5 bg-[#002b49]/90 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs">
                      Capítulo {mapItem.id}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base font-serif mb-2 leading-snug group-hover:text-sky-700 transition-colors">
                      {mapItem.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {mapItem.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Formato WebP HD</span>
                  <button
                    onClick={() => setActiveModalMap(mapItem)}
                    className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BIBLIOGRAPHIC NOTES */}
        <section className="bg-slate-100 rounded-xl p-5 text-xs text-slate-600 space-y-2 border border-slate-200">
          <span className="font-bold text-slate-800 block">Créditos y Archivo Cartográfico:</span>
          <p>• Colección digital Biblioteca Nacional de Chile (Memoria Chilena y Mapoteca Histórica).</p>
          <p>• Archivo Territorial de Maullín y Proyecto Santuario de la Naturaleza Humedales de Maullín.</p>
          <p>• Archivos históricos de la expedición de Moraleda (1795) e Instituto Geográfico Militar (IGM).</p>
        </section>
      </main>

      {/* LIGHTBOX MODAL */}
      {activeModalMap && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setActiveModalMap(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase font-mono">
                  Capítulo {activeModalMap.id}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {activeModalMap.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalMap(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[60vh]">
              <img
                src={activeModalMap.image}
                alt={activeModalMap.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {activeModalMap.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
