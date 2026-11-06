"""great-pyramid-big-void-2017 b01_artifact (35 mm, push (dolly over lightbox); VO "There's a space a hundred feet long hidden inside the Great Pyramid."): Real artifact: the ScanPyramids E-W cut view (Big Void hatching) on a lightbox table, warm lamp, dark room.
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=True, vignette=0.26)
c = artifact_set('artifact.jpg', 'lightbox', h=0.9)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, artifact_move(c, 'lightbox'), 35, fstop=5.6, focus=c)
go(cam, NF, a, sc, meter=NF // 2)
