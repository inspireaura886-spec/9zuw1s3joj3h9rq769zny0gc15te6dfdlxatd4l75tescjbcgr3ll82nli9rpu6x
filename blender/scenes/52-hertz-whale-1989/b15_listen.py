"""52hz b15_listen (WIDE 30 mm, crane down; VO 'The hydrophones still listen. Nobody explained it.'). Crane down the empty column onto the quiet array; pods glow faintly. Loop: cuts back to b01 screen.
NF default 87 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.24)
underwater(NF, depth=45, half=320, sun_az=90, sun_elev=68, sun_strength=3.0, density=0.035, up=(0.1, 0.3, 0.38))
seabed('Bed', 640, 45, height=1.5, scale=0.03, seed=21, tid='damp_beach_sand', tint=(0.28, 0.3, 0.28), tex_scale=0.4)
hydrophone_array('Hyd', n=7, spacing=12.0, y=12.0, depth=45.0, glow=2.5)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.crane((10, -16, -12), (2, 14, -44), dz=-16, dlook=0.0), lens=28, fstop=8, focus=34.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
