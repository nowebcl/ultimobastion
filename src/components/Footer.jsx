import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon, TiktokIcon 
} from './SocialIcons'
import { 
  ArrowUp, CheckCircle2, ArrowRight, Landmark, Building2, 
  MapPin, Waves, Radio, Link2, Lock 
} from 'lucide-react'

const recommendedSites = [
  {
    title: 'GOBIERNO REGIONAL',
    url: 'https://www.goreloslagos.cl/',
    icon: Landmark
  },
  {
    title: 'MUNICIPALIDAD DE MAULLIN',
    url: 'https://munimaullin.cl/',
    icon: Building2
  },
  {
    title: 'COMUNAS MÁGICAS',
    url: 'https://comunasmagicas.cl/',
    icon: MapPin
  },
  {
    title: 'PATAGONIA COSTA',
    url: 'https://patagoniacosta.cl/',
    icon: Waves
  },
  {
    title: 'RADIO PANGAL FM',
    url: 'https://pangalfmlaestacion.cl/',
    icon: Radio
  },
  {
    title: 'RADIO SAN FRANCISCO FM',
    url: 'https://web.radiosanfrancisco.cl/',
    icon: Radio
  },
  {
    title: 'ALEJANDRO GALLARDO CL',
    url: 'https://alejandrogallardo.cl/',
    icon: Link2
  }
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 4000)
      setEmail('')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white text-slate-700 border-t border-slate-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
          
          {/* Column 1: Logo & Municipal Contact Info (md:col-span-6 lg:col-span-4) */}
          <div className="md:col-span-6 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <img 
                src="/images/site/logo.webp" 
                alt="Maullín Último Bastión Continental" 
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </Link>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[#05a353] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Sitio Independiente
              </div>
              <h3 className="font-serif font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                MAULLÍN ÚLTIMO BASTIÓN
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                Revista digital territorial • Memoria visual e identidad local, desde hoy para el futuro.
              </p>
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div>📍 Calle Almeyda 151, Maullín</div>
                <div>📞 +56 9 9510 4318 • ✉️ victorg10@gmail.com</div>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-2 pt-1">
              <a 
                href="https://www.facebook.com/ultimobastionm" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#1877F2] text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/maullinultimobastion.cl?igsh=MzJjdzlpdTI0bm5s" 
                target="_blank" 
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#E4405F] text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@maullinultimobastion?lang=es-419" 
                target="_blank" 
                rel="noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-2xs hover:scale-105"
              >
                <TiktokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Sitios recomendados (md:col-span-6 lg:col-span-5) */}
          <div className="md:col-span-6 lg:col-span-5 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-4.5 bg-[#05a353] rounded-full inline-block" />
              <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                Sitios recomendados
              </h4>
            </div>

            <div className="flex flex-col gap-1.5">
              {recommendedSites.map((site, index) => {
                const IconComponent = site.icon
                return (
                  <a
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#0284c7] via-[#0055a5] to-[#00215c] hover:from-[#0396e6] hover:via-[#0266c2] hover:to-[#00296e] text-white border border-sky-400/40 hover:border-sky-300 shadow-xs hover:shadow-md hover:shadow-sky-950/20 transition-all group select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className="w-3.5 h-3.5 text-sky-200 group-hover:text-white transition-colors shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white truncate drop-shadow-xs">
                        {site.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-200 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Column 3: Newsletter Box (md:col-span-12 lg:col-span-3) */}
          <div className="md:col-span-12 lg:col-span-3 space-y-3 pt-2">
            <h4 className="font-serif font-bold text-sm text-slate-900">
              Suscríbete a nuestro boletín
            </h4>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-[#05a353] focus:ring-1 focus:ring-[#05a353] transition-all"
              />
              <button
                type="submit"
                className="bg-[#05a353] hover:bg-[#048a46] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
              >
                Suscribir
              </button>
            </form>

            {subscribed && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> ¡Gracias por suscribirte al boletín de Maullín!
              </p>
            )}
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/contacto" className="hover:text-slate-600 transition-colors">
              Términos y Condiciones
            </Link>
            <span>|</span>
            <Link to="/contacto" className="hover:text-slate-600 transition-colors">
              Política de Privacidad
            </Link>
            <span>|</span>
            <Link to="/quienes-somos" className="hover:text-slate-600 transition-colors">
              Accesibilidad
            </Link>
            <span>|</span>
            <Link 
              to="/admin" 
              className="hover:text-slate-700 text-slate-400 transition-colors inline-flex items-center gap-1"
              title="Panel Editorial"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Redacción</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} MAULLÍN: EL ÚLTIMO BASTIÓN. Sitio web independiente.
            </p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <a
              href="https://www.instagram.com/noweb.dev/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#05a353] no-underline transition-colors group"
            >
              <span>Desarrollado por</span>
              <span className="font-extrabold text-[#002845] group-hover:text-[#05a353] no-underline transition-colors">
                @noweb.dev
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToTop}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#05a353] text-slate-600 hover:text-white flex items-center justify-center transition-all shadow-2xs hover:-translate-y-0.5"
              aria-label="Volver arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}
