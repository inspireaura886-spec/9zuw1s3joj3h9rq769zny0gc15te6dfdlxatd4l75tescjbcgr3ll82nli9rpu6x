"""usa-32-farrah-2026 b07_launch (28 mm, crane up; VO 'A Titan Two rocket lifted it from California in nineteen eighty-eight.'): WIDE: a night launch from a coastal pad: slim two-stage rocket climbing on a bright flame, tower lattice, sea haze, moon.
NF default 135 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.28)
Wd.hdri('qwantani_night_puresky', strength=0.35, bg_strength=0.5, rot=60, tint=(0.75, 0.85, 1.1), stars=0.6)
Wd.moon(direction=(-0.5, 0.7, 0.35), strength=1.4, color=(0.62, 0.72, 1.0), angle=0.55)
Wd.sea_plane(size=60000, z=-4.0, color=(0.003, 0.006, 0.012), rough=0.2, wave=0.2, frames=max(NF, 60))
gnd = mat_once('PadGround', base=(0.05, 0.05, 0.045), rough=0.9)
boxm('Pad', (0, 0, -1.0), (260, 260, 2.0), gnd)
steel = mat_once('TowerSteel', base=(0.18, 0.2, 0.22), rough=0.5, metal=0.8)
for sx in (-1, 1):
    for sy in (-1, 1):
        boxm('TwrLeg', (22 + sx * 3, sy * 3, 28), (0.8, 0.8, 56), steel)
for z in range(6, 56, 8):
    boxm('TwrBar', (22, 0, z), (6.8, 6.8, 0.5), steel)
wh = mat_once('RocketWhite', base=(0.82, 0.82, 0.8), rough=0.35, metal=0.2)
rk = link(bpy.data.objects.new('Rocket', None))
cyl('Stage1', (0, 0, 0), (0, 0, 22), 1.5, wh).parent = rk
cyl('Stage2', (0, 0, 22), (0, 0, 31), 1.3, mat_once('RocketDark', base=(0.1, 0.1, 0.11), rough=0.4)).parent = rk
fl = sphere('Flame', (0, 0, -6), 1.0, glow_mat('FlameM', (1.0, 0.75, 0.4), 18.0), scale=(1.6, 1.6, 7.0), seg=24)
fl.parent = rk
Wd.point('FlameLight', (0, 0, 4), color=(1.0, 0.7, 0.4), power=400000, radius=2.0).parent = rk
key_loc(rk, [(0, (0, 0, 4)), (int(NF * 0.35), (0, 0, 14)), (NF, (0, 0, 190))])
Wd.fog(center=(0, 0, 40), size=(600, 600, 120), density=0.0016, color=(0.7, 0.75, 0.85), anisotropy=0.3)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.crane((-110, -190, 6), (0, 0, 40), dz=60, dlook=70), 28, fstop=8, focus=220.0)
go(cam, NF, a, sc, meter=NF // 2)
