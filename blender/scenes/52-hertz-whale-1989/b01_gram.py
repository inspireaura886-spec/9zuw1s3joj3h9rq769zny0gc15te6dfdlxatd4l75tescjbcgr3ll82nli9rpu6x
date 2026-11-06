"""52hz b01_gram (MEDIUM-WIDE 35 mm, push-in; VO 'Somewhere in the Pacific, one whale sings at a pitch no known whale uses.'). Empty Navy listening station; the REAL NOAA 52 Hz spectrogram glows on the hero screen and feeds out on strip-chart paper.
NF default 168 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.24)
gradient_world('Room', up=(0.02, 0.025, 0.03), mid=(0.01, 0.012, 0.015), down=(0.0, 0.0, 0.0), light=0.2)
scr = listening_room(NF, hero_img='artifact_spectrogram.jpg', n_desks=4)
CN.haze(center=(0, -1, 1.6), size=(14, 10, 3.2), density=0.012, color=(0.8, 0.88, 0.95), anisotropy=0.4, noise=0.25, height_falloff=0.0)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((-0.55, -3.3, 1.55), (-1.0, 0.44, 1.32), amount=0.33), lens=35, fstop=4.0, focus='HeroScreen')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
