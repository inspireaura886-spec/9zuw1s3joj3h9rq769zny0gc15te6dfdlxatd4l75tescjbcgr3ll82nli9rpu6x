"""yonaguni b04_island (WIDE 24 mm, eased dolly; VO 'So who said it first?'). Above water at dawn: a dark island cliff, a small dive boat at anchor. Eased dolly across the swell.
NF default 64 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.22)
dawn_world(sun_az=75, elev=7, strength=4.0, hdri_strength=1.0)
swell_ocean(NF, half=2500, wave_scale=0.9, wind=9, color=(0.01, 0.035, 0.045))
Wd.terrain('Island', size=2400, res=150, height=110, scale=0.002, center=(0, 1300, -10), seed=6, island=1.0,
           mat=M.texture_set('IslandM', 'rocky_terrain_02', scale=0.04, tint=(0.3, 0.32, 0.25), box=True))
hull = loft('Boat', 9.0, [(0.0, 0.05, 0.05, 0.6), (0.15, 1.0, 0.7, 0.35), (0.6, 1.4, 0.8, 0.3), (1.0, 1.3, 0.7, 0.35)], n=16)
hull.data.materials.append(M.principled('BoatPaint', base=(0.75, 0.74, 0.7), rough=0.4, grime=0.5))
hull.location = (40, 220, 0.0)
hull.rotation_euler = (0, 0, math.radians(200))
boxm('Cabin', (44, 221, 1.8), (3.0, 2.0, 1.6), M.principled('CabinM', base=(0.7, 0.7, 0.68), rough=0.5), 0.1)
CN.haze(center=(0, 700, 30), size=(2500, 2500, 90), density=0.0009, color=(1.0, 0.86, 0.74), anisotropy=0.6, noise=0.2, height_falloff=0.6)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-40, -40, 4.0), (-28, -34, 3.6), look=(40, 260, 12), look1=(44, 260, 11)), lens=28, fstop=8, focus=260.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
