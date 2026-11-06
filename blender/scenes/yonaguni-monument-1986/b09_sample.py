"""yonaguni b09_sample (MEDIUM 30 mm, crane up; VO 'But geologist Robert Schoch brought pieces of it to the surface.'). A faceless diver lifts a loose rock fragment from the terrace edge and rises toward the light. Crane up.
NF default 133 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=50, sun_elev=68, sun_strength=5.5, density=0.03, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
dv = faceless_diver('Diver', loc=(-2.0, 2.0, -21.2), yaw=100, NF=NF)
move_line(dv, NF, (-2.0, 2.0, -21.2), (0.0, 0.0, 0.035))
frag = slab('Fragment', (0, 0, 0), (0.28, 0.2, 0.12), sandstone_mat('FragStone', algae=0.5), bev=0.03, rough=0.03)
frag.parent = dv
frag.location = (0.55, -0.34, -0.2)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.crane((-8.5, -7.5, -21.5), (-1.6, 2.0, -20.0), dz=3.6, dlook=3.0), lens=30, fstop=5.0, focus='DiverTorso')
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
