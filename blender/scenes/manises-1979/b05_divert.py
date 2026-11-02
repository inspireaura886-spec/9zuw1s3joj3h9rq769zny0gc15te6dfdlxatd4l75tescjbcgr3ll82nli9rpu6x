"""manises-1979 plate 5 (132 f, VO 13.50-17.55 'He made an emergency landing at Valencia. Passengers were told it
was a fault.'): the airliner banks left and descends toward Valencia's lights; the two red lights pace it, IN frame.
Fixes the r1 test's dark exterior (exposure 1.3, brighter city, moon in front of the camera)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 132
setup(sc, exposure=1.3, glare=0.65)
night_air(NF, moon_dir=(-0.4, 0.85, 0.3), moon=3.0, coverage=0.40)
Wd.city_lights('Valencia', center=(-3000, 9000, -2430), radius=3200, count=5000, seed=31, strength=9, size=1.5,
               cluster=0.85)
Wd.city_lights('Coast', center=(-6000, 5000, -2430), radius=300, count=900, seed=32, strength=8, size=1.4,
               shape='line', length=16000)
plane = Md.airliner('Airliner', f1=NF, cabin_glow=2.4)
Md.fly(plane, [(0, (0, 0, 0), (0, -14, 4)), (60, (-30, V_JET * 60, -10), (-2, -24, 10)),
               (NF, (-160, V_JET * NF * 0.95, -36), (-3, -26, 16))])
r1, r2 = red_orbs(NF, parent=plane, radius=4.5)
Md.fly(r1, [(0, (-70, 120, 24), None), (NF, (-50, 90, 16), None)], interp='LINEAR')
Md.fly(r2, [(0, (-84, 132, 8), None), (NF, (-60, 100, 4), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
# shot A 0-65: front-right, low: the jet rolls into the turn, red lights beyond its left wing
cam.shot(0, 66, C.track('Airliner', offset=(70, 150, -12), offset1=(62, 136, -10), look_offset=(-30, 40, 6)),
         lens=(34, 36), fstop=8, focus='Airliner')
# shot B 66-131: chase from behind-above-right; jet lower frame, the lights off the left wing, city below
cam.shot(66, NF, C.track('Airliner', offset=(40, -80, 20), offset1=(32, -66, 16), look_offset=(-30, 70, 4)),
         lens=(30, 32), fstop=8, focus='Airliner')
finish_cam(cam, NF, a, sc)
