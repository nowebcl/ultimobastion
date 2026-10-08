import fs from 'fs';
import path from 'path';

console.log('Splitting posts.json into individual lightweight files...');
const posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

const outDir = path.resolve('public/data/posts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let written = 0;
for (const p of posts) {
  const filePath = path.join(outDir, `${p.id}.json`);
  // Each file only needs content and id/slug/title
  const singlePost = {
    id: p.id,
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    categories: p.categories,
    author: p.author,
    image: p.image,
    content: p.content
  };
  fs.writeFileSync(filePath, JSON.stringify(singlePost), 'utf8');
  written++;
}

console.log(`Successfully split ${written} posts into public/data/posts/*.json!`);
