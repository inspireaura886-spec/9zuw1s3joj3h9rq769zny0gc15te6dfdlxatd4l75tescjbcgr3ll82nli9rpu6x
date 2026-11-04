"""lakenheath b02 (L2 'A C-47 pilot and ground observers saw a fast white light'): night over the fields at ~800 m,
cruising forward; a single white light streaks across ahead, fast."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 210, int)
sc = night_country(NF)
o = Md.orb('Fast', (-900, 2600, 120), color=(1.0, 0.98, 0.95), strength=60, power=3e5, radius=6, halo=0.9, pulse=0.03, f1=NF, seed=2)
Md.fly(o, [(0, (-900, 2600, 120), None), (int(NF * 0.55), (-900, 2600, 120), None), (int(NF * 0.55) + 40, (1300, 3000, 260), None), (NF, (1300, 3000, 260), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
v = 3.5
cam.shot(0, NF, C.dolly((0, 0, 0), (0, v * NF, -3), look=(-300, 3000, 90), look1=(100, 3000 + v * NF, 90)), lens=(36, 40), roll=(-1.5, -0.8), fstop=8, focus=(0, 2600, 100))
finish_cam(cam, NF, a, sc)
