from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('public/images', exist_ok=True)
dest = 'public/images/default-news.webp'

if not os.path.exists(dest):
    # Create an elegant deep navy gradient placeholder
    img = Image.new('RGB', (800, 500), color='#002b49')
    draw = ImageDraw.Draw(img)
    
    # Draw simple subtle geometric accent
    draw.rectangle([0, 480, 800, 500], fill='#0284c7')
    
    img.save(dest, format='WEBP', quality=75)
    print(f"Created fallback image at {dest}")
else:
    print(f"Fallback image already exists at {dest}")
