import fs from 'fs';

const home = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');
const regex = /src=\{?['"]([^'"{}]+)['"]\}?/g;
let match;
const images = [];
while ((match = regex.exec(home)) !== null) {
  images.push(match[1]);
}
console.log('Static images in HomePage:', images);
images.forEach(img => {
  if (img.startsWith('/')) {
    const p = 'public' + img;
    console.log(img, fs.existsSync(p) ? 'EXISTS' : 'MISSING');
  }
});
