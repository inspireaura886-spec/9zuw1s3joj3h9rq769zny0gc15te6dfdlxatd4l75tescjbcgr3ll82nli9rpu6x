"""List titles of recent public IA Shorts (no login). Used by post.py to block re-posting a title already live (2026-10-28 Woolpit duplicate)."""
import re, json, urllib.request
def _get(u):
    r = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en', 'Cookie': 'CONSENT=YES+1'})
    return urllib.request.urlopen(r, timeout=20).read().decode('utf8', 'ignore')
def titles(n=40):
    s = _get('https://www.youtube.com/@ia.unfolds/shorts')
    ids = []
    for i in re.findall(r'"videoId":"([\w-]{11})"', s):
        if i not in ids: ids.append(i)
    out = {}
    for i in ids[:n]:
        try: out[i] = json.loads(_get(f'https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/{i}&format=json'))['title']
        except Exception: pass
    return out
norm = lambda t: re.sub(r'[^a-z0-9]', '', t.lower().replace('#shorts', ''))
if __name__ == '__main__':
    for k, v in titles().items(): print(k, v)
