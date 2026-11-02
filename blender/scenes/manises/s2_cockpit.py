"""Manises 1979 test, plate 2 (90 f): captain's view, two red lights closing in through the windshield.
VO 7.65-10.70 s 'The crew sees two strong red lights closing in.'  'red' at plate f~34, 'closing' f~49."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, interiors as I

a = core.args()
sc = core.reset()
NF = 92
core.setup_render(sc, samples=20, look='AgX - Medium High Contrast', exposure=1.1, vol_step=6.0, vol_max_steps=64,
                  bounces=5, clamp_ind=5.0)
core.finish(sc, glare=0.7, glare_thr=0.9, glare_size=9, vignette=0.45, streaks=0.12, lift=(0.99, 1.0, 1.05),
            gain=(1.03, 0.99, 0.96), sat=0.95)
Wd.hdri('kloppenheim_02_puresky', strength=0.3, bg_strength=0.55, rot=60, tint=(0.75, 0.85, 1.1), stars=0.15)
Wd.moon(direction=(0.5, 0.6, 0.35), strength=1.2, color=(0.6, 0.7, 1.0))
Wd.clouds(center=(0, 4000, -520), size=(18000, 18000, 340), density=0.05, scale=0.0011, coverage=0.5, detail=5,
          drift=(0, -3.7), evolve=0.03, frames=NF, sharp=0.2)
Wd.cloud_deck_far(z=-390, hole=8600)
Wd.sea_plane(size=80000, z=-2600, frames=NF)
Wd.city_lights('Coast', center=(-1800, 9000, -2430), radius=1500, count=2000, seed=5, strength=18, size=1.6)
ck = I.cockpit(panel_glow=1.0)
r1 = Md.orb('Red1', (0, 0, 0), strength=700, power=6e6, radius=3.5, halo=2.5, pulse=0.15, f1=NF, seed=1)
r2 = Md.orb('Red2', (0, 0, 0), strength=700, power=6e6, radius=3.5, halo=2.5, pulse=0.15, f1=NF, seed=2)
Md.fly(r1, [(0, (-60, 2600, 130), None), (NF, (-26, 420, 22), None)])
Md.fly(r2, [(0, (60, 2650, 70), None), (NF, (22, 470, -4), None)])
cam = C.Cam()
eye = (-0.10, 0.0, 0.56)
cam.shot(0, NF, C.dolly(eye, (-0.02, 0.30, 0.55), look=(0.02, 4.0, 0.45), look1=(-0.02, 4.0, 0.42)),
         lens=(30, 36), fstop=2.0, focus='Red1')
cam.handheld(0.004)
cam.kick(49, amp=0.12, decay=8, rot=0.6)
cam.bake(0, NF - 1)
core.render(a, sc)
