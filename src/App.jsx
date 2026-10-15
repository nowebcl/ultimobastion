import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import HistoriaPage from './pages/HistoriaPage'
import MapasPage from './pages/MapasPage'
import EmprendimientosPage from './pages/EmprendimientosPage'
import QuienesSomosPage from './pages/QuienesSomosPage'
import ContactoPage from './pages/ContactoPage'
import AdminPage from './pages/AdminPage'
import { RadioProvider } from './context/RadioContext'
import RadioFloatingPlayer from './components/RadioFloatingPlayer'
import { getPostIndexBySlug, getPostBySlug, getPostUrl } from './utils/postsService'

// Auto-resolver for legacy WordPress shortlinks: /?p=15473 or /?p=15473&fbclid=...
function LegacyUrlRedirector() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!location.search) return
    const searchParams = new URLSearchParams(location.search)
    const postId = searchParams.get('p') || searchParams.get('post') || searchParams.get('page_id') || searchParams.get('id')
    
    if (postId) {
      // 1. Instant synchronous check
      const post = getPostIndexBySlug(postId)
      if (post) {
        navigate(getPostUrl(post), { replace: true })
        return
      }

      // 2. Async check for newly published articles
      getPostBySlug(postId).then((asyncPost) => {
        if (asyncPost) {
          navigate(getPostUrl(asyncPost), { replace: true })
        }
      })
    }
  }, [location.search, navigate])

  return null
}

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/panel-privado') || 
                       location.pathname.startsWith('/panel-gestion-bastion')

  // If on private admin route, render minimalist standalone admin without public headers/footers
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/panel-privado" element={<AdminPage />} />
        <Route path="/panel-gestion-bastion" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    )
  }

  return (
    <RadioProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-sky-600 selection:text-white">
        <LegacyUrlRedirector />
        <Header />
      
        <div className="flex-1">
          <Routes>
            {/* Main Home & WordPress index.php aliases */}
            <Route path="/" element={<HomePage />} />
            <Route path="/inicio" element={<Navigate to="/" replace />} />
            <Route path="/index.php" element={<HomePage />} />

            {/* Full News Archive & Search */}
            <Route path="/noticias" element={<SearchPage />} />
            <Route path="/buscar" element={<SearchPage />} />

            {/* Exact WordPress Canonical Permalinks (/YYYY/MM/DD/slug/ and /YYYY/MM/slug/) */}
            <Route path="/:year/:month/:day/:slug" element={<PostDetailPage />} />
            <Route path="/:year/:month/:slug" element={<PostDetailPage />} />
            <Route path="/index.php/:year/:month/:day/:slug" element={<PostDetailPage />} />
            <Route path="/index.php/:year/:month/:slug" element={<PostDetailPage />} />

            {/* Standard News Details & Aliases */}
            <Route path="/noticia/:slug" element={<PostDetailPage />} />
            <Route path="/noticias/:slug" element={<PostDetailPage />} />
            <Route path="/post/:slug" element={<PostDetailPage />} />

            {/* Categories */}
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />

            {/* Institutional Pages & WordPress URL aliases */}
            <Route path="/historia" element={<HistoriaPage />} />
            <Route path="/histo" element={<HistoriaPage />} />

            <Route path="/mapas" element={<MapasPage />} />

            <Route path="/emprendimientos" element={<EmprendimientosPage />} />
            <Route path="/emprendimientos-2" element={<EmprendimientosPage />} />

            <Route path="/quienes-somos" element={<QuienesSomosPage />} />

            <Route path="/contacto" element={<ContactoPage />} />

            {/* Single Slug Permalinks fallback (/slug/) */}
            <Route path="/:slug" element={<PostDetailPage />} />

            {/* 404 Fallback */}
            <Route 
              path="*" 
              element={
                <div className="min-h-[60vh] flex items-center justify-center p-4">
                  <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <h2 className="text-3xl font-extrabold text-slate-800 font-serif mb-2">404</h2>
                    <p className="text-slate-600 text-sm mb-6">Página no encontrada en el Bastión.</p>
                    <a href="/" className="inline-block bg-[#002b49] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors">
                      Volver al Inicio
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>

        <Footer />
        <RadioFloatingPlayer />
      </div>
    </RadioProvider>
  )
}
