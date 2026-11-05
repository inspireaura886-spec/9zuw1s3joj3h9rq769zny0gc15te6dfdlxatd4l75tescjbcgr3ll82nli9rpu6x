"""b10 (MEDIUM-WIDE 35 mm, VO 'a clump of fallen trees'): eased orbit around the clump of fallen palm trunks, roots and dry fronds on the coral sand, lagoon behind."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 69, int)
sc = core.reset(); look(sc, vol=False, glare=0.35, vignette=0.24)
spit_scene(NF, sun_az=238, elev=22)
clump(NF)
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.orbit((0.5, 0, 0), r=19, a0=205, a1=232, h=(5.0, 3.6), look_h=1.0), lens=35, fstop=9, focus=Vector((0.5, 0, 0.9)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
