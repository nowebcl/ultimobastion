const fs = require('fs');

const posts = JSON.parse(fs.readFileSync('src/data/posts.json', 'utf8'));

let postsWithUploads = 0;
let totalUploadUrls = 0;
const allUrls = new Set();

posts.forEach(p => {
  if (p.content) {
    const matches = p.content.match(/https:\/\/maullinultimobastion\.cl\/wp-content\/uploads\/[^\s"'>]+/g);
    if (matches && matches.length > 0) {
      postsWithUploads++;
      totalUploadUrls += matches.length;
      matches.forEach(m => allUrls.add(m));
    }
  }
});

console.log({
  totalPosts: posts.length,
  postsWithUploads,
  totalUploadUrls,
  uniqueUploadUrls: allUrls.size
});
