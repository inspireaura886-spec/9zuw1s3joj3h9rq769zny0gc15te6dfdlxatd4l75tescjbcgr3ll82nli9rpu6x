"""uss-stein-squid-claws-1978 b14_unproven (24 mm, crane up; VO 'That number was never proven.'): Looking up from depth at a frigate hull silhouette on the bright surface; nothing else in the water.
NF default 66 = 5 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 66, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
underwater(depth_fog=0.03, surface_z=0.0)
ship, dome = frigate()
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.crane((-40, 30, -70), (0, 40, 0), dz=12, dlook=0), 24, fstop=8, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2)
