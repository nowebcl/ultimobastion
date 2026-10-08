import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Landmark, Calendar, Clock, BookOpen, Search, 
  ChevronRight, ArrowUpDown, ChevronLeft, Award, MapPin 
} from 'lucide-react'

const alcaldesData = [
  { nombre: "José Nabih Soza K.", inicio: 1963, termino: 1967, partido: "Partido Nacional", periodo: "1963 - 1967" },
  { nombre: "Eduardo Atala Barahona", inicio: 1967, termino: 1971, partido: "Partido Radical", periodo: "1967 - 1971" },
  { nombre: "José Montealegre", inicio: 1971, termino: 1973, partido: "Democracia Cristiana", periodo: "1971 - 1973" },
  { nombre: "Walterio Gebauer", inicio: 1973, termino: 1981, partido: "Designado (Régimen Militar)", periodo: "1973 - 1981" },
  { nombre: "Berta Reyes Manzano", inicio: 1981, termino: 1992, partido: "Designada (11 años de gestión)", periodo: "1981 - 1992" },
  { nombre: "Juan Carlos Soto", inicio: 1992, termino: 1996, partido: "Democracia Cristiana", periodo: "1992 - 1996" },
  { nombre: "Jorge Westermeier Estrada", inicio: 2000, termino: 2021, partido: "Democracia Cristiana", periodo: "2000 - 2021" },
  { nombre: "Nabih Soza Cárdenas", inicio: 2021, termino: 2026, partido: "Independiente / Chile Vamos", periodo: "2021 - Actualidad" }
]

const hitosHistoricos = [
  {
    periodo: "1567",
    titulo: "Llegada Española y Asentamiento Fluvial",
    descripcion: "Martín Ruiz de Gamboa explora la cuenca del Río Maullín, estableciendo el primer contacto entre la expedición colonizadora y los pueblos originarios huilliches y chonos que habitaban sus riberas y laberintos de estuarios.",
    badge: "Siglo XVI"
  },
  {
    periodo: "1790",
    titulo: "El Fuerte San Antonio de Carelmapu",
    descripcion: "Frente a las incursiones corsarias y la rebelión huilliche de Osorno, la Corona fortifica la costa sur. Carelmapu y Maullín se convierten en los centinelas continentales del archipiélago de Chiloé.",
    badge: "Baluarte Colonial"
  },
  {
    periodo: "1826",
    titulo: "Tratado de Tantauco: El Último Bastión",
    descripcion: "Mientras todo el continente americano lograba su emancipación, Chiloé y el territorio de Maullín permanecieron leales a la Corona española hasta enero de 1826. La anexión a la República de Chile marca el cierre de la época colonial continental.",
    badge: "Hito Republicano"
  },
  {
    periodo: "1960",
    titulo: "El Gran Terremoto y Tsunami de Valdivia",
    descripcion: "El megasismo más potente registrado en la historia moderna cambió para siempre la fisonomía de Maullín. La costa se hundió más de 1.8 metros, sumergiendo bosques nativos y creando el complejo sistema de humedales estuarinos que hoy es Santuario de la Naturaleza.",
    badge: "Transformación Natural"
  },
  {
    periodo: "Época Actual",
    titulo: "Capital Nacional de Humedales y Memoria Viva",
    descripcion: "Maullín se proyecta al mundo como un modelo de coexistencia entre la pesca artesanal, el cultivo del pelillo, el turismo de observación de aves y la preservación inquebrantable de su patrimonio costero.",
    badge: "Presente y Futuro"
  }
]

export default function HistoriaPage() {
  const [alcaldeSearch, setAlcaldeSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(false)

  const filteredAlcaldes = alcaldesData
    .filter(a => 
      a.nombre.toLowerCase().includes(alcaldeSearch.toLowerCase()) ||
      a.periodo.toLowerCase().includes(alcaldeSearch.toLowerCase()) ||
      a.partido.toLowerCase().includes(alcaldeSearch.toLowerCase())
    )
    .sort((a, b) => sortAsc ? a.inicio - b.inicio : b.inicio - a.inicio)

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#002b49] text-white py-12 px-4 border-b-4 border-sky-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Patrimonio e Historia</span>
          </div>
          <div className="flex items-center gap-3">
            <Landmark className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight">
              Historia de Maullín
            </h1>
          </div>
          <p className="text-sky-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            El Último Bastión Continental: una crónica viva de navegación, defensa colonial, resiliencia telúrica y profunda identidad ribereña.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-10 space-y-12">
        {/* Intro Card with Historic Photo */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 bg-slate-900">
              <img
                src="/images/maps/map-15.webp"
                alt="Cartografía histórica Maullín"
                className="w-full h-full object-cover min-h-[260px] opacity-90"
                onError={(e) => { e.target.src = '/images/default-news.webp' }}
              />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
                Reseña Histórica Territorial
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-serif mb-3 leading-tight">
                ¿Por qué Maullín es el "Último Bastión"?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Por su posición geográfica privilegiada frente a la boca del Golfo de Coronados y la entrada al canal de Chacao, Maullín constituyó el punto más austral de la resistencia continental española en Sudamérica.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Su historia no solo está forjada por decretos y tratados como el Tratado de Tantauco de 1826, sino por las generaciones de carpinteros de ribera, pescadores, mariscadores y agricultores que han sabido convivir con la fuerza indómita del Río Maullín y el Océano Pacífico.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Hitos */}
        <section className="space-y-6">
          <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                Cronología y Capítulos Fundamentales
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">1567 - Siglo XXI</span>
          </div>

          <div className="space-y-4">
            {hitosHistoricos.map((hito, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:border-sky-300 transition-colors flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="bg-[#002b49] text-white px-4 py-2.5 rounded-xl font-mono font-bold text-lg text-center shrink-0 min-w-[90px]">
                  {hito.periodo}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {hito.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {hito.titulo}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {hito.descripcion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALCALDES HISTÓRICOS TABLE */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
                Memoria Institucional
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Alcaldes de Maullín: Línea Histórica
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar alcalde o año..."
                  value={alcaldeSearch}
                  onChange={(e) => setAlcaldeSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                title="Invertir orden cronológico"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortAsc ? 'Más antiguos' : 'Más recientes'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Alcalde</th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4">Afiliación / Contexto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlcaldes.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.nombre}
                    </td>
                    <td className="py-3.5 px-4 text-sky-700 font-mono text-xs font-semibold">
                      {item.periodo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {item.partido}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Source citation from original site */}
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1 border border-slate-200/80">
            <span className="font-bold text-slate-700 block">Fuentes y Bibliografía Oficial:</span>
            <p>• Programa de Recuperación de Barrios "Quiero Mi Barrio", MINVU Región de Los Lagos (Barrio Centro Histórico de Maullín).</p>
            <p>• Consejo Vecinal de Desarrollo (CVD) y Archivo Histórico Municipal de Maullín.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
