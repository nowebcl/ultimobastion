import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { 
  Folder, ChevronRight, Search, Filter, Calendar, 
  ChevronLeft, ChevronRight as ChevronRightIcon, Newspaper 
} from 'lucide-react'
import { 
  getCategoryBySlug, 
  getPostsByCategory, 
  getCategories 
} from '../utils/postsService'
import NewsCard from '../components/NewsCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('p') || '1', 10)
  const [, setVersion] = useState(0)

  useEffect(() => {
    const handleUpdate = () => setVersion(v => v + 1)
    window.addEventListener('bastion:posts-updated', handleUpdate)
    return () => window.removeEventListener('bastion:posts-updated', handleUpdate)
  }, [])
  
  const [filterQuery, setFilterQuery] = useState('')
  const category = getCategoryBySlug(slug) || { name: slug.replace(/-/g, ' ').toUpperCase(), slug }
  const allCategories = getCategories()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug, page])

  const { posts, total, totalPages } = getPostsByCategory(slug, page, 12)

  // Filter within this page if user types
  const displayedPosts = filterQuery.trim()
    ? posts.filter(p => p.title.toLowerCase().includes(filterQuery.toLowerCase()))
    : posts

  const handlePageChange = (newPage) => {
    setSearchParams({ p: newPage.toString() })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* 1. CATEGORY HEADER */}
      <div className="bg-[#002b49] text-white py-10 px-4 shadow-sm border-b-4 border-sky-600">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-sky-200 mb-3">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <Link to="/noticias" className="hover:text-white">Secciones</Link>
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span className="text-white font-semibold">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Folder className="w-6 h-6 text-sky-400" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight font-serif">
                  {category.name}
                </h1>
              </div>
              <p className="text-sm text-sky-200 mt-2 max-w-2xl">
                Noticias, reportes comunitarios y actualidad sobre {category.name} en la comuna de Maullín.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/15 text-center shrink-0">
              <span className="text-2xl font-black text-amber-300 block">{total}</span>
              <span className="text-xs uppercase font-medium text-slate-200">Noticias Publicadas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* CATEGORIES PILLS SLIDER */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <Link
            to="/noticias"
            className="text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          >
            Todas las noticias
          </Link>
          {allCategories.map(c => (
            <Link
              key={c.id}
              to={`/categoria/${c.slug}`}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                c.slug === slug
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.name} ({c.count})
            </Link>
          ))}
        </div>

        {/* Filter Input */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Mostrando página <strong>{page}</strong> de <strong>{totalPages || 1}</strong></span>
            <span>•</span>
            <span>{total} noticias en total</span>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={`Filtrar en ${category.name}...`}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-sky-500 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* News Grid */}
        {displayedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No se encontraron noticias
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {filterQuery ? `No hay resultados para "${filterQuery}"` : 'Esta categoría aún no contiene artículos.'}
            </p>
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="text-xs bg-sky-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedPosts.map((post) => (
              <NewsCard key={post.id} post={post} variant="default" />
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && !filterQuery && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
              .map((p, idx, arr) => {
                const prev = arr[idx - 1]
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && (
                      <span className="px-2 text-slate-400 text-xs">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-lg font-bold text-xs transition-colors ${
                        page === p
                          ? 'bg-[#002b49] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                )
              })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
