"""nimitz plate b07 (110 f): skeptics: three small glow sources (glare / parallax / sensor) as soft bokeh on a dark sea horizon"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 110
setup(sc, exposure=1.15, vol=True, glare=0.9)
dusk_sea(NF, hdri_rot=140)
for i, (x, z) in enumerate([(-30, 12), (0, 18), (30, 10)]):
    Md.orb('G%d' % i, (x, 120, z), color=(1.0, 0.9, 0.75), strength=20, power=2e3, radius=1.6, halo=1.0, pulse=0.05, f1=NF, seed=i + 1)
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((-10, -40, 8), (10, -34, 9), look=(0, 120, 14)), lens=(50, 56), fstop=2.8, focus=(0, 120, 14))
finish_cam(cam, NF, a, sc)
