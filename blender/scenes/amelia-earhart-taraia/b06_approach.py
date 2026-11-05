"""b06 (WIDE 28 mm, VO 'to find out'): the ship nears the low atoll, surf line on the reef. Slow crane up."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 76, int)
sc = core.reset(); look(sc, vol=False, glare=0.35, vignette=0.2)
day_world(sun_az=250, elev=34)
at = Atoll(); at.build(NF=NF)
ship = expedition_ship(NF, y_speed=0.2)
root = Md.empty('ShipRoot', (1585, 18, 0)); ship.parent = root; root.rotation_euler = (0, 0, math.radians(90))
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.crane((1700, -135, 14), (1535, 22, 6), dz=14, dlook=2), lens=28, fstop=11, focus=Vector((1585, 18, 6)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
