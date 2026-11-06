"""gobekli-tepe b01_photo (MEDIUM-WIDE 35 mm, push-in; VO 'On a hill in Turkey stand stone pillars taller than a person, carved with foxes and vultures.').
REAL ARTIFACT frame 0: File:Göbekli_Tepe,_Urfa.jpg (Teomancimit, Wikimedia Commons, CC BY-SA 3.0) as a print on an archive desk; Remotion flashes it full frame 0-1.2 s with credit "Teomancimit, CC BY-SA 3.0"
NF default 202 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 202, int)
random.seed(1)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_gobekli.jpg')
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.05, -1.3, 1.45), (-0.05, 0.0, 0.75), amount=0.25), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
