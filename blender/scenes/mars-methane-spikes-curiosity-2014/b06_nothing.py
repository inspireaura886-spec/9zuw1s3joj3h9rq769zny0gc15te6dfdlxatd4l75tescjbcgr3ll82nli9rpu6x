"""mars b06_nothing (WIDE 28 mm, crane down; VO 'and found nothing.'). Looking down past the orbiter at the clear planet: a faint scan line sweeps, finds nothing. Crane down.
NF default 42 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.2)
space_world(stars=0.5)
mars_globe('Mars', r=100.0)
CN.sun(elev=35, az=60, warmth=(1.0, 0.97, 0.93), strength=4.0, check=False)
orbiter('Orbiter', loc=(0, -60, 84), scale=0.05)
sm = glow_mat('ScanM', (0.55, 0.9, 1.0), 3.0)
sline = curve_poly('Scan', [(-0.03, -60.0, 84.0), (0.0, -55.0, 80.0)], bevel=0.004, mat=sm)
key_fac(sm, [(0, 0.0), (6, 0.8), (NF, 0.4)])
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.crane((0.6, -61.6, 85.8), (0.0, -56.0, 79.0), dz=-0.5, dlook=-0.4), lens=30, fstop=8, focus='OrbiterBus')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
