"""s08 CLOSE 35 mm REVEAL 'It was gone.' Two empty iron hooks on the scorched siding, firelight crawling over them; the pale
stripe between them. Push-in (accent close-up)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
winter_night(NF, seed=8, moon=0.1, ground_size=60)
house('House', (0, 0, 0), lit=True, xmas=False)
boxm('Stripe', (5.03, -1.0, 3.2), (0.02, 0.55, 5.8), M.principled('PaleSiding', base=(0.86, 0.84, 0.78), rough=0.8))
iron = M.principled('HookI', base=(0.06, 0.06, 0.06), rough=0.5, metal=0.8, grime=0.6)
for z in (2.2, 4.6):
    for y in (-1.25, -0.75):
        cyl('HookA%d%d' % (int(z), int(y * 10)), (5.0, y, z), (5.12, y, z), 0.012, iron, 8)
        cyl('HookB%d%d' % (int(z), int(y * 10)), (5.12, y, z), (5.12, y, z + 0.06), 0.012, iron, 8)
li = Wd.point('FireGlow', (6.5, 2.5, 4.0), color=(1.0, 0.45, 0.15), power=1500, radius=1.0)
r = rng(8)
key_energy(li, [(f, 1500 * r.uniform(0.6, 1.2)) for f in range(0, NF + 1, 4)])
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((6.6, -1.6, 3.4), (5.05, -1.0, 3.4), amount=0.3), lens=35, fstop=4, focus=Vector((5.05, -1.0, 3.4)))
go(cam, NF, a, sc, meter=NF // 2)
