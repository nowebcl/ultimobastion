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

def download_and_convert(item):
    pid, url = item
    dest_path = f"public/images/posts/{pid}.webp"
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return pid, True

    if not url:
        return pid, False

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            data = urllib.request.urlopen(req, timeout=35).read()
            img = Image.open(io.BytesIO(data))
            
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
            return pid, True
        except Exception as e:
            time.sleep(1.5 * (attempt + 1))
            
    return pid, False

def main():
    with open('src/data/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    existing = set(os.listdir('public/images/posts'))
    missing = []
    for p in posts:
        expected = f"{p['id']}.webp"
        if expected not in existing and p.get('remoteImage'):
            missing.append((p['id'], p['remoteImage']))

    print(f"Missing images to retry: {len(missing)}")
    if not missing:
        print("All images are already present!")
        return

    success_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(download_and_convert, item): item for item in missing}
        for future in concurrent.futures.as_completed(futures):
            pid, success = future.result()
            if success:
                success_count += 1
            if success_count % 30 == 0:
                print(f"Retried progress: {success_count}/{len(missing)} successfully converted.")

    print(f"Completed retry: {success_count}/{len(missing)} newly converted.")

if __name__ == '__main__':
    main()
