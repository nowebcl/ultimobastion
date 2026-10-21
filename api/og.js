import postsIndex from '../src/data/posts_index.json' with { type: 'json' };

const POCKETBASE_URL = 'https://bd.maullinultimobastion.cl';
const CANONICAL_BASE = 'https://www.maullinultimobastion.cl';
const DEFAULT_TITLE = 'Último Bastión Maullín | La voz de Maullín y su comunidad';
const DEFAULT_DESC = 'Portal de noticias, cultura, historia, fomento, proyectos y vida comunitaria de Maullín y la Región de Los Lagos.';
const DEFAULT_IMAGE = `${CANONICAL_BASE}/images/default-news.webp`;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;|&#8212;/g, '—')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getCanonicalUrl(post, fallbackPath) {
  if (!post) {
    if (!fallbackPath || fallbackPath === '/' || fallbackPath === 'index.html') {
      return CANONICAL_BASE;
    }
    return `${CANONICAL_BASE}/${fallbackPath.replace(/^\/+/, '').replace(/\/+$/, '')}`;
  }

  const slug = post.slug || String(post.id);
  if (post.date) {
    try {
      const d = new Date(post.date);
      if (!isNaN(d.getTime())) {
        const y = String(d.getFullYear());
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${CANONICAL_BASE}/${y}/${m}/${day}/${slug}/`;
      }
    } catch {
      // fallback
    }
  }
  return `${CANONICAL_BASE}/noticia/${slug}`;
}

function resolveImageUrl(rawImage, recordId) {
  if (!rawImage || typeof rawImage !== 'string' || !rawImage.trim()) {
    return DEFAULT_IMAGE;
  }
  const img = rawImage.trim();
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  if (img.startsWith('/')) {
    return `${CANONICAL_BASE}${img}`;
  }
  if (recordId) {
    return `${POCKETBASE_URL}/api/files/noticias/${recordId}/${img}`;
  }
  return `${CANONICAL_BASE}/images/posts/${img}`;
}

async function fetchPostFromPocketBase(querySlug) {
  if (!querySlug) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3200);

    const safeSlug = querySlug.replace(/"/g, '\\"');
    const filter = `slug="${safeSlug}" || id="${safeSlug}"`;
    const url = `${POCKETBASE_URL}/api/collections/noticias/records?filter=(${encodeURIComponent(filter)})&fields=id,title,slug,date,excerpt,content,image,author&requestKey=null`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.items && json.items.length > 0) {
        return json.items[0];
      }
    }
  } catch {
    // Network or timeout failure, will fallback to local posts_index
  }
  return null;
}

function findPostInStaticIndex(querySlug) {
  if (!querySlug || !Array.isArray(postsIndex)) return null;
  const clean = querySlug.toLowerCase().trim();
  return (
    postsIndex.find(p => (p.slug && p.slug.toLowerCase() === clean) || String(p.id) === clean) ||
    null
  );
}

function extractSlug(rawPath, query) {
  if (query) {
    if (query.slug) return String(query.slug).trim();
    if (query.p) return String(query.p).trim();
    if (query.id) return String(query.id).trim();
    if (query.post) return String(query.post).trim();
  }

  if (!rawPath) return '';
  const clean = String(rawPath)
    .split('?')[0]
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  if (!clean) return '';
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return '';

  const lastPart = parts[parts.length - 1].replace(/\.html?$/i, '');
  return lastPart;
}

const STATIC_PAGE_META = {
  historia: {
    title: 'Historia de Maullín | Último Bastión Continental',
    description: 'Línea de tiempo histórica desde 1567, el Último Bastión Continental español y registro cronológico de alcaldes de Maullín.',
    image: `${CANONICAL_BASE}/images/site/quienes-somos.webp`
  },
  mapas: {
    title: 'Atlas Cartográfico de la Cuenca del Río Maullín',
    description: '15 capítulos interactivos de cartografía histórica, humedales, mareas, terremoto de 1960 y geografía comunal de Maullín.',
    image: `${CANONICAL_BASE}/images/maps/cap-01.webp`
  },
  emprendimientos: {
    title: 'Directorio de Emprendimientos y Comercio de Maullín',
    description: 'Guía oficial de comercio local, gastronomía, cabañas, servicios y turismo en Maullín y la Región de Los Lagos.',
    image: `${CANONICAL_BASE}/images/site/derniere-restobar.webp`
  },
  'quienes-somos': {
    title: 'Quiénes Somos | Redacción El Último Bastión',
    description: 'Trayectoria periodística y comunitaria desde 2008: historia, compromiso territorial y difusión informativa de Maullín.',
    image: `${CANONICAL_BASE}/images/site/quienes-somos.webp`
  },
  contacto: {
    title: 'Contacto y Redacción | El Último Bastión',
    description: 'Comunícate con nuestro equipo periodístico en Calle Almeyda 151, Maullín, Región de Los Lagos.',
    image: `${CANONICAL_BASE}/images/default-news.webp`
  },
  noticias: {
    title: 'Archivo de Noticias y Actualidad Comunal de Maullín',
    description: 'Archivo completo de noticias, reportajes, proyectos, cultura y eventos de la comuna de Maullín.',
    image: `${CANONICAL_BASE}/images/default-news.webp`
  }
};

export default async function handler(req, res) {
  const query = req.query || {};
  const rawPath = query.path || req.url || '';
  const slug = extractSlug(rawPath, query);

  let metaTitle = DEFAULT_TITLE;
  let metaDesc = DEFAULT_DESC;
  let metaImage = DEFAULT_IMAGE;
  let canonicalUrl = CANONICAL_BASE;
  let isArticle = false;

  const lowSlug = (slug || '').toLowerCase();

  // 1. Check if it's one of the known static pages
  if (STATIC_PAGE_META[lowSlug]) {
    const pageData = STATIC_PAGE_META[lowSlug];
    metaTitle = `${pageData.title} | Último Bastión`;
    metaDesc = pageData.description;
    metaImage = pageData.image;
    canonicalUrl = `${CANONICAL_BASE}/${lowSlug}`;
  } else if (slug && slug !== 'index' && slug !== 'api') {
    // 2. Look up the news article: first in live PocketBase (for fresh/edited news)
    let post = await fetchPostFromPocketBase(slug);

    // 3. Fallback to local static index (instant for historical posts)
    if (!post) {
      post = findPostInStaticIndex(slug);
    }

    if (post) {
      isArticle = true;
      metaTitle = `${cleanText(post.title)} | Último Bastión Maullín`;

      let excerpt = post.excerpt ? cleanText(post.excerpt) : '';
      if (!excerpt && post.content) {
        const plain = cleanText(post.content);
        excerpt = plain.slice(0, 180) + (plain.length > 180 ? '...' : '');
      }
      if (excerpt) {
        metaDesc = excerpt;
      }

      metaImage = resolveImageUrl(post.image, post.id);
      canonicalUrl = getCanonicalUrl(post, rawPath);
    }
  }

  const safeTitle = escapeHtml(metaTitle);
  const safeDesc = escapeHtml(metaDesc);
  const safeImage = escapeHtml(metaImage);
  const safeUrl = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns# fb: https://ogp.me/ns/fb# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="canonical" href="${safeUrl}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:site_name" content="Último Bastión Maullín" />
  <meta property="og:locale" content="es_CL" />
  <meta property="og:type" content="${isArticle ? 'article' : 'website'}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Fast client redirect for non-crawler human visitors -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}" />
  <script>
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/api/og')) {
      window.location.replace(${JSON.stringify(canonicalUrl)});
    }
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; max-width: 680px; margin: 0 auto; line-height: 1.6;">
  <p style="font-size: 0.85rem; color: #05a353; font-weight: 700; text-transform: uppercase;">Último Bastión Maullín</p>
  <h1 style="font-size: 1.5rem; line-height: 1.3; margin: 0.5rem 0;">${safeTitle}</h1>
  <p style="color: #475569; font-size: 0.95rem;">${safeDesc}</p>
  ${safeImage ? `<div style="margin: 1.5rem 0;"><img src="${safeImage}" alt="${safeTitle}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" /></div>` : ''}
  <p><a href="${safeUrl}" style="display: inline-block; background: #002845; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">Ver noticia completa &rarr;</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
