"""usa-32-farrah-2026 b01_artifact (35 mm, push-in; VO 'In September twenty twenty-six, a Cold War spy satellite'): Real artifact: the PD USAF photo of the Titan II(23)G-01 launch (5 Sep 1988, USA 32 is its payload) on a monitor in a dark briefing room, cold spill.
NF default 100 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 100, int)
sc = core.reset(); look(sc, vol=True, vignette=0.26)
c = artifact_set('artifact.jpg', 'monitor', warm=(0.7, 0.8, 1.0), h=0.95)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, artifact_move(c, 'monitor'), 35, fstop=5.6, focus=2.4)
go(cam, NF, a, sc, meter=NF // 2)
