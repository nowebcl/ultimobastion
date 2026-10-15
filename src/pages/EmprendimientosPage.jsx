import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Store, Utensils, Hotel, Bus, Anchor, Mountain, 
  MapPin, Phone, MessageCircle, ChevronRight, Search, 
  PlusCircle, Star, Clock 
} from 'lucide-react'

const directoryItems = [
  {
    id: 1,
    name: "Derniere Restobar",
    category: "restaurantes",
    categoryName: "Restaurante & Bar",
    image: "/images/site/derniere-restobar.webp",
    location: "Maullín Centro (Calle O'Higgins)",
    description: "Un nuevo punto de encuentro para disfrutar en la ciudad. Si buscas un lugar acogedor para compartir con amigos, disfrutar de excelente gastronomía marina y cócteles de autor en un ambiente moderno y cercano.",
    phone: "+56 9 9510 4318",
    hours: "Miércoles a Domingo 18:00 - 02:00",
    featured: true
  }
]

import { getDbEmprendimientos, getPocketBaseFileUrl } from '../utils/pocketbase'

export default function EmprendimientosPage() {
  const [selectedCat, setSelectedCat] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState(directoryItems)

  useEffect(() => {
    let cancelled = false
    getDbEmprendimientos().then(records => {
      if (!cancelled && records && records.length > 0) {
        const liveItems = records.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          categoryName: r.categoryName || r.category,
          image: r.image ? getPocketBaseFileUrl('emprendimientos', r.id, r.image) : (directoryItems.find(d => d.name === r.name)?.image || '/images/default-news.webp'),
          location: r.location || 'Maullín',
          description: r.description || '',
          phone: r.phone || '+56 9 9510 4318',
          hours: r.hours || 'Atención continuada',
          featured: Boolean(r.featured)
        }))
        setItems(liveItems)
      }
    })
    return () => { cancelled = true }
  }, [])

  const categories = [
    { id: 'todos', name: 'Todos los Rubros', icon: Store },
    { id: 'restaurantes', name: 'Restaurantes & Gastronomía', icon: Utensils },
    { id: 'hospedajes', name: 'Hospedajes & Cabañas', icon: Hotel },
    { id: 'fluvial', name: 'Transportes Fluviales', icon: Anchor },
    { id: 'terrestre', name: 'Transportes Terrestres', icon: Bus },
    { id: 'rural', name: 'Turismo Rural', icon: Mountain },
    { id: 'excursionismo', name: 'Excursionismo & Guiados', icon: Mountain }
  ]

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCat === 'todos' || item.category === selectedCat
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#002b49] text-white py-12 px-4 border-b-4 border-sky-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Comercio Local</span>
          </div>
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight">
              Guía de Emprendimientos de Maullín
            </h1>
          </div>
          <p className="text-sky-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Directorio oficial de gastronomía, alojamientos, conectividad terrestre y fluvial, turismo comunitario y servicios locales del territorio.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-10 space-y-10">
        {/* TOP CTA: REGISTRA TU EMPRENDIMIENTO */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-emerald-500/50 text-white font-bold text-xs uppercase px-3.5 py-1.5 rounded-full inline-block tracking-wider">
              Consulta nuestros planes y promociones
            </span>
            <h2 className="text-2xl font-bold font-serif">
              ¿Tienes un negocio, hospedaje o servicio en Maullín?
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
              Difunde tu negocio, hospedaje o servicio en el portal de El Último Bastión. Conoce nuestras opciones de difusión y apoya el comercio local.
            </p>
          </div>
          <a
            href="https://wa.me/56995104318?text=Hola,%20quisiera%20consultar%20por%20planes%20y%20promociones%20para%20mi%20negocio%20en%20Ultimo%20Bastion%20Maullin"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-sm transition-transform hover:scale-105 shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Consultar Planes & Promociones</span>
          </a>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por nombre, rubro o localidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => {
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedCat === c.id
                      ? 'bg-[#002b49] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* DIRECTORY GRID OR EMPTY STATE */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Store className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-slate-800 text-lg sm:text-xl">
                Próximamente más emprendimientos
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Aún no hay negocios registrados en esta categoría. Si eres dueño de un emprendimiento, hospedaje o servicio en Maullín, consulta nuestros planes y promociones de difusión.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/56995104318?text=Hola,%20quisiera%20consultar%20por%20planes%20y%20promociones%20para%20mi%20negocio%20en%20Ultimo%20Bastion%20Maullin"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#05a353] hover:bg-[#048a46] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar planes y promociones</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className={`bg-white rounded-2xl shadow-xs border overflow-hidden flex flex-col justify-between transition-all duration-200 group hover:shadow-md ${
                  item.featured ? 'border-sky-500 ring-2 ring-sky-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/images/default-news.webp' }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-[#002b49]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                      {item.categoryName}
                    </span>
                    {item.featured && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-900" /> Destacado
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-lg font-serif group-hover:text-sky-700 transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{item.location}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <a
                    href={`https://wa.me/56995104318?text=Hola,%20vi%20su%20contacto%20en%20Ultimo%20Bastion%20Maullin:%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contactar Emprendimiento</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
