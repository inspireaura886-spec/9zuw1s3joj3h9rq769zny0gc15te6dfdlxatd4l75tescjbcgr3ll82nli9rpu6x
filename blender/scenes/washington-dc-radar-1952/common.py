"""Shared helpers for washington-dc-radar-1952 (REAL3D, 30-35 s A/B Short, 2026-11-03).
NO shake/kicks/handheld (kit defaults cruise-eased). Radar scope = kit interiors.radar_room with floor (blips stay lit)."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, timing as T, interiors as I
from mathutils import Vector

TGT = (0.06, 0.04, 1.03)          # hero scope face (look target)
HOOK_POS = (0.17, -0.60, 1.56)     # frame-0 hook framing (b01 start == b07 end, loop seam)
HOOK_LENS = 40
# seven targets (scope space): drift NE toward the scope centre (= Washington) over the hook
SEVEN0 = [(0.34, -0.42), (0.40, -0.30), (0.27, -0.33), (0.47, -0.40), (0.31, -0.22), (0.20, -0.46), (0.43, -0.18)]
SEVEN1 = [(x - 0.13, y + 0.16) for x, y in SEVEN0]
T0 = -0.6


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def setup(sc, exposure=1.0, vol=True, samples=20, glare=0.6, vignette=0.38, streaks=0.0, sat=0.95):
    core.setup_render(sc, samples=samples, look='AgX - Medium High Contrast', exposure=exposure,
                      vol_step=6.0 if vol else 8.0, vol_max_steps=56 if vol else 24, bounces=4, clamp_ind=4.0)
    core.finish(sc, glare=glare, glare_thr=1.0, glare_size=8, vignette=vignette, streaks=streaks,
                lift=(0.98, 1.0, 1.06), gain=(1.03, 1.0, 0.97), sat=sat)


def radar_set(NF, blips, seed=3, t0=T0, floor=0.55):
    sc = core.reset()
    setup(sc, exposure=0.95, vol=False, glare=0.6, vignette=0.45)
    Wd.hdri('moonless_golf', strength=0.02)
    I.radar_room(frames=NF, blips=blips, seed=seed, haze=0.02, t0=t0, ppi_floor=floor)
    return sc


def finish_cam(cam, NF, a, sc):
    cam.bake(0, NF - 1)
    sc.frame_start, sc.frame_end = 0, NF - 1
    core.render(a, sc)


def night_city(NF, exposure=1.1):
    """Washington at night from ~1 km: moonlit haze, warm city grid below, dark river band."""
    sc = core.reset()
    setup(sc, exposure=exposure, vol=True, glare=0.7, vignette=0.4)
    Wd.hdri('kloppenheim_02_puresky', strength=0.3, bg_strength=0.55, rot=160, tint=(0.75, 0.85, 1.1))
    Wd.moon(direction=(0.25, 0.9, 0.3), strength=1.6, color=(0.62, 0.72, 1.0))
    Wd.terrain('Land', size=40000, res=80, height=40, scale=0.0003, center=(0, 8000, -1010), seed=4,
               mat=M.principled('LandDC', base=(0.03, 0.032, 0.03), rough=0.9))
    Wd.city_lights('DC', center=(0, 6500, -985), radius=5000, count=12000, seed=52, strength=7, size=1.4, cluster=0.8)
    Wd.city_lights('DCcore', center=(300, 7000, -985), radius=1400, count=5000, seed=53, strength=10, size=1.2,
                   cluster=0.6, color=(1.0, 0.75, 0.45))
    Wd.city_lights('Avenue', center=(-600, 6000, -984), radius=30, count=500, seed=54, strength=16, size=1.6,
                   shape='line', length=6000, color=(1.0, 0.82, 0.55))
    Wd.fog(center=(0, 6000, -500), size=(40000, 40000, 1200), density=0.00005, color=(0.72, 0.78, 0.95),
           anisotropy=0.3)
    return sc
