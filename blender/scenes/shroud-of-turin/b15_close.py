"""shroud-of-turin b15_close (MEDIUM-WIDE 35 mm, push-in; VO 'Every study since gives the same answer: Nobody explained it.').
3D: back on the darkroom desk with the 1898 print; loops to b01 (same desk, same lamp)
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(15)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_pia1898.jpg', lamp_color=(1.0, 0.62, 0.42))
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.25, -1.35, 1.45), (0.0, 0.05, 0.75), amount=0.22), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
