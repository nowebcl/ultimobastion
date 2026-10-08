import fs from 'fs';

const posts = JSON.parse(fs.readFileSync('src/data/posts_index.json', 'utf8'));

let corrupted = 0;
let valid = 0;

posts.forEach(p => {
  const filePath = 'public' + p.image;
  try {
    const buffer = fs.readFileSync(filePath);
    // WebP header starts with RIFF and WEBP
    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
    if (isRiff && isWebp && buffer.length > 500) {
      valid++;
    } else {
      corrupted++;
      console.log('Not valid webp:', p.id, filePath, buffer.length);
    }
  } catch (err) {
    corrupted++;
    console.log('Error reading:', p.id, filePath, err.message);
  }
});

console.log({ total: posts.length, valid, corrupted });
