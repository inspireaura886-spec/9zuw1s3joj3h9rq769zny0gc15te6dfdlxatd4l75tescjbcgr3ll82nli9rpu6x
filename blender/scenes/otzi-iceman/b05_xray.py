"""s05 MEDIUM 30 mm 'Then an X-ray caught a shadow under his left shoulder.' 2001 radiology reading room: dim, three lightboxes on
the wall, a schematic chest film on the middle one (chip ILLUSTRATIVE). Lateral dolly along the wall."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(6, 5, 3.0), wood_walls=False, window=False, sun_power=0, seed=5)
for k, x in enumerate((-1.0, 0.0, 1.0)):
    lightbox('LB%d' % k, (x, 2.4, 1.5), strength=2.5)
xray_film('Film', (0.0, 2.4, 1.5), point=True)
desk('Desk', (0, 1.6, 0))
cam = C.Cam(clip_end=200)
wide(cam, NF, C.dolly((-1.2, -0.6, 1.5), (-0.3, -0.6, 1.5), look=(-0.4, 2.4, 1.45), look1=(0.05, 2.4, 1.5)), lens=30, fstop=4, focus=Vector((0, 2.36, 1.5)))
go(cam, NF, a, sc, meter=NF // 2)
