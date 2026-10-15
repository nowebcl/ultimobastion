import PocketBase from 'pocketbase'

export const PB_URL = 'https://bd.maullinultimobastion.cl'

export const pb = new PocketBase(PB_URL)

// Ensure auto-cancellation is disabled so multiple parallel queries don't cancel each other
pb.autoCancellation(false)

/**
 * Log in admin using email and password
 * Checks both 'users' and '_superusers' collections securely
 */
export async function loginAdmin(email, password) {
  try {
    const authData = await pb.collection('users').authWithPassword(email.trim(), password)
    return authData
  } catch (err) {
    // If not in users, attempt superuser auth
    try {
      const superAuth = await pb.collection('_superusers').authWithPassword(email.trim(), password)
      return superAuth
    } catch {
      throw new Error(err.message || 'Credenciales incorrectas')
    }
  }
}

/**
 * Log out admin
 */
export function logoutAdmin() {
  pb.authStore.clear()
}

/**
 * Check if current session has valid authentication
 */
export function isAdminAuthenticated() {
  return pb.authStore.isValid
}

/**
 * Get current authenticated user / superuser
 */
export function getCurrentAdminUser() {
  return pb.authStore.record
}

/**
 * Helper to construct file URLs
 */
export function getPocketBaseFileUrl(collectionName, recordId, filename, thumb = '') {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename
  }
  const base = `${PB_URL}/api/files/${collectionName}/${recordId}/${filename}`
  return thumb ? `${base}?thumb=${thumb}` : base
}

/**
 * Fetch all noticias from PocketBase
 */
export async function getDbNoticias(page = 1, perPage = 50) {
  try {
    const result = await pb.collection('noticias').getList(page, perPage, {
      sort: '-date',
      requestKey: null
    })
    return result.items
  } catch (err) {
    console.warn('Error fetching noticias from PocketBase:', err)
    return []
  }
}

/**
 * Fetch all emprendimientos from PocketBase
 */
export async function getDbEmprendimientos(page = 1, perPage = 100) {
  try {
    const result = await pb.collection('emprendimientos').getList(page, perPage, {
      sort: '-featured',
      requestKey: null
    })
    return result.items
  } catch (err) {
    console.warn('Error fetching emprendimientos from PocketBase:', err)
    return []
  }
}
