"""gobekli-tepe b15_close (MEDIUM-WIDE 35 mm, push-in; VO 'Archaeologists still argue. Nobody explained it.').
3D: back on the archive desk with the print; loops to b01 (same desk, same lamp)
NF default 75 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
random.seed(15)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_gobekli.jpg')
boxm('Notes', (0.55, 0.2, 0.75), (0.21, 0.297, 0.004), M.principled('NotesM', base=(0.9, 0.88, 0.82), rough=0.8), 0.002)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.25, -1.35, 1.45), (0.2, 0.05, 0.75), amount=0.22), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
