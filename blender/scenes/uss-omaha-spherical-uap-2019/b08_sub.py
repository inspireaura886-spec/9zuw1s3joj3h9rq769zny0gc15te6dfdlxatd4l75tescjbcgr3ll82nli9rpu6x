"""uss-omaha-spherical-uap-2019 b08_sub (24 mm, tracking dolly; VO 'The filmmaker who leaked the clip says a Navy submarine searched the spot.'): Underwater night: a submarine silhouette glides in, its lamp cutting the murk (chip: claim).
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
deep_water(floor_z=-140)
sub, lamp = submarine(loc=(0, 0, -70))
key_loc(sub, [(0, (0, -30, -70)), (NF, (0, 15, -70))], interp='LINEAR')
key_loc(lamp, [(0, (0, 20, -73)), (NF, (0, 65, -73))], interp='LINEAR')
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.dolly((-70, -40, -55), (-60, -10, -58), look=(0, -10, -70), look1=(0, 20, -70)), 24, fstop=8, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2)
