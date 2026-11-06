"""uss-omaha-spherical-uap-2019 b01_artifact (35 mm, push-in; VO 'A Navy warship filmed something drop into the Pacific.'): Real artifact: the PD Navy photo of USS Omaha on a monitor in a dark briefing room, blue spill.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=True, vignette=0.26)
c = artifact_set('artifact.jpg', 'monitor', warm=(0.7, 0.8, 1.0), h=0.9)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, artifact_move(c, 'monitor'), 35, fstop=5.6, focus=2.4)
go(cam, NF, a, sc, meter=NF // 2)
