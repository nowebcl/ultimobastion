import fs from 'fs';

const rawPosts = JSON.parse(fs.readFileSync('data/raw_posts.json', 'utf8'));

let withFeaturedMedia = 0;
let withoutFeaturedMedia = 0;
let sampleWithout = [];

rawPosts.forEach(p => {
  let url = null;
  if (p._embedded && p._embedded['wp:featuredmedia']) {
    const fm = p._embedded['wp:featuredmedia'];
    if (fm && fm.length > 0 && fm[0].source_url) {
      url = fm[0].source_url;
    }
  }

  if (url) {
    withFeaturedMedia++;
  } else {
    withoutFeaturedMedia++;
    if (sampleWithout.length < 5) {
      sampleWithout.push({
        id: p.id,
        title: p.title?.rendered,
        featured_media_id: p.featured_media,
        hasEmbedded: !!p._embedded,
        embeddedKeys: p._embedded ? Object.keys(p._embedded) : [],
        fmRaw: p._embedded?.['wp:featuredmedia']
      });
    }
  }
});

console.log({
  totalRawPosts: rawPosts.length,
  withFeaturedMedia,
  withoutFeaturedMedia
});
console.log('Sample without:', JSON.stringify(sampleWithout, null, 2));
