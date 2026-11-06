"""s12 WIDE 28 mm 'The family answered with a roadside billboard that stood for thirty-seven years.' Dusk on the highway: a
large billboard seen from BEHIND (timber back, legs, braces) at the edge of the lot; car headlights pass. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
sod_mats()
Wd.hdri('qwantani_dawn_puresky', strength=0.2, bg_strength=0.5, tint=(0.75, 0.8, 1.0))
CN.sun(elev=15, az=250, warmth='blue', strength=0.6)
CN.ground('Road', 'asphalt_02', (8, 400), center=(0, 0, 0.02), tile_m=6.0)
Wd.terrain('Verge', size=300, res=60, height=0.8, scale=0.03, center=(0, 0, -0.1), seed=12, mat=bpy.data.materials['Frost'])
wood = M.principled('BoardWood', base=(0.25, 0.19, 0.12), rough=0.85, grime=0.5)
boxm('BoardBack', (12, 6, 4.5), (9.0, 0.15, 4.0), wood)
for x in (8.5, 12, 15.5):
    boxm('Leg%d' % int(x), (x, 6.2, 1.25), (0.2, 0.2, 2.5), wood)
    cyl('Brace%d' % int(x), (x, 6.2, 0.2), (x, 7.6, 2.4), 0.06, wood, 6)
car = M.emission('Headlight', (1.0, 0.92, 0.75), 30.0)
for k, d in enumerate((1, -1)):
    hl = sphere('Car%d' % k, (d * 1.5, -200 * d, 0.7), 0.15, car, 10, scale=(3, 1, 1))
    key_loc(hl, [(0, (d * 1.5, -200 * d, 0.7)), (NF, (d * 1.5, 120 * d, 0.7))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((2, -14, 1.6), (7, -14, 1.6), look=(10, 6, 3.5), look1=(13, 6, 3.5)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
