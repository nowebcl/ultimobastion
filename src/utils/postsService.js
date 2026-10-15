import postsIndex from '../data/posts_index.json'
import categoriesData from '../data/categories.json'
import { pb, getPocketBaseFileUrl } from './pocketbase.js'

// In-memory cache for live database posts
let liveDbPosts = []
let isDbSynced = false
let syncPromise = null

// Helper to convert PocketBase noticia record into standard post object
export function transformDbNoticia(record) {
  const rawCategories = Array.isArray(record.category)
    ? record.category
    : (record.category || 'Actualidad y Comuna')
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)

  const categories = (rawCategories.length > 0 ? rawCategories : ['Actualidad y Comuna']).map((catName, idx) => ({
    id: 900 + idx,
    name: catName,
    slug: catName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'actualidad'
  }))

  let coverUrl = '/images/default-news.webp'
  if (record.image) {
    const match = record.image.match(/^(\d+)_.+\.webp$/)
    if (match) {
      coverUrl = `/images/posts/${match[1]}.webp`
    } else {
      coverUrl = getPocketBaseFileUrl('noticias', record.id, record.image)
    }
  }

  const galleryUrls = Array.isArray(record.gallery)
    ? record.gallery.map(img => getPocketBaseFileUrl('noticias', record.id, img))
    : []

  // Ensure clean excerpt
  let excerpt = record.excerpt || ''
  if (!excerpt && record.content) {
    const plain = record.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    excerpt = plain.slice(0, 160) + (plain.length > 160 ? '...' : '')
  }

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    date: record.date || record.created,
    excerpt: excerpt,
    content: record.content || '',
    category: rawCategories.join(', '),
    categories: categories,
    author: record.author || 'Redacción Último Bastión',
    image: coverUrl,
    gallery: galleryUrls,
    isDb: true,
    featured: Boolean(record.featured)
  }
}

/**
 * Fetch and sync live noticias from PocketBase
 */
export async function syncDbPosts() {
  if (syncPromise) return syncPromise

  syncPromise = (async () => {
    try {
      const records = await pb.collection('noticias').getList(1, 20, {
        sort: '-date',
        fields: 'id,title,slug,date,category,author,excerpt,image,gallery,featured',
        requestKey: null
      })

      liveDbPosts = records.items.map(transformDbNoticia)
      isDbSynced = true

      // Notify any listening components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bastion:posts-updated', { detail: liveDbPosts }))
      }

      return liveDbPosts
    } catch (err) {
      console.warn('PocketBase sync skipped/failed:', err)
      return liveDbPosts
    } finally {
      syncPromise = null
    }
  })()

  return syncPromise
}

// Trigger initial sync non-blockingly
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncDbPosts()
  }, 10)
}

export function getAllPostsIndex() {
  if (liveDbPosts.length > 0) {
    const existingSlugs = new Set(postsIndex.map(p => p.slug))
    const trulyNew = liveDbPosts.filter(p => !existingSlugs.has(p.slug))
    if (trulyNew.length > 0) {
      return [...trulyNew, ...postsIndex]
    }
  }
  return postsIndex
}

export function getCategories() {
  const map = new Map()
  for (const c of categoriesData) {
    map.set(c.slug.toLowerCase(), { ...c })
  }

  // Merge dynamic municipal/custom categories from posts
  const all = getAllPostsIndex()
  for (const post of all) {
    if (Array.isArray(post.categories)) {
      for (const cat of post.categories) {
        if (!cat.slug) continue
        const s = cat.slug.toLowerCase()
        if (map.has(s)) {
          const item = map.get(s)
          item.count = (item.count || 0) + 1
        } else {
          map.set(s, {
            id: cat.id || 900 + map.size,
            name: cat.name,
            slug: cat.slug,
            count: 1
          })
        }
      }
    }
  }

  return Array.from(map.values())
}

export function getActiveCategoriesWithPosts() {
  const cats = new Set()
  for (const c of categoriesData) {
    if (c.count > 0 && c.name) cats.add(c.name)
  }
  const all = getAllPostsIndex()
  for (const p of all) {
    if (Array.isArray(p.categories)) {
      p.categories.forEach(c => { if (c.name) cats.add(c.name) })
    } else if (p.category) {
      p.category.split(',').forEach(c => {
        const trimmed = c.trim()
        if (trimmed) cats.add(trimmed)
      })
    }
  }
  return Array.from(cats).sort((a, b) => a.localeCompare('es', { sensitivity: 'base' }))
}

export function getCategoryBySlug(slug) {
  if (!slug) return null
  const cleanSlug = slug.toLowerCase().trim()
  const found = categoriesData.find(c => c.slug === cleanSlug || c.slug.toLowerCase() === cleanSlug)
  if (found) return found

  // Scan posts for dynamic municipal or custom category
  const all = getAllPostsIndex()
  for (const post of all) {
    if (Array.isArray(post.categories)) {
      const match = post.categories.find(c => c.slug === cleanSlug || c.slug.toLowerCase() === cleanSlug)
      if (match) return match
    }
  }
  return null
}

export function getFeaturedPosts(count = 5) {
  const all = getAllPostsIndex()
  return all.slice(0, count)
}

export function getLatestPosts(count = 10, offset = 0) {
  const all = getAllPostsIndex()
  return all.slice(offset, offset + count)
}

export function getPostsByCategory(categorySlug, page = 1, perPage = 12) {
  const all = getAllPostsIndex()
  const filtered = all.filter(p => 
    p.categories && p.categories.some(c => c.slug === categorySlug || c.slug.toLowerCase() === categorySlug.toLowerCase())
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
  const all = getAllPostsIndex()
  if (!query || query.trim() === '') {
    return {
      posts: all.slice(0, perPage),
      total: all.length,
      totalPages: Math.ceil(all.length / perPage),
      currentPage: 1
    }
  }

  const q = query.toLowerCase().trim()
  const filtered = all.filter(p => {
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

/**
 * Generate exact WordPress canonical permalink: /YYYY/MM/DD/slug/
 * 100% identical to legacy WordPress links so all Facebook, Google & WhatsApp links keep working.
 */
export function getPostUrl(post) {
  if (!post) return '/noticias'
  const slug = post.slug || String(post.id)
  if (post.date) {
    try {
      const d = new Date(post.date)
      if (!isNaN(d.getTime())) {
        const y = String(d.getFullYear())
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `/${y}/${m}/${day}/${slug}/`
      }
    } catch {
      // fallback
    }
  }
  return `/noticia/${slug}`
}

export function getPostIndexBySlug(slug) {
  if (!slug) return null
  const all = getAllPostsIndex()
  return all.find(p => p.slug === slug || String(p.id) === slug) || null
}

export async function getPostBySlug(slug) {
  // 1. Check in live DB posts first
  const dbMatch = liveDbPosts.find(p => p.slug === slug || String(p.id) === slug)
  if (dbMatch && dbMatch.content) {
    return dbMatch
  }

  // 2. Check static archive first (instant 1ms load for all 701 historical articles)
  const indexPost = postsIndex.find(p => p.slug === slug || String(p.id) === slug)
  if (indexPost) {
    if (postCache.has(indexPost.id)) {
      return postCache.get(indexPost.id)
    }

    try {
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

  // 3. Fallback: Query PocketBase directly for newly created posts
  try {
    const record = await pb.collection('noticias').getFirstListItem(`slug="${slug}"`, {
      requestKey: null
    })
    if (record) {
      const transformed = transformDbNoticia(record)
      postCache.set(transformed.id, transformed)
      return transformed
    }
  } catch {
    // Not found
  }

  return null
}

export function getRelatedPosts(currentPost, limit = 4) {
  const all = getAllPostsIndex()
  if (!currentPost || !currentPost.categories || currentPost.categories.length === 0) {
    return all.filter(p => p.id !== currentPost?.id).slice(0, limit)
  }

  const catId = currentPost.categories[0].id
  const catSlug = currentPost.categories[0].slug
  const related = all.filter(p => 
    p.id !== currentPost.id && 
    p.categories && 
    p.categories.some(c => c.id === catId || c.slug === catSlug)
  )

  if (related.length < limit) {
    const others = all.filter(p => p.id !== currentPost.id && !related.includes(p))
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
