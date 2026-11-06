"""gobekli-tepe b14_why (MEDIUM 35 mm, push-in; VO 'But why build it? And why bury it?').
3D: the two central pillars at dusk, low warm light
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(14)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=260, elev=4, strength=3.5, hdri_strength=0.8)
Wd.terrain('Hill', size=1600, res=150, height=40, scale=0.002, center=(0, 0, -6), seed=11, mat=M.texture_set('HillM', 'dry_ground_rocks', scale=0.05, tint=(0.62, 0.55, 0.42), box=True))
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.push_in((0, -11, 2.2), (0, 0, 2.4), amount=0.22), lens=35, fstop=5.6, focus=11.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
