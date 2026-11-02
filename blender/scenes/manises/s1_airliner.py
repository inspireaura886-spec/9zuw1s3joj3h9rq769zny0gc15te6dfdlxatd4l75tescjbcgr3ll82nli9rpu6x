"""Manises 1979 test: exterior airliner at night over a moonlit cloud deck near Ibiza, two red lights.
--variant A : plate 1 (0-229)  'November eleventh 1979 ... over Ibiza at night.'  (VO 0.00-7.65 s)
--variant B : plate 4 (0-184)  'The captain diverts ... told it is a fault.'      (VO 13.86-19.61 s)
"""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, timing as T
from mathutils import Vector

a = core.args()
variant = 'B' if '--variant' in a.extra and a.extra[a.extra.index('--variant') + 1] == 'B' else 'A'
sc = core.reset()
NF = 230 if variant == 'A' else 185
core.setup_render(sc, samples=20, look='AgX - Medium High Contrast', exposure=0.8, vol_step=6.0, vol_max_steps=64,
                  bounces=4, clamp_ind=4.0)
core.finish(sc, glare=0.6, glare_thr=1.0, glare_size=8, vignette=0.4, streaks=0.0,
            lift=(0.98, 1.0, 1.06), gain=(1.02, 1.0, 0.97), sat=0.95)

# ---------------- world ----------------
Wd.hdri('kloppenheim_02_puresky', strength=0.35, bg_strength=0.5, rot=140, tint=(0.75, 0.85, 1.1), stars=0.0)
Wd.moon(direction=(0.35, 0.8, 0.30), strength=2.4, color=(0.6, 0.7, 1.0), angle=0.55)
V = 110.0 / 30  # m per frame (~110 m/s approach speed, reads as motion against the deck)
Wd.clouds(center=(0, 600, -520), size=(18000, 18000, 340), density=0.05, scale=0.0011, coverage=0.5, detail=4,
          color=(0.9, 0.93, 1.0), anisotropy=0.4, evolve=0.08, frames=NF, sharp=0.2)
Wd.cloud_deck_far(z=-400, hole=6800)
Wd.sea_plane(size=80000, z=-2600, color=(0.003, 0.006, 0.01), rough=0.32, wave=0.15, frames=NF)
# Ibiza: island glow + town lights below the gaps, far ahead/below
land = Wd.terrain('Ibiza', size=14000, res=90, height=180, scale=0.00035, center=(2500, 5500, -2650), seed=4,
                  mat=M.principled('Land', base=(0.03, 0.035, 0.03), rough=0.9), island=1.0)
for i, (cx, cy, n, r) in enumerate([(1200, 4200, 900, 1600), (3800, 6900, 600, 1100), (600, 7600, 400, 900),
                                     (4200, 3300, 300, 700)]):
    Wd.city_lights('Town%d' % i, center=(cx, cy, -2430), radius=r, count=n, seed=11 + i, strength=6, size=1.2,
                   cluster=0.8)
# thin high haze for depth (aerial perspective)
Wd.fog(center=(0, 2000, -300), size=(90000, 90000, 1600), density=0.000025, color=(0.7, 0.78, 0.95), anisotropy=0.3)

# ---------------- actors ----------------
plane = Md.airliner('Airliner', f1=NF, cabin_glow=2.2)
red1 = Md.orb('Red1', (0, 0, 0), strength=600, power=3e5 if variant == 'A' else 1.5e5, radius=4.0, halo=2.0, pulse=0.12, f1=NF, seed=1)
red2 = Md.orb('Red2', (0, 0, 0), strength=600, power=3e5 if variant == 'A' else 1.5e5, radius=4.0, halo=2.0, pulse=0.12, f1=NF, seed=2)

if variant == 'A':
    # straight and level, heading +Y
    Md.fly(plane, [(0, (0, 0, 0), (0, 0, 0)), (NF, (0, V * NF, 0), (0.5, 0, 0))], interp='LINEAR')
    # red lights far behind-right, slowly gaining (hook: visible from frame 0 as two points)
    Md.fly(red1, [(0, (700, 2600, 160), None), (NF, (520, V * NF + 1500, 110), None)], interp='LINEAR')
    Md.fly(red2, [(0, (790, 2700, 120), None), (NF, (600, V * NF + 1580, 80), None)], interp='LINEAR')
    cam = C.Cam(clip_end=90000)
    # shot 1 (0-104): behind-left, low over the wing line, plane in the upper third, red lights tiny far right
    cam.shot(0, 105, C.track('Airliner', offset=(-24, -40, 5), offset1=(-19, -31, 3.5), look_offset=(14, 34, 1)),
             lens=(50, 56), fstop=5.6, focus='Airliner')
    # shot 2 (105-174): close glide along the lit windows toward the nose ('a hundred and nine passengers')
    cam.shot(105, 175, C.track('Airliner', offset=(-5.5, -6, -0.2), offset1=(-5.0, 6.5, 0.2), look_offset=(0, 2, 0.3)),
             lens=(32, 30), fstop=2.2, focus=None, roll=(-4, -2))
    # shot 3 (175-229): high, looking down past the fin at the island lights through the gaps ('over Ibiza')
    cam.shot(175, NF, C.track('Airliner', offset=(16, -36, 14), offset1=(12, -30, 11), look_offset=(-6, 200, -45)),
             lens=(28, 31), fstop=8, focus='Airliner', roll=(3, 2))
    cam.handheld(0.04)
else:
    # banking left turn + descent toward Valencia, the red light pacing behind
    Md.fly(plane, [(0, (0, 0, 0), (0, 0, 0)), (40, (-15, V * 40, -4), (0, -22, 6)),
                   (NF, (-520, V * NF * 0.9, -120), (-3, -26, 22))])
    # the lights pace the jet: parented to it, closing from far left-above
    for o, k in ((red1, 0), (red2, 1)):
        o.parent = plane
        Md.fly(o, [(0, (-260 - 40 * k, 220 + 30 * k, 60 + 15 * k), None), (NF, (-95 - 18 * k, 90 + 20 * k, 24 + 10 * k), None)])
    cam = C.Cam(clip_end=90000)
    # shot 1 (0-74): low front-right, the jet rolls into the turn across frame ('the captain diverts')
    cam.shot(0, 75, C.follow('Airliner', (110, 330, -40), (95, 360, -42), look_offset=(-20, 10, 8)),
             lens=(38, 42), fstop=5.6, focus='Airliner')
    # shot 2 (75-184): chase from behind-above; the red light hangs off the left wing, coast lights below
    cam.shot(75, NF, C.track('Airliner', offset=(34, -70, 16), offset1=(26, -56, 12), look_offset=(-45, 90, 4)),
             lens=(35, 38), fstop=6, focus='Airliner', roll=(-6, -9))
    cam.handheld(0.05)
    for i, (cx, cy, n, r) in enumerate([(-3000, 9000, 3000, 1400)]):
        Wd.city_lights('Valencia', center=(cx, cy, -2430), radius=3000, count=4000, seed=31, strength=3, size=1.4,
                       cluster=0.85)

cam.bake(0, NF - 1)
sc.frame_start, sc.frame_end = 0, NF - 1
core.render(a, sc)
