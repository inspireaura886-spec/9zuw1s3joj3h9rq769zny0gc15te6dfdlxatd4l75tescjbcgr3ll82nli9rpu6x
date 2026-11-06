"""52hz b10_tech (MEDIUM 35 mm, push-in; VO 'On the seventh of December, a Navy technician watched the trace climb on the screen,'). MOMENT, slower: the empty chair at the console, the animated trace climbing on the centre screen (no person shown).
NF default 179 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 179, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.26)
gradient_world('Room', up=(0.02, 0.025, 0.03), mid=(0.01, 0.012, 0.015), down=(0.0, 0.0, 0.0), light=0.2)
scr = listening_room(NF, hero_img='artifact_spectrogram.jpg', n_desks=4, trace=True)
CN.haze(center=(0, -1, 1.6), size=(14, 10, 3.2), density=0.012, color=(0.8, 0.88, 0.95), anisotropy=0.4, noise=0.25, height_falloff=0.0)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((0.2, -3.6, 1.45), (1.0, 0.44, 1.25), amount=0.3), lens=35, fstop=3.2, focus='TraceScreen')
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
