"""bloop-1997 b01_gram (MEDIUM-WIDE 35 mm, push-in; VO 'In nineteen ninety-seven, the ocean made a sound so loud it crossed the Pacific.').
REAL ARTIFACT frame 0: NOAA Bloop spectrogram File:Bloop.jpg (Public domain, NOAA PMEL) on the hero screen of an empty generic listening room; Remotion flashes it full frame 0-1.2 s with credit "NOAA (PD)"
NF default 168 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
random.seed(1)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
listening_room(NF, hero_img='artifact_bloop.jpg', n_desks=4, lamp=True, trace=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.35, -2.7, 1.45), (0, 0, 1.25), amount=0.28), lens=35, fstop=4.0, focus=2.6)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
