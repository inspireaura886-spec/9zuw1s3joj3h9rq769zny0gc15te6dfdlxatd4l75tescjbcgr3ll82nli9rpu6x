#!/usr/bin/env python3
"""plan.json + vo.json -> cues.json (cuts, frames, plate frame counts). usage: python3 daily/cues.py <work dir> <vo.json> <out cues.json>"""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
work, vo, out = sys.argv[1:4]
p = load_plan(work); V = json.load(open(vo)); W = V['words']
off = [0]
for l in p['lines']: off.append(off[-1] + len(tokens(l)))
cuts = []
for k, s in enumerate(p['shots']):
    g = off[s['line']] + s.get('word', 0)
    cuts.append(0.0 if k == 0 else round(max(0.0, W[g][1] - 0.07), 3))
dur = V['dur'] + 0.8                     # 0.8 s tail after the last word
FR = int(math.ceil(dur * FPS)); fr = [round(c * FPS) for c in cuts] + [FR]
plate_nf = {}; scenes = {}
for k, s in enumerate(p['shots']):
    n = f's{k + 1:02d}'; plate_nf[n] = max(30, fr[k + 1] - fr[k] + 8); scenes[n] = s['scene']
reveal = next((w[1] for w in reversed(W) if norm(w[0]) == 'nobody'), dur * 0.9)
json.dump({'cuts': cuts, 'frames': FR, 'dur_video': round(FR / FPS, 3), 'voice_s': V['dur'], 'plate_nf': plate_nf,
           'scenes': scenes, 'hook': 0.0, 'bed': p.get('bed', 'heartbeat'), 'reveal': round(reveal, 3), 'hits': cuts[3::4]}, open(out, 'w'), indent=1)
print('shots', len(cuts), 'frames', FR, 'dur', round(FR / FPS, 2), 'reveal', round(reveal, 2))
