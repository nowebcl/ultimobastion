import postsIndex from '../data/posts_index.json'
import categoriesData from '../data/categories.json'



export function getAllPostsIndex() {
  return postsIndex
}

export function getCategories() {
  return categoriesData
}

export function getCategoryBySlug(slug) {
  return categoriesData.find(c => c.slug === slug || c.slug.toLowerCase() === slug.toLowerCase())
}

export function getFeaturedPosts(count = 5) {
  return postsIndex.slice(0, count)
}

export function getLatestPosts(count = 10, offset = 0) {
  return postsIndex.slice(offset, offset + count)
}

export function getPostsByCategory(categorySlug, page = 1, perPage = 12) {
  const filtered = postsIndex.filter(p => 
    p.categories && p.categories.some(c => c.slug === categorySlug)
  )
  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const posts = filtered.slice(start, start + perPage)
  
  return {
    posts,
    total,
    totalPages,
    currentPage: page
  }
}

export function searchPosts(query, page = 1, perPage = 12) {
  if (!query || query.trim() === '') {
    return {
      posts: postsIndex.slice(0, perPage),
      total: postsIndex.length,
      totalPages: Math.ceil(postsIndex.length / perPage),
      currentPage: 1
    }
  }

  const q = query.toLowerCase().trim()
  const filtered = postsIndex.filter(p => {
    const titleMatch = p.title && p.title.toLowerCase().includes(q)
    const excerptMatch = p.excerpt && p.excerpt.toLowerCase().includes(q)
    const catMatch = p.categories && p.categories.some(c => c.name.toLowerCase().includes(q))
    return titleMatch || excerptMatch || catMatch
  })

  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const posts = filtered.slice(start, start + perPage)

  return {
    posts,
    total,
    totalPages,
    currentPage: page
  }
}

const postCache = new Map()

export function getPostIndexBySlug(slug) {
  if (!slug) return null
  return postsIndex.find(p => p.slug === slug || String(p.id) === slug) || null
}

export async function getPostBySlug(slug) {
  const indexPost = getPostIndexBySlug(slug)
  if (!indexPost) return null

  if (postCache.has(indexPost.id)) {
    return postCache.get(indexPost.id)
  }

  try {
    // Ultra-fast fetch of ~8KB single post JSON instead of 13MB bundle
    const res = await fetch(`/data/posts/${indexPost.id}.json`)
    if (res.ok) {
      const full = await res.json()
      postCache.set(indexPost.id, full)
      return full
    }
  } catch (e) {
    console.warn('Fast fetch failed, falling back:', e)
  }

  return indexPost
}

export function getRelatedPosts(currentPost, limit = 4) {
  if (!currentPost || !currentPost.categories || currentPost.categories.length === 0) {
    return postsIndex.filter(p => p.id !== currentPost?.id).slice(0, limit)
  }

  const catId = currentPost.categories[0].id
  const related = postsIndex.filter(p => 
    p.id !== currentPost.id && 
    p.categories && 
    p.categories.some(c => c.id === catId)
  )

  if (related.length < limit) {
    const others = postsIndex.filter(p => p.id !== currentPost.id && !related.includes(p))
    return [...related, ...others].slice(0, limit)
  }

  return related.slice(0, limit)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      if (diffMins <= 5) return 'Hace instantes'
      return `Hace ${diffMins} min`
    }
    if (diffHours < 24) {
      return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`
    }
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
    return `Hace ${Math.floor(diffDays / 365)} años`
  } catch (e) {
    return formatDate(dateStr)
  }
}
