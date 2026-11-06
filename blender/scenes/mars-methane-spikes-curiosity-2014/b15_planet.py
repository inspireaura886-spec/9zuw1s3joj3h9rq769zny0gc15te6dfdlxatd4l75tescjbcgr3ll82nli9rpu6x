"""mars b15_planet (WIDE 35 mm, orbit; VO 'Yet methane should last about three hundred years on Mars, and pile up where orbiters can see.'). The whole planet from space, thin limb haze; slow orbit (methane should spread planet-wide).
NF default 202 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 202, int)
sc = core.reset(); look(sc, vol=False, glare=0.45, vignette=0.2)
space_world(stars=0.9)
mars_globe('Mars', r=100.0)
CN.sun(elev=10, az=35, warmth=(1.0, 0.97, 0.93), strength=4.2, check=False)
cam = C.Cam(clip_end=8000)
cam.shot(0, NF, C.orbit((0, 0, 0), r=330, a0=250, a1=268, h=(40, 30), look_h=0.0), lens=35, fstop=11, focus=330.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
