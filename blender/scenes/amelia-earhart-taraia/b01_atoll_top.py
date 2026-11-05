"""b01 (WIDE 35 mm, VO 'A satellite photo' + s16 loop target): top-down satellite-style view of a ring atoll lagoon, a pale plane-shaped patch on the sandspit. Crane down. Frame 0 = loop frame."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 114, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.18, sat=1.08)
day_world(sun_az=235, elev=48)
at = Atoll(); at.build(NF=NF)
lx, ly = at.spit_center()
taraia_shape((lx + 6, ly), rot_deg=18, scale=1.0, z=1.05)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((lx, ly - 34, 235), (lx, ly + 2, 1.0), dz=-70, dlook=0), lens=35, fstop=11, focus=Vector((lx, ly, 1.0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
