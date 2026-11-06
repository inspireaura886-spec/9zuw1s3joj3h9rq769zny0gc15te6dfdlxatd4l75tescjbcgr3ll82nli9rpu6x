"""stonehenge-altar-stone-2024 b12_land (WIDE 24 mm, eased dolly; VO 'Over land, that means mountains, with six tonnes on board.').
3D illustration: high moorland and mountains, a tiny slab on a timber sledge for scale (no method is known)
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(12)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=150, elev=14, strength=3.2, hdri_strength=1.0)
Wd.terrain('Hills', size=4000, res=170, height=420, scale=0.0016, center=(0, 900, -20), seed=13,
           mat=M.texture_set('HillsM', 'forest_ground_04', scale=0.03, tint=(0.3, 0.36, 0.2), box=True))
CN.haze(center=(0, 800, 40), size=(4000, 4000, 120), density=0.0016, color=(0.92, 0.95, 1.0), anisotropy=0.5, noise=0.35)
sl = megalith('Sled', (0, 60, 1.0), (4.9, 1.0, 0.5), rock_mat('SledM', tint=(0.36, 0.42, 0.33), tid='dry_ground_rocks', scale=0.6), rz=10)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-30, -10, 6), (-10, -14, 6.5), look=(0, 60, 1), look1=(0, 60, 2)), lens=24, fstop=8, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
