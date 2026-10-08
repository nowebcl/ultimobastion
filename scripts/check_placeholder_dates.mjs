import fs from 'fs';

const posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

const tiny = [];
posts.forEach(p => {
  const file = 'public/images/posts/' + p.id + '.webp';
  if (fs.existsSync(file) && fs.statSync(file).size < 4000) {
    tiny.push(p);
  }
});

console.log('Total placeholders:', tiny.length);
const dates = tiny.map(p => p.date ? p.date.slice(0, 7) : 'no-date');
const freq = {};
dates.forEach(d => { freq[d] = (freq[d] || 0) + 1; });
console.log('Distribution of placeholders by month:', freq);
