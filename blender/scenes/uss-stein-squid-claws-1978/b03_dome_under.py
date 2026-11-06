"""uss-stein-squid-claws-1978 b03_dome_under (24 mm, dolly under the bow; VO 'hidden in a rubber dome under the bow.'): Underwater, murky blue: the bulbous sonar dome under the bow; last weak sonar rings spread and die.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
underwater(surface_z=0.0)
ship, dome = frigate()
sonar_pings(NF, dome.location + Vector((0, 6, 0)), n=3, rmax=40)
cam = C.Cam(clip_end=600)
ease_cam(cam, NF, C.dolly((-22, 78, -12), (-16, 70, -10), look=dome.location, look1=dome.location + Vector((0, -4, 1))), 24, fstop=8, focus=20.0)
go(cam, NF, a, sc, meter=NF // 2)
