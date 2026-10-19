import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, ChevronRight } from 'lucide-react'
import { getPostUrl } from '../utils/postsService'

const formatTickerTime = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  } catch {
    // fallback
  }
  return dateStr.substring(11, 16)
}

export default function BreakingTicker({ posts = [] }) {
  if (!posts || posts.length === 0) return null

  // Take top 8 latest posts
  const tickerPosts = posts.slice(0, 8)

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-red-600 text-white font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider shrink-0 mr-3 shadow-sm animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          <span>Último Minuto</span>
        </div>

        {/* Scrolling text */}
        <div className="relative overflow-hidden w-full flex items-center whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-8">
            {tickerPosts.concat(tickerPosts).map((post, idx) => (
              <Link
                key={`${post.id}-${idx}`}
                to={getPostUrl(post)}
                className="hover:text-amber-400 transition-colors flex items-center gap-2 group"
              >
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatTickerTime(post.date)}
                </span>
                <span className="font-medium group-hover:underline line-clamp-1 max-w-[380px] sm:max-w-[450px]">
                  {post.title}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
