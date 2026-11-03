#!/usr/bin/env python3
"""Download the CC0 Poly Haven assets listed in assets.json into a cache dir (stdlib only; skips files already there).
Layout: <dir>/hdri/<id>.hdr, <dir>/tex/<id>/<map>.jpg, <dir>/models/<id>/<id>.gltf (+ its textures)."""
import json, os, sys, urllib.request, time
D = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/ia3d_assets')
M = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets.json')))
UA = {'User-Agent': 'ia-real3d/1.0'}
def get(url, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0: return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r, open(dst + '.tmp', 'wb') as f:
                f.write(r.read())
            os.replace(dst + '.tmp', dst); print('got', dst); return
        except Exception as e:
            print('retry', url, e); time.sleep(3 * (k + 1))
    print('FAILED', url)
def files(aid):
    p = os.path.join(D, '_api', aid + '.json')
    if not os.path.exists(p): get('https://api.polyhaven.com/files/' + aid, p)
    return json.load(open(p))
for h in M.get('hdris', []):
    f = files(h['id']); get(f['hdri'][h['res']]['hdr']['url'], os.path.join(D, 'hdri', h['id'] + '.hdr'))
for t in M.get('textures', []):
    f = files(t['id'])
    for m in t['maps']:
        e = f[m][t['res']]; u = (e.get('jpg') or e.get('png'))['url']
        get(u, os.path.join(D, 'tex', t['id'], m + os.path.splitext(u)[1]))
for m in M.get('models', []):
    g = files(m['id'])['gltf'][m['res']]['gltf']; base = os.path.join(D, 'models', m['id'])
    get(g['url'], os.path.join(base, m['id'] + '.gltf'))
    for rel, inc in g.get('include', {}).items(): get(inc['url'], os.path.join(base, rel))
print('assets ok', D)
