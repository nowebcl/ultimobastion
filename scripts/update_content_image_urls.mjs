import fs from 'fs';

console.log('Loading src/data/posts.json...');
let content = fs.readFileSync('src/data/posts.json', 'utf8');

const regex1 = /https:\/\/maullinultimobastion\.cl\/wp-content\/uploads\//g;
const regex2 = /http:\/\/maullinultimobastion\.cl\/wp-content\/uploads\//g;

const matches1 = (content.match(regex1) || []).length;
const matches2 = (content.match(regex2) || []).length;

console.log(`Found ${matches1} https and ${matches2} http upload occurrences.`);

content = content.replace(regex1, 'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/');
content = content.replace(regex2, 'https://i0.wp.com/maullinultimobastion.cl/wp-content/uploads/');

// Clean aggressive inline onerror that hid valid images before CDN could load
content = content.replace(/onerror="this\.onerror=null; \(this\.closest\('figure'\) \|\| this\)\.style\.display='none';"/g, '');

fs.writeFileSync('src/data/posts.json', content, 'utf8');
console.log('Successfully updated src/data/posts.json with i0.wp.com CDN URLs!');
