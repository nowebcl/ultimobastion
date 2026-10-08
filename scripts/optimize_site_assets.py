import urllib.request
import io
import os
import json
from PIL import Image

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def optimize_image(url, output_path, max_width=900, quality=72, transparent=False):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        data = urllib.request.urlopen(req, timeout=30).read()
        img = Image.open(io.BytesIO(data))
        
        # Resize if width > max_width
        if img.width > max_width:
            w_percent = max_width / float(img.width)
            h_size = int(float(img.height) * float(w_percent))
            img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
        
        if transparent or img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert('RGBA')
            img.save(output_path, format='WEBP', quality=quality, method=6)
        else:
            img = img.convert('RGB')
            img.save(output_path, format='WEBP', quality=quality, method=6)
        
        orig_kb = len(data) / 1024.0
        new_kb = os.path.getsize(output_path) / 1024.0
        print(f"Optimized: {os.path.basename(output_path)} ({orig_kb:.1f}KB -> {new_kb:.1f}KB, {(1-new_kb/orig_kb)*100:.1f}% saved)")
        return True
    except Exception as e:
        print(f"Error optimizing {url}: {e}")
        return False

def main():
    os.makedirs('public/images/site', exist_ok=True)
    os.makedirs('public/images/maps', exist_ok=True)

    # 1. Main Logo
    logo_url = 'https://maullinultimobastion.cl/wp-content/uploads/2025/11/logo-final-color-transparente-1024x254.png'
    optimize_image(logo_url, 'public/images/site/logo.webp', max_width=600, quality=80, transparent=True)

    # 2. Banners
    banner1 = 'https://maullinultimobastion.cl/wp-content/uploads/2025/11/Recurso-1-scaled.webp'
    banner2 = 'https://maullinultimobastion.cl/wp-content/uploads/2025/11/Recurso-2.webp'
    optimize_image(banner1, 'public/images/site/banner-1.webp', max_width=800, quality=70)
    optimize_image(banner2, 'public/images/site/banner-2.webp', max_width=800, quality=70)

    # 3. Quienes somos & Emprendimientos
    quienes_url = 'https://maullinultimobastion.cl/wp-content/uploads/2026/01/172690ad-5038-4f89-a410-dc7ffff6cf72.jpg'
    optimize_image(quienes_url, 'public/images/site/quienes-somos.webp', max_width=800, quality=72)
    
    emp_url = 'https://maullinultimobastion.cl/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-16-at-18.58.59-300x200.jpeg'
    optimize_image(emp_url, 'public/images/site/derniere-restobar.webp', max_width=500, quality=72)

    # 4. Map images
    try:
        with open('data/pages.json', 'r', encoding='utf-8') as f:
            pages = json.load(f)
        map_imgs = pages.get('mapas', {}).get('images', [])
        print(f"Optimizing {len(map_imgs)} map images...")
        for i, m_url in enumerate(map_imgs):
            out_file = f"public/images/maps/map-{i+1}.webp"
            optimize_image(m_url, out_file, max_width=900, quality=70)
    except Exception as e:
        print(f"Error reading maps: {e}")

    print("Site assets optimization completed!")

if __name__ == '__main__':
    main()
