import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Lock, User, LogOut, CheckCircle2, AlertCircle, 
  Image as ImageIcon, Plus, Trash2, ExternalLink, 
  RefreshCw, FileText, Store, UploadCloud, 
  X, Eye, Phone, MapPin, Clock, Menu, PenSquare,
  ShieldCheck, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Edit3, Compass, Check, ArrowLeft, Home,
  ChevronDown, FolderTree, LayoutGrid, List, Tag, Filter, Sparkles
} from 'lucide-react'
import { 
  pb, 
  loginAdmin, 
  logoutAdmin, 
  isAdminAuthenticated, 
  getCurrentAdminUser, 
  getPocketBaseFileUrl 
} from '../utils/pocketbase'
import { syncDbPosts, getActiveCategoriesWithPosts, getPostUrl } from '../utils/postsService'
import { compressImageToWebP, formatBytes } from '../utils/imageOptimizer'

// Categorías oficiales estándar utilizadas por Municipalidades en Chile (DIDECO, DAEM, SECPLAC, etc.)
const MUNICIPAL_CATEGORIES = [
  'Actualidad y Comuna',
  'DIDECO y Acción Social',
  'Adultos Mayores',
  'Educación y DAEM',
  'Salud y Postas Rurales',
  'SECPLAC y Obras Públicas',
  'Seguridad Pública y Emergencias',
  'Medio Ambiente y Humedales',
  'Fomento Productivo y OMIL',
  'Desarrollo Rural y Pesca',
  'Cultura, Fiestas y Patrimonio',
  'Deportes y Vida Sana',
  'Mujeres y Equidad de Género',
  'Juventud e Infancia',
  'Turismo y Fomento Comunal',
  'Tránsito y Conectividad',
  'Organizaciones Comunitarias'
]

const DEFAULT_FILTER_CATEGORIES = [
  'Todas',
  ...MUNICIPAL_CATEGORIES
]

// Helper to slugify titles safely
function slugify(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9 -]/g, '')     // remove invalid chars
    .replace(/\s+/g, '-')           // collapse whitespace and replace by -
    .replace(/-+/g, '-')           // collapse dashes
    .replace(/^-+/, '')             // trim - from start of text
    .replace(/-+$/, '')             // trim - from end of text
}

export default function AdminPage() {
  // Authentication states
  const [isAuth, setIsAuth] = useState(isAdminAuthenticated())
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Dashboard navigation states
  const [activeTab, setActiveTab] = useState('noticias') // 'noticias' | 'emprendimientos'
  const [activeSubView, setActiveSubView] = useState('create') // 'create' | 'list'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // EDIT STATE FOR NOTICIAS
  const [editingPostId, setEditingPostId] = useState(null)

  // NOTICIAS FORM STATE
  const [postTitle, setPostTitle] = useState('')
  const [postSlug, setPostSlug] = useState('')
  const [availableCategories, setAvailableCategories] = useState(MUNICIPAL_CATEGORIES)
  const [selectedCategories, setSelectedCategories] = useState(['Actualidad y Comuna'])
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [postAuthor, setPostAuthor] = useState('Redacción Último Bastión')
  const [postExcerpt, setPostExcerpt] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postFeatured, setPostFeatured] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [isOptimizingCover, setIsOptimizingCover] = useState(false)
  const [coverOptMeta, setCoverOptMeta] = useState(null)
  const [isOptimizingGallery, setIsOptimizingGallery] = useState(false)
  const [galleryOptMeta, setGalleryOptMeta] = useState(null)
  const [postSubmitting, setPostSubmitting] = useState(false)
  const [postSuccess, setPostSuccess] = useState(null)
  const [postError, setPostError] = useState('')

  // NOTICIAS LIST, CATEGORY FILTER & PAGINATION STATE
  const [dbNoticiasList, setDbNoticiasList] = useState([])
  const [loadingNoticiasList, setLoadingNoticiasList] = useState(false)
  const [searchNoticiasQuery, setSearchNoticiasQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas')
  const [noticiasPage, setNoticiasPage] = useState(1)
  const [noticiasTotalPages, setNoticiasTotalPages] = useState(1)
  const [noticiasTotalItems, setNoticiasTotalItems] = useState(0)
  const [newsViewMode, setNewsViewMode] = useState('grid') // 'grid' | 'list'
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const [categoriesWithNews, setCategoriesWithNews] = useState(() => getActiveCategoriesWithPosts())
  const categoryDropdownRef = useRef(null)
  const NOTICIAS_PER_PAGE = 12 // 12 cards for a clean 3x4 or 2x6 grid

  // Refresh active categories that actually have news articles
  const refreshCategoriesWithNews = useCallback(async () => {
    try {
      const baseCats = new Set(getActiveCategoriesWithPosts())
      const records = await pb.collection('noticias').getFullList({
        fields: 'category',
        requestKey: null
      })
      records.forEach(r => {
        if (r.category) {
          r.category.split(',').forEach(c => {
            const trimmed = c.trim()
            if (trimmed) baseCats.add(trimmed)
          })
        }
      })
      setCategoriesWithNews(Array.from(baseCats).sort((a, b) => a.localeCompare('es', { sensitivity: 'base' })))
    } catch {
      setCategoriesWithNews(getActiveCategoriesWithPosts())
    }
  }, [])

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false)
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [categoryDropdownOpen])

  // EMPRENDIMIENTOS FORM STATE
  const [empName, setEmpName] = useState('')
  const [empCategory, setEmpCategory] = useState('restaurantes')
  const [empCategoryName, setEmpCategoryName] = useState('Restaurantes & Gastronomía')
  const [empLocation, setEmpLocation] = useState('')
  const [empPhone, setEmpPhone] = useState('')
  const [empHours, setEmpHours] = useState('')
  const [empDescription, setEmpDescription] = useState('')
  const [empFeatured, setEmpFeatured] = useState(false)
  const [empFile, setEmpFile] = useState(null)
  const [empPreview, setEmpPreview] = useState(null)
  const [isOptimizingEmp, setIsOptimizingEmp] = useState(false)
  const [empOptMeta, setEmpOptMeta] = useState(null)
  const [empSubmitting, setEmpSubmitting] = useState(false)
  const [empSuccess, setEmpSuccess] = useState(null)
  const [empError, setEmpError] = useState('')

  // EMPRENDIMIENTOS LIST & PAGINATION STATE
  const [dbEmpList, setDbEmpList] = useState([])
  const [loadingEmpList, setLoadingEmpList] = useState(false)
  const [searchEmpQuery, setSearchEmpQuery] = useState('')
  const [empPage, setEmpPage] = useState(1)
  const [empTotalPages, setEmpTotalPages] = useState(1)
  const [empTotalItems, setEmpTotalItems] = useState(0)
  const EMP_PER_PAGE = 10

  // File input refs
  const coverInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const empFileInputRef = useRef(null)

  // In-memory cache for instant pagination & zero-latency switching
  const noticiasCacheRef = useRef(new Map())
  const empCacheRef = useRef(new Map())

  // Check auth on mount
  useEffect(() => {
    setIsAuth(isAdminAuthenticated())
  }, [])

  // Auto-generate slug from title (only if creating, not editing)
  useEffect(() => {
    if (!editingPostId && activeSubView === 'create' && postTitle) {
      setPostSlug(slugify(postTitle))
    }
  }, [postTitle, activeSubView, editingPostId])

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      if (coverPreview && !coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview)
      galleryPreviews.forEach(p => {
        if (!p.startsWith('http')) URL.revokeObjectURL(p)
      })
      if (empPreview && !empPreview.startsWith('http')) URL.revokeObjectURL(empPreview)
    }
  }, [coverPreview, galleryPreviews, empPreview])

  // ----------------------------------------------------
  // AUTH HANDLERS
  // ----------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      await loginAdmin(authEmail, authPassword)
      setIsAuth(true)
      setAuthPassword('')
    } catch (err) {
      setAuthError(err.message || 'Error al iniciar sesión. Verifica correo y contraseña.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    setIsAuth(false)
  }

  // ----------------------------------------------------
  // COVER IMAGE HANDLERS (With Instant Client-Side WebP Compression)
  // ----------------------------------------------------
  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsOptimizingCover(true)
    try {
      const opt = await compressImageToWebP(file, 1200, 0.80)
      if (coverPreview && !coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview)
      setCoverFile(opt.file)
      setCoverPreview(opt.previewUrl)
      setCoverOptMeta({
        originalSize: opt.originalSize,
        optimizedSize: opt.optimizedSize,
        savingsPercent: opt.savingsPercent
      })
    } catch (err) {
      console.warn('WebP compression fallback:', err)
      if (coverPreview && !coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview)
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
      setCoverOptMeta(null)
    } finally {
      setIsOptimizingCover(false)
    }
  }

  const handleRemoveCover = () => {
    if (coverPreview && !coverPreview.startsWith('http')) URL.revokeObjectURL(coverPreview)
    setCoverFile(null)
    setCoverPreview(null)
    setCoverOptMeta(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  // ----------------------------------------------------
  // GALLERY IMAGES HANDLERS (Batch WebP Compression)
  // ----------------------------------------------------
  const handleGallerySelect = async (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return

    setIsOptimizingGallery(true)
    try {
      const optimizedResults = await Promise.all(
        selected.map(f => compressImageToWebP(f, 1200, 0.80))
      )
      const newFiles = optimizedResults.map(r => r.file)
      const newPreviews = optimizedResults.map(r => r.previewUrl)

      const totalOriginal = optimizedResults.reduce((acc, r) => acc + r.originalSize, 0)
      const totalOptimized = optimizedResults.reduce((acc, r) => acc + r.optimizedSize, 0)
      const totalSavings = Math.max(0, Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100))

      setGalleryFiles(prev => [...prev, ...newFiles])
      setGalleryPreviews(prev => [...prev, ...newPreviews])
      setGalleryOptMeta({
        count: optimizedResults.length,
        originalSize: totalOriginal,
        optimizedSize: totalOptimized,
        savingsPercent: totalSavings
      })
    } catch (err) {
      console.warn('Gallery optimization fallback:', err)
      const newPreviews = selected.map(f => URL.createObjectURL(f))
      setGalleryFiles(prev => [...prev, ...selected])
      setGalleryPreviews(prev => [...prev, ...newPreviews])
    } finally {
      setIsOptimizingGallery(false)
    }
  }

  const handleRemoveGalleryImage = (index) => {
    const previewToRemove = galleryPreviews[index]
    if (previewToRemove && !previewToRemove.startsWith('http')) URL.revokeObjectURL(previewToRemove)
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // ----------------------------------------------------
  // CATEGORIES MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const handleToggleCategory = (catName) => {
    setSelectedCategories(prev => {
      if (prev.includes(catName)) {
        if (prev.length <= 1) return prev // Keep at least one category selected
        return prev.filter(c => c !== catName)
      } else {
        return [...prev, catName]
      }
    })
  }

  const handleAddNewCategory = (e) => {
    if (e) e.preventDefault()
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    setAvailableCategories(prev => {
      if (!prev.includes(formatted)) return [...prev, formatted]
      return prev
    })
    setSelectedCategories(prev => {
      if (!prev.includes(formatted)) return [...prev, formatted]
      return prev
    })
    setNewCategoryInput('')
  }

  const handleRemoveCategoryBadge = (catName) => {
    if (selectedCategories.length <= 1) return
    setSelectedCategories(prev => prev.filter(c => c !== catName))
  }

  // ----------------------------------------------------
  // NOTICIAS EDIT & CREATE HANDLERS
  // ----------------------------------------------------
  const handleStartEdit = async (post) => {
    setEditingPostId(post.id)
    setPostTitle(post.title || '')
    setPostSlug(post.slug || '')
    
    // Parse existing categories (array or comma-separated string)
    let existingCats = []
    if (Array.isArray(post.categories) && post.categories.length > 0) {
      existingCats = post.categories.map(c => c.name || c)
    } else if (typeof post.category === 'string' && post.category.trim()) {
      existingCats = post.category.split(',').map(s => s.trim()).filter(Boolean)
    }
    if (existingCats.length === 0) existingCats = ['Actualidad y Comuna']

    setSelectedCategories(existingCats)
    setAvailableCategories(prev => Array.from(new Set([...prev, ...existingCats])))
    setNewCategoryInput('')

    setPostAuthor(post.author || 'Redacción Último Bastión')
    setPostExcerpt(post.excerpt || '')
    setPostFeatured(Boolean(post.featured))

    // Set existing cover preview
    if (post.image) {
      const match = post.image.match(/^(\d+)_.+\.webp$/)
      if (match) {
        setCoverPreview(`/images/posts/${match[1]}.webp`)
      } else {
        setCoverPreview(getPocketBaseFileUrl('noticias', post.id, post.image))
      }
    } else {
      setCoverPreview(null)
    }
    setCoverFile(null)

    // Set existing gallery previews
    if (Array.isArray(post.gallery) && post.gallery.length > 0) {
      setGalleryPreviews(post.gallery.map(g => getPocketBaseFileUrl('noticias', post.id, g)))
    } else {
      setGalleryPreviews([])
    }
    setGalleryFiles([])

    // Load full article content if not included in lite list
    let fullContent = post.content || ''
    if (!fullContent && post.id) {
      try {
        const fullRecord = await pb.collection('noticias').getOne(post.id)
        fullContent = fullRecord.content || ''
      } catch (err) {
        console.warn('Error fetching full content for edit:', err)
      }
    }
    setPostContent(fullContent)

    setPostError('')
    setPostSuccess(null)
    setActiveTab('noticias')
    setActiveSubView('create')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingPostId(null)
    setPostTitle('')
    setPostSlug('')
    setSelectedCategories(['Actualidad y Comuna'])
    setNewCategoryInput('')
    setPostExcerpt('')
    setPostContent('')
    setPostFeatured(false)
    handleRemoveCover()
    setGalleryFiles([])
    setGalleryPreviews([])
    setPostError('')
    setPostSuccess(null)
    setActiveSubView('list')
  }

  const handlePublishNoticia = async (e) => {
    e.preventDefault()
    if (!postTitle.trim()) {
      setPostError('Debes ingresar un título para la noticia.')
      return
    }

    setPostSubmitting(true)
    setPostError('')
    setPostSuccess(null)

    try {
      const fd = new FormData()

      // Compute clean base slug
      let baseSlug = (postSlug.trim() || slugify(postTitle))
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      if (!baseSlug) baseSlug = 'noticia'

      // Guarantee slug uniqueness against PocketBase to prevent validation_not_unique (400)
      let finalSlug = baseSlug
      let counter = 1
      while (counter <= 50) {
        try {
          const filter = editingPostId
            ? `slug = "${finalSlug}" && id != "${editingPostId}"`
            : `slug = "${finalSlug}"`
          const existing = await pb.collection('noticias').getFirstListItem(filter)
          if (existing) {
            counter++
            finalSlug = `${baseSlug}-${counter}`
          } else {
            break
          }
        } catch {
          // Record not found -> slug is free!
          break
        }
      }
      
      // Auto-format clean paragraphs if story was pasted as plain text
      let cleanContent = postContent.trim()
      if (cleanContent && !/<[a-z][\s\S]*>/i.test(cleanContent)) {
        cleanContent = cleanContent
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => `<p class="mb-4">${p.replace(/\n/g, '<br/>')}</p>`)
          .join('\n')
      }

      // Compute excerpt if empty
      let finalExcerpt = postExcerpt.trim()
      if (!finalExcerpt && cleanContent) {
        const plainText = cleanContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        finalExcerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '')
      }

      const categoryString = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Actualidad y Comuna'
      fd.append('title', postTitle.trim())
      fd.append('slug', finalSlug)
      fd.append('category', categoryString)
      fd.append('author', postAuthor.trim() || 'Redacción Último Bastión')
      fd.append('excerpt', finalExcerpt)
      fd.append('content', cleanContent)
      fd.append('featured', postFeatured ? 'true' : 'false')
      if (!editingPostId) {
        fd.append('date', new Date().toISOString())
      }

      // Append cover image if a new file was chosen
      if (coverFile) {
        fd.append('image', coverFile)
      }

      // Append new gallery files
      for (const f of galleryFiles) {
        fd.append('gallery', f)
      }

      let record
      if (editingPostId) {
        // UPDATE existing record
        record = await pb.collection('noticias').update(editingPostId, fd)
        setPostSuccess({
          id: record.id,
          slug: record.slug,
          title: record.title,
          isEdit: true
        })
      } else {
        // CREATE new record
        record = await pb.collection('noticias').create(fd)
        setPostSuccess({
          id: record.id,
          slug: record.slug,
          title: record.title,
          isEdit: false
        })
      }

      // Clear admin cache & sync local posts service
      noticiasCacheRef.current.clear()
      await syncDbPosts()
      await refreshCategoriesWithNews()

      // Reset list filters and force instant list reload to page 1 so the new/edited post is immediately visible
      setSearchNoticiasQuery('')
      setSelectedCategoryFilter('Todas')
      setNoticiasPage(1)
      await fetchNoticiasList(1, '', 'Todas', true)

      // Reset form if was creation
      if (!editingPostId) {
        setPostTitle('')
        setPostSlug('')
        setSelectedCategories(['Actualidad y Comuna'])
        setNewCategoryInput('')
        setPostExcerpt('')
        setPostContent('')
        setPostFeatured(false)
        handleRemoveCover()
        setGalleryFiles([])
        setGalleryPreviews([])
      }
    } catch (err) {
      console.error('Error saving post:', err)
      let detailedMsg = err.message || 'Error al guardar la noticia.'
      if (err.data?.data) {
        const fieldDetails = Object.entries(err.data.data)
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? (v.message || v.code) : v}`)
          .join(', ')
        if (fieldDetails) {
          detailedMsg += ` (${fieldDetails})`
        }
      }
      setPostError(detailedMsg)
    } finally {
      setPostSubmitting(false)
    }
  }

  // ----------------------------------------------------
  // NOTICIAS LIST & SERVER-SIDE PAGINATION + CATEGORY FILTER
  // ----------------------------------------------------
  const fetchNoticiasList = useCallback(async (
    targetPage = 1, 
    query = searchNoticiasQuery, 
    categoryFilter = selectedCategoryFilter,
    forceRefresh = false
  ) => {
    const trimmedQuery = (query || '').trim()
    const activeCategory = categoryFilter || 'Todas'
    const cacheKey = `${targetPage}__${trimmedQuery}__${activeCategory}`

    // 0ms instantaneous load from in-memory cache
    if (!forceRefresh && noticiasCacheRef.current.has(cacheKey)) {
      const cached = noticiasCacheRef.current.get(cacheKey)
      setDbNoticiasList(cached.items)
      setNoticiasPage(cached.page)
      setNoticiasTotalPages(cached.totalPages || 1)
      setNoticiasTotalItems(cached.totalItems || 0)
      return
    }

    setLoadingNoticiasList(true)
    try {
      const conditions = []
      
      if (trimmedQuery) {
        conditions.push(`(title ~ "${trimmedQuery}" || author ~ "${trimmedQuery}")`)
      }

      if (activeCategory && activeCategory !== 'Todas') {
        conditions.push(`category ~ "${activeCategory}"`)
      }

      const filterStr = conditions.join(' && ')

      // Project lite fields to cut payload size from 104KB down to 7KB
      const result = await pb.collection('noticias').getList(targetPage, NOTICIAS_PER_PAGE, {
        sort: '-date',
        filter: filterStr,
        fields: 'id,title,slug,date,category,author,excerpt,image,gallery,featured',
        requestKey: null
      })

      noticiasCacheRef.current.set(cacheKey, result)
      setDbNoticiasList(result.items)
      setNoticiasPage(result.page)
      setNoticiasTotalPages(result.totalPages || 1)
      setNoticiasTotalItems(result.totalItems || 0)
    } catch (err) {
      console.error('Error fetching noticias list:', err)
    } finally {
      setLoadingNoticiasList(false)
    }
  }, [searchNoticiasQuery, selectedCategoryFilter])

  // Handle Category Filter Click
  const handleCategorySelect = (cat) => {
    setSelectedCategoryFilter(cat)
    fetchNoticiasList(1, searchNoticiasQuery, cat)
  }

  // Handle Search Submit for Noticias
  const handleSearchNoticiasSubmit = (e) => {
    e.preventDefault()
    fetchNoticiasList(1, searchNoticiasQuery, selectedCategoryFilter)
  }

  // Handle Clear Search for Noticias
  const handleClearNoticiasSearch = () => {
    setSearchNoticiasQuery('')
    fetchNoticiasList(1, '', selectedCategoryFilter)
  }

  // Handle Page Change
  const handleNoticiasPageChange = (newPage) => {
    if (newPage < 1 || newPage > noticiasTotalPages || newPage === noticiasPage) return
    fetchNoticiasList(newPage, searchNoticiasQuery, selectedCategoryFilter)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteNoticia = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la noticia "${title}"?`)) {
      return
    }
    try {
      noticiasCacheRef.current.clear()
      await pb.collection('noticias').delete(id)
      await fetchNoticiasList(noticiasPage, searchNoticiasQuery, selectedCategoryFilter, true)
      await syncDbPosts()
    } catch (err) {
      alert('Error al eliminar la noticia: ' + err.message)
    }
  }

  // ----------------------------------------------------
  // EMPRENDIMIENTOS HANDLERS & SERVER-SIDE PAGINATION
  // ----------------------------------------------------
  const handleEmpCategoryChange = (e) => {
    const val = e.target.value
    setEmpCategory(val)
    const mapNames = {
      restaurantes: 'Restaurantes & Gastronomía',
      hospedajes: 'Hospedajes & Cabañas',
      fluvial: 'Transporte Fluvial',
      terrestre: 'Transporte Terrestre',
      rural: 'Turismo Rural',
      excursionismo: 'Excursionismo & Guiados',
      comercio: 'Comercio Local & Servicios'
    }
    setEmpCategoryName(mapNames[val] || 'Comercio Local')
  }

  const handleEmpFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsOptimizingEmp(true)
    try {
      const opt = await compressImageToWebP(file, 1000, 0.80)
      if (empPreview && !empPreview.startsWith('http')) URL.revokeObjectURL(empPreview)
      setEmpFile(opt.file)
      setEmpPreview(opt.previewUrl)
      setEmpOptMeta({
        originalSize: opt.originalSize,
        optimizedSize: opt.optimizedSize,
        savingsPercent: opt.savingsPercent
      })
    } catch (err) {
      console.warn('Emp image optimization fallback:', err)
      if (empPreview && !empPreview.startsWith('http')) URL.revokeObjectURL(empPreview)
      setEmpFile(file)
      setEmpPreview(URL.createObjectURL(file))
      setEmpOptMeta(null)
    } finally {
      setIsOptimizingEmp(false)
    }
  }

  const handleRemoveEmpFile = () => {
    if (empPreview && !empPreview.startsWith('http')) URL.revokeObjectURL(empPreview)
    setEmpFile(null)
    setEmpPreview(null)
    setEmpOptMeta(null)
    if (empFileInputRef.current) empFileInputRef.current.value = ''
  }

  const handlePublishEmprendimiento = async (e) => {
    e.preventDefault()
    if (!empName.trim()) {
      setEmpError('Debes ingresar el nombre del emprendimiento.')
      return
    }

    setEmpSubmitting(true)
    setEmpError('')
    setEmpSuccess(null)

    try {
      const fd = new FormData()
      fd.append('name', empName.trim())
      fd.append('category', empCategory)
      fd.append('categoryName', empCategoryName)
      fd.append('location', empLocation.trim())
      fd.append('phone', empPhone.trim())
      fd.append('hours', empHours.trim())
      fd.append('description', empDescription.trim())
      fd.append('featured', empFeatured ? 'true' : 'false')

      if (empFile) {
        fd.append('image', empFile)
      }

      empCacheRef.current.clear()
      const record = await pb.collection('emprendimientos').create(fd)

      setEmpSuccess({
        id: record.id,
        name: record.name
      })

      // Reset form
      setEmpName('')
      setEmpLocation('')
      setEmpPhone('')
      setEmpHours('')
      setEmpDescription('')
      setEmpFeatured(false)
      handleRemoveEmpFile()
    } catch (err) {
      console.error('Error creating emprendimiento:', err)
      setEmpError(err.message || 'Error al guardar el emprendimiento.')
    } finally {
      setEmpSubmitting(false)
    }
  }

  const fetchEmpList = useCallback(async (targetPage = 1, query = searchEmpQuery, forceRefresh = false) => {
    const trimmed = (query || '').trim()
    const cacheKey = `${targetPage}__${trimmed}`

    if (!forceRefresh && empCacheRef.current.has(cacheKey)) {
      const cached = empCacheRef.current.get(cacheKey)
      setDbEmpList(cached.items)
      setEmpPage(cached.page)
      setEmpTotalPages(cached.totalPages || 1)
      setEmpTotalItems(cached.totalItems || 0)
      return
    }

    setLoadingEmpList(true)
    try {
      const filterStr = trimmed 
        ? `name ~ "${trimmed}" || category ~ "${trimmed}" || location ~ "${trimmed}"` 
        : ''

      const records = await pb.collection('emprendimientos').getList(targetPage, EMP_PER_PAGE, {
        sort: '-featured',
        filter: filterStr,
        requestKey: null
      })

      empCacheRef.current.set(cacheKey, records)
      setDbEmpList(records.items)
      setEmpPage(records.page)
      setEmpTotalPages(records.totalPages || 1)
      setEmpTotalItems(records.totalItems || 0)
    } catch (err) {
      console.error('Error fetching emprendimientos:', err)
    } finally {
      setLoadingEmpList(false)
    }
  }, [searchEmpQuery])

  const handleSearchEmpSubmit = (e) => {
    e.preventDefault()
    fetchEmpList(1, searchEmpQuery)
  }

  const handleClearEmpSearch = () => {
    setSearchEmpQuery('')
    fetchEmpList(1, '')
  }

  const handleEmpPageChange = (newPage) => {
    if (newPage < 1 || newPage > empTotalPages || newPage === empPage) return
    fetchEmpList(newPage, searchEmpQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteEmp = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el emprendimiento "${name}"?`)) {
      return
    }
    try {
      empCacheRef.current.clear()
      await pb.collection('emprendimientos').delete(id)
      await fetchEmpList(empPage, searchEmpQuery, true)
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  // Load lists on tab/view activation without re-triggering on every search keystroke
  useEffect(() => {
    if (isAuth) {
      refreshCategoriesWithNews()
      if (activeTab === 'noticias' && activeSubView === 'list') {
        fetchNoticiasList(1, searchNoticiasQuery, selectedCategoryFilter)
      } else if (activeTab === 'emprendimientos' && activeSubView === 'list') {
        fetchEmpList(1, '')
      }
    }
  }, [isAuth, activeTab, activeSubView, refreshCategoriesWithNews])

  // ----------------------------------------------------
  // LOGIN SCREEN (WITH REAL LOGO, PURE WHITE)
  // ----------------------------------------------------
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-600 selection:text-white">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm p-7 sm:p-9 space-y-6">
          
          {/* Real Logo */}
          <div className="text-center space-y-3">
            <Link to="/" target="_blank" className="inline-block hover:opacity-95 transition-opacity">
              <img
                src="/images/site/logo.webp"
                alt="El Último Bastión"
                className="h-16 sm:h-20 w-auto mx-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/apple-touch-icon.png'
                }}
              />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                Panel Administrativo
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Acceso Editorial Privado
              </p>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="maullinbastion@admin.cl"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando acceso...</span>
                </>
              ) : (
                <span>Ingresar al Administrador</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Acceso seguro y protegido
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // SIDEBAR NAVIGATION COMPONENT (DESKTOP)
  // ----------------------------------------------------
  const handleNavClick = (tab, subView) => {
    setActiveTab(tab)
    setActiveSubView(subView)
    if (tab === 'noticias' && subView === 'create') {
      setEditingPostId(null)
    }
    setMobileMenuOpen(false)
  }

  const renderSidebar = () => (
    <div className="w-64 bg-white h-full flex flex-col justify-between border-r border-slate-200 select-none">
      <div className="p-5 space-y-6">
        
        {/* Real Logo in Sidebar */}
        <div className="pb-4 border-b border-slate-100 flex items-center justify-center">
          <Link to="/" target="_blank" className="block hover:opacity-90 transition-opacity">
            <img
              src="/images/site/logo.webp"
              alt="El Último Bastión"
              className="h-10 sm:h-11 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/apple-touch-icon.png'
              }}
            />
          </Link>
        </div>

        {/* Section 1: NOTICIAS */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Noticias & Artículos
          </div>

          <button
            onClick={() => handleNavClick('noticias', 'create')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'noticias' && activeSubView === 'create'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PenSquare className="w-4 h-4 shrink-0" />
            <span>{editingPostId ? 'Modificar Noticia' : 'Publicar Noticia'}</span>
          </button>

          <button
            onClick={() => handleNavClick('noticias', 'list')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'noticias' && activeSubView === 'list'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Ver Listado</span>
            </div>
            {noticiasTotalItems > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'noticias' && activeSubView === 'list'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {noticiasTotalItems}
              </span>
            )}
          </button>
        </div>

        {/* Section 2: EMPRENDIMIENTOS */}
        <div className="space-y-1 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Emprendimientos
          </div>

          <button
            onClick={() => handleNavClick('emprendimientos', 'create')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'emprendimientos' && activeSubView === 'create'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Nuevo Emprendimiento</span>
          </button>

          <button
            onClick={() => handleNavClick('emprendimientos', 'list')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'emprendimientos' && activeSubView === 'list'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Store className="w-4 h-4 shrink-0" />
              <span>Directorio de Locales</span>
            </div>
            {empTotalItems > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'emprendimientos' && activeSubView === 'list'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {empTotalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  // ----------------------------------------------------
  // PAGINATION CONTROLS
  // ----------------------------------------------------
  const renderPagination = (currentPage, totalPages, totalItems, onPageChange, label = 'noticias') => {
    if (totalPages <= 1) return null

    const delta = 2
    const range = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    return (
      <div className="pt-4 pb-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-[11px] sm:text-xs">
        <div className="text-slate-500 text-center sm:text-left">
          Pág <strong className="text-slate-800">{currentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong> ({totalItems} {label})
        </div>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Primera página"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Ant</span>
          </button>

          {/* Page 1 */}
          <button
            onClick={() => onPageChange(1)}
            className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
              currentPage === 1
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            1
          </button>

          {currentPage - delta > 2 && (
            <span className="px-0.5 text-slate-400 text-xs">…</span>
          )}

          {range.map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                currentPage === p
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}

          {currentPage + delta < totalPages - 1 && (
            <span className="px-0.5 text-slate-400 text-xs">…</span>
          )}

          {totalPages > 1 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                currentPage === totalPages
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Sig</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 sm:p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // MAIN WORKSPACE LAYOUT
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex pb-16 md:pb-0">
      
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside className="hidden md:block sticky top-0 h-screen shrink-0 z-20">
        {renderSidebar()}
      </aside>

      {/* 2. MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full bg-white h-full z-10 shadow-xl">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* ULTRA-MINIMALIST TOP BAR: ONLY "SITIO WEB" & "SALIR" */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-slate-200 h-14 px-4 sm:px-8 flex items-center justify-between">
          
          {/* Mobile brand with logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" target="_blank" className="flex items-center">
              <img
                src="/images/site/logo.webp"
                alt="El Último Bastión"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/apple-touch-icon.png'
                }}
              />
            </Link>
          </div>

          <div className="hidden md:block">
            {/* Kept empty for extreme minimalism */}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200"
              title="Abrir el sitio web en una nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Sitio Web</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1.5 border border-rose-100 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
          
          {/* ========================================================================= */}
          {/* TAB: NOTICIAS                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'noticias' && (
            <div>
              {/* SUB-VIEW: PUBLICAR / EDITAR NOTICIA */}
              {activeSubView === 'create' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
                        {editingPostId ? (
                          <>
                            <Edit3 className="w-5 h-5 text-emerald-600" />
                            <span>Modificar Noticia</span>
                          </>
                        ) : (
                          <span>Publicar Noticia</span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingPostId 
                          ? 'Edita los datos de la noticia y guarda los cambios.'
                          : 'Copia y pega la historia, selecciona la portada e imágenes adicionales para la galería.'
                        }
                      </p>
                    </div>

                    {editingPostId && (
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Cancelar edición</span>
                      </button>
                    )}
                  </div>

                  {postSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {postSuccess.isEdit ? '¡Noticia actualizada con éxito!' : '¡Noticia publicada con éxito!'}
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            "{postSuccess.title}" está visible en el sitio web.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={getPostUrl(postSuccess)}
                          target="_blank"
                          className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver noticia</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubView('list')
                            fetchNoticiasList(1, '', 'Todas', true)
                          }}
                          className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <List className="w-3.5 h-3.5" />
                          <span>Ver en lista</span>
                        </button>
                        <button
                          onClick={() => setPostSuccess(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {postError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{postError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishNoticia} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Título de la Noticia <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Ej: Inician obras de mejoramiento en el borde costero de Maullín"
                        className="w-full text-sm sm:text-base font-bold px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Autor / Redacción
                      </label>
                      <input
                        type="text"
                        value={postAuthor}
                        onChange={(e) => setPostAuthor(e.target.value)}
                        placeholder="Redacción Último Bastión"
                        className="w-full text-xs px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    {/* CATEGORÍAS: SELECTOR DESPLEGABLE ELEGANTE Y COMPACTO */}
                    <div className="relative" ref={categoryDropdownRef}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                          Categorías de la Noticia <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {selectedCategories.length} seleccionada{selectedCategories.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Dropdown Trigger Button */}
                      <div
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        className={`w-full min-h-[42px] px-3 py-2 bg-slate-50 hover:bg-slate-100/90 border rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-all shadow-2xs ${
                          categoryDropdownOpen ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20' : 'border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FolderTree className="w-4 h-4 text-emerald-600 shrink-0" />
                          {selectedCategories.length === 0 ? (
                            <span className="text-xs text-slate-400">Toca para seleccionar categorías...</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {selectedCategories.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
                            {categoryDropdownOpen ? 'Cerrar' : 'Elegir'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Selected Category Tags Display (Clean & Compact Removable Badges) */}
                      {selectedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {selectedCategories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex items-center gap-1.5 bg-[#002845] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs"
                            >
                              <span>{cat}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveCategoryBadge(cat)
                                }}
                                className="w-4 h-4 rounded-full bg-white/20 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                title={`Quitar ${cat}`}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dropdown Popover Menu */}
                      {categoryDropdownOpen && (
                        <div className="absolute left-0 right-0 top-[68px] bg-white border border-slate-300 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                          
                          {/* Search bar & Add custom category */}
                          <div className="p-2.5 bg-slate-50/90 space-y-2">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                              <input
                                type="text"
                                placeholder="Filtrar categorías municipales..."
                                value={categorySearchQuery}
                                onChange={(e) => setCategorySearchQuery(e.target.value)}
                                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            {/* Create custom category on the fly */}
                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                placeholder="+ Escribe otra categoría propia..."
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddNewCategory()
                                  }
                                }}
                                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-600"
                              />
                              <button
                                type="button"
                                onClick={handleAddNewCategory}
                                disabled={!newCategoryInput.trim()}
                                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
                              >
                                + Agregar
                              </button>
                            </div>
                          </div>

                          {/* Category Options List with Checkboxes */}
                          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                            {availableCategories
                              .filter(cat => cat.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                              .map((cat) => {
                                const isSelected = selectedCategories.includes(cat)
                                return (
                                  <div
                                    key={cat}
                                    onClick={() => handleToggleCategory(cat)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className="truncate pr-2">{cat}</span>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-emerald-700 border-emerald-700 text-white'
                                        : 'border-slate-300 bg-white'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>

                          {/* Footer with Done button */}
                          <div className="p-2 bg-slate-50 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {selectedCategories.length} seleccionada{selectedCategories.length === 1 ? '' : 's'}
                            </span>
                            <div className="flex gap-2">
                              {selectedCategories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategories([selectedCategories[0]])}
                                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                                >
                                  Dejar sólo 1
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setCategoryDropdownOpen(false)}
                                className="text-[11px] bg-slate-900 text-white px-3.5 py-1 rounded-lg font-bold hover:bg-slate-800 cursor-pointer shadow-2xs"
                              >
                                Listo
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                          Bajada / Resumen
                        </label>
                        <span className="text-[10px] sm:text-[11px] text-slate-400">
                          Opcional
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={postExcerpt}
                        onChange={(e) => setPostExcerpt(e.target.value)}
                        placeholder="Breve resumen destacado de la noticia..."
                        className="w-full text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                          Historia Completa <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] sm:text-[11px] text-slate-400">
                          {postContent.trim() ? `${postContent.trim().split(/\s+/).length} palabras` : '0 palabras'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 mb-1.5">
                        📋 <strong>Copia y pega directo:</strong> Puedes pegar texto desde Word o notas. El sistema formatea los párrafos automáticamente.
                      </p>
                      <textarea
                        required
                        rows={8}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Pega aquí la historia completa...&#10;&#10;Separa párrafos con saltos de línea normales y se verán ordenados en la web."
                        className="w-full text-xs sm:text-sm leading-relaxed p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-sans placeholder:text-slate-400"
                      />
                    </div>

                    {/* FOTO DE PORTADA */}
                    <div className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-white space-y-2">
                      <div>
                        <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                          Foto de Portada
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500">
                          Imagen principal que encabezará el artículo y las tarjetas de inicio.
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverSelect}
                        accept="image/*"
                        className="hidden"
                      />

                      {isOptimizingCover ? (
                        <div className="w-full py-7 border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-2 animate-pulse">
                          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                          <span className="text-xs font-bold text-emerald-800">
                            ⚡ Optimizando imagen a WebP de alta compresión...
                          </span>
                          <span className="text-[10px] text-emerald-600">
                            Reduciendo peso automáticamente para carga ultrarrápida (ecommerce standard)
                          </span>
                        </div>
                      ) : coverPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-sm">
                          <img
                            src={coverPreview}
                            alt="Vista previa portada"
                            className="w-full aspect-[16/10] object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          {coverOptMeta && (
                            <div className="px-2.5 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
                              <span className="flex items-center gap-1 font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>WebP Ultra-Liviano: <strong>{formatBytes(coverOptMeta.optimizedSize)}</strong></span>
                              </span>
                              <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                                -{coverOptMeta.savingsPercent}% PESO
                              </span>
                            </div>
                          )}
                          <div className="p-2 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                            <span className="text-[10px] sm:text-[11px] text-slate-600 truncate font-mono">
                              {coverFile ? coverFile.name : 'Foto actual'}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveCover}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="w-full py-4 sm:py-5 border-2 border-dashed border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer bg-white group"
                        >
                          <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-700" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                            Clic aquí para elegir foto de portada (conversión automática a WebP)
                          </span>
                        </button>
                      )}
                    </div>

                    {/* FOTOS ADICIONALES (GALERÍA) */}
                    <div className="border border-slate-200 rounded-xl p-3 sm:p-4 bg-white space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700">
                            Fotos Adicionales (Galería)
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-500">
                            Se verán en la galería interactiva al final de la noticia con zoom en pantalla completa.
                          </p>
                        </div>
                        {galleryPreviews.length > 0 && (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {galleryPreviews.length} {galleryPreviews.length === 1 ? 'foto' : 'fotos'}
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={galleryInputRef}
                        onChange={handleGallerySelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      {isOptimizingGallery && (
                        <div className="w-full py-5 border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 animate-pulse">
                          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                          <span className="text-xs font-bold text-emerald-800">
                            ⚡ Comprimiendo lote de imágenes a WebP ultraliviano...
                          </span>
                        </div>
                      )}

                      {galleryOptMeta && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] text-emerald-800">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lote optimizado a WebP: <strong>{formatBytes(galleryOptMeta.optimizedSize)}</strong></span>
                          </span>
                          <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                            -{galleryOptMeta.savingsPercent}% PESO
                          </span>
                        </div>
                      )}

                      {galleryPreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                          {galleryPreviews.map((previewUrl, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group shadow-2xs"
                            >
                              <img
                                src={previewUrl}
                                alt={`Foto ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md"
                                title="Quitar foto"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.2 rounded font-mono">
                                #{idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-full py-2.5 border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-white text-xs font-bold text-slate-700 hover:text-emerald-800"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>{galleryPreviews.length > 0 ? '+ Agregar más fotos (conversión WebP)' : 'Seleccionar fotos para la galería (conversión WebP)'}</span>
                      </button>
                    </div>

                    {/* Destacar Noticia */}
                    <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Destacar Noticia
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-slate-500">
                          Ubica la noticia en la portada principal.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={postFeatured}
                          onChange={(e) => setPostFeatured(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={postSubmitting}
                      className="w-full py-3 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {postSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando publicación...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>{editingPostId ? 'Guardar Cambios en la Noticia' : 'Publicar Noticia Ahora'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* SUB-VIEW: LISTADO DE NOTICIAS EN GRID / CUADRADOS */}
              {activeSubView === 'list' && (
                <div className="space-y-5">
                  
                  {/* Top Bar with Category Filter */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900">
                          Noticias Publicadas
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                          {noticiasTotalItems} artículos disponibles • Vista en cuadrícula
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => {
                            setEditingPostId(null)
                            setActiveSubView('create')
                          }}
                          className="text-[11px] sm:text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-lg sm:rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nueva Noticia</span>
                        </button>

                        <button
                          onClick={() => fetchNoticiasList(noticiasPage, searchNoticiasQuery, selectedCategoryFilter, true)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Actualizar lista"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingNoticiasList ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* CATEGORY SELECTOR DROPDOWN & VIEW MODE TOGGLE */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          className="w-full text-xs py-2 pl-3.5 pr-8 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-emerald-600 outline-none appearance-none cursor-pointer transition-colors shadow-2xs"
                        >
                          <option value="Todas">Categorías</option>
                          {categoriesWithNews.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>

                      {/* View Mode Switcher: Grid (2 cols en móvil) vs List (filas ultra-compactas) */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => setNewsViewMode('grid')}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            newsViewMode === 'grid'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                          title="Vista Cuadrícula (2 columnas en móvil)"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewsViewMode('list')}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            newsViewMode === 'list'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                          title="Vista Lista Compacta"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchNoticiasSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Buscar por título o autor..."
                          value={searchNoticiasQuery}
                          onChange={(e) => setSearchNoticiasQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {searchNoticiasQuery && (
                          <button
                            type="button"
                            onClick={handleClearNoticiasSearch}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Buscar
                      </button>
                    </form>

                    {/* Active Filter Pill indicator if filtered */}
                    {selectedCategoryFilter !== 'Todas' && (
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-slate-500">Filtrando por:</span>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span>{selectedCategoryFilter}</span>
                          <button
                            onClick={() => handleCategorySelect('Todas')}
                            className="text-emerald-700 hover:text-rose-600 cursor-pointer text-xs"
                            title="Quitar filtro de categoría"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* LISTADO DE NOTICIAS (RESPONSIVE: 2 COLUMNAS EN MÓVIL O FILAS COMPACTAS) */}
                  {loadingNoticiasList ? (
                    <div className="py-24 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                      <p className="text-xs font-medium">Cargando noticias...</p>
                    </div>
                  ) : dbNoticiasList.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-slate-700 text-sm">
                        {searchNoticiasQuery || selectedCategoryFilter !== 'Todas' 
                          ? 'No se encontraron noticias con estos filtros' 
                          : 'No hay noticias registradas'
                        }
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedCategoryFilter('Todas')
                          handleClearNoticiasSearch()
                        }}
                        className="text-xs font-bold text-emerald-700 hover:underline inline-block mt-1 cursor-pointer"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  ) : newsViewMode === 'grid' ? (
                    /* MODO CUADRÍCULA: 2 COLUMNAS EN MÓVIL (SE VEN MÚLTIPLES NOTICIAS A LA VEZ) */
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {dbNoticiasList.map((post) => {
                        const thumbUrl = (() => {
                          if (!post.image) return '/images/default-news.webp'
                          const match = post.image.match(/^(\d+)_.+\.webp$/)
                          if (match) {
                            return `/images/posts/${match[1]}.webp`
                          }
                          return getPocketBaseFileUrl('noticias', post.id, post.image, '400x260')
                        })()
                        const galleryCount = Array.isArray(post.gallery) ? post.gallery.length : 0
                        const cats = (post.category || 'Actualidad y Comuna')
                          .split(',')
                          .map(c => c.trim())
                          .filter(Boolean)
                        const primary = cats[0] || 'Actualidad'
                        const extraCount = cats.length - 1

                        return (
                          <div
                            key={post.id}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              {/* Top Thumbnail Image */}
                              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                                <img
                                  src={thumbUrl}
                                  alt={post.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    if (post.image && !e.currentTarget.dataset.fallbackTried) {
                                      e.currentTarget.dataset.fallbackTried = 'true'
                                      e.currentTarget.src = getPocketBaseFileUrl('noticias', post.id, post.image)
                                    } else {
                                      e.currentTarget.src = '/images/default-news.webp'
                                    }
                                  }}
                                />
                                
                                {/* Category Badges */}
                                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 max-w-[85%] z-10 flex-wrap">
                                  <span className="bg-slate-900/85 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded shadow-2xs truncate max-w-[85px] sm:max-w-[125px]">
                                    {primary}
                                  </span>
                                  {extraCount > 0 && (
                                    <span
                                      className="bg-emerald-700/90 text-white text-[7px] sm:text-[8px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded shadow-2xs"
                                      title={cats.slice(1).join(', ')}
                                    >
                                      +{extraCount}
                                    </span>
                                  )}
                                </div>

                                {/* Featured / Gallery Badges */}
                                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1">
                                  {post.featured && (
                                    <span className="bg-amber-400 text-slate-900 text-[8px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded shadow-2xs">
                                      ★
                                    </span>
                                  )}
                                  {galleryCount > 0 && (
                                    <span className="bg-emerald-600/90 text-white text-[7px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded shadow-2xs">
                                      +{galleryCount}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-2 sm:p-3.5 space-y-1 sm:space-y-1.5">
                                <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-slate-400">
                                  <span>{post.date ? new Date(post.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }) : ''}</span>
                                  {post.author && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[90px] sm:max-w-[120px]">{post.author}</span>
                                    </>
                                  )}
                                </div>

                                <h4 className="font-serif font-bold text-slate-900 text-[11px] sm:text-sm leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                                  {post.title}
                                </h4>

                                {post.excerpt && (
                                  <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {post.excerpt}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Card Footer Action Buttons */}
                            <div className="p-1.5 sm:p-3 pt-0 border-t border-slate-100 mt-1 flex items-center justify-between gap-1 sm:gap-1.5">
                              {/* Botón Editar */}
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="Editar esta noticia"
                              >
                                <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>Editar</span>
                              </button>

                              {/* Botón Ver */}
                              <Link
                                to={getPostUrl(post)}
                                target="_blank"
                                className="py-1 sm:py-1.5 px-1.5 sm:px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                title="Ver en el sitio web"
                              >
                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </Link>

                              {/* Botón Eliminar */}
                              <button
                                onClick={() => handleDeleteNoticia(post.id, post.title)}
                                className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar noticia permanentemente"
                              >
                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    /* MODO LISTA COMPACTA: FILAS ULTRA-EFICIENTES (CABEN 6-8 NOTICIAS EN PANTALLA) */
                    <div className="space-y-1.5 sm:space-y-2">
                      {dbNoticiasList.map((post) => {
                        const thumbUrl = (() => {
                          if (!post.image) return '/images/default-news.webp'
                          const match = post.image.match(/^(\d+)_.+\.webp$/)
                          if (match) {
                            return `/images/posts/${match[1]}.webp`
                          }
                          return getPocketBaseFileUrl('noticias', post.id, post.image, '120x90')
                        })()
                        const cats = (post.category || 'Actualidad y Comuna')
                          .split(',')
                          .map(c => c.trim())
                          .filter(Boolean)
                        const primary = cats[0] || 'Actualidad'
                        const extraCount = cats.length - 1

                        return (
                          <div
                            key={post.id}
                            className="bg-white rounded-xl border border-slate-200 p-2 sm:p-2.5 flex items-center justify-between gap-2.5 hover:shadow-xs hover:border-slate-300 transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* Mini Thumbnail */}
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                                <img
                                  src={thumbUrl}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => { e.currentTarget.src = '/images/default-news.webp' }}
                                />
                                {post.featured && (
                                  <span className="absolute top-0.5 left-0.5 bg-amber-400 text-slate-900 text-[8px] font-extrabold px-1 rounded shadow-2xs">
                                    ★
                                  </span>
                                )}
                              </div>

                              {/* Title & Info */}
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {primary}
                                  </span>
                                  {extraCount > 0 && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1 rounded" title={cats.slice(1).join(', ')}>
                                      +{extraCount}
                                    </span>
                                  )}
                                  <span className="text-[9px] sm:text-[10px] text-slate-400">
                                    {post.date ? new Date(post.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }) : ''}
                                  </span>
                                </div>

                                <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                  {post.title}
                                </h4>

                                {post.author && (
                                  <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                                    Por {post.author}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Row Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="py-1 px-2 sm:py-1.5 sm:px-2.5 bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                title="Editar noticia"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>

                              <Link
                                to={getPostUrl(post)}
                                target="_blank"
                                className="p-1 sm:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg flex items-center transition-colors"
                                title="Ver en el sitio web"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => handleDeleteNoticia(post.id, post.title)}
                                className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar noticia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {renderPagination(noticiasPage, noticiasTotalPages, noticiasTotalItems, handleNoticiasPageChange, 'noticias')}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: EMPRENDIMIENTOS                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'emprendimientos' && (
            <div>
              {/* SUB-VIEW: CREAR EMPRENDIMIENTO */}
              {activeSubView === 'create' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                      Registrar Emprendimiento
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agrega nuevos restaurantes, cabañas, servicios y negocios a la Guía Local de Maullín.
                    </p>
                  </div>

                  {empSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            ¡Emprendimiento registrado con éxito!
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            "{empSuccess.name}" ya está visible en la Guía de Emprendimientos.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/emprendimientos"
                          target="_blank"
                          className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver en la Guía</span>
                        </Link>
                        <button
                          onClick={() => setEmpSuccess(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {empError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{empError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishEmprendimiento} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Nombre del Emprendimiento / Negocio <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        placeholder="Ej: Cabañas & Hospedaje Río Maullín"
                        className="w-full text-base sm:text-lg font-bold px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400 font-serif"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Rubro / Categoría
                        </label>
                        <select
                          value={empCategory}
                          onChange={handleEmpCategoryChange}
                          className="w-full text-xs font-bold px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 outline-none"
                        >
                          <option value="restaurantes">Restaurantes & Gastronomía</option>
                          <option value="hospedajes">Hospedajes & Cabañas</option>
                          <option value="fluvial">Transporte Fluvial</option>
                          <option value="terrestre">Transporte Terrestre</option>
                          <option value="rural">Turismo Rural</option>
                          <option value="excursionismo">Excursionismo & Guiados</option>
                          <option value="comercio">Comercio Local & Servicios</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Ubicación / Sector
                        </label>
                        <input
                          type="text"
                          value={empLocation}
                          onChange={(e) => setEmpLocation(e.target.value)}
                          placeholder="Ej: Maullín Centro (Calle O'Higgins)"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Teléfono o WhatsApp
                        </label>
                        <input
                          type="text"
                          value={empPhone}
                          onChange={(e) => setEmpPhone(e.target.value)}
                          placeholder="Ej: +56 9 9510 4318"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Horario de Atención
                        </label>
                        <input
                          type="text"
                          value={empHours}
                          onChange={(e) => setEmpHours(e.target.value)}
                          placeholder="Ej: Miércoles a Domingo 18:00 - 02:00"
                          className="w-full text-xs px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Descripción de Servicios
                      </label>
                      <textarea
                        rows={3}
                        value={empDescription}
                        onChange={(e) => setEmpDescription(e.target.value)}
                        placeholder="Describe los platos, servicios, recorridos o comodidades que ofrece..."
                        className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Foto o Logo del Emprendimiento
                      </h4>

                      <input
                        type="file"
                        ref={empFileInputRef}
                        onChange={handleEmpFileSelect}
                        accept="image/*"
                        className="hidden"
                      />

                      {isOptimizingEmp ? (
                        <div className="w-full py-5 border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 animate-pulse">
                          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                          <span className="text-xs font-bold text-emerald-800">
                            ⚡ Comprimiendo imagen a WebP ultraliviano...
                          </span>
                        </div>
                      ) : empPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-xs">
                          <img
                            src={empPreview}
                            alt="Vista previa emprendimiento"
                            className="w-full aspect-[16/10] object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          {empOptMeta && (
                            <div className="px-2 py-1 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-800">
                              <span className="font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>WebP: <strong>{formatBytes(empOptMeta.optimizedSize)}</strong></span>
                              </span>
                              <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                -{empOptMeta.savingsPercent}%
                              </span>
                            </div>
                          )}
                          <div className="p-2 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
                            <span className="text-[11px] text-slate-600 truncate font-mono">
                              {empFile ? empFile.name : 'Foto actual'}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveEmpFile}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => empFileInputRef.current?.click()}
                          className="w-full py-5 border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer bg-white text-xs font-bold text-slate-700 hover:text-emerald-800"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>Seleccionar Foto o Logo (conversión WebP)</span>
                        </button>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Destacar en la Guía
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Insignia dorada de destacado en los primeros lugares.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={empFeatured}
                          onChange={(e) => setEmpFeatured(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={empSubmitting}
                      className="w-full py-3.5 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {empSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando emprendimiento...</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4" />
                          <span>Guardar Emprendimiento</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* SUB-VIEW: LISTADO DE EMPRENDIMIENTOS CON PAGINACIÓN */}
              {activeSubView === 'list' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                        Directorio de Emprendimientos
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {empTotalItems} negocios registrados
                      </p>
                    </div>
                    <button
                      onClick={() => fetchEmpList(empPage, searchEmpQuery)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingEmpList ? 'animate-spin' : ''}`} />
                      <span>Actualizar</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <form onSubmit={handleSearchEmpSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Buscar por nombre, rubro o localidad..."
                        value={searchEmpQuery}
                        onChange={(e) => setSearchEmpQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 outline-none"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      {searchEmpQuery && (
                        <button
                          type="button"
                          onClick={handleClearEmpSearch}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Buscar
                    </button>
                  </form>

                  {loadingEmpList ? (
                    <div className="py-20 text-center text-slate-400 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                      <p className="text-xs">Cargando emprendimientos...</p>
                    </div>
                  ) : dbEmpList.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-2">
                      <Store className="w-7 h-7 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-slate-700 text-sm">
                        {searchEmpQuery ? 'No se encontraron emprendimientos' : 'No hay emprendimientos registrados'}
                      </h3>
                      {searchEmpQuery ? (
                        <button
                          onClick={handleClearEmpSearch}
                          className="text-xs font-bold text-emerald-700 hover:underline inline-block mt-1"
                        >
                          Mostrar todos
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveSubView('create')}
                          className="text-xs font-bold bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl hover:bg-emerald-800 transition-colors inline-block mt-2 cursor-pointer"
                        >
                          + Nuevo Emprendimiento
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {dbEmpList.map((emp) => {
                        const imgUrl = emp.image
                          ? getPocketBaseFileUrl('emprendimientos', emp.id, emp.image, '120x90')
                          : '/images/default-news.webp'

                        return (
                          <div
                            key={emp.id}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between gap-2 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <img
                                src={imgUrl}
                                alt={emp.name}
                                loading="lazy"
                                decoding="async"
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                                onError={(e) => { e.currentTarget.src = '/images/default-news.webp' }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                                    {emp.categoryName || emp.category}
                                  </span>
                                  {emp.featured && (
                                    <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                                      Destacado
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate font-serif mt-0.5">
                                  {emp.name}
                                </h4>
                                {emp.location && (
                                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{emp.location}</span>
                                  </p>
                                )}
                                {emp.phone && (
                                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>{emp.phone}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[9px] sm:text-[10px] text-slate-400">
                                ID: {emp.id}
                              </span>
                              <button
                                onClick={() => handleDeleteEmp(emp.id, emp.name)}
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-0.5 rounded-md border border-rose-100 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {renderPagination(empPage, empTotalPages, empTotalItems, handleEmpPageChange, 'emprendimientos')}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 4. MOBILE NATIVE APP BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleNavClick('noticias', 'list')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'noticias' && activeSubView === 'list'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Noticias</span>
        </button>

        <button
          onClick={() => handleNavClick('noticias', 'create')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'noticias' && activeSubView === 'create'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="w-7 h-7 -mt-2 bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[10px]">Publicar</span>
        </button>

        <button
          onClick={() => handleNavClick('emprendimientos', 'list')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'emprendimientos'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px]">Locales</span>
        </button>

        <Link
          to="/"
          target="_blank"
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Ver Web</span>
        </Link>
      </nav>
    </div>
  )
}
