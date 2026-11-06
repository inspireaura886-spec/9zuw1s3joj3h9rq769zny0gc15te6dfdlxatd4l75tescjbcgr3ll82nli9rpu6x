"""yonaguni b12_layers (MEDIUM-WIDE 30 mm, orbit; VO 'The rock splits along flat layers,'). Three bedding-plane slabs: the top one parts and slides slowly along the flat plane (eased, no shake). Orbit.
NF default 75 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=60, sun_elev=64, sun_strength=5.0, density=0.026, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
st = sandstone_mat('LayerStone', algae=0.3)
s0 = slab('Layer0', (0, 0, -25.0), (10, 7, 2.0), st, bev=0.1, rough=0.1)
s1 = slab('Layer1', (0, 0, -22.97), (10, 7, 2.0), st, bev=0.1, rough=0.1)
s2 = slab('Layer2', (0, 0, -20.94), (10, 7, 2.0), st, bev=0.1, rough=0.1)
for f, (x, z) in ((0, (0.0, -20.94)), (int(NF * 0.15), (0.0, -20.94)), (NF, (2.4, -20.7))):
    s2.location = (x, 0, z)
    s2.keyframe_insert('location', frame=f)
for f, z in ((0, -22.97), (int(NF * 0.3), -22.97), (NF, -22.85)):
    s1.location = (0, 0, z)
    s1.keyframe_insert('location', frame=f)
cam = C.Cam(clip_end=800)
cam.shot(0, NF, C.orbit((0.6, 0, -22.5), r=17, a0=236, a1=258, h=(2.5, 3.5), look_h=0.0), lens=30, fstop=6.3, focus=17.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
