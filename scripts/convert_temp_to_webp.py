import os
import glob
from PIL import Image

def main():
    files = glob.glob('temp_downloads/*.jpg')
    print(f"Converting {len(files)} downloaded original images to WebP...")
    
    converted = 0
    for fpath in files:
        fname = os.path.basename(fpath)
        pid = fname.replace('.jpg', '')
        dest = f"public/images/posts/{pid}.webp"
        
        try:
            img = Image.open(fpath)
            
            # Max width 800px for optimal balance of sharpness & minimum weight
            if img.width > 800:
                w_percent = 800 / float(img.width)
                h_size = int(float(img.height) * float(w_percent))
                img = img.resize((800, h_size), Image.Resampling.LANCZOS)
                
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img = img.convert('RGBA')
                img.save(dest, format='WEBP', quality=70, method=6)
            else:
                img = img.convert('RGB')
                img.save(dest, format='WEBP', quality=68, method=6)
                
            converted += 1
            if converted % 50 == 0 or converted == len(files):
                print(f"Converted {converted}/{len(files)} to WebP")
        except Exception as e:
            print(f"Error converting {fpath}: {e}")
            
    print(f"Done! Successfully converted {converted} images to public/images/posts/*.webp")

if __name__ == '__main__':
    main()
