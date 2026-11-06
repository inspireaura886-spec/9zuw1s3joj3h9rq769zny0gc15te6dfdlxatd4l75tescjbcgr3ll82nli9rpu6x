"""stonehenge-altar-stone-2024 b09_scotland (WIDE 24 mm, crane down; VO 'The match was the far northeast of Scotland.').
3D: generic NE-Scotland sandstone coast under a pale sky (Caithness-like flagstone cliffs, not a specific site); chip "Orcadian Basin, NE Scotland"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(9)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=120, elev=12, strength=3.0, hdri_strength=1.0)
swell_ocean(NF, half=3000, wave_scale=1.2, wind=12, color=(0.01, 0.03, 0.04))
Wd.terrain('Coast', size=2600, res=160, height=60, scale=0.002, center=(0, 1400, -8), seed=9, island=1.0,
           mat=M.texture_set('CoastM', 'rocky_terrain_02', scale=0.05, tint=(0.5, 0.42, 0.33), box=True))
CN.haze(center=(0, 900, 30), size=(3000, 3000, 80), density=0.001, color=(0.9, 0.93, 1.0), anisotropy=0.5, noise=0.3)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-60, -40, 40), (0, 600, 10), dz=-24, dlook=4), lens=24, fstop=8, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
