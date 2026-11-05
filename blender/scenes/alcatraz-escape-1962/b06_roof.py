"""b06 (WIDE 24 mm, 'inside the San Francisco Bay prison'): cellhouse roof at night, ventilation stacks, bay and city lights far away, fog. Slow eased orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 85, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.28)
sea_night(NF, moon_dir=(0.1, 0.85, 0.3), moon=1.2, half=2200, wave_scale=0.7, z=-20)
m = mats()
conc = M.principled('RoofConc', base=(0.12, 0.12, 0.115), rough=0.9, grime=0.3, bump=0.3, bump_scale=80)
boxm('Roof', (0, 0, -0.5), (60, 22, 1.0), conc, 0.1)
boxm('ParapetN', (0, 11.1, 0.25), (60, 0.3, 0.5), conc)
boxm('ParapetS', (0, -11.1, 0.25), (60, 0.3, 0.5), conc)
sky = M.emission('SkyGlass', (0.2, 0.3, 0.45), 0.5)
for k in range(-4, 5):
    boxm('Skylight%d' % k, (k * 6.5, -2.0, 0.12), (4.0, 3.0, 0.22), sky, 0.04)
    boxm('SkylightFr%d' % k, (k * 6.5, -2.0, 0.26), (4.15, 3.15, 0.05), m['steel'])
for k, x in enumerate((-18, -6, 5, 17)):
    cyl('Stack%d' % k, (x, 5.5, 0), (x, 5.5, 2.4), 0.45, m['steel'], 18)
    cyl('StackCap%d' % k, (x, 5.5, 2.4), (x, 5.5, 2.6), 0.62, m['steel'], 18)
for x in range(-28, 29, 4):
    boxm('RailPost%d' % x, (x, 10.6, 0.55), (0.05, 0.05, 1.1), m['bar'])
boxm('RailTop', (0, 10.6, 1.1), (60, 0.05, 0.05), m['bar'])
boxm('RailMid', (0, 10.6, 0.6), (60, 0.04, 0.04), m['bar'])
sf_lights(center=(0, 3200, -8), radius=1900, n=1500, seed=6)
Wd.point('RoofLamp', (-12, 9.5, 3.2), color=(1.0, 0.8, 0.55), power=900, radius=0.2)
CN.haze(center=(0, 600, -5), size=(5000, 1500, 60), density=0.0012, color=(0.7, 0.78, 0.95), anisotropy=0.45, noise=0.35, noise_scale=0.01, height_falloff=0.3)
cam = C.Cam(clip_end=15000)
cam.shot(0, NF, C.orbit((4, 6.5, 1.0), r=9, a0=-130, a1=-62, h=(1.7, 2.0), look_h=0.8), lens=24, fstop=8, focus=Vector((4, 6.5, 1.5)))
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
