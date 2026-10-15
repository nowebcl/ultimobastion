import json
import re

with open('data/pages.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

for p in ['mapas', 'contacto', 'emprendimientos-2']:
    html = pages[p].get('raw_html', '')
    print(f"=== {p} ===")
    iframes = re.findall(r'<iframe[^>]+src=[\'"]([^\'"]+)[\'"]', html, re.I)
    print("Iframes:", iframes)
    links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html, re.I)
    map_links = [l for l in links if 'map' in l.lower() or 'google' in l.lower()]
    print("Map links:", map_links)
