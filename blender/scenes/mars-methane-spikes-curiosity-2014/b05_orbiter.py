"""mars b05_orbiter (WIDE 24 mm, eased dolly; VO 'But Europes orbiter, the most sensitive gas detector at Mars, flew over'). Generic trace-gas orbiter crossing high over the Mars limb (no agency marks). Eased dolly alongside.
NF default 144 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
sc = core.reset(); look(sc, vol=False, glare=0.45, vignette=0.2)
space_world(stars=0.8)
mars_globe('Mars', r=100.0)
CN.sun(elev=12, az=10, warmth=(1.0, 0.97, 0.93), strength=4.0, check=False)
orb = orbiter('Orbiter', loc=(0, -104.5, 6.0), scale=0.05)
move_line(orb, NF, (-1.0, -104.5, 6.0), (0.012, 0, 0))
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.dolly((-1.4, -106.4, 6.35), (-0.2, -106.3, 6.3), look=(-0.6, -104.5, 6.0), look1=(0.6, -104.5, 5.9)), lens=28, fstop=8, focus='OrbiterBus')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
