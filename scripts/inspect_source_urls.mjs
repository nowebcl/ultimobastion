import fs from 'fs';

const rawPosts = JSON.parse(fs.readFileSync('data/raw_posts.json', 'utf8'));

const urls = rawPosts.map(p => ({
  id: p.id,
  title: p.title?.rendered,
  source_url: p._embedded['wp:featuredmedia'][0].source_url
}));

console.log('Total URLs:', urls.length);
console.log('First 5 URLs:', urls.slice(0, 5));
console.log('Last 5 URLs:', urls.slice(-5));

// Check domains
const domains = {};
urls.forEach(u => {
  try {
    const urlObj = new URL(u.source_url);
    domains[urlObj.hostname] = (domains[urlObj.hostname] || 0) + 1;
  } catch(e) {
    domains['invalid'] = (domains['invalid'] || 0) + 1;
  }
});
console.log('Domains breakdown:', domains);
