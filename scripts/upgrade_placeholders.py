import json
import os
from PIL import Image, ImageDraw, ImageFont

SCENIC_SOURCES = [
    'public/images/site/gallery-6.webp', # Humedal & Atardecer
    'public/images/site/gallery-2.webp', # Muelle Costanera
    'public/images/site/gallery-5.webp', # Botes y Caleta
    'public/images/site/gallery-3.webp', # Campo y Rural
    'public/images/site/gallery-4.webp', # Carelmapu Iglesia
    'public/images/site/gallery-1.webp', # Deportes Costero
    'public/images/site/banner-panorama.webp', # Panorámica Maullín
]

def load_scenic_images():
    imgs = []
    for src in SCENIC_SOURCES:
        if os.path.exists(src):
            imgs.append(Image.open(src).convert('RGB'))
    return imgs

def create_scenic_card(base_img, dest_path, title, category_name):
    target_w, target_h = 800, 500
    
    # Aspect-fit crop to 800x500
    img_ratio = base_img.width / float(base_img.height)
    target_ratio = target_w / float(target_h)
    
    if img_ratio > target_ratio:
        new_w = int(base_img.height * target_ratio)
        offset = (base_img.width - new_w) // 2
        cropped = base_img.crop((offset, 0, offset + new_w, base_img.height))
    else:
        new_h = int(base_img.width / target_ratio)
        offset = (base_img.height - new_h) // 2
        cropped = base_img.crop((0, offset, base_img.width, offset + new_h))
        
    resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Overlay gradient at the bottom for editorial polish
    overlay = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Dark gradient from y=380 to 500
    for y in range(360, 500):
        alpha = int(180 * ((y - 360) / 140.0))
        draw.line([(0, y), (target_w, y)], fill=(0, 20, 35, alpha))
        
    # Top badge for context
    draw.rectangle([25, 25, 240, 55], fill=(0, 43, 73, 210))
    
    # Combined with base image
    final_img = Image.alpha_composite(resized.convert('RGBA'), overlay).convert('RGB')
    
    # Save optimized WebP
    final_img.save(dest_path, format='WEBP', quality=75, method=6)

def main():
    with open('src/data/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    scenics = load_scenic_images()
    print(f"Loaded {len(scenics)} scenic source images.")
    
    upgraded = 0
    for idx, p in enumerate(posts):
        dest = f"public/images/posts/{p['id']}.webp"
        if os.path.exists(dest) and os.path.getsize(dest) < 4000:
            # Pick a scenic base deterministically
            base = scenics[(p['id'] + idx) % len(scenics)]
            cat_name = p['categories'][0]['name'] if p.get('categories') else 'Maullín'
            create_scenic_card(base, dest, p.get('title', ''), cat_name)
            upgraded += 1
            
    print(f"Successfully upgraded {upgraded} placeholder posts to real scenic Maullín photography!")
    
    # Also upgrade default-news.webp
    create_scenic_card(scenics[0], 'public/images/default-news.webp', 'Último Bastión', 'Noticias')
    print("Upgraded public/images/default-news.webp to scenic Maullín photography.")

if __name__ == '__main__':
    main()
