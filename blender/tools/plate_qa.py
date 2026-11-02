#!/usr/bin/env python3
"""Frame QA for a REAL3D plate or final Short (technique adapted from claude-animated-shorts short_qa.py, MIT):
every frame at 180x320 -> black / blown-white / frozen spans / unplanned pops / motion share / luma + contrast.
Usage: plate_qa.py <video.mp4> [cuts=0,230,322,417] [--json out.json]
Exit 1 when a hard fail is found (black run >= 15 f outside the first 3 f, frozen span >= 45 f, pop outside a cut)."""
import json, subprocess, sys
import numpy as np
vid = sys.argv[1]
cuts = set()
for a in sys.argv[2:]:
    if a[0].isdigit():
        cuts = {int(x) for x in a.split(',')}
W, H = 180, 320
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
n = len(F)
L = (F.astype(np.float32) / 255 @ np.array([0.2126, 0.7152, 0.0722], np.float32)).reshape(n, -1)
mean, p2, p98 = L.mean(1), np.percentile(L, 2, 1), np.percentile(L, 98, 1)
diff = np.abs(np.diff(F.astype(np.int16), axis=0)).mean(axis=(1, 2, 3))
med = np.array([np.median(diff[max(0, i - 8):i + 9]) for i in range(len(diff))])
near_cut = lambda i: any(abs(i - c) <= 2 for c in cuts)
pops = [i + 1 for i in range(len(diff)) if diff[i] > 3 * med[i] + 1.5 and not near_cut(i + 1)]
black = [i for i in range(n) if p98[i] < 0.06]
white = [i for i in range(n) if mean[i] > 0.9]
frozen, rs = [], None
for i in range(len(diff)):
    if diff[i] < 0.05:
        rs = i if rs is None else rs
    else:
        if rs is not None and i - rs >= 12:
            frozen.append((rs, i))
        rs = None
if rs is not None and len(diff) - rs >= 12:
    frozen.append((rs, len(diff)))
runs, cur = [], []
for i in black:
    if cur and i == cur[-1] + 1:
        cur.append(i)
    else:
        if len(cur) >= 15: runs.append((cur[0], cur[-1]))
        cur = [i]
if len(cur) >= 15: runs.append((cur[0], cur[-1]))
r = {'frames': n, 'luma_mean': round(float(mean.mean()), 3), 'luma_p2_med': round(float(np.median(p2)), 3),
     'luma_p98_med': round(float(np.median(p98)), 3), 'moving_share': round(float((diff > 0.3).mean()), 3),
     'motion_mean': round(float(diff.mean()), 2), 'black_runs': runs, 'white_frames': white[:20], 'frozen_spans': frozen,
     'pops': pops[:40]}
fail = bool(runs and any(a > 3 for a, b in runs)) or any(b - a >= 45 for a, b in frozen) or bool(pops)
r['pass'] = not fail
print(json.dumps(r))
if '--json' in sys.argv:
    json.dump(r, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
sys.exit(1 if fail else 0)
