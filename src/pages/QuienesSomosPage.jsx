import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check, Camera, Compass, ShieldAlert, Sparkles } from 'lucide-react'

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-sky-600 selection:text-white">
      {/* ----------------------------------------------------
          BREADCRUMBS
      ---------------------------------------------------- */}
      <div className="bg-[#002238] border-b border-sky-950 py-2.5 px-4 text-xs text-sky-200">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-white font-medium">Quiénes Somos</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          HERO SECTION (COPIA EXACTA DE LA WEB ORIGINAL)
      ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 shadow-xs">
        {/* Subtle mesh background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(900px_480px_at_10%_-10%,rgba(2,132,199,0.14),transparent_60%),radial-gradient(900px_520px_at_90%_0%,rgba(124,58,237,0.12),transparent_55%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 backdrop-blur-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Revista digital territorial • <b>Maullín, Chile</b></span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl font-serif">
            Quiénes Somos
          </h1>

          <p className="mt-4 text-slate-700 text-base sm:text-lg leading-relaxed max-w-4xl">
            <b>Maullín Último Bastión</b> es una revista digital de carácter territorial que nace como una extensión natural y evolución del grupo comunitario de Facebook{' '}
            <strong className="text-slate-900">“Maullín Último Bastión Continental”</strong>, creado en el año <strong className="text-sky-700 font-bold">2008</strong>, espacio que desde sus orígenes ha tenido como propósito la difusión, valoración y visibilización del quehacer social, cultural, patrimonial y comunitario de la comuna de Maullín.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
          MAIN CONTENT GRIDS (COPIA EXACTA DE LA WEB ORIGINAL)
      ---------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 pt-10 space-y-8">
        {/* FIRST GRID: ORIGEN & MISIÓN + COBERTURA Y PRIORIDADES */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
          
          {/* Card: Origen y evolución + Misión editorial */}
          <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
                Origen y evolución
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Durante más de una década, dicho grupo ha cumplido un rol activo en la circulación de información local positiva, en la promoción de iniciativas comunitarias y en el fortalecimiento de la identidad territorial, manteniendo hasta hoy una línea editorial coherente con esos principios.
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                En ese contexto, <strong className="text-slate-900">www.maullinultimobastion.cl</strong> surge como un paso natural de crecimiento, consolidación y proyección de ese trabajo sostenido en el tiempo, trasladando esa experiencia y enfoque a un formato de revista digital.
              </p>

              {/* Decorative Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6" />

              <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
                Misión editorial
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                En su actual etapa, Maullín Último Bastión se define como una revista online orientada a divulgar, difundir y poner en valor el quehacer social, cultural, patrimonial, deportivo, productivo y comunitario de la comuna de Maullín, entendiendo la comunicación como una herramienta fundamental para fortalecer la identidad local, el tejido social y la calidad de vida de sus habitantes.
              </p>

              {/* Callout Quote */}
              <blockquote className="mt-4 p-4 sm:p-5 rounded-2xl bg-sky-50/80 border-l-4 border-sky-600 text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                Este medio orienta su quehacer editorial a la difusión de contenidos positivos, constructivos y propositivos, centrados en iniciativas, proyectos, actividades y procesos que aportan al desarrollo integral de la comuna, tanto desde el ámbito público como desde la sociedad civil organizada.
              </blockquote>
            </div>
          </article>

          {/* Aside Card: Cobertura permanente & Prioridades */}
          <aside className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-black font-serif text-slate-950 tracking-tight">
                De manera permanente, damos espacio a la cobertura y difusión de:
              </h3>

              <ul className="space-y-3">
                <li className="grid grid-cols-[28px_1fr] gap-3 items-start p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-100 transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200 text-sky-800 font-bold flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                    Actividades de organizaciones comunitarias, sociales, culturales, deportivas y territoriales.
                  </span>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-3 items-start p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-100 transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200 text-sky-800 font-bold flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                    Iniciativas, programas y proyectos impulsados por la Municipalidad de Maullín.
                  </span>
                </li>

                <li className="grid grid-cols-[28px_1fr] gap-3 items-start p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/50 hover:border-sky-100 transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200 text-sky-800 font-bold flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 leading-snug">
                    Proyectos, actividades e iniciativas de personas, agrupaciones e instituciones que soliciten difusión, siempre que estén orientadas al beneficio de la comunidad y al desarrollo local.
                  </span>
                </li>
              </ul>

              {/* Decorative Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6" />

              <h3 className="text-base sm:text-lg font-black font-serif text-slate-950 tracking-tight">
                Asimismo, priorizamos contenidos relacionados con:
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Historia, memoria e identidad
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Patrimonio cultural y natural
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Emprendimientos locales
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Innovación y espacios públicos
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Calidad de vida
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 hover:border-sky-300 transition-colors">
                  Deporte y actividad física
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* SECOND GRID: LA FOTOGRAFÍA COMO EJE EDITORIAL & ENFOQUE Y CRITERIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Card: La fotografía como eje editorial */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full mb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>Sello Narrativo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
              La fotografía como eje editorial
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Uno de los sellos fundamentales de Maullín Último Bastión es el uso protagónico de la fotografía como principal lenguaje narrativo. La revista privilegia el despliegue fotográfico amplio y detallado de las actividades, eventos y procesos que cubre, entendiendo la imagen como una forma directa, sensible y accesible de relatar la vida comunitaria y el acontecer del territorio.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              En coherencia con los hábitos contemporáneos de consumo de información digital, este medio reconoce que la imagen cumple un rol central en la forma en que las personas se informan, se vinculan y se interesan por su entorno. Por ello, la fotografía no actúa como un simple complemento del texto, sino como un relato visual autónomo, capaz de comunicar, documentar y poner en valor la realidad local desde una perspectiva cercana y humana, además de construir memoria visual con identidad local desde el hoy para el futuro.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Los textos que acompañan las publicaciones cumplen una función contextual y descriptiva, reforzando el sentido informativo y editorial del contenido visual, sin desplazar el protagonismo de la imagen.
            </p>
          </section>

          {/* Card: Enfoque editorial y criterios de cobertura */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Línea Editorial</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950 tracking-tight">
              Enfoque editorial y criterios de cobertura
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Por definición editorial, Maullín Último Bastión no contempla la cobertura de hechos policiales, delictuales, siniestros, incendios, muertes, crímenes ni sucesos de carácter sensacionalista o de crónica roja, ni conflictos políticos o sociales; así como tampoco será buzón de reclamos ni sugerencias.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Esta decisión responde a una línea editorial consciente, orientada a promover una narrativa positiva y propositiva del territorio, centrada en sus personas, procesos y capacidades, y no en la reproducción de contenidos que refuercen el temor, el conflicto o la estigmatización.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Por su naturaleza y enfoque, el medio se define como una revista digital, orientada a la divulgación, documentación y puesta en valor del quehacer comunal, más que a la cobertura de la inmediatez noticiosa. La publicación de contenidos responde a criterios de pertinencia territorial, relevancia social y aporte al desarrollo local.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Maullín Último Bastión asume su rol comunicacional desde una perspectiva de responsabilidad editorial, respeto por la comunidad y compromiso con el desarrollo cultural, social y humano de la comuna, utilizando la imagen y la palabra como herramientas para fortalecer la identidad, la participación y el sentido de pertenencia al territorio; así como darle continuidad al germen de origen del año 2008 de Facebook: construir memoria visual e histórica de la comuna de Maullín hacia el futuro.
            </p>
          </section>
        </div>

        {/* FULL-WIDTH ENDING IMAGE & CAPTION */}
        <div className="pt-4">
          <figure className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <img
              src="/images/quienes-somos.jpg"
              alt="Maullín Último Bastión - Imagen territorial"
              loading="lazy"
              className="w-full h-auto max-h-[75vh] object-cover object-center"
              onError={(e) => {
                // Fallback to original remote URL if local is not resolved
                e.target.src = 'https://maullinultimobastion.cl/wp-content/uploads/2026/01/172690ad-5038-4f89-a410-dc7ffff6cf72.jpg'
              }}
            />
            <figcaption className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 text-xs sm:text-sm text-slate-600 text-center font-medium">
              Maullín Último Bastión • Memoria visual e identidad local, desde hoy para el futuro.
            </figcaption>
          </figure>
        </div>
      </main>
    </div>
  )
}
