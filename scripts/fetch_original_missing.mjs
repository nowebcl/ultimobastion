import fs from 'fs';
import path from 'path';

const rawPosts = JSON.parse(fs.readFileSync('data/raw_posts.json', 'utf8'));
const posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

// Identify the 229 posts:
// They are posts from Nov 2025 to Mar 2026 (or id <= 6075 or id == 10645)
const targetIds = new Set();
for (const p of posts) {
  const d = p.date || '';
  if (d.startsWith('2025-') || d.startsWith('2026-01') || d.startsWith('2026-02') || (d.startswith && d.startswith('2026-03') && p.id <= 6075) || (d.startsWith('2026-03') && p.id <= 6075) || p.id === 10645) {
    targetIds.add(p.id);
  }
}

console.log(`Identified ${targetIds.size} target posts to fetch original images for.`);

const tempDir = path.resolve('temp_downloads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Map each post to its original URL
const items = [];
for (const p of rawPosts) {
  if (targetIds.has(p.id)) {
    let sourceUrl = null;
    if (p._embedded && p._embedded['wp:featuredmedia'] && p._embedded['wp:featuredmedia'][0]) {
      sourceUrl = p._embedded['wp:featuredmedia'][0].source_url;
    }
    if (sourceUrl) {
      items.push({ id: p.id, url: sourceUrl });
    }
  }
}

console.log(`Found ${items.length} items with original source URLs.`);

// Download with concurrency 8
const CONCURRENCY = 8;
let completed = 0;
let success = 0;
let failed = 0;

async function downloadOne(item) {
  const cdnUrl = `https://i0.wp.com/${item.url.replace(/^https?:\/\//, '')}`;
  const outPath = path.join(tempDir, `${item.id}.jpg`);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(cdnUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(outPath, Buffer.from(buffer));
      success++;
      return;
    } catch (e) {
      if (attempt === 2) {
        failed++;
        console.error(`Failed ${item.id} (${cdnUrl}): ${e.message}`);
      } else {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
}

async function run() {
  const queue = [...items];
  const workers = Array(CONCURRENCY).fill(0).map(async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      await downloadOne(item);
      completed++;
      if (completed % 20 === 0 || completed === items.length) {
        console.log(`Progress: ${completed}/${items.length} (Success: ${success}, Failed: ${failed})`);
      }
    }
  });

  await Promise.all(workers);
  console.log(`Download finished! Total success: ${success}, Failed: ${failed}`);
}

run();
