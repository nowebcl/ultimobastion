import urllib.request
import json
from bs4 import BeautifulSoup
import os

pages = ['inicio', 'histo', 'mapas', 'emprendimientos-2', 'quienes-somos', 'contacto']

for slug in pages:
    url = f"https://maullinultimobastion.cl/wp-json/wp/v2/pages?slug={slug}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        if data:
            p = data[0]
            soup = BeautifulSoup(p['content']['rendered'], 'html.parser')
            text = soup.get_text(' ', strip=True)
            imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
            print(f"=== PAGE: {slug.upper()} ===")
            print(f"Title: {p['title']['rendered']}")
            print(f"Text snippet: {text[:300]}")
            print(f"Images count: {len(imgs)}")
            print(f"Sample images: {imgs[:4]}")
            print("-----------------------------------------")
    except Exception as e:
        print(f"Error fetching {slug}: {e}")
