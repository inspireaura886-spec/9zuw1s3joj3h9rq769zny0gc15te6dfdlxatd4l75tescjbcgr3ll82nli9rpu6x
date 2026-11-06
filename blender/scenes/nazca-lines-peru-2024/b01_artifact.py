"""nazca-lines-peru-2024 b01_artifact (35 mm, dolly over lightbox; VO 'Everyone says the Nazca Lines were drawn to be seen from the sky.'): Real artifact: the CC BY-SA aerial photo of a Nazca figure on a lightbox table in a field office, warm lamp.
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, vignette=0.26)
c = artifact_set('artifact.jpg', 'lightbox', h=0.8)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, artifact_move(c, 'lightbox'), 35, fstop=5.6, focus=1.75)
go(cam, NF, a, sc, meter=NF // 2)
