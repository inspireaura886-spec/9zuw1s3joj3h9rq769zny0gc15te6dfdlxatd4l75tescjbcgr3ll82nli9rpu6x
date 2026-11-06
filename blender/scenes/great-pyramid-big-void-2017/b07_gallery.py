"""great-pyramid-big-void-2017 b07_gallery (24 mm, dolly up the slope; VO "Above the Grand Gallery, the pyramid's tallest passage, the count jumped."): Inside the Grand Gallery: corbelled walls rising, warm handrail strips, camera climbs the 26 deg ramp looking up.
NF default 135 = 11 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
b0, b1 = grand_gallery()
Wd.fog(center=(0, 21, 14), size=(6, 46, 30), density=0.015, color=(1, 0.9, 0.75), anisotropy=0.55)
Wd.hdri('kloppenheim_02_puresky', strength=0.01, bg_strength=0.0)
cam = C.Cam(clip_end=200)
ease_cam(cam, NF, C.dolly(b0 + Vector((0, 2.0, 1.9)), b0 + Vector((0, 7.0, 4.3)), look=b1 + Vector((0, 0, 4))), 24, fstop=5.6, focus=20.0)
go(cam, NF, a, sc, meter=NF // 2)
