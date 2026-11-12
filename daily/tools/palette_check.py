#!/usr/bin/env python3
"""HUMANE CAPTION COLOUR GATE (user 2026-11-03, angry about yellow/red AI-template captions). Exit 1 = do not post.
usage:
  python3 tools/palette_check.py --src <story dir with entry.jsx>   source check: entry.jsx imports palette.pick.js FIRST, the pick names a
        palette in remotion/src/real3d/caption_schemes.json, and no TEXT/UI line in the story dir or the kits still uses a banned template colour.
  python3 tools/palette_check.py <video.mp4>   pixel check: samples 1 frame/s; fails when template yellow (#FFD93B/#FFD21F-like: hue 44-58,
        sat >= 0.62, val >= 0.86) covers >= 0.35 % of the headline band (y 200-700) or caption band (y 1150-1500) in >= 3 frames.
        (Red is checked at source only: red orbs/lamps in the scene are legitimate.)
Both modes may be combined. Called by scary-reels/pipeline/shortqa.py and tools/prerender_check.py."""
import sys, os, re, json, glob, subprocess
sys.path[:0] = [os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), d) for d in ("pylib", "pylib_x86_64")]
import numpy as np
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(R, 'remotion', 'src')
BANNED = ['#ffd93b', '#ffd21f', '#ffd400', '#ffd45a', '#ffcc00', '#ffd700', '#ffeb3b', '#ff5a4e', '#ff3b2f', '#d6302a', '#c62828', '#e63946']
UI = ['fontFamily', 'style={{', 'fill=', 'stroke=', '{yellow:', 'border', 'background', 'textShadow', 'accentColor', 'color: ', 'STROKE(', 'fontcolor=']
NOT3D = ['Material', 'Light', 'emissive', '<mesh', '<sprite', '<Glow', '<Orb', '<Particles', 'pointLight', 'spotLight', 'THREE.Color']
KITS = ['lowpoly/kit/Overlay.jsx', 'lowpoly/kit/KineticCard.jsx', 'noir/NoirKit.jsx', 'real3d/Real3DKit.jsx']
fails = []
def src_check(d):
    d = os.path.abspath(d); e = os.path.join(d, 'entry.jsx')
    if not os.path.exists(e): fails.append(f'no entry.jsx in {d}'); return
    first = [l for l in open(e).read().split('\n') if l.strip() and not l.strip().startswith('//')][:1]
    if not first or 'palette.pick' not in first[0]: fails.append('entry.jsx: first import must be ./palette.pick.js (humane caption palette)')
    pk = os.path.join(d, 'palette.pick.js')
    names = [k for k in json.load(open(os.path.join(SRC, 'real3d', 'caption_schemes.json'))) if not k.startswith('_')]
    if os.path.exists(pk):
        m = re.search(r"setPalette\('([^']+)'\)", open(pk).read())
        if not m or m.group(1) not in names: fails.append(f'palette.pick.js names no known humane palette ({names})')
        else: print('palette:', m.group(1))
    files = glob.glob(os.path.join(d, '*.jsx')) + [os.path.join(SRC, k) for k in KITS]
    for p in files:
        for i, ln in enumerate(open(p).read().split('\n'), 1):
            low = ln.lower()
            if any(b in low for b in BANNED) and any(k in ln for k in UI) and not any(k in ln for k in NOT3D):
                fails.append(f'{os.path.relpath(p, R)}:{i} banned template colour in a text/UI line')
    if os.path.exists(os.path.join(SRC, 'lowpoly/kit/Overlay.jsx')) and "'#ffd93b'" in open(os.path.join(SRC, 'lowpoly/kit/Overlay.jsx')).read():
        fails.append('kit Overlay.jsx still defines #ffd93b')
def px_check(v):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v], capture_output=True, text=True).stdout or 0)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', 'fps=1,scale=270:480,format=rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8); n = len(fr) // (270 * 480 * 3)
    if n == 0: fails.append('could not read frames'); return
    fr = fr[:n * 270 * 480 * 3].reshape(n, 480, 270, 3).astype(np.float32) / 255
    mx = fr.max(-1); mn = fr.min(-1); s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = fr[..., 0], fr[..., 1], fr[..., 2]
    h = np.zeros_like(mx); m = (mx == r) & (mx > mn); h[m] = (60 * ((g - b)[m] / (mx - mn)[m])) % 360
    m2 = (mx == g) & (mx > mn) & ~m; h[m2] = 60 * ((b - r)[m2] / (mx - mn)[m2]) + 120
    yel = (h >= 44) & (h <= 58) & (s >= 0.62) & (mx >= 0.86)
    bands = {'headline': (50, 175), 'caption': (287, 375)}
    bad = []
    for name, (y0, y1) in bands.items():
        frac = yel[:, y0:y1].mean(axis=(1, 2))
        hits = [i for i, f in enumerate(frac) if f >= 0.0035]
        if len(hits) >= 3: bad.append(f'{name} band: template yellow in {len(hits)} of {n} sampled s (e.g. t={hits[:5]})')
    if bad: fails.extend(bad)
    else: print(f'pixel check ok ({n} frames, no template yellow in text bands)')
args = sys.argv[1:]
if not args: sys.exit(__doc__)
if '--src' in args: i = args.index('--src'); src_check(args[i + 1]); del args[i:i + 2]
for v in args: px_check(v)
for f in fails: print('FAIL', f)
sys.exit(1 if fails else 0)
