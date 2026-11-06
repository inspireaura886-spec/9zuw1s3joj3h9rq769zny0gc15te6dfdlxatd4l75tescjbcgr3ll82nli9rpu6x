"""gobekli-tepe b04_hunters (MEDIUM 30 mm, orbit; VO 'Built by hunter-gatherers.').
3D: a T-pillar with a low-relief fox, slow orbit
NF default 42 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
random.seed(4)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((8.0, 0, 1.8), r=6.5, a0=-30, a1=-5, h=(0.6, 1.0), look_h=0.0), lens=30, fstop=5.6, focus=6.5)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
