import fs from 'fs';

const allPosts = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf8'));

const featuredLead = allPosts[0];
const secondaryFeatured = allPosts.slice(1, 5);

const usedIds = new Set([featuredLead?.id, ...secondaryFeatured.map(p => p.id)].filter(Boolean));

const findPost = (predicate, fallbackIdx) => {
  const found = allPosts.find(p => !usedIds.has(p.id) && predicate(p));
  if (found) {
    usedIds.add(found.id);
    return found;
  }
  const fallback = allPosts[fallbackIdx] || allPosts.find(p => !usedIds.has(p.id));
  if (fallback) usedIds.add(fallback.id);
  return fallback;
};

const row1Salud = findPost(p => p.categories?.some(c => c.slug === 'salud'), 5);
const row1Deportes = findPost(p => p.categories?.some(c => c.slug === 'deporte'), 6);
const row1Cultura = findPost(p => p.categories?.some(c => c.slug === 'cultura-comunidad'), 7);

const row2Comuna = findPost(p => p.categories?.some(c => c.slug === 'seguridad' || c.slug === 'proyectos'), 8);
const row2MedioAmbiente = findPost(p => p.title?.toLowerCase().includes('humedal') || p.title?.toLowerCase().includes('costero') || p.title?.toLowerCase().includes('limpieza') || p.title?.toLowerCase().includes('rio'), 9);
const row2Comunidad = findPost(p => p.title?.toLowerCase().includes('adulto') || p.title?.toLowerCase().includes('comunitari') || p.categories?.some(c => c.slug === 'agrupaciones-comunitarias'), 10);
const row2Turismo = findPost(p => p.categories?.some(c => c.slug === 'turismo') || p.categories?.some(c => c.slug === 'fomento'), 11);

const selected = [
  { section: 'hero', post: featuredLead },
  ...secondaryFeatured.map((p, i) => ({ section: `secondary_${i}`, post: p })),
  { section: 'row1Salud', post: row1Salud },
  { section: 'row1Deportes', post: row1Deportes },
  { section: 'row1Cultura', post: row1Cultura },
  { section: 'row2Comuna', post: row2Comuna },
  { section: 'row2MedioAmbiente', post: row2MedioAmbiente },
  { section: 'row2Comunidad', post: row2Comunidad },
  { section: 'row2Turismo', post: row2Turismo },
];

console.log('Homepage selected posts:');
selected.forEach(s => {
  const file = 'public' + s.post.image;
  const exists = fs.existsSync(file);
  const size = exists ? fs.statSync(file).size : 0;
  console.log(`${s.section}: id=${s.post.id}, img=${s.post.image}, size=${size} bytes, isReal=${size > 4000}`);
});
