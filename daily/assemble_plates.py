#!/usr/bin/env python3
"""Join downloaded plate parts into rm/public/real3d/<slug>/sNN.mp4. A plate whose parts are missing (failed render)
is replaced by its nearest finished neighbour so the Short still renders; the swap is recorded in plates.json.
usage: python3 daily/assemble_plates.py <slug> <parts dir> <cues.json> <out dir>"""
import glob, json, os, re, subprocess, sys
slug, pd, cues, out = sys.argv[1:5]
C = json.load(open(cues)); os.makedirs(out, exist_ok=True)
names = list(C['plate_nf']); ok = {}; rep = {}
for n in names:
    parts = sorted(glob.glob(os.path.join(pd, f'part_{slug}_{n}_*.mp4')), key=lambda f: int(re.findall(r'_(\d+)\.mp4$', f)[0]))
    if not parts: continue
    lst = os.path.join(pd, f'list_{n}.txt'); open(lst, 'w').write(''.join(f"file '{os.path.abspath(f)}'\n" for f in parts))
    dst = os.path.join(out, n + '.mp4')
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', dst])
    if r.returncode == 0: ok[n] = len(parts)
missing = [n for n in names if n not in ok]
for n in missing:
    k = names.index(n); cand = sorted([m for m in ok], key=lambda m: abs(names.index(m) - k))
    if not cand: sys.exit('no plates rendered at all for ' + slug)
    subprocess.run(['cp', os.path.join(out, cand[0] + '.mp4'), os.path.join(out, n + '.mp4')], check=True); rep[n] = cand[0]
# Record exactly which plates are still missing/replaced after the plates job's one retry (Hark task 2026-11-14).
json.dump({'rendered': ok, 'replaced': rep, 'missing': missing,
           'missing_scenes': {n: C.get('scenes', {}).get(n) for n in missing}},
          open(os.path.join(out, '..', f'{slug}.plates.json'), 'w'), indent=1)
print('plates ok', len(ok), 'replaced', rep, 'missing', missing)
