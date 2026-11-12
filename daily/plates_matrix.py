#!/usr/bin/env python3
"""cues.json of every case -> GitHub matrix of Blender plate parts. usage: python3 daily/plates_matrix.py <cases root>  (prints matrix=<json>)
Each plate sNN of each Short is split into parts of <= CH frames (CH grows so the matrix stays <= 250 jobs)."""
import glob, json, math, os, sys
root = sys.argv[1]
P = []
for c in sorted(glob.glob(os.path.join(root, '*', 'cues.json'))):
    slug = os.path.basename(os.path.dirname(c)); C = json.load(open(c))
    for n, nf in C['plate_nf'].items(): P.append((slug, n, C['scenes'][n], nf))
CH = 22
while sum(math.ceil(nf / CH) for *_, nf in P) > 250: CH += 2
inc = []
for slug, n, sc, nf in P:
    k = math.ceil(nf / CH); s = math.ceil(nf / k)
    for i in range(k):
        a, b = i * s, min(nf, (i + 1) * s) - 1
        if a <= b: inc.append({'slug': slug, 'shot': n, 'scene': sc, 'nf': nf, 'a': a, 'b': b, 'i': i})
print('matrix=' + json.dumps({'include': inc}))
print(f'{len(P)} plates, {len(inc)} part jobs, <= {CH} frames each', file=sys.stderr)
