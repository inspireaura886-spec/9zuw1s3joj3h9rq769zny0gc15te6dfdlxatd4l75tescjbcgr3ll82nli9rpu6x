"""uss-stein-squid-claws-1978 b01_artifact (35 mm, push-in; VO 'A Navy warship came back from sea with claws stuck in its hull.'): Real artifact: the PD Navy photo of USS Stein pinned on a wood board in a dim Navy office, warm lamp.
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, vignette=0.26)
c = artifact_set('artifact.jpg', 'wall', h=1.0)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, artifact_move(c, 'wall'), 35, fstop=5.6, focus=2.6)
go(cam, NF, a, sc, meter=NF // 2)
