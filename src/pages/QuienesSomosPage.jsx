import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, ChevronRight, Award, Compass, Heart, 
  ShieldCheck, MessageSquare, Newspaper, MapPin, Mail 
} from 'lucide-react'

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#002b49] text-white py-12 px-4 border-b-4 border-sky-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Identidad Editorial</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight">
              Quiénes Somos
            </h1>
          </div>
          <p className="text-sky-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Revista Digital Territorial • Maullín, Región de Los Lagos, Chile.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-10 space-y-12">
        {/* Core Narrative Card */}
        <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 bg-slate-900">
              <img
                src="/images/site/quienes-somos.webp"
                alt="Equipo Maullín Último Bastión"
                className="w-full h-full object-cover min-h-[300px]"
                onError={(e) => { e.target.src = '/images/default-news.webp' }}
              />
            </div>
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-2">
                Nuestra Trayectoria
              </span>
              <h2 className="text-2xl font-bold text-slate-900 font-serif mb-4 leading-tight">
                Desde 2008 Construyendo Identidad Comunitaria
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                <strong>Maullín Último Bastión</strong> es una revista digital de carácter territorial que nace como una extensión natural y evolución del grupo comunitario de Facebook <em>“Maullín Último Bastión Continental”</em>, creado en el año <strong>2008</strong>.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Durante más de una década y media, este espacio ha cumplido un rol activo en la circulación de información local positiva, en la promoción de iniciativas comunitarias y en el fortalecimiento de la identidad territorial, manteniendo hasta hoy una línea editorial coherente con esos principios.
              </p>
            </div>
          </div>
        </section>

        {/* Misión, Visión, Principios */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Misión Editorial</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Divulgar, difundir y poner en valor el quehacer social, cultural, patrimonial, deportivo, productivo y comunitario de la comuna de Maullín, entendiendo la comunicación como una herramienta indispensable para fortalecer el tejido social.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Visión Territorial</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consolidarnos como el medio digital de referencia comunal, conectando las realidades de Maullín urbano con sus diversas localidades rurales y costeras: Carelmapu, Quenuir, Lepihué, Peñol, La Pasada y Olmopulli.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">Compromiso Ético</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Periodismo independiente, respetuoso de la verdad y riguroso con los hechos. Priorizamos el beneficio comunitario, la voz de los dirigentes vecinales y la preservación ambiental del Río Maullín.
            </p>
          </div>
        </section>

        {/* Editorial Values & Stats */}
        <section className="bg-gradient-to-r from-[#002b49] to-[#01406c] rounded-2xl p-8 text-white shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 block font-mono">2008</span>
              <span className="text-xs text-slate-200 uppercase tracking-wider mt-1 block">Año de Fundación</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 block font-mono">701+</span>
              <span className="text-xs text-slate-200 uppercase tracking-wider mt-1 block">Noticias Publicadas</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 block font-mono">18</span>
              <span className="text-xs text-slate-200 uppercase tracking-wider mt-1 block">Localidades Cubiertas</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 block font-mono">100%</span>
              <span className="text-xs text-slate-200 uppercase tracking-wider mt-1 block">Independiente</span>
            </div>
          </div>
        </section>

        {/* Contact info bar */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              ¿Quieres formar parte o colaborar con el Bastión?
            </h3>
            <p className="text-xs text-slate-500">
              Estamos abiertos a columnas de opinión, cartas a la redacción y reportes vecinales.
            </p>
          </div>
          <Link
            to="/contacto"
            className="bg-[#002b49] hover:bg-sky-700 text-white font-medium text-xs px-6 py-3 rounded-xl transition-colors shrink-0"
          >
            Contactar al Equipo Editorial
          </Link>
        </section>
      </main>
    </div>
  )
}
