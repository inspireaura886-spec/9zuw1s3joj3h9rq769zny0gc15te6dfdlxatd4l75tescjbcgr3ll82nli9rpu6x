"""shroud-of-turin b01_neg (MEDIUM-WIDE 35 mm, push-in; VO 'In eighteen ninety-eight, a photographer in Turin developed his plate. The negative showed a face.').
REAL ARTIFACT frame 0: Secondo Pia 1898 negative, File:Secundo_Pia_Turinske_platno_1898.jpg (Public domain, Wikimedia Commons) as a print under a warm darkroom lamp; Remotion flashes it full frame 0-1.2 s with credit "Secondo Pia, 1898 (PD)"
NF default 179 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 179, int)
random.seed(1)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_pia1898.jpg', lamp_color=(1.0, 0.62, 0.42))
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.05, -1.3, 1.45), (-0.05, 0.0, 0.75), amount=0.25), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
