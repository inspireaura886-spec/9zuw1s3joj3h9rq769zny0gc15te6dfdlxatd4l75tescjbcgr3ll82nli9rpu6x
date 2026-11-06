"""gobekli-tepe b08_dig (WIDE 28 mm, crane up; VO 'Digging began the next year.').
3D: excavation trench, pillars half exposed, spoil heaps; chip "digs from 1995"
NF default 64 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
random.seed(8)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(40, z=-1.8)
enclosure('A', center=(0, 0, 0), r=8.0, n=10, h=4.5, fill=1.8)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-14, -16, 2.5), (0, 0, -0.5), dz=9, dlook=-1.5), lens=28, fstop=8, focus=20.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.27)
