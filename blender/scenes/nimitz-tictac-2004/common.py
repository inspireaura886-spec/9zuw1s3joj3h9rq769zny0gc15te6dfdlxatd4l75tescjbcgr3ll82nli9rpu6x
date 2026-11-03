"""Shared helpers for the manises-1979 REAL3D Short (first production Short on the REAL3D kit, 2026-11-02).
Rules baked in: NO shake/kicks/handheld (user 2026-11-02), cruise-eased camera moves (kit default), orbs never
jitter (smooth breathing only), visible red lights stay IN frame, no moon glint on the sea (rough sea), exteriors
bright enough to read (exposure >= 1.0, moon in front of camera)."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, timing as T, interiors as I
from mathutils import Vector

V_JET = 110.0 / 30  # m per frame


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def setup(sc, exposure=1.0, vol=True, samples=20, glare=0.6, vignette=0.38, streaks=0.0, sat=0.95):
    core.setup_render(sc, samples=samples, look='AgX - Medium High Contrast', exposure=exposure,
                      vol_step=6.0 if vol else 8.0, vol_max_steps=56 if vol else 24, bounces=4, clamp_ind=4.0)
    core.finish(sc, glare=glare, glare_thr=1.0, glare_size=8, vignette=vignette, streaks=streaks,
                lift=(0.98, 1.0, 1.06), gain=(1.03, 1.0, 0.97), sat=sat)


def night_air(NF, moon_dir=(0.1, 0.9, 0.32), moon=2.6, clouds=True, coverage=0.48, hdri_rot=140):
    """Night sky above a moonlit cloud deck with dark (rough, glint-free) sea far below."""
    Wd.hdri('kloppenheim_02_puresky', strength=0.4, bg_strength=0.6, rot=hdri_rot, tint=(0.75, 0.85, 1.1), stars=0.0)
    Wd.moon(direction=moon_dir, strength=moon, color=(0.62, 0.72, 1.0), angle=0.55)
    if clouds:
        Wd.clouds(center=(0, 1500, -520), size=(18000, 18000, 340), density=0.05, scale=0.0011, coverage=coverage,
                  detail=4, color=(0.9, 0.93, 1.0), anisotropy=0.4, evolve=0.06, frames=NF, sharp=0.2)
        Wd.cloud_deck_far(z=-400, hole=6800)
    Wd.sea_plane(size=80000, z=-2600, color=(0.004, 0.007, 0.012), rough=0.75, wave=0.1, frames=NF)
    Wd.fog(center=(0, 2000, -300), size=(90000, 90000, 1600), density=0.00002, color=(0.7, 0.78, 0.95),
           anisotropy=0.3)


def red_orbs(NF, power=5e3, radius=3.0, halo=1.0, parent=None, color=(1.0, 0.07, 0.03), strength=60):
    """Close-range red lights (60-300 m): low emission so the core stays RED (AgX clips bright red to white) and
    low lamp power so the cloud deck is not washed pink."""
    r1 = Md.orb('Red1', (0, 0, 0), color=color, strength=strength, power=power, radius=radius, halo=halo, pulse=0.08,
                f1=NF, seed=1)
    r2 = Md.orb('Red2', (0, 0, 0), color=color, strength=strength, power=power, radius=radius, halo=halo, pulse=0.08,
                f1=NF, seed=2)
    if parent is not None:
        r1.parent = parent
        r2.parent = parent
    return r1, r2


def finish_cam(cam, NF, a, sc):
    cam.bake(0, NF - 1)
    sc.frame_start, sc.frame_end = 0, NF - 1
    core.render(a, sc)


def burner_ramp(name, keys):
    """Animate a fighter's afterburner: keys = [(frame, 0..1)]. Smooth ramps only (no flicker)."""
    import bpy
    m = bpy.data.materials.get(name + '_flame_m')
    L = bpy.data.objects.get(name + '_burnL')
    if m:
        s = m.node_tree.nodes['Emission'].inputs['Strength']
        M.animate(s, 'default_value', [(f, 60 * v) for f, v in keys])
    if L:
        for f, v in keys:
            L.data.energy = 4000 * v
            L.data.keyframe_insert('energy', frame=f)


def accel_keys(NF, a=0.015, y0=0.0, lift_f=None, climb=0.0, step=6):
    """Takeoff roll: y = y0 + a f^2 / 2; after lift_f the jet pitches up and climbs (climb m per frame^2)."""
    ks = []
    for f in list(range(0, NF, step)) + [NF]:
        y = y0 + 0.5 * a * f * f
        z, pitch = 0.0, 0.0
        if lift_f is not None and f > lift_f:
            k = f - lift_f
            z = 0.5 * climb * k * k
            pitch = min(12.0, k * 0.5)
        ks.append((f, (0, y, 1.3 + z), (pitch, 0, 0)))  # wheel bottoms touch z=0
    return ks


def runway(length=3200, width=45, y0=-400):
    """Asphalt runway with edge, centreline and threshold lights + dark grass around (one mesh per light kind)."""
    g = Wd.box('Grass', (0, length / 2 + y0, -0.05), (9000, length + 9000, 0.1))
    g.data.materials.append(M.principled('GrassN', base=(0.02, 0.025, 0.018), rough=0.95, bump=0.2))
    rw = Wd.box('Runway', (0, length / 2 + y0, 0.0), (width, length, 0.1))
    rw.data.materials.append(M.texture_set('Asphalt', 'asphalt_02', scale=0.12, tint=(0.45, 0.45, 0.45), rough_mul=0.85, box=True))
    def lights(name, pts, color, strength, s=0.35):
        verts, faces = [], []
        for (x, y) in pts:
            k = len(verts)
            verts += [(x - s, y - s, 0.12), (x + s, y - s, 0.12), (x + s, y + s, 0.12), (x - s, y + s, 0.12),
                      (x - s, y - s, 0.5), (x + s, y - s, 0.5), (x + s, y + s, 0.5), (x - s, y + s, 0.5)]
            faces += [(k, k + 1, k + 2, k + 3), (k + 4, k + 5, k + 6, k + 7), (k, k + 1, k + 5, k + 4),
                      (k + 1, k + 2, k + 6, k + 5), (k + 2, k + 3, k + 7, k + 6), (k + 3, k, k + 4, k + 7)]
        Md.mesh_obj(name, verts, faces, smooth=False, mats=(M.emission(name + '_m', color, strength),))
    ys = range(int(y0), int(y0 + length), 60)
    lights('EdgeL', [(s * (width / 2 + 1.5), y) for y in ys for s in (-1, 1)], (1.0, 0.85, 0.6), 40)
    lights('CentreL', [(0, y + 15) for y in range(int(y0), int(y0 + length), 30)], (0.85, 0.9, 1.0), 25, s=0.25)
    lights('Threshold', [(x, y0 + 2) for x in range(-int(width / 2), int(width / 2) + 1, 4)], (0.2, 1.0, 0.35), 50)
    return rw


def dusk_sea(NF, hdri_rot=100, moon_dir=(0.5, 0.8, 0.35), moon=2.2, sea_z=-0.4, ocean=True, wave_scale=1.2, wind=10):
    """Dusk Pacific shared by the nimitz plates (same light as b04)."""
    Wd.hdri('kloppenheim_02_puresky', strength=0.9, bg_strength=1.1, rot=hdri_rot, tint=(1.0, 0.92, 0.85))
    Wd.moon(direction=moon_dir, strength=moon, color=(1.0, 0.9, 0.8), angle=1.0)
    if ocean:
        o = Wd.ocean(center=(0, 0, 0), spatial=90, res=11, wave_scale=wave_scale, choppy=1.0, time_frames=NF, wind=wind)
        o.modifiers['Ocean'].repeat_x = o.modifiers['Ocean'].repeat_y = 3
    Wd.sea_plane(size=60000, z=sea_z, rough=0.12, frames=NF)
    Wd.fog(center=(0, 400, 20), size=(8000, 8000, 160), density=0.0004, color=(0.8, 0.85, 0.95))
