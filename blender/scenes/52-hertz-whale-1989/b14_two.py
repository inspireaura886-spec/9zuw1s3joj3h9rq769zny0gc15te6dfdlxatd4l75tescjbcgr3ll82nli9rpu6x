"""52hz b14_two (WIDE 28 mm, crane down; VO 'in two places at once. One whale, or more?'). Crane down into the dark: two glowing ring sources pulse far apart at the same moment (illustration).
NF default 110 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.24)
underwater(NF, depth=90, half=500, sun_az=250, sun_elev=40, sun_strength=1.6, density=0.02, up=(0.06, 0.16, 0.22), mid=(0.008, 0.03, 0.045))
seabed('Bed', 1000, 90, height=8.0, scale=0.01, seed=19)
for nm, c in (('SrcA', (-70, 160, -45)), ('SrcB', (80, 210, -50))):
    pulse_rings(nm, c, 3, 6, 30, 45, 60, color=(0.6, 0.95, 1.0), strength=6.0, w=0.03, rot=(math.radians(90), 0, 0))
    cyl(nm + 'Core', (c[0], c[1], c[2] - 0.6), (c[0], c[1], c[2] + 0.6), 0.6, M.emission(nm + 'CoreM', color=(0.6, 0.95, 1.0), strength=8.0), 16)
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.crane((0, -60, -10), (0, 185, -46), dz=-14, dlook=0.0), lens=24, fstop=9, focus=230.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.15)
