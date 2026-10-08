import json
import os
import urllib.request
import io
import time
import concurrent.futures
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def get_cdn_url(orig_url):
    # Strip protocol
    clean = orig_url.replace('https://', '').replace('http://', '')
    return f"https://i0.wp.com/{clean}"

def download_and_convert_post(item):
    pid, orig_url = item
    dest_path = f"public/images/posts/{pid}.webp"
    
    cdn_url = get_cdn_url(orig_url)
    
    for attempt in range(3):
        try:
            req = urllib.request.Request(cdn_url, headers=HEADERS)
            data = urllib.request.urlopen(req, timeout=30).read()
            img = Image.open(io.BytesIO(data))
            
            # Max width 800px for optimal balance of sharpness and minimum weight
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
                
            return pid, True, len(data), os.path.getsize(dest_path)
        except Exception as e:
            time.sleep(1.0 * (attempt + 1))
            
    return pid, False, 0, 0

def main():
    with open('data/raw_posts.json', 'r', encoding='utf-8') as f:
        raw_posts = json.load(f)

    # Find the 229 posts that were previously placeholders or all posts needing refresh
    # We have all raw_posts
    items = []
    for p in raw_posts:
        pid = p['id']
        url = None
        if '_embedded' in p and 'wp:featuredmedia' in p['_embedded']:
            fm = p['_embedded']['wp:featuredmedia']
            if fm and len(fm) > 0 and 'source_url' in fm[0]:
                url = fm[0]['source_url']
        if url:
            items.append((pid, url))

    print(f"Total posts with original source URLs: {len(items)}")

    # Check which ones are from the 229 placeholder batch
    # In check_placeholder_dates earlier, those were from months 2026-06, 2026-03, 2026-02, 2026-01, 2025-12, 2025-11
    # We can download all items whose date is <= 2026-03 or just all 229
    # Let's inspect which ones were upgraded by upgrade_placeholders.py
    # Actually, we can check all items whose file was written recently or just download all 229!
    with open('src/data/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    target_ids = set()
    for p in posts:
        # Check date: the 229 posts were: 2026-06 (1), 2026-03 (6), 2026-02 (59), 2026-01 (71), 2025-12 (46), 2025-11 (46)
        d = p.get('date', '')
        if d.startswith('2025-') or d.startswith('2026-01') or d.startswith('2026-02') or (d.startswith('2026-03') and p['id'] <= 6075) or p['id'] == 10645:
            target_ids.add(p['id'])

    print(f"Targeting {len(target_ids)} original posts to download via WordPress CDN...")

    items_to_download = [it for it in items if it[0] in target_ids]
    print(f"Items to download: {len(items_to_download)}")

    success_count = 0
    fail_count = 0
    total = len(items_to_download)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_and_convert_post, it): it for it in items_to_download}
        for future in concurrent.futures.as_completed(futures):
            pid, success, orig_size, new_size = future.result()
            if success:
                success_count += 1
            else:
                fail_count += 1
            if (success_count + fail_count) % 25 == 0 or (success_count + fail_count) == total:
                print(f"Progress: {success_count + fail_count}/{total} (Success: {success_count}, Failed: {fail_count})")

    print(f"\nCompleted! Total downloaded & converted: {success_count}/{total}")

if __name__ == '__main__':
    main()
