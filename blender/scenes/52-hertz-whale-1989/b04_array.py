"""52hz b04_array (WIDE 24 mm, crane down; VO 'The microphones that caught it were Navy hydrophones,'). Crane down onto a seabed hydrophone array (generic reconstruction), pods and trunk cable into the dark.
NF default 98 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.24)
underwater(NF, depth=40, half=300, sun_az=100, sun_elev=70, sun_strength=3.5, density=0.035, up=(0.12, 0.35, 0.42))
seabed('Bed', 600, 40, height=1.6, scale=0.03, seed=8, tid='damp_beach_sand', tint=(0.3, 0.32, 0.3), tex_scale=0.4)
hydrophone_array('Hyd', n=7, spacing=12.0, y=10.0, depth=40.0, glow=2.0)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.crane((-26, -14, -24), (4, 14, -39), dz=-8, dlook=0.0), lens=24, fstop=8, focus=36.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.17)
