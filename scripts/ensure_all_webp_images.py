import json
import os
from PIL import Image, ImageDraw, ImageFont

def get_category_color(cat_slug):
    colors = {
        'cultura-comunidad': ('#1e3a8a', '#3b82f6'),
        'deporte': ('#14532d', '#22c55e'),
        'salud': ('#701a75', '#d946ef'),
        'educacion': ('#831843', '#ec4899'),
        'proyectos': ('#0c4a6e', '#0284c7'),
        'fomento': ('#713f12', '#eab308'),
        'turismo': ('#134e4a', '#14b8a6'),
        'seguridad': ('#7f1d1d', '#ef4444'),
        'regional': ('#1e293b', '#64748b')
    }
    return colors.get(cat_slug, ('#002b49', '#0284c7'))

def create_placeholder(dest_path, category_name, category_slug):
    c1, c2 = get_category_color(category_slug)
    img = Image.new('RGB', (800, 500), color=c1)
    draw = ImageDraw.Draw(img)
    
    # Bottom accent bar
    draw.rectangle([0, 475, 800, 500], fill=c2)
    # Subtle inner border
    draw.rectangle([20, 20, 780, 480], outline=c2, width=2)
    
    img.save(dest_path, format='WEBP', quality=75)

def main():
    with open('src/data/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    existing = set(os.listdir('public/images/posts'))
    created = 0

    for p in posts:
        fname = f"{p['id']}.webp"
        if fname not in existing:
            dest = f"public/images/posts/{fname}"
            cat_slug = p['categories'][0]['slug'] if p['categories'] else 'general'
            cat_name = p['categories'][0]['name'] if p['categories'] else 'Maullín'
            create_placeholder(dest, cat_name, cat_slug)
            created += 1

    print(f"Total posts: {len(posts)}")
    print(f"Created category-themed WebP placeholders for {created} posts.")
    total_webps = len([f for f in os.listdir('public/images/posts') if f.endswith('.webp')])
    print(f"Total WebP images in public/images/posts: {total_webps} (100% coverage!)")

if __name__ == '__main__':
    main()
