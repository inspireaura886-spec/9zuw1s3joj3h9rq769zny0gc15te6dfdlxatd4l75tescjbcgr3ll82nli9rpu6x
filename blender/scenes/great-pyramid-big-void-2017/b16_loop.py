"""great-pyramid-big-void-2017 b16_loop (24 mm, slow pull back; VO 'Nobody explained it.'): Dusk wide of the pyramid, sun just gone, a few muon streaks still falling; pull back (loops into the hook).
NF default 75 = 3 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
desert(NF, sun_az=275, elev=1.5, strength=1.4)
great_pyramid()
muon_rain(NF, n=24, groups=3, strength=3.0)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-360, -330, 12), (-420, -390, 16), look=(0, 0, 60)), 24, fstop=11, focus=520.0)
go(cam, NF, a, sc, meter=NF // 2)
