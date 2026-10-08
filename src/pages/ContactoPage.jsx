import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Mail, Phone, MapPin, Send, MessageCircle, 
  CheckCircle2, ChevronRight, Share2, AlertCircle 
} from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '../components/SocialIcons'

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending message
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-[#002b49] text-white py-12 px-4 border-b-4 border-sky-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Atención Ciudadana</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-serif tracking-tight">
              Contacto Ciudadano
            </h1>
          </div>
          <p className="text-sky-200 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Escríbenos para compartir noticias, denuncias vecinales, avisos comunitarios o consultar sobre publicidad y difusión en Maullín Último Bastión.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block">
                Formulario Oficial
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                Déjanos un Mensaje
              </h2>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 font-serif">
                  ¡Mensaje Enviado con Éxito!
                </h3>
                <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Gracias por comunicarte con la redacción de <strong>Último Bastión Maullín</strong>. Tu mensaje ha sido recibido y nos pondremos en contacto a la brevedad.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({ nombre: '', apellido: '', correo: '', telefono: '', asunto: '', mensaje: '' })
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      required
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Tu apellido"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="correo"
                      required
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.cl"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Asunto del Mensaje *
                  </label>
                  <input
                    type="text"
                    name="asunto"
                    required
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="Noticia, denuncia, consulta de publicidad..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mensaje / Detalle *
                  </label>
                  <textarea
                    name="mensaje"
                    required
                    rows={5}
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe aquí tu consulta o información detallada..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-sky-500 transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#002b49] hover:bg-sky-700 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Direct WhatsApp (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct WhatsApp Callout */}
            <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-md space-y-4">
              <span className="bg-emerald-500/40 text-emerald-100 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full inline-block">
                Contacto Rápido
              </span>
              <h3 className="text-xl font-bold font-serif">
                Escríbenos directamente por WhatsApp
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Para enviar fotos de último minuto, reportes del clima o avisos vecinales de urgencia.
              </p>
              <a
                href="https://wa.me/56995104318?text=Hola,%20me%20comunico%20con%20Ultimo%20Bastion%20Maullin"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Abrir Chat de WhatsApp</span>
              </a>
            </div>

            {/* Official Coordinates Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b border-slate-100 pb-3">
                Datos Institucionales
              </h3>

              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Dirección Territorial:</strong>
                    <span>Calle Almeyda 151, Maullín, Región de Los Lagos, Chile</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Teléfono de Contacto:</strong>
                    <a href="tel:+56995104318" className="text-sky-600 hover:underline">
                      +56 9 9510 4318
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Correo Electrónico:</strong>
                    <a href="mailto:victorg10@gmail.com" className="text-sky-600 hover:underline">
                      victorg10@gmail.com
                    </a>
                  </div>
                </li>
              </ul>

              {/* Social Channels */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">
                  Redes Oficiales
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-pink-600 hover:text-white text-slate-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://wa.me/56995104318"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
