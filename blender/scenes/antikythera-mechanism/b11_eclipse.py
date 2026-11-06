"""s11 WIDE 24 mm 'and predict eclipses, down to the day and hour.' Over the Aegean: the Moon's dark disc slides across a
low Sun, the sea going copper below; island silhouette (chip SAROS DIAL: 223 LUNAR MONTHS). Crane UP from the water."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
antikythera_coast(NF, seed=11, sun_elev=9, az=260)
sun_d = Vector((math.cos(math.radians(260)), math.sin(math.radians(260)), 0)) * -1
sp = Vector((0, 9000, 1400))
sphere('SunDisc', tuple(sp), 80, glow_mat('SunDiscM', color=(1.0, 0.85, 0.6), strength=40.0), 32)
m = sphere('MoonDisc', tuple(sp + Vector((-170, -200, 10))), 82, M.principled('MoonBlack', base=(0.0, 0.0, 0.0), rough=1.0), 32)
key_loc(m, [(0, sp + Vector((-170, -200, 10))), (NF, sp + Vector((-20, -200, 0)))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-30, -200, 4), (0, 9000, 1350), dz=26, dlook=0), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
