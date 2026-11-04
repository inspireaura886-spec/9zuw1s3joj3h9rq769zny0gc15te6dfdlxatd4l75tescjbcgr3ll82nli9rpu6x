"""lakenheath b03 (L3+L4 'golf-ball-sized lights shrank to pinpoints' + 'RAF sent a Venom fighter'): shot A: pale lights
over the base shrink away (orbs fly away from camera); shot B: single fighter from behind-left."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 211, int)
cut = arg(a, '--cut', 115, int)
sc = night_country(NF, exposure=1.2)
col = (1.0, 0.95, 0.85)
for i, (x, y, z) in enumerate([(-60, 700, 60), (60, 800, 90), (0, 900, 40)]):
    o = Md.orb('Ball%d' % i, (x, y, z), color=col, strength=50, power=2e5, radius=4, halo=0.9, pulse=0.04, f1=NF, seed=i + 3)
    Md.fly(o, [(0, (x, y, z), None), (cut, (x * 2, y + 3500, z + 40 * i), None), (NF, (x * 2, y + 3500, z + 40 * i), None)], interp='LINEAR')
j = Md.fighter('Venom', f1=NF, burner=0.3)
Md.fly(j, [(0, (0, 0, 0), (0, 0, 0)), (cut, (0, 0, 0), (0, 0, 0)), (cut + 1, (-40, 1200, 0), (0, 0, 0)), (NF, (-40, 1200 + 5.0 * (NF - cut), 0), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=90000)
cam.shot(0, cut, C.dolly((0, 0, 20), (0, 60, 22), look=(0, 900, 70), look1=(0, 1500, 70)), lens=(40, 55), fstop=8, focus=(0, 800, 70))
cam.shot(cut, NF, C.track('Venom', offset=(-22, -46, 9), offset1=(-16, -36, 7), look_offset=(16, 30, -2)), lens=(40, 44), fstop=8, focus='Venom')
finish_cam(cam, NF, a, sc)
