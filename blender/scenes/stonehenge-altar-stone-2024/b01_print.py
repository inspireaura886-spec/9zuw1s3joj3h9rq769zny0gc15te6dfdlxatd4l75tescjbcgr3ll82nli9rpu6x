"""stonehenge-altar-stone-2024 b01_print (MEDIUM-WIDE 35 mm, push-in; VO 'At the centre of Stonehenge lies a six-tonne stone, and for a century everyone agreed where it came from.').
REAL ARTIFACT frame 0: CC BY 4.0 photo File:Stonehenge-Altar-Stone_P1110732.jpg (The Stones of Stonehenge, Wikimedia Commons) as a print on an archive desk; Remotion flashes it full frame 0-1.2 s with credit "Photo: The Stones of Stonehenge, CC BY 4.0"
NF default 225 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 225, int)
random.seed(1)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_altar.jpg', extra_prints=())
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.05, -1.3, 1.45), (-0.05, 0.0, 0.75), amount=0.25), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
