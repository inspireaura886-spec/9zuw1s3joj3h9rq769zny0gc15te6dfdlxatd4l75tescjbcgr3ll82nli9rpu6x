"""great-pyramid-big-void-2017 b04_muon_rain (28 mm, orbit; VO 'Cosmic rays rain muons down through the stone all day,'): Wide orbit around the pyramid: dense near-vertical muon streaks raining through it (zenith-peaked angles).
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
desert(NF, sun_az=95, elev=4, strength=2.5)
great_pyramid()
muon_rain(NF, n=90, groups=6)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.orbit((0, 0, 40), r=330, a0=225, a1=250, h=(20, 34), look_h=30), 28, fstop=11, focus=330.0)
go(cam, NF, a, sc, meter=NF // 2)
