"""stonehenge-altar-stone-2024 b02_wales (WIDE 24 mm, crane up; VO 'Wales.').
3D: green Welsh-style hills in morning mist (generic, no named outcrop); chip "the textbook answer: Wales"
NF default 42 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
random.seed(2)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=80, elev=8, strength=3.2, hdri_strength=1.0)
Wd.terrain('Hills', size=4000, res=170, height=160, scale=0.0016, center=(0, 900, -20), seed=5,
           mat=M.texture_set('HillsM', 'forest_ground_04', scale=0.03, tint=(0.3, 0.36, 0.2), box=True))
CN.haze(center=(0, 800, 40), size=(4000, 4000, 120), density=0.0012, color=(0.92, 0.95, 1.0), anisotropy=0.5, noise=0.35)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((0, -60, 12), (0, 700, 60), dz=14, dlook=-6), lens=24, fstop=8, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
