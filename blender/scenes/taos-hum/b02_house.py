"""taos b02 (WIDE): night adobe house under the Sangre de Cristo ridge, warm window; shot 1 wide dolly, shot 2 closer to the sill with a glass of water pulsing. NF 96."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *
a = core.args(); NF = arg(a, '--nf', 96, int)
sc = core.reset()
setup(sc, exposure=0.7, vol=True, glare=0.55, vignette=0.4)
night_sky(moon_dir=(0.55, 0.65, 0.4), moon=1.6)
g = CN.ground('Desert', 'dry_ground_rocks', (500, 500), center=(0, 0, -0.02), tile_m=3.0, tint=(0.5, 0.44, 0.4))
ridge('Ridge', loc=(0, 330, -2), amp=130, seed=5)
wx, wy = house(0, 0)
glass_of_water('Gl', (wx - 0.22, wy - 0.22, 1.07), NF, r=0.042, h=0.12, pulse_every=24)
for i, (px, py, sc_) in enumerate(((-7, -9, 1.0), (6, -11, 1.3), (-12, -4, 0.9), (11, -6, 1.1))):
    CN.place('dry_branches_medium_01', (px, py, 0), rot=(0, 0, i * 1.3), scale=sc_ * 2.0, name='Bush%d' % i)
CN.scatter('grass_medium_02', 140, (-14, 14, -16, -3), seed=4, scale=(1.0, 1.8))
CN.haze(center=(0, -6, 3), size=(60, 40, 12), density=0.004, color=(0.65, 0.72, 0.9), anisotropy=0.4, height_falloff=1.0)
cam = C.Cam(clip_end=2000)
S = 54
cam.shot(0, S, C.dolly(Vector((-15, -23, 2.1)), Vector((-10.5, -19, 1.9)), look=Vector((1.5, 0, 1.7)), look1=Vector((1.2, 0, 1.7))), lens=24, fstop=8.0, focus=Vector((1.5, -2, 1.5)))
cam.shot(S, NF, C.dolly(Vector((wx - 3.2, wy - 6.0, 1.55)), Vector((wx - 1.0, wy - 2.2, 1.25)), look=Vector((wx, wy - 0.3, 1.2)), look1=Vector((wx - 0.2, wy - 0.25, 1.1))), lens=35, fstop=3.2, focus=Vector((wx - 0.22, wy - 0.22, 1.1)))
finish_cam(cam, NF, a, sc)
