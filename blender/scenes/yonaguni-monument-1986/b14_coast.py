"""yonaguni b14_coast (WIDE 24 mm, crane up; VO 'And on the islands own coast, above water, the same steps form by themselves.'). Above water at dawn on the island's shore: natural stepped sandstone ledges, surf below. Crane up.
NF default 168 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
coast_steps(NF)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-14, -18, 1.6), (0, 10, 0.5), dz=5.0, dlook=-0.5), lens=24, fstop=8, focus=24.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.27)
