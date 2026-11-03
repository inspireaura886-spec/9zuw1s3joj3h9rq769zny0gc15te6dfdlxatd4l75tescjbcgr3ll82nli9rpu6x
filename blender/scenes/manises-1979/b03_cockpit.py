"""manises-1979 plate 3 (52 f, VO 7.81-9.53 'The captain watched them close in,'): captain's view, two red lights
closing in through the windshield. Thin-glass panes (no refraction stripes), no kick, no handheld."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 52
setup(sc, exposure=1.15, glare=0.7, vignette=0.42, streaks=0.1)
night_air(NF, moon_dir=(0.5, 0.6, 0.35), moon=1.4, hdri_rot=60)
Wd.city_lights('Coast', center=(-1800, 9000, -2430), radius=1500, count=2000, seed=5, strength=18, size=1.6)
ck = I.cockpit(panel_glow=1.0)
r1 = Md.orb('Red1', (0, 0, 0), strength=700, power=3e6, radius=3.5, halo=2.5, pulse=0.08, f1=NF, seed=1)
r2 = Md.orb('Red2', (0, 0, 0), strength=700, power=3e6, radius=3.5, halo=2.5, pulse=0.08, f1=NF, seed=2)
Md.fly(r1, [(0, (-50, 1500, 90), None), (NF, (-30, 700, 40), None)], interp='LINEAR')
Md.fly(r2, [(0, (50, 1540, 50), None), (NF, (26, 740, 16), None)], interp='LINEAR')
cam = C.Cam()
cam.shot(0, NF, C.dolly((-0.10, 0.0, 0.56), (-0.04, 0.22, 0.55), look=(0.0, 4.0, 0.47), look1=(-0.01, 4.0, 0.44)),
         lens=(30, 34), fstop=2.0, focus='Red1')
finish_cam(cam, NF, a, sc)
