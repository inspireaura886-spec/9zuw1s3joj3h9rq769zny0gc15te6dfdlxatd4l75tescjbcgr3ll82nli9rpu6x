"""dc-radar b02 (L2 'An airline pilot saw lights right where the blips were.'): night over Washington at ~1 km,
camera cruises forward like an airliner; pale lights hang ahead in the haze, drifting slowly. No aircraft shown."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 100, int)
sc = night_city(NF)
col = (1.0, 0.86, 0.66)
for i, (x, y, z) in enumerate([(-260, 2600, 60), (120, 2900, 120), (420, 3300, 20), (-60, 3600, 160), (300, 2400, -40)]):
    o = Md.orb('Light%d' % i, (x, y, z), color=col, strength=55, power=3e5, radius=5 + i % 2, halo=0.9, pulse=0.05,
               f1=NF, seed=i + 1)
    Md.fly(o, [(0, (x, y, z), None), (NF, (x + 40 * (1 if i % 2 else -1), y + 120, z + 15), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
v = 4.0  # m per frame (~430 km/h)
cam.shot(0, NF, C.dolly((0, 0, 30), (0, v * NF, 26), look=(40, 3000, -60), look1=(60, 3000 + v * NF, -50)),
         lens=(38, 42), roll=(-2.0, -1.0), fstop=8, focus=(0, 2900, 60))
finish_cam(cam, NF, a, sc)
