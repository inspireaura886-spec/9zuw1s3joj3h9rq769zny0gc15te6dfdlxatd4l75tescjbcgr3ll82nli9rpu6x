"""great-pyramid-big-void-2017 b11_endoscope (28 mm, push-in; VO 'A camera thinner than a pencil slid through a gap in the stones,'): Inside the dark corridor looking back at the crack: the 6 mm endoscope and its bright tip creep in, dust in the light.
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, glare=0.5)
nf_corridor()
endoscope(NF, path_y=(0.0, 1.6), z=1.0, tip_power=5.0)
Wd.fog(center=(0, 4.5, 1.0), size=(2.0, 8.8, 2.4), density=0.04, color=(0.95, 0.95, 1.0), anisotropy=0.6)
Wd.hdri('kloppenheim_02_puresky', strength=0.005, bg_strength=0.0)
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.push_in((0.35, 5.0, 1.15), (0, 0.4, 1.0), amount=0.3), 28, fstop=4.0, focus=4.2)
go(cam, NF, a, sc, meter=NF // 2)
