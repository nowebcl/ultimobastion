import urllib.request
import json
import concurrent.futures
import time
import os

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def fetch_category_map():
    url = "https://maullinultimobastion.cl/wp-json/wp/v2/categories?per_page=100"
    req = urllib.request.Request(url, headers=HEADERS)
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    cat_map = {}
    for c in data:
        cat_map[c['id']] = {
            'id': c['id'],
            'name': c['name'],
            'slug': c['slug'],
            'count': c['count']
        }
    return cat_map

def fetch_page(page_num):
    url = f"https://maullinultimobastion.cl/wp-json/wp/v2/posts?per_page=100&page={page_num}&_embed=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        t0 = time.time()
        res = urllib.request.urlopen(req, timeout=90)
        posts = json.loads(res.read().decode('utf-8'))
        print(f"Page {page_num}: fetched {len(posts)} posts in {time.time() - t0:.1f}s")
        return posts
    except Exception as e:
        print(f"Error fetching page {page_num}: {e}")
        return []

def main():
    os.makedirs('data', exist_ok=True)
    print("Fetching categories...")
    cat_map = fetch_category_map()
    with open('data/categories.json', 'w', encoding='utf-8') as f:
        json.dump(cat_map, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(cat_map)} categories.")

    print("Fetching all 8 pages of posts in parallel...")
    all_posts = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fetch_page, p): p for p in range(1, 9)}
        for future in concurrent.futures.as_completed(futures):
            posts = future.result()
            all_posts.extend(posts)

    print(f"Total raw posts fetched: {len(all_posts)}")
    
    # Sort posts by date descending
    all_posts.sort(key=lambda x: x.get('date', ''), reverse=True)

    with open('data/raw_posts.json', 'w', encoding='utf-8') as f:
        json.dump(all_posts, f, ensure_ascii=False)
    print("Saved data/raw_posts.json successfully.")

if __name__ == '__main__':
    main()
