"""gobekli-tepe b11_buried (WIDE 28 mm, eased dolly; VO 'Then the strangest detail: every few decades, the builders buried pillars').
3D illustration: fill rising inside an enclosure (eased, slow); label "illustration"
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(11)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
fill = boxm('Fill', (0, 0, -1.0), (18, 16, 2.0), M.texture_set('FillM', 'dry_ground_rocks', scale=0.2, tint=(0.6, 0.53, 0.42), box=True), 0.2)
for f, z in ((0, -1.4), (int(NF * 0.2), -1.4), (NF, 1.4)):
    fill.location.z = z
    fill.keyframe_insert('location', frame=f)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-20, -16, 4.0), (-12, -20, 4.0), look=(0, 0, 0.5), look1=(2, 0, 0.5)), lens=28, fstop=8, focus=22.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
