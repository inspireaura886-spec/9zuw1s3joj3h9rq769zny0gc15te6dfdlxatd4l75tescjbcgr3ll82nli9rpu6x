"""Look check for every preset: --preset night_sky|ocean_night|forest|empty_road (frames 0..NF-1, slow push)."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, presets as P

a = core.args()
name = a.extra[a.extra.index('--preset') + 1] if '--preset' in a.extra else 'night_sky'
sc = core.reset()
NF = 120
core.setup_render(sc, samples=32, exposure=0.8, vol_step=6.0, vol_max_steps=48, bounces=4)
core.finish(sc, glare=0.6, glare_thr=1.0, vignette=0.4)
cam = C.Cam()
if name == 'night_sky':
    P.night_sky()
    o1 = Md.orb('Light1', (0, 0, 0), color=(1.0, 0.85, 0.6), strength=300, power=3e5, radius=2.0, halo=2.0, pulse=0.2, f1=NF)
    Md.fly(o1, [(0, (-60, 900, 160), None), (NF, (40, 880, 190), None)])
    cam.shot(0, NF, C.crane((0, -20, 3), (0, 900, 120), dz=2.5, dlook=10), lens=(28, 32), fstop=8)
elif name == 'ocean_night':
    P.ocean_night(frames=NF)
    cam.shot(0, NF, C.orbit((0, 8, 1.5), r=16, a0=250, a1=275, h=(2.2, 3.0), look_h=0.5), lens=35, fstop=4, focus='Boat')
elif name == 'forest':
    P.forest()
    cam.shot(0, NF, C.dolly((0, -4, 1.65), (0.3, 6, 1.6), look=(0.5, 30, 1.4)), lens=24, fstop=2.8, focus=12.0)
    cam.handheld(0.03)
elif name == 'empty_road':
    P.empty_road()
    cam.shot(0, NF, C.dolly((-1.6, -8, 1.3), (-1.6, 10, 1.2), look=(0, 120, 2)), lens=30, fstop=5.6)
cam.bake(0, NF - 1)
core.render(a, sc)
