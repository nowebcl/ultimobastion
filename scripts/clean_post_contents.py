import json
import re
from bs4 import BeautifulSoup

def sanitize_content(html_str):
    if not html_str:
        return ""

    soup = BeautifulSoup(html_str, 'html.parser')

    # 1. Remove the first figure if it appears before text (avoids repeating featured image)
    first_child = None
    for child in soup.children:
        if child.name:
            first_child = child
            break

    if first_child and first_child.name == 'figure':
        first_child.decompose()

    # 2. Clean all images inside content
    for img in soup.find_all('img'):
        # Delete hardcoded width and height attributes that force browsers to reserve massive blank boxes
        if img.has_attr('width'):
            del img['width']
        if img.has_attr('height'):
            del img['height']
        if img.has_attr('sizes'):
            del img['sizes']
        
        img['loading'] = 'lazy'
        # Fallback to collapse figure if remote WordPress image times out
        img['onerror'] = "this.onerror=null; (this.closest('figure') || this).style.display='none';"

    # 3. Clean empty paragraphs, figures, headers
    for tag in soup.find_all(['figure', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']):
        # If tag has no text (or only whitespace/nbsp) and no images, remove it
        tag_text = tag.get_text(strip=True).replace('\xa0', '').replace('&nbsp;', '')
        if not tag_text and not tag.find_all('img'):
            tag.decompose()

    # 4. Clean empty galleries
    for gallery in soup.find_all(['figure', 'ul', 'div'], class_=re.compile(r'gallery', re.I)):
        if not gallery.find_all('img'):
            gallery.decompose()

    cleaned = str(soup)
    # Remove repeated breaks and newlines
    cleaned = re.sub(r'(?:<br\s*/?>\s*){2,}', '<br/>', cleaned)
    return cleaned.strip()

def main():
    print("Reading src/data/posts.json...")
    with open('src/data/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)

    print(f"Cleaning contents for {len(posts)} posts...")
    cleaned_count = 0
    for p in posts:
        orig = p.get('content', '')
        p['content'] = sanitize_content(orig)
        cleaned_count += 1

    print("Saving cleaned src/data/posts.json...")
    with open('src/data/posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False)

    print("Successfully sanitized all 701 posts content!")

if __name__ == '__main__':
    main()
