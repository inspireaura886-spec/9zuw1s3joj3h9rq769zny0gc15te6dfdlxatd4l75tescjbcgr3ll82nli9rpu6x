"""mars b02_crater (WIDE 24 mm, crane up; VO 'Methane, inside Gale Crater.'). Gale-like crater at late afternoon, central mound behind; the rover is a speck on the floor. Crane up.
NF default 52 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 52, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
mars_world('day', sun_elev=16, sun_az=200, sun_strength=4.5, haze_density=0.0006)
crater('Gale', size=9000, res=240)
rover('Rover', loc=on_floor(0, -1500), yaw=70, NF=NF)
cam = C.Cam(clip_end=40000)
r0 = Vector(on_floor(-260, -2100, 40))
cam.shot(0, NF, C.crane(tuple(r0), on_floor(0, -1300, 20), dz=55, dlook=-6), lens=24, fstop=11, focus=650.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
