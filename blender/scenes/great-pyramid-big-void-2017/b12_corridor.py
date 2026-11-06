"""great-pyramid-big-void-2017 b12_corridor (24 mm, slow dolly forward; VO 'and found it empty, probably unseen for forty-five centuries.'): Down the corridor from the scope position: gabled chevron roof, empty floor, light falling off into the dark end wall.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
nf_corridor()
endoscope(NF, path_y=(1.6, 2.2), z=1.0, tip_power=8.0)
Wd.fog(center=(0, 4.5, 1.0), size=(2.0, 8.8, 2.4), density=0.03, color=(0.95, 0.95, 1.0), anisotropy=0.6)
Wd.hdri('kloppenheim_02_puresky', strength=0.005, bg_strength=0.0)
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.dolly((0, 2.0, 1.05), (0, 3.4, 1.05), look=(0, 9.0, 0.9)), 24, fstop=4.0, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2)
