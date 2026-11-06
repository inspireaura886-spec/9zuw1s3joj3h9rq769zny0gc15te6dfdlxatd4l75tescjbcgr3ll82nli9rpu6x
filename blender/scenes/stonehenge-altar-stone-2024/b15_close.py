"""stonehenge-altar-stone-2024 b15_close (MEDIUM-WIDE 35 mm, push-in; VO 'The old guidebooks had one line for it: Nobody explained it.').
3D: back on the archive desk, a closed old guidebook beside the print; loops to b01 (same desk, same lamp)
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(15)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_altar.jpg', extra_prints=())
boxm('Guide', (0.55, 0.2, 0.765), (0.18, 0.25, 0.03), M.principled('GuideM', base=(0.18, 0.22, 0.15), rough=0.6, grime=0.4), 0.004)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.25, -1.35, 1.45), (0.2, 0.05, 0.75), amount=0.22), lens=35, fstop=4.0, focus='Guide')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
