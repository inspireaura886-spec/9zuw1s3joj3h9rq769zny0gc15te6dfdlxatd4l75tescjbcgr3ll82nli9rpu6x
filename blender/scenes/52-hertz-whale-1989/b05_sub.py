"""52hz b05_sub (WIDE 28 mm, eased dolly; VO 'laid on the seabed to hunt Soviet submarines.'). Dolly along the array as a dark generic submarine silhouette slides overhead in the haze.
NF default 98 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.24)
underwater(NF, depth=60, half=420, sun_az=80, sun_elev=66, sun_strength=4.0, density=0.03, up=(0.12, 0.35, 0.42))
seabed('Bed', 800, 60, height=2.0, scale=0.025, seed=9, tid='damp_beach_sand', tint=(0.28, 0.3, 0.28), tex_scale=0.4)
hydrophone_array('Hyd', n=9, spacing=12.0, y=6.0, depth=60.0, glow=1.5)
sub = submarine('Sub', loc=(60, 70, -18), length=90.0)
move_line(sub, NF, (70, 70, -18), (-0.45, 0, 0))
cam = C.Cam(clip_end=2500)
cam.shot(0, NF, C.dolly((-40, -18, -55), (-28, -16, -54.5), look=(0, 40, -36), look1=(6, 44, -34)), lens=28, fstop=8, focus=60.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
