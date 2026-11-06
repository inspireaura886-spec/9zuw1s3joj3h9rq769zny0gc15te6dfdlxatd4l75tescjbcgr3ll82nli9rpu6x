"""s14 MEDIUM 35 mm 'Scientists still argue over what killed them.' The leather journal open on a boulder, a few snow
flakes drifting across it in the low light. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
kvitoya(NF, seed=14, dusk=True)
st = M.texture_set('Boulder', 'rocky_terrain_02', scale=0.6, tint=(0.36, 0.34, 0.31), box=True)
sphere('Boulder', (0, 120, 0.3), 1.0, st, 24, scale=(1.4, 1.1, 0.6))
boxm('JournalL', (-0.12, 120, 0.93), (0.22, 0.28, 0.025), bpy.data.materials['Leather'], 0.005)
boxm('JournalR', (0.12, 120, 0.93), (0.22, 0.28, 0.025), bpy.data.materials['Leather'], 0.005)
pg = M.principled('Page', base=(0.78, 0.72, 0.58), rough=0.9, grime=0.4)
boxm('Pages', (0, 120, 0.95), (0.42, 0.26, 0.012), pg)
ink = M.principled('Hand', base=(0.15, 0.12, 0.10), rough=0.8)
for k in range(10):
    boxm('Ln%d' % k, (-0.1 if k < 5 else 0.11, 120.1 - (k % 5) * 0.045, 0.957), (0.16, 0.004, 0.001), ink)
r = rng(3)
flake = M.principled('Flake', base=(0.95, 0.96, 1.0), rough=0.5)
for k in range(40):
    s = sphere('Flake%d' % k, (r.uniform(-1.5, 1.5), 120 + r.uniform(-1.5, 1), r.uniform(0.9, 2.2)), 0.006, flake, 6)
    p = s.location.copy()
    key_loc(s, [(0, p), (NF, p + Vector((r.uniform(0.6, 1.2), 0.1, -r.uniform(0.5, 0.9))))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0.6, 118.6, 1.6), (0, 120, 0.94), amount=0.3), lens=35, fstop=4, focus=Vector((0, 120, 0.95)))
go(cam, NF, a, sc, meter=NF // 2)
