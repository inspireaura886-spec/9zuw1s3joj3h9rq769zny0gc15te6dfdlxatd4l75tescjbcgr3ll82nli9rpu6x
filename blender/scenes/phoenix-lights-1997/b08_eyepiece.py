"""s08 CLOSE 50 mm accent TWIST 'Five separate planes, flying in formation.' The telescope view: five
small A-10 silhouettes with steady lights against a dark sky, in a soft round vignette (Remotion adds the circle).
Slow follow."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
desert_mats()
Wd.hdri('qwantani_night_puresky', strength=0.12, bg_strength=0.6)
CN.sun(elev=-8, az=270, warmth='golden', strength=0.2)
lead = a10('Lead', (0, 0, 0))
for i, (dx, dy) in enumerate([(-30, -26), (30, -26), (-60, -52), (60, -52)]):
    a10('W%d' % i, (dx, dy, 0))
wing = [lead] + [bpy.data.objects['W%d' % i] for i in range(4)]
for o in wing:
    p = o.location.copy()
    key_loc(o, [(0, p), (NF, p + Vector((0, 70.0, 0)))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('Lead', (40, -520, -260), (40, -470, -255), look_offset=(0, -26, 0)), lens=50, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
