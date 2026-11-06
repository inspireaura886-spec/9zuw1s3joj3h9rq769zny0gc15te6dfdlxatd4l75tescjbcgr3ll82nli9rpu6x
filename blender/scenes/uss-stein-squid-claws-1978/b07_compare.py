"""uss-stein-squid-claws-1978 b07_compare (35 mm, lateral dolly; VO 'Except these were bigger than any squid hook ever collected.'): Navy lab bench: tray of Stein hooks beside a row of much smaller reference squid hooks and a ruler.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=False, glare=0.3)
c = lab_table()
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.dolly(c + Vector((-0.5, -1.1, 0.55)), c + Vector((0.4, -1.1, 0.5)), look=c, look1=c + Vector((0.35, 0, 0))), 35, fstop=5.6, focus=1.2)
go(cam, NF, a, sc, meter=NF // 2)
