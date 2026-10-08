import urllib.request
import json
import io
import os
import re
import concurrent.futures
from bs4 import BeautifulSoup
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def clean_html(text):
    if not text:
        return ""
    # Strip dangerous scripts or weird Elementor wrappers if needed
    return text.strip()

def clean_excerpt(excerpt_html):
    if not excerpt_html:
        return ""
    soup = BeautifulSoup(excerpt_html, 'html.parser')
    text = soup.get_text(' ', strip=True)
    # clean [&#8230;] or &hellip;
    text = re.sub(r'\[&hellip;\]|\[\.\.\.\]|&hellip;', '...', text)
    return text.strip()

def process_single_image(post_id, url):
    dest_path = f"public/images/posts/{post_id}.webp"
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return post_id, f"/images/posts/{post_id}.webp", True

    if not url:
        return post_id, None, False

    try:
        req = urllib.request.Request(url, headers=HEADERS)
        data = urllib.request.urlopen(req, timeout=20).read()
        img = Image.open(io.BytesIO(data))
        
        # Max width 800px for optimal balance of razor sharpness & minimum weight
        if img.width > 800:
            w_percent = 800 / float(img.width)
            h_size = int(float(img.height) * float(w_percent))
            img = img.resize((800, h_size), Image.Resampling.LANCZOS)
        
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
            img.save(dest_path, format='WEBP', quality=70, method=6)
        else:
            img = img.convert('RGB')
            img.save(dest_path, format='WEBP', quality=68, method=6)
            
        return post_id, f"/images/posts/{post_id}.webp", True
    except Exception as e:
        # Fallback if specific image fails download
        return post_id, None, False

def main():
    os.makedirs('public/images/posts', exist_ok=True)
    os.makedirs('src/data', exist_ok=True)

    print("Loading raw posts and categories...")
    with open('data/raw_posts.json', 'r', encoding='utf-8') as f:
        raw_posts = json.load(f)

    with open('data/categories.json', 'r', encoding='utf-8') as f:
        cat_map = json.load(f)

    print(f"Total posts to process: {len(raw_posts)}")

    # Collect images to download
    items_to_download = []
    for p in raw_posts:
        pid = p['id']
        url = None
        if '_embedded' in p and 'wp:featuredmedia' in p['_embedded']:
            fm = p['_embedded']['wp:featuredmedia']
            if fm and len(fm) > 0 and 'source_url' in fm[0]:
                url = fm[0]['source_url']
        items_to_download.append((pid, url))

    print(f"Starting parallel download and WebP optimization with 16 workers...")
    image_results = {}
    completed_count = 0
    total = len(items_to_download)

    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(process_single_image, pid, url): pid for pid, url in items_to_download}
        for future in concurrent.futures.as_completed(futures):
            pid, local_webp, success = future.result()
            image_results[pid] = local_webp
            completed_count += 1
            if completed_count % 100 == 0 or completed_count == total:
                print(f"Progress: {completed_count}/{total} images processed ({(completed_count/total)*100:.1f}%)")

    # Build clean posts dataset
    processed_posts = []
    compact_index = []

    for p in raw_posts:
        pid = p['id']
        slug = p['slug']
        title = BeautifulSoup(p['title']['rendered'], 'html.parser').get_text(strip=True)
        date = p.get('date', '')
        modified = p.get('modified', '')
        excerpt = clean_excerpt(p.get('excerpt', {}).get('rendered', ''))
        raw_content = p.get('content', {}).get('rendered', '')
        
        # Get category objects
        post_cats = []
        for cid in p.get('categories', []):
            cid_str = str(cid)
            if cid_str in cat_map:
                c = cat_map[cid_str]
                post_cats.append({'id': c['id'], 'name': c['name'], 'slug': c['slug']})
        
        # Fallback category if empty
        if not post_cats:
            post_cats.append({'id': 1, 'name': 'General', 'slug': 'general'})

        author_name = "Redacción Último Bastión"
        if '_embedded' in p and 'author' in p['_embedded'] and len(p['_embedded']['author']) > 0:
            author_name = p['_embedded']['author'][0].get('name', author_name)

        # Image path
        img_path = image_results.get(pid)
        remote_img = None
        if '_embedded' in p and 'wp:featuredmedia' in p['_embedded']:
            fm = p['_embedded']['wp:featuredmedia']
            if fm and len(fm) > 0:
                remote_img = fm[0].get('source_url')

        post_obj = {
            'id': pid,
            'slug': slug,
            'title': title,
            'date': date,
            'modified': modified,
            'excerpt': excerpt,
            'content': raw_content,
            'categories': post_cats,
            'author': author_name,
            'image': img_path if img_path else f"/images/posts/{pid}.webp",
            'remoteImage': remote_img
        }
        processed_posts.append(post_obj)

        compact_index.append({
            'id': pid,
            'slug': slug,
            'title': title,
            'date': date,
            'excerpt': excerpt[:160] + ('...' if len(excerpt) > 160 else ''),
            'categories': post_cats,
            'author': author_name,
            'image': img_path if img_path else f"/images/posts/{pid}.webp"
        })

    # Save to src/data/
    print("Saving processed posts to src/data/...")
    with open('src/data/posts.json', 'w', encoding='utf-8') as f:
        json.dump(processed_posts, f, ensure_ascii=False)

    with open('src/data/posts_index.json', 'w', encoding='utf-8') as f:
        json.dump(compact_index, f, ensure_ascii=False)

    with open('src/data/categories.json', 'w', encoding='utf-8') as f:
        json.dump(list(cat_map.values()), f, ensure_ascii=False, indent=2)

    posts_file_size = os.path.getsize('src/data/posts.json') / (1024 * 1024)
    index_file_size = os.path.getsize('src/data/posts_index.json') / 1024
    print(f"Saved {len(processed_posts)} posts: posts.json is {posts_file_size:.2f}MB, posts_index.json is {index_file_size:.1f}KB")
    print("Done!")

if __name__ == '__main__':
    main()
