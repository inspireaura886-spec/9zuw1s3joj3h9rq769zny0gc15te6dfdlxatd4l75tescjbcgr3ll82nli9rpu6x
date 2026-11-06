"""mars b11_pass (WIDE 24 mm, eased dolly; VO 'The orbiters still saw nothing.'). High over the dark crater the orbiter slides through frame; the floor below shows nothing. Eased dolly.
NF default 64 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
space_world(stars=0.8)
mars_globe('Mars', r=100.0)
CN.sun(elev=8, az=200, warmth=(1.0, 0.96, 0.92), strength=3.2, check=False)
orb = orbiter('Orbiter', loc=(0, -103.0, 22.0), scale=0.05)
move_line(orb, NF, (-0.8, -103.0, 22.0), (0.016, 0, 0))
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.dolly((0.2, -104.9, 23.2), (0.7, -104.8, 23.1), look=(0.0, -101.0, 19.5), look1=(0.6, -101.0, 19.4)), lens=26, fstop=8, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
