"""usa-32-farrah-2026 b05_nocause (28 mm, slow pull-back; VO 'No cause. No official count of the pieces.'): WIDE: a silent ribbon of foil shards along the orbit over the dark limb, nothing labelled, camera easing away.
NF default 100 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 100, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.28)
space(sun_az=150, sun_elev=18); earth()
shards(420, (0, 0, 0), 0, NF, spread=300.0, size=0.9, seed=21, along=Vector((1, 0, 0)), speed=0.6)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.dolly((10, -70, 6), (-30, -150, 30), look=Vector((0, 0, -4))), 28, fstop=11, focus=90.0)
go(cam, NF, a, sc, meter=NF // 2)
