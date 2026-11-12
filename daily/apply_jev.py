#!/usr/bin/env python3
"""Apply Jev's packaging/style choices to the day's plans (advisory; any invalid change is reverted).
usage: python3 daily/apply_jev.py daily/work/<slugA> [daily/work/<slugB>]
- narrators: Jev picks which Short gets narrator_m (the other narrator_f) -> alternation is kept
- per Short: title (from titles.json candidates), frame-0 hook text (shot 0 head), caption palette (different from the
  other Short), synth sound bed. Writes daily/work/<slug>/jev_package.json. Missing JEV_API_KEY = nothing changes."""
import json, os, shutil, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(D)
def jev(*a, env=None):
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'jev.py')] + list(a), capture_output=True, text=True, env=env)
    if r.stderr.strip(): print(r.stderr.strip()[-300:], file=sys.stderr)
    try: return json.loads(r.stdout.strip().splitlines()[-1])
    except Exception: return {'ok': False}
def valid(w): return subprocess.run([sys.executable, os.path.join(D, 'validate.py'), w], capture_output=True).returncode == 0
W = sys.argv[1:]
if len(W) == 2:
    n = jev('narrators', *W); print('narrators', json.dumps(n)[:300])
    if n.get('ok'):
        for w in W:
            p = json.load(open(w + '/plan.json')); p['narrator'] = 'narrator_m' if p['slug'] == n['male'] else 'narrator_f'
            json.dump(p, open(w + '/plan.json', 'w'), indent=1)
used = []
for w in W:
    pf = w + '/plan.json'; shutil.copy(pf, pf + '.bak'); tf = w + '/yt_title.txt'; shutil.copy(tf, tf + '.bak')
    env = dict(os.environ, OTHER_SCHEME=','.join(used))
    r = jev('package', w, env=env); print('package', w, json.dumps(r)[:400])
    json.dump(r, open(w + '/jev_package.json', 'w'), indent=1)
    p = json.load(open(pf))
    if r.get('ok'):
        if r.get('palette') and r['palette'] not in used: p['scheme'] = r['palette']
        if r.get('bed') in ('heartbeat', 'drone'): p['bed'] = r['bed']
        if r.get('thumb'):
            words = r['thumb'].split(); half = (len(words) + 1) // 2
            head = [' '.join(words[:half]), ' '.join(words[half:])] if len(words) > 2 else [r['thumb']]
            if all(len(h) <= 22 for h in head if h): p['shots'][0]['head'] = [h for h in head if h]; p['thumb_text'] = r['thumb']
        if r.get('title'): open(tf, 'w').write(r['title'].strip() + '\n')
        json.dump(p, open(pf, 'w'), indent=1)
        if not valid(w):
            print('jev choices broke validation, reverted', w); shutil.copy(pf + '.bak', pf); shutil.copy(tf + '.bak', tf)
    used.append(json.load(open(pf))['scheme'])
    os.remove(pf + '.bak'); os.remove(tf + '.bak')
if len(W) == 2:
    a, b = [json.load(open(w + '/plan.json')) for w in W]
    if a['narrator'] == b['narrator']: print('narrator clash; resetting to A=m, B=f')
    for w, n in zip(W, ['narrator_m', 'narrator_f'] if a['narrator'] == b['narrator'] else [a['narrator'], b['narrator']]):
        p = json.load(open(w + '/plan.json')); p['narrator'] = n; json.dump(p, open(w + '/plan.json', 'w'), indent=1)
