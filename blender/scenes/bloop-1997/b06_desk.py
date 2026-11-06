"""bloop-1997 b06_desk (MEDIUM 35 mm, push-in; VO 'So who said it first?').
3D: archive desk with the real spectrogram print and a generic 2002 science-magazine page (no masthead logo); chip "who said it first?"
NF default 64 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
random.seed(6)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_bloop.jpg')
boxm('Mag', (-0.5, 0.15, 0.752), (0.21, 0.28, 0.006), M.principled('MagM', base=(0.9, 0.9, 0.86), rough=0.7), 0.002)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((-0.2, -1.2, 1.4), (-0.25, 0.05, 0.75), amount=0.26), lens=35, fstop=4.0, focus='Mag')
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
