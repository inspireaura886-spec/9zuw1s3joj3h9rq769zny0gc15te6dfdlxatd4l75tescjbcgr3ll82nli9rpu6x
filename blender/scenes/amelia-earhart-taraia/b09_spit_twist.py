"""b09 (WIDE 28 mm, VO 'it was not her plane'): TWIST. Sandspit at golden light; a generic wireframe twin-engine plane hovers over the pale clump, then dissolves leaving a clump of fallen palm trunks. Slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 75, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.24)
spit_scene(NF, sun_az=238, elev=20)
clump(NF)
wm = wire_mat('WirePlane')
wire_plane((0.5, 0.0, 5.4), span=13.0, yaw_deg=84, mat=wm)
key_fade(wm, [(0, 0.0), (8, 1.0), (30, 1.0), (NF - 14, 0.0)])
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.dolly((-24, -34, 9.5), (-15, -21, 6.5), look=(0.5, 0, 2.2), look1=(0.5, 0, 1.6)), lens=28, fstop=11, focus=Vector((0.5, 0, 1.2)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
