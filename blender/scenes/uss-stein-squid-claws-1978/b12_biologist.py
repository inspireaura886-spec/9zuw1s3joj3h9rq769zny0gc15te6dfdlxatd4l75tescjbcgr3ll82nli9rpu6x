"""uss-stein-squid-claws-1978 b12_biologist (28 mm, push-in; VO 'A Navy biologist called it a squid, but would not rule out something unknown.'): Lab wide: bench, tray of hooks under a lamp, window light, empty stool (the biologist is not shown).
NF default 170 = 14 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 170, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
c = lab_table(seed=5)
Wd.fog(center=(0, 0, 1.8), size=(9, 9, 3.5), density=0.01, color=(0.9, 0.92, 0.95))
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.push_in(c + Vector((-1.6, -2.6, 0.9)), c, amount=0.25), 28, fstop=5.6, focus=3.1)
go(cam, NF, a, sc, meter=NF // 2)
