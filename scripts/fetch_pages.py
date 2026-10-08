import urllib.request
import json
from bs4 import BeautifulSoup
import os

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

pages_to_fetch = [
    {'slug': 'inicio', 'title': 'Inicio'},
    {'slug': 'histo', 'title': 'Historia'},
    {'slug': 'mapas', 'title': 'Mapas'},
    {'slug': 'emprendimientos-2', 'title': 'Emprendimientos'},
    {'slug': 'quienes-somos', 'title': 'Quiénes Somos'},
    {'slug': 'contacto', 'title': 'Contacto'}
]

results = {}

for p in pages_to_fetch:
    slug = p['slug']
    url = f"https://maullinultimobastion.cl/wp-json/wp/v2/pages?slug={slug}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        if data:
            page_data = data[0]
            rendered_html = page_data['content']['rendered']
            soup = BeautifulSoup(rendered_html, 'html.parser')
            
            # Collect images
            images = []
            for img in soup.find_all('img'):
                src = img.get('src')
                if src:
                    images.append(src)
            
            results[slug] = {
                'id': page_data['id'],
                'slug': slug,
                'title': page_data['title']['rendered'],
                'raw_html': rendered_html,
                'clean_text': soup.get_text('\n', strip=True),
                'images': list(set(images))
            }
            print(f"Processed page: {slug} ({len(results[slug]['images'])} images)")
    except Exception as e:
        print(f"Error fetching page {slug}: {e}")

with open('data/pages.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Saved data/pages.json successfully.")
