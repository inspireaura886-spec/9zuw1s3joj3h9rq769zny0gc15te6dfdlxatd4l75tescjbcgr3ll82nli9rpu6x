"""stonehenge-altar-stone-2024 b10_moment (MEDIUM 35 mm, push-in; VO 'In twenty twenty-four, geologist Anthony Clarkes team put it in Nature:').
MOMENT, told slower: empty desk at night, journal pages and the print under the lamp (no likeness of Clarke); chip "Clarke et al., Nature, Aug 2024"
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(10)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_altar.jpg', extra_prints=())
pg = M.principled('PageM', base=(0.92, 0.91, 0.88), rough=0.8)
for k in range(3):
    boxm('Page%d' % k, (-0.5 + 0.02 * k, 0.15 - 0.01 * k, 0.75 + 0.002 * k), (0.21, 0.297, 0.001), pg)
text_obj('Title', 'A Scottish provenance for the Altar Stone', (-0.6, 0.27, 0.755), size=0.012, mat=M.principled('Ink', base=(0.03, 0.03, 0.03), rough=0.6))
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((-0.3, -0.95, 1.35), (-0.45, 0.12, 0.75), amount=0.28), lens=35, fstop=3.5, focus='Page2')
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
