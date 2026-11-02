"""manises-1979 plate 2 (102 f, VO 4.46-7.45 'November 1979, near Ibiza.'): the airliner high over the moonlit deck,
Ibiza's towns glowing through the gaps; the two red lights small but visible behind it. Brighter than the r1 test's
dark shot 3 (exposure 1.3, stronger moon, brighter towns, thinner deck)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 102
setup(sc, exposure=1.3, glare=0.65)
night_air(NF, moon_dir=(-0.3, 0.85, 0.35), moon=3.2, coverage=0.42)
Wd.terrain('Ibiza', size=14000, res=90, height=180, scale=0.00035, center=(1500, 4200, -2650), seed=4,
           mat=M.principled('Land', base=(0.035, 0.04, 0.035), rough=0.9), island=1.0)
for i, (cx, cy, n, r) in enumerate([(600, 3000, 1200, 1500), (2600, 5400, 800, 1100), (-400, 6200, 500, 900),
                                     (3000, 2200, 400, 700)]):
    Wd.city_lights('Town%d' % i, center=(cx, cy, -2430), radius=r, count=n, seed=11 + i, strength=14, size=1.6,
                   cluster=0.8)
plane = Md.airliner('Airliner', f1=NF, cabin_glow=2.4)
Md.fly(plane, [(0, (0, 0, 0), (0, 0, 0)), (NF, (0, V_JET * NF, 0), (0.4, 0, 0))], interp='LINEAR')
r1, r2 = red_orbs(NF, parent=plane, radius=3.0)
Md.fly(r1, [(0, (60, -260, 30), None), (NF, (48, -200, 22), None)], interp='LINEAR')
Md.fly(r2, [(0, (78, -248, 14), None), (NF, (62, -190, 10), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
# shot A 0-55: high behind, looking down past the fin to the island lights; lights small at frame right
cam.shot(0, 56, C.track('Airliner', offset=(26, -58, 26), offset1=(20, -48, 22), look_offset=(-4, 160, -60)),
         lens=(28, 30), fstop=8, focus='Airliner')
# shot B 56-101: low side, wing + island glow below, the two lights following far behind
cam.shot(56, NF, C.track('Airliner', offset=(-38, 30, -4), offset1=(-34, 18, -3), look_offset=(16, -90, 2)),
         lens=(30, 32), fstop=8, focus='Airliner')
finish_cam(cam, NF, a, sc)
