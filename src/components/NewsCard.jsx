import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, Clock, ArrowRight } from 'lucide-react'
import { formatDate, formatTimeAgo, getPostUrl } from '../utils/postsService'

export default function NewsCard({ post, variant = 'default', showExcerpt = true }) {
  if (!post) return null

  const allCategories = Array.isArray(post.categories) && post.categories.length > 0
    ? post.categories
    : (typeof post.category === 'string' && post.category.trim()
        ? post.category.split(',').map((c, i) => ({
            id: 900 + i,
            name: c.trim(),
            slug: c.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'actualidad'
          }))
        : [{ name: 'Actualidad y Comuna', slug: 'actualidad-y-comuna' }])

  const mainCategory = allCategories[0] || { name: 'Actualidad y Comuna', slug: 'actualidad-y-comuna' }
  const extraCount = allCategories.length - 1
  const extraTooltip = extraCount > 0 ? allCategories.slice(1).map(c => c.name).join(', ') : ''
  const postUrl = getPostUrl(post)

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = '/images/default-news.webp'
  }

  // 1. HORIZONTAL VARIANT (for lists or secondary sections)
  if (variant === 'horizontal') {
    return (
      <article className="bg-white rounded-xl shadow-xs hover:shadow-md border border-slate-100 overflow-hidden transition-all duration-200 flex flex-col sm:flex-row group">
        <Link 
          to={postUrl} 
          className="sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden relative shrink-0 bg-slate-100"
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 max-w-[85%] flex-wrap">
            <span className="bg-[#002b49]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm truncate max-w-[130px]">
              {mainCategory.name}
            </span>
            {extraCount > 0 && (
              <span className="bg-[#05a353] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs" title={extraTooltip}>
                +{extraCount}
              </span>
            )}
          </div>
        </Link>

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span className="text-slate-500 font-medium">{formatTimeAgo(post.date)}</span>
            </div>

            <Link to={postUrl}>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
            </Link>

            {showExcerpt && post.excerpt && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <User className="w-3 h-3 text-sky-600" />
              {post.author || 'Redacción'}
            </span>
            <Link 
              to={postUrl}
              className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
            >
              Leer más <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // 2. COMPACT SIDEBAR VARIANT
  if (variant === 'compact') {
    return (
      <article className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0 group">
        <Link 
          to={postUrl} 
          className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative"
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            to={`/categoria/${mainCategory.slug}`}
            className="text-[10px] font-bold text-sky-600 hover:text-sky-800 uppercase tracking-wider block mb-1"
          >
            {mainCategory.name}
          </Link>
          <Link to={postUrl}>
            <h4 className="text-xs font-semibold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h4>
          </Link>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatDate(post.date)}
          </span>
        </div>
      </article>
    )
  }

  // 3. FEATURED HERO LEAD VARIANT
  if (variant === 'featured') {
    return (
      <article className="relative rounded-2xl overflow-hidden shadow-lg group bg-slate-900 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] flex flex-col justify-end">
        <img
          src={post.image}
          alt={post.title}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        {/* Deep gradient overlay for readibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative p-5 sm:p-7 z-10 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              to={`/categoria/${mainCategory.slug}`}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm transition-colors"
            >
              {mainCategory.name}
            </Link>
            {extraCount > 0 && (
              <span className="bg-[#05a353] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm" title={extraTooltip}>
                +{extraCount}
              </span>
            )}
            <span className="text-xs text-slate-300 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
              {formatDate(post.date)}
            </span>
          </div>

          <Link to={postUrl}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white group-hover:text-amber-300 transition-colors leading-tight drop-shadow-sm font-serif">
              {post.title}
            </h2>
          </Link>

          {showExcerpt && post.excerpt && (
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs max-w-2xl hidden sm:block">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-sky-400" />
              {post.author || 'Redacción Último Bastión'}
            </span>
            <span className="text-amber-300 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Leer noticia completa ›
            </span>
          </div>
        </div>
      </article>
    )
  }

  // 4. DEFAULT VERTICAL CARD VARIANT
  return (
    <article className="bg-white rounded-xl shadow-xs hover:shadow-md border border-slate-100 overflow-hidden flex flex-col justify-between transition-all duration-200 group">
      <div>
        <div className="aspect-[16/10] overflow-hidden relative block bg-slate-100">
          <Link to={postUrl} className="block w-full h-full">
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10 flex-wrap max-w-[85%]">
            <Link
              to={`/categoria/${mainCategory.slug}`}
              className="bg-[#002b49]/90 hover:bg-emerald-600 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm transition-colors truncate max-w-[130px]"
            >
              {mainCategory.name}
            </Link>
            {extraCount > 0 && (
              <span
                className="bg-[#05a353] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                title={extraTooltip}
              >
                +{extraCount}
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{formatDate(post.date)}</span>
          </div>

          <Link to={postUrl}>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {showExcerpt && post.excerpt && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[140px]">
          <User className="w-3 h-3 text-sky-600 shrink-0" />
          {post.author || 'Redacción'}
        </span>
        <Link 
          to={postUrl}
          className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0"
        >
          Leer más <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </article>
  )
}
