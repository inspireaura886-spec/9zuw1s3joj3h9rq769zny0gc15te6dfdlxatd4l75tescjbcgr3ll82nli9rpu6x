"""vela-incident-double-flash-1979 shared helpers (REAL3D, code-only daily batch 2026-11-09 IST). Built from the proven titanic tc.py builders + usa-32 space builders + slug part below.
User rules: 14-18 shots, mostly WIDE 24-35 mm; every plate one eased kit move, never shake.
Frame counts in frames.json (2.6 w/s at 30 fps + 8 handle frames); --nf overrides."""

import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, interiors as I
from kit import cine as CN
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def look(sc, samples=20, vol=False, glare=0.45, glare_thr=0.9, vignette=0.24, sat=0.92, lift=(0.98, 1.0, 1.05),
         gain=(1.0, 1.0, 1.0)):
    CN.setup(sc, samples=samples, adaptive=0.04, vol=vol, vol_step=4.0, glare=glare, glare_thr=glare_thr,
             vignette=vignette, sat=sat, lift=lift, gain=gain)
    cy = sc.cycles
    cy.max_bounces = 6
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 4
    cy.transparent_max_bounces = 8
    cy.sample_clamp_indirect = 5.0
    try:
        cy.volume_max_steps = 48 if vol else 16
    except Exception:
        pass
    return sc


def go(cam, NF, a, sc, meter=None, target=0.22):
    return CN.render(cam, NF, a, sc, meter_frame=meter, target=target)


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


# ------------------------------------------------------------------ small geometry helpers
def boxm(name, c, s, mat, bev=0.0, rot=None):
    o = Wd.box(name, c, s)
    o.data.materials.append(mat)
    if bev:
        I.bevel(o, bev)
    if rot:
        o.rotation_euler = rot
    return o


def cyl(name, p0, p1, r, mat, seg=20):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def sph(name, loc, r, mat, seg=14, ring=8, scale=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ring, radius=r, location=loc)
    o = bpy.context.active_object
    o.name = name
    for p in o.data.polygons:
        p.use_smooth = True
    if scale:
        o.scale = scale
    M.assign(o, mat)
    return o


def torus(name, loc, R, r, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=40, minor_segments=10, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = rot
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def curve_poly(name, pts, bevel=0.01, mat=None, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = bevel
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    sp.use_cyclic_u = cyclic
    o = link(bpy.data.objects.new(name, cu))
    if mat:
        o.data.materials.append(mat)
    return o


def lin(obj):
    ad = obj.animation_data
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = 'LINEAR'


def quads_mesh(name, rects, mat):
    """rects: list of (cx, cy, cz, w, h, axis) quad in the plane normal to axis ('x': spans y,z / 'y': spans x,z)."""
    vs, fs = [], []
    for (cx, cy, cz, w, h, ax) in rects:
        i = len(vs)
        if ax == 'x':
            vs += [(cx, cy - w / 2, cz - h / 2), (cx, cy + w / 2, cz - h / 2), (cx, cy + w / 2, cz + h / 2), (cx, cy - w / 2, cz + h / 2)]
        elif ax == 'y':
            vs += [(cx - w / 2, cy, cz - h / 2), (cx + w / 2, cy, cz - h / 2), (cx + w / 2, cy, cz + h / 2), (cx - w / 2, cy, cz + h / 2)]
        else:
            vs += [(cx - w / 2, cy - h / 2, cz), (cx + w / 2, cy - h / 2, cz), (cx + w / 2, cy + h / 2, cz), (cx - w / 2, cy + h / 2, cz)]
        fs.append((i, i + 1, i + 2, i + 3))
        fs.append((i + 3, i + 2, i + 1, i))
    o = Md.mesh_obj(name, vs, fs, smooth=False, mats=(mat,))
    return o


# ------------------------------------------------------------------ materials (shared)
def mats():
    d = {}
    d['brass'] = M.principled('Brass', base=(0.78, 0.52, 0.2), rough=0.28, metal=1.0, rough_noise=0.06)
    d['wood'] = M.principled('WoodDark', base=(0.12, 0.07, 0.04), rough=0.55, grime=0.4, rough_noise=0.1, bump=0.15, bump_scale=60)
    d['wood_l'] = M.principled('WoodMid', base=(0.30, 0.18, 0.09), rough=0.5, grime=0.35, rough_noise=0.1, bump=0.15, bump_scale=60)
    d['iron'] = M.principled('IronDark', base=(0.03, 0.03, 0.035), rough=0.55, metal=0.5, grime=0.3)
    d['coat'] = M.principled('CoatDark', base=(0.012, 0.014, 0.022), rough=0.85)
    d['paint_w'] = M.principled('PaintWhite', base=(0.62, 0.6, 0.55), rough=0.5, grime=0.25)
    d['buff'] = M.principled('FunnelBuff', base=(0.55, 0.34, 0.12), rough=0.6, grime=0.3)
    d['frost'] = M.principled('Frost', base=(0.75, 0.82, 0.88), rough=0.4, sss=0.1, rough_noise=0.15, bump=0.4, bump_scale=120)
    d['canvas'] = M.principled('Canvas', base=(0.10, 0.11, 0.10), rough=0.9, grime=0.3)
    d['warm'] = M.emission('WarmWin', (1.0, 0.68, 0.34), 5.0)
    d['paper'] = M.principled('Paper', base=(0.62, 0.6, 0.52), rough=0.8)
    return d


def ice_mat():
    return M.principled('Ice', base=(0.70, 0.82, 0.92), rough=0.3, spec=0.6, sss=0.25, rough_noise=0.12, bump=0.5, bump_scale=30)


# ------------------------------------------------------------------ worlds
def night(sea_z=0.0, star=0.9, hdri_strength=0.30, key=0.10, key_dir=(-0.5, -0.3, 0.45), NF=120, sea_color=(0.002, 0.004, 0.008)):
    """Moonless clear night: HDRI stars, very faint cold starlight key, calm glossy sea at sea_z."""
    Wd.hdri('qwantani_night_puresky', strength=hdri_strength, bg_strength=1.0, rot=200, tint=(0.62, 0.74, 1.0), stars=star)
    Wd.moon(direction=key_dir, strength=key, color=(0.55, 0.68, 1.0), angle=2.0)
    Wd.sea_plane(size=90000, z=sea_z, color=sea_color, rough=0.045, wave=0.06, wave_scale=0.05, frames=max(NF, 60))


def ice_floe_meshes(n=7, seed=3):
    rnd = random.Random(seed)
    meshes = []
    for k in range(n):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
        for v in bm.verts:
            f = 1.0 + rnd.uniform(-0.22, 0.22)
            v.co.x *= f * 1.1
            v.co.y *= f * rnd.uniform(0.8, 1.15)
            v.co.z *= (0.30 + 0.28 * rnd.random()) * (1.0 if v.co.z > 0 else 0.8)
            if v.co.z > 0.1:
                v.co.z += rnd.uniform(-0.04, 0.12)
        me = bpy.data.meshes.new('FloeMesh%d' % k)
        bm.to_mesh(me)
        bm.free()
        for p in me.polygons:
            p.use_smooth = True
        meshes.append(me)
    return meshes


def ice_field(n, area, sea_z, seed=5, avoid=None, size=(2.0, 14.0), mat=None, berg=0):
    """Scatter n floes (linked mesh data, random scale/rotation) in area=(xmin,xmax,ymin,ymax). A few taller bergs."""
    rnd = random.Random(seed)
    mat = mat or ice_mat()
    meshes = ice_floe_meshes(7, seed)
    for me in meshes:
        me.materials.append(mat)
    out, tries = [], 0
    while len(out) < n and tries < n * 40:
        tries += 1
        x, y = rnd.uniform(area[0], area[1]), rnd.uniform(area[2], area[3])
        if avoid and avoid(x, y):
            continue
        s = rnd.uniform(*size) ** 1.0
        if rnd.random() < 0.25:
            s *= 1.8
        o = bpy.data.objects.new('Floe%d' % len(out), rnd.choice(meshes))
        link(o)
        o.location = (x, y, sea_z - 0.05 * s)
        o.rotation_euler = (0, 0, rnd.uniform(0, 6.283))
        o.scale = (s, s * rnd.uniform(0.7, 1.4), s * rnd.uniform(0.7, 1.3))
        out.append(o)
    for k in range(berg):
        s = rnd.uniform(25, 40)
        x, y = rnd.uniform(area[0], area[1]), rnd.uniform(area[2], area[3])
        if avoid and avoid(x, y):
            continue
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1.0)
        for v in bm.verts:
            f = 1.0 + rnd.uniform(-0.3, 0.3)
            v.co.x *= f
            v.co.y *= f
            v.co.z = max(v.co.z, -0.2) * (0.6 + 0.9 * rnd.random()) * (1.0 + 0.6 * max(0, 1 - (v.co.x ** 2 + v.co.y ** 2)))
        me = bpy.data.meshes.new('Berg%d' % k)
        bm.to_mesh(me)
        bm.free()
        for p in me.polygons:
            p.use_smooth = True
        me.materials.append(mat)
        o = link(bpy.data.objects.new('Berg%d' % k, me))
        o.location = (x, y, sea_z - 0.3 * s)
        o.rotation_euler = (0, 0, rnd.uniform(0, 6.283))
        o.scale = (s, s * 0.8, s * 0.55)
    return out


# ------------------------------------------------------------------ distant liner lights (reads as lit decks, NOT a sinking ship)
def distant_lights(center, sea_z, length=240.0, k=1.0, yaw_deg=0.0, strength=26.0, glow=True):
    """Row of warm deck lights + two white mastheads, seen end-on-ish from far away. k scales sizes with distance
    (k = distance / 3000). Returns empty."""
    root = Md.empty('DistantLiner', center)
    warm = M.emission('DLwarm', (1.0, 0.72, 0.38), strength)
    white = M.emission('DLwhite', (1.0, 0.96, 0.9), strength * 1.3)
    rects = []
    rnd = random.Random(11)
    for row, (z, n) in enumerate(((7, 40), (11, 42), (15, 34), (19, 24))):
        for i in range(n):
            if rnd.random() < 0.12:
                continue
            x = (i / (n - 1) - 0.5) * length * (1.0 - 0.06 * row)
            rects.append((x * k * 0 + x, 0.0, z, 2.6 * k, 2.2 * k, 'y'))
    o = quads_mesh('DLrows', [(r[0], r[1], sea_z + r[2] * k - center[2], r[3], r[4], r[5]) for r in rects], warm)
    o.parent = root
    for x, z in ((-length * 0.30, 44), (length * 0.22, 40)):
        s = sph('DLmast', (x, 0, sea_z + z * k - center[2]), 1.8 * k, white, 8, 6)
        s.parent = root
    if glow:
        g = sph('DLglow', (0, 0, sea_z + 14 * k - center[2]), 1.0, M.emission('DLhalo', (1.0, 0.7, 0.4), 0.25), 10, 8,
                scale=(length * 0.55 * k, 2.0 * k, 22 * k))
        g.parent = root
        g.visible_shadow = False
    root.rotation_euler = (0, 0, math.radians(yaw_deg))
    return root


# ------------------------------------------------------------------ rockets (white, Roman-candle style)
def _glow(name, color, strength):
    return M.emission(name, color, strength)


def rocket(launch, burst, f_launch, flight_f, k=1.0, life_f=46, seed=1, flash_power=2.0e6, n_star=36, spread=150.0,
           tag='R', star_r=4.6, trail_w=2.4, trail_len_f=8):
    """Rising comet trail launch -> burst, then a white star burst with gravity and a decaying flash light.
    All sizes multiplied by k (distance/3000)."""
    rnd = random.Random(seed)
    L, B = Vector(launch), Vector(burst)
    f_b = f_launch + flight_f
    white = _glow(tag + 'trail', (1.0, 0.95, 0.85), 40.0)
    # trail
    cu = curve_poly(tag + 'Trail', [tuple(L), tuple(L.lerp(B, 0.5) + Vector((0, 0, 4 * k))), tuple(B)], bevel=trail_w * k, mat=white)
    cd = cu.data
    cd.bevel_factor_mapping_start = 'SPLINE'
    cd.bevel_factor_mapping_end = 'SPLINE'
    Lf = trail_len_f / max(flight_f, 1)
    for f, s_, e_ in ((f_launch - 1, 0.0, 0.0), (f_launch - 1 + trail_len_f, 0.0, Lf), (f_b, 1 - Lf, 1.0), (f_b + trail_len_f, 1.0, 1.0)):
        cd.bevel_factor_start = s_
        cd.bevel_factor_end = e_
        cd.keyframe_insert('bevel_factor_start', frame=f)
        cd.keyframe_insert('bevel_factor_end', frame=f)
    # head
    head = sph(tag + 'Head', tuple(L), 2.4 * k, white, 8, 6)
    head.keyframe_insert('location', frame=f_launch - 1)
    head.scale = (1, 1, 1)
    head.keyframe_insert('scale', frame=f_launch - 1)
    head.location = tuple(B)
    head.keyframe_insert('location', frame=f_b)
    head.scale = (0.0, 0.0, 0.0)
    head.keyframe_insert('scale', frame=f_b + 1)
    head.scale = (0.0, 0.0, 0.0)
    head.keyframe_insert('scale', frame=f_launch - 2)
    head.scale = (1, 1, 1)
    head.keyframe_insert('scale', frame=f_launch - 1)
    head.scale = (1, 1, 1)
    head.keyframe_insert('scale', frame=f_b)
    lin(head)
    # burst stars
    star_m = _glow(tag + 'star', (1.0, 0.93, 0.80), 70.0)
    T = life_f / 30.0
    for i in range(n_star):
        v = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)))
        if v.length < 1e-3:
            v = Vector((0, 0, 1))
        v.normalize()
        sp = spread * k * rnd.uniform(0.55, 1.0) / T
        o = sph(tag + 'S%d' % i, tuple(B), star_r * k * rnd.uniform(0.7, 1.15), star_m, 6, 4)
        o.scale = (0, 0, 0)
        o.keyframe_insert('scale', frame=f_b - 1)
        for j in range(0, life_f + 1, 3):
            t = j / 30.0
            p = B + v * sp * (t - 0.5 * t * t / T) + Vector((0, 0, -0.5 * 20.0 * k * t * t))
            o.location = p
            o.keyframe_insert('location', frame=f_b + j)
            s = max(0.0, 1.0 - (t / T) ** 1.6)
            o.scale = (s, s, s)
            o.keyframe_insert('scale', frame=f_b + j)
        lin(o)
    # flash
    ld = bpy.data.lights.new(tag + 'Flash', 'POINT')
    ld.color = (1.0, 0.95, 0.88)
    ld.shadow_soft_size = 5.0 * k
    lo = link(bpy.data.objects.new(tag + 'Flash', ld))
    lo.location = tuple(B)
    for f, p in ((f_b - 2, 0.0), (f_b, flash_power), (f_b + life_f * 0.6, flash_power * 0.25), (f_b + life_f + 4, 0.0)):
        ld.energy = p
        ld.keyframe_insert('energy', frame=int(f))
    lin(ld)
    return f_b


# ------------------------------------------------------------------ steamer (generic single funnel, ~130 m)
def steamer(name='Steamer', loc=(0, 0, 0), yaw_deg=0.0, NF=120, lit=1.0, roll=True):
    """Bow +Y, waterline z=0 (local). Hull loft + bridge house + buff funnel with black top + two masts + derricks.
    Generic; no name, no flag, no markings."""
    Lh, B, KEEL = 65.0, 17.0, -7.0
    d = mats()
    hull_m = M.principled('SteamHull', base=(0.012, 0.013, 0.016), rough=0.5, grime=0.25, rough_noise=0.1)
    red_m = M.principled('SteamBoot', base=(0.12, 0.02, 0.015), rough=0.55, grime=0.3)
    rows = []
    for kk in range(45):
        y = -Lh + 2 * Lh * kk / 44
        u = y / Lh
        w = (B / 2) * ((1 - u ** 2.2) ** 0.55 if u > 0 else (1 - abs(u) ** 5) ** 0.5)
        w = max(w, 0.12)
        zd = 6.0 + 3.0 * max(0, u) ** 2.2 + 1.2 * max(0, -u) ** 2
        sec = [(w, zd), (w * 0.99, 0.0), (w * 0.9, -3.0), (w * 0.5, -6.0), (0.0, KEEL)]
        pts = sec + [(-x, z) for x, z in reversed(sec[:-1])]
        rows.append([(x, y, z) for x, z in pts])
    v, f = Md.loft(rows, cap_start=True, cap_end=True)
    root = Md.empty(name, loc)
    Md.mesh_obj(name + '_Hull', v, f, parent=root, smooth=True, mats=(hull_m,))
    parts = [boxm(name + '_Deck', (0, -2, 6.05), (B * 0.93, 112, 0.12), d['wood']),
             boxm(name + '_BoatDk', (0, 2, 9.4), (B * 0.62, 36, 0.14), d['wood_l'])]
    parts.append(boxm(name + '_Bridge', (0, 2, 7.8), (B * 0.58, 30, 3.2), d['paint_w'], 0.1))
    parts.append(boxm(name + '_Wheel', (0, 8, 11.2), (6.5, 9, 3.0), d['paint_w'], 0.08))
    parts.append(boxm(name + '_WingBar', (0, 8, 12.55), (B * 0.58, 1.4, 0.14), d['paint_w']))
    parts.append(cyl(name + '_Funnel', (0, -12, 9.6), (0, -12, 19.5), 2.5, d['buff'], 28))
    parts.append(cyl(name + '_FunnelTop', (0, -12, 17.2), (0, -12, 20.3), 2.56, d['iron'], 28))
    parts.append(cyl(name + '_Fore', (0, 36, 6.0), (0, 36, 26.0), 0.32, d['iron'], 10))
    parts.append(cyl(name + '_Main', (0, -42, 6.0), (0, -42, 22.0), 0.3, d['iron'], 10))
    parts.append(cyl(name + '_Yard', (-4.0, 36, 21.0), (4.0, 36, 21.0), 0.12, d['iron'], 8))
    for i, (yy, sg) in enumerate(((36, 1), (36, -1), (-42, 1), (-42, -1))):
        parts.append(cyl(name + '_Der%d' % i, (0, yy, 9.0), (sg * 7.0, yy + (6 if yy > 0 else -6), 12.5), 0.12, d['iron'], 8))
    for i, yy in enumerate((24, 14, -30, -50)):
        parts.append(boxm(name + '_Hatch%d' % i, (0, yy, 6.7), (6.5, 5.0, 1.2), d['wood_l'], 0.05))
    for i in range(4):
        sgn = 1 if i % 2 == 0 else -1
        parts.append(boxm(name + '_Boat%d' % i, (sgn * 5.0, 6 - 12 * (i // 2), 10.2), (2.2, 7.0, 1.4), d['paint_w'], 0.12))
    for p in parts:
        p.parent = root
    # lit windows
    wr = []
    for yy in [-12 + 2.0 * j for j in range(13)]:
        if abs(yy - 0.0) < 0.1:
            continue
        for sgx in (1, -1):
            wr.append((sgx * (B * 0.29 + 0.02), yy + 2, 7.9, 1.1, 0.8, 'x'))
    for j in range(5):
        wr.append((-3.28 + 1.6 * j, 12.52, 11.4, 1.1, 0.9, 'y'))
        wr.append((-3.28 + 1.6 * j, 3.48, 11.4, 1.1, 0.9, 'y'))
    for sgx in (1, -1):
        wr.append((sgx * 3.27, 8, 11.4, 5.5, 0.9, 'x'))
    win = M.emission(name + 'Win', (1.0, 0.66, 0.30), 5.0 * lit)
    w = quads_mesh(name + '_Windows', wr, win)
    w.parent = root
    # nav lights
    red = M.emission(name + 'Red', (1.0, 0.05, 0.03), 30.0)
    grn = M.emission(name + 'Grn', (0.05, 1.0, 0.2), 30.0)
    wht = M.emission(name + 'Wht', (1.0, 0.95, 0.85), 40.0)
    for nm, x, m_ in (('P', -4.2, red), ('S', 4.2, grn)):
        s = sph(name + 'Nav' + nm, (x, 8, 12.9), 0.28, m_, 8, 6)
        s.parent = root
    s = sph(name + 'MastLamp', (0, 36, 26.3), 0.3, wht, 8, 6)
    s.parent = root
    # warm light spilling on the ice + hull
    for y_ in (-10, 6, 20):
        l_ = Wd.point(name + 'Spill%d' % y_, (0, y_, 9.0), color=(1.0, 0.68, 0.36), power=2200 * lit, radius=0.6)
        l_.parent = root
    if roll:
        for fr in range(0, NF + 1, 4):
            t = fr / 30.0
            root.location = (loc[0], loc[1], loc[2] + 0.08 * math.sin(t * 0.8))
            root.rotation_euler = (math.radians(0.35 * math.sin(t * 0.6)), math.radians(0.5 * math.sin(t * 0.5 + 0.6)), math.radians(yaw_deg))
            root.keyframe_insert('location', frame=fr)
            root.keyframe_insert('rotation_euler', frame=fr)
    else:
        root.rotation_euler = (0, 0, math.radians(yaw_deg))
    return root


# ------------------------------------------------------------------ people (faceless dark silhouettes)
def officer(name, loc, yaw_deg=0.0, binoc=False, d=None):
    d = d or mats()
    m = d['coat']
    root = Md.empty(name, loc)
    parts = []
    parts.append(cyl(name + 'Coat', (0, 0, 0.35), (0, 0, 1.38), 0.27, m, 16))
    parts.append(cyl(name + 'LegL', (-0.1, 0, 0.0), (-0.1, 0, 0.45), 0.08, m, 10))
    parts.append(cyl(name + 'LegR', (0.1, 0, 0.0), (0.1, 0, 0.45), 0.08, m, 10))
    parts.append(sph(name + 'Sh', (0, 0, 1.42), 0.27, m, 14, 8, scale=(1.0, 0.65, 0.45)))
    parts.append(cyl(name + 'Neck', (0, 0, 1.45), (0, 0, 1.6), 0.07, m, 8))
    parts.append(sph(name + 'Head', (0, 0, 1.7), 0.115, m, 14, 10, scale=(1.0, 1.05, 1.08)))
    parts.append(cyl(name + 'Cap', (0, 0, 1.78), (0, 0, 1.84), 0.135, m, 16))
    parts.append(boxm(name + 'Brim', (0, 0.12, 1.775), (0.2, 0.1, 0.014), m))
    if binoc:
        parts.append(cyl(name + 'ArmL', (-0.27, 0.0, 1.35), (-0.12, 0.22, 1.66), 0.055, m, 8))
        parts.append(cyl(name + 'ArmR', (0.27, 0.0, 1.35), (0.12, 0.22, 1.66), 0.055, m, 8))
        parts.append(boxm(name + 'Bino', (0, 0.3, 1.68), (0.2, 0.18, 0.08), d['iron'], 0.012))
    else:
        parts.append(cyl(name + 'ArmL', (-0.27, 0.0, 1.35), (-0.3, 0.12, 0.95), 0.055, m, 8))
        parts.append(cyl(name + 'ArmR', (0.27, 0.0, 1.35), (0.3, 0.12, 0.95), 0.055, m, 8))
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw_deg))
    return root


# ------------------------------------------------------------------ bridge wing set (platform z=0, rail at y=+2.4, bow toward +Y)
def bridge_set(sea_z=-14.0, d=None, lamp=True, telegraph=True):
    d = d or mats()
    boxm('BWFloor', (0, 0, -0.07), (7.0, 5.2, 0.14), d['wood_l'], 0.01)
    # rail: posts + rails + bulwark board
    for i in range(-4, 5):
        cyl('BWPost%d' % i, (i * 0.8 * 0.5, 2.4, 0), (i * 0.8 * 0.5, 2.4, 1.05), 0.03, d['iron'], 8)
    cyl('BWRailTop', (-3.5, 2.4, 1.08), (3.5, 2.4, 1.08), 0.045, d['frost'], 10)
    cyl('BWRailMid', (-3.5, 2.4, 0.6), (3.5, 2.4, 0.6), 0.025, d['iron'], 8)
    boxm('BWBulwark', (0, 2.42, 0.22), (7.0, 0.05, 0.44), d['canvas'])
    boxm('BWRailSideL', (-3.5, 0.0, 0.5), (0.06, 5.0, 1.0), d['canvas'])
    # pilot house wall behind
    boxm('BWWall', (0, -2.6, 1.4), (7.0, 0.2, 2.8), d['paint_w'], 0.02)
    for i, x in enumerate((-2.2, 0.0, 2.2)):
        boxm('BWWin%d' % i, (x, -2.48, 1.55), (1.3, 0.04, 0.85), d['warm'])
    boxm('BWRoof', (0, -1.3, 2.85), (7.2, 2.8, 0.1), d['iron'])
    # fore deck + hull far below (so the ship reads as a ship)
    boxm('BWFore', (0, 33.0, -6.0), (17.0, 62.0, 0.5), d['wood'], 0.0)
    boxm('BWFHatch', (0, 14.0, -5.2), (6.5, 5.0, 1.2), d['wood_l'], 0.05)
    boxm('BWFHatch2', (0, 24.0, -5.2), (6.5, 5.0, 1.2), d['wood_l'], 0.05)
    cyl('BWFore', (0, 34, -5.8), (0, 34, 14), 0.3, d['iron'], 10)
    cyl('BWDerrick', (0, 34, 8.0), (6.0, 46, 3.0), 0.1, d['iron'], 8)
    boxm('BWHull', (0, 33.0, -10.1), (17.0, 62.0, 7.8), d['coat'], 0.0)
    boxm('BWBow', (0, 62.0, -4.5), (7.0, 8.0, 3.0), d['coat'], 0.2)
    if telegraph:
        cyl('TelePed', (-0.4, 0.8, 0.0), (-0.4, 0.8, 0.92), 0.075, d['iron'], 14)
        cyl('TeleDial', (-0.4, 0.8, 1.02), (-0.4, 0.9, 1.02), 0.27, d['brass'], 32)
        cyl('TeleFace', (-0.4, 0.74, 1.02), (-0.4, 0.795, 1.02), 0.235, M.principled('TeleFace', base=(0.55, 0.5, 0.38), rough=0.5), 32)
        cyl('TeleHandleA', (-0.4, 0.74, 1.02), (-0.6, 0.71, 1.14), 0.015, d['brass'], 8)
        cyl('TeleHandleB', (-0.4, 0.74, 1.02), (-0.23, 0.71, 0.9), 0.015, d['brass'], 8)
        sph('TeleKnobA', (-0.6, 0.71, 1.14), 0.035, d['brass'], 10, 6)
        sph('TeleKnobB', (-0.23, 0.71, 0.9), 0.035, d['brass'], 10, 6)
    # binnacle
    boxm('Binn', (0.5, 0.55, 0.45), (0.34, 0.34, 0.9), d['wood'], 0.02)
    sph('BinnDome', (0.5, 0.55, 0.98), 0.2, d['brass'], 16, 8, scale=(1, 1, 0.8))
    glow = M.emission('BinnGlow', (1.0, 0.62, 0.28), 6.0)
    cyl('BinnCard', (0.5, 0.37, 1.0), (0.5, 0.41, 1.0), 0.11, glow, 20)
    Wd.point('BinnLight', (0.5, 0.2, 1.05), color=(1.0, 0.62, 0.3), power=14, radius=0.05)
    Wd.area('BWWinSpill', (0, -2.2, 2.0), (0, 1.0, 0.4), color=(1.0, 0.68, 0.38), power=70, size=3.0)
    if lamp:
        boxm('LanternBody', (-3.2, 1.9, 1.5), (0.18, 0.18, 0.26), d['iron'], 0.02)
        sph('LanternGlow', (-3.2, 1.9, 1.5), 0.08, M.emission('LanternG', (1.0, 0.7, 0.35), 8.0), 8, 6)
        Wd.point('LanternLight', (-3.2, 1.85, 1.5), color=(1.0, 0.7, 0.35), power=18, radius=0.05)


# ------------------------------------------------------------------ Morse lamp
MORSE = [(8, 12), (16, 20), (24, 28), (36, 48), (52, 56), (60, 72), (76, 80), (84, 88), (96, 108), (112, 116),
         (120, 124), (128, 140), (146, 150), (156, 160), (164, 176)]


def morse_lamp(loc=(0.0, 2.05, 1.18), aim=(0, 400, 12), NF=120, power=3000.0, d=None, pattern=MORSE, scale=1.0):
    d = d or mats()
    x, y, z = loc
    cyl('MLStand', (x, y - 0.05, 1.05), (x, y - 0.05, z - 0.1), 0.025, d['iron'], 8)
    cyl('MLBody', (x, y - 0.22, z), (x, y + 0.16, z), 0.11 * scale, d['brass'], 24)
    cyl('MLHood', (x, y + 0.16, z), (x, y + 0.30, z), 0.135 * scale, d['brass'], 24)
    boxm('MLHandle', (x, y - 0.3, z + 0.11), (0.03, 0.14, 0.03), d['iron'], 0.004)
    lens = glow_disc('MLLens', (x, y + 0.168, z), 0.105 * scale, (1.0, 0.82, 0.55), 40.0)
    sp = Wd.spot('MLSpot', (x, y + 0.2, z), aim, color=(1.0, 0.86, 0.6), power=power, size_deg=9, blend=0.5, radius=0.04)
    keys = [(0, 0.0)]
    for a_, b_ in pattern:
        if a_ >= NF + 6:
            break
        keys += [(a_ - 1, 0.0), (a_, 1.0), (b_, 1.0), (b_ + 1, 0.0)]
    keys.append((NF + 10, 0.0))
    for f, v in keys:
        lens.node_tree.nodes['Mix'].inputs[0].default_value = v
        lens.node_tree.nodes['Mix'].inputs[0].keyframe_insert('default_value', frame=f)
        sp.data.energy = power * v
        sp.data.keyframe_insert('energy', frame=f)
    for fc in (sp.data.animation_data.action.fcurves if sp.data.animation_data else []):
        for k in fc.keyframe_points:
            k.interpolation = 'CONSTANT'
    for fc in lens.node_tree.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = 'CONSTANT'
    return lens


def glow_disc(name, loc, r, color, strength):
    m, nb, b, out = M.new(name + 'M')
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=strength)
    em.inputs['Color'].default_value = (*color, 1)
    mx = nb.n('ShaderNodeMixShader')
    mx.name = 'Mix'
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    mx.inputs[0].default_value = 0.0
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=0.01, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = (math.radians(90), 0, 0)
    o.data.materials.append(m)
    return m


# ------------------------------------------------------------------ clocks / rooms
def clock(name, loc, hour, minute, r=0.17, normal_axis='y', d=None, lit=True, hour_end=None, min_end=None, f0=0, f1=100):
    """Wall clock facing -Y (face toward a camera at lower y). hands in degrees from 12 o'clock clockwise.
    hour_end/min_end animate the hands between f0..f1."""
    d = d or mats()
    x, y, z = loc
    face = M.principled(name + 'Face', base=(0.62, 0.6, 0.52), rough=0.6, emission=(1.0, 0.8, 0.5) if lit else None, emit=0.35 if lit else 0.0)
    cyl(name + 'Rim', (x, y, z), (x, y + 0.04, z), r * 1.1, d['brass'], 40)
    cyl(name + 'Face', (x, y - 0.002, z), (x, y + 0.03, z), r, face, 40)
    for i in range(12):
        a = math.radians(30 * i)
        boxm(name + 'Tick%d' % i, (x + math.sin(a) * r * 0.86, y - 0.006, z + math.cos(a) * r * 0.86),
             (0.012, 0.004, 0.03 if i % 3 else 0.05), d['iron'], rot=(0, a, 0))

    def hand(nm, length, w, ang0, ang1):
        pivot = Md.empty(nm + 'Piv', (x, y - 0.012, z))
        h = boxm(nm, (0, 0, length / 2), (w, 0.006, length), d['iron'])
        h.parent = pivot
        pivot.rotation_mode = 'XYZ'
        pivot.rotation_euler = (0, math.radians(ang0), 0)
        pivot.keyframe_insert('rotation_euler', frame=f0)
        if ang1 is not None:
            pivot.rotation_euler = (0, math.radians(ang1), 0)
            pivot.keyframe_insert('rotation_euler', frame=f1)
            lin(pivot)
        return pivot
    ha = (hour % 12) * 30 + minute * 0.5
    hand(name + 'Hr', r * 0.55, 0.014, ha, None if hour_end is None else ((hour_end[0] % 12) * 30 + hour_end[1] * 0.5))
    hand(name + 'Mn', r * 0.8, 0.009, minute * 6, None if min_end is None else min_end * 6)


def room_shell(sx, sy, sz, center, wall_m, floor_m, ceil_m, open_side=None):
    cx, cy, cz = center
    boxm('Floor', (cx, cy, cz - 0.02), (sx, sy, 0.04), floor_m)
    boxm('Ceil', (cx, cy, cz + sz + 0.02), (sx, sy, 0.04), ceil_m)
    for nm, c, s in (('WBack', (cx, cy + sy / 2, cz + sz / 2), (sx, 0.1, sz)), ('WFront', (cx, cy - sy / 2, cz + sz / 2), (sx, 0.1, sz)),
                     ('WLeft', (cx - sx / 2, cy, cz + sz / 2), (0.1, sy, sz)), ('WRight', (cx + sx / 2, cy, cz + sz / 2), (0.1, sy, sz))):
        if nm != open_side:
            boxm(nm, c, s, wall_m)


def wood_floor(name='Parquet', tint=(0.25, 0.16, 0.09), scale=3.0):
    return M.texture_set(name, 'wood_table_worn', scale=scale, tint=tint)


def chair(name, loc, yaw=0.0, d=None, h=0.46):
    d = d or mats()
    root = Md.empty(name, loc)
    parts = [boxm(name + 'Seat', (0, 0, h), (0.46, 0.44, 0.05), d['wood'], 0.01),
             boxm(name + 'Back', (0, -0.2, h + 0.4), (0.44, 0.04, 0.72), d['wood'], 0.01)]
    for i, (sx, sy) in enumerate(((1, 1), (-1, 1), (1, -1), (-1, -1))):
        parts.append(boxm(name + 'Lg%d' % i, (sx * 0.2, sy * 0.19, h / 2), (0.04, 0.04, h), d['wood']))
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def paper_stack(name, loc, rot=0.0, n=1, d=None):
    d = d or mats()
    for i in range(n):
        boxm('%s%d' % (name, i), (loc[0], loc[1], loc[2] + 0.004 * i), (0.30, 0.21, 0.003), d['paper'],
             rot=(0, 0, math.radians(rot + 4 * i)))


def dashed_ring(name, center, r, n=28, dash=0.05, w=0.012, mat=None, f_on=None, z=0.0):
    out = []
    for i in range(n):
        a = 2 * math.pi * (i + 0.5) / n
        arc = 2 * math.pi * r / n * 0.55
        o = boxm('%s%d' % (name, i), (center[0] + math.cos(a) * r, center[1] + math.sin(a) * r, center[2] + z), (w, arc, 0.004), mat,
                 rot=(0, 0, a))
        out.append(o)
        if f_on is not None:
            f0, f1 = f_on
            t0 = f0 + (f1 - f0) * i / n
            o.scale = (0, 0, 0)
            o.keyframe_insert('scale', frame=int(t0))
            o.scale = (1, 1, 1)
            o.keyframe_insert('scale', frame=int(t0) + 3)
            lin(o)
    return out


# ---------------------------------------------------------------- from usa-32-farrah-2026/common.py (space)
R = random.Random(7)


def mat_once(name, **kw):
    return bpy.data.materials.get(name) or M.principled(name, **kw)


def glow_mat(name, color=(0.55, 0.9, 1.0), strength=6.0):
    """Emission mixed with Transparent; animate nodes['Mix'].inputs[0] (0 = invisible, 1 = full glow). No light."""
    m, nb, b, out = M.new(name)
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=strength)
    em.inputs['Color'].default_value = (*color, 1)
    mx = nb.n('ShaderNodeMixShader')
    mx.name = 'Mix'
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    mx.inputs[0].default_value = 1.0
    return m


def key_fac(m, keys):
    s = m.node_tree.nodes['Mix'].inputs[0]
    for f, v in keys:
        s.default_value = v
        s.keyframe_insert('default_value', frame=f)


def ring_mesh(name, r=1.0, w=0.02, n=128):
    vs, fs = [], []
    for k in range(n):
        t = 2 * math.pi * k / n
        vs += [((r - w / 2) * math.cos(t), (r - w / 2) * math.sin(t), 0), ((r + w / 2) * math.cos(t), (r + w / 2) * math.sin(t), 0)]
    for k in range(n):
        a, b = 2 * k, 2 * ((k + 1) % n)
        fs.append((a, b, b + 1, a + 1))
    return Md.mesh_obj(name, vs, fs, smooth=False)


def grow_curve(o, keys):
    cu = o.data
    cu.bevel_factor_mapping_end = 'SPLINE'
    for f, v in keys:
        cu.bevel_factor_end = v
        cu.keyframe_insert('bevel_factor_end', frame=f)


def ribbon(name, pts, w=1.0, mat=None, z=0.02, closed=False):
    """Flat strip of width w following a 2D polyline at height z (geoglyph lines, trails, slashes on flat ground)."""
    P2 = [Vector((p[0], p[1])) for p in pts]
    if closed:
        P2 = P2 + [P2[0]]
    vs, fs = [], []
    for i, p in enumerate(P2):
        d = (P2[min(i + 1, len(P2) - 1)] - P2[max(i - 1, 0)])
        d = d.normalized() if d.length > 1e-6 else Vector((1, 0))
        n = Vector((-d.y, d.x)) * (w / 2)
        vs += [(p.x + n.x, p.y + n.y, z), (p.x - n.x, p.y - n.y, z)]
    for i in range(len(P2) - 1):
        fs.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    o = Md.mesh_obj(name, vs, fs, smooth=False, mats=(mat,) if mat else ())
    return o


def sphere(name, loc, r, mat, scale=(1, 1, 1), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.shade_smooth()
    M.assign(o, mat)
    return o


def key_loc(o, keys, interp='BEZIER'):
    for f, p in keys:
        o.location = p
        o.keyframe_insert('location', frame=f)
    M.set_interp(o, interp)
EARTH_C = Vector((0, 0, -1200.0))
EARTH_R = 1000.0
ORBIT_R = 1200.0          # stylised orbit radius about EARTH_C (satellite sits 200 u above the surface)


def space(sun_az=120, sun_elev=28, sun_strength=3.2, stars=1.0):
    """Black sky with a fine starfield, one hard sun, no volumes (space)."""
    Wd.hdri('qwantani_night_puresky', strength=0.01, bg_strength=0.5, rot=40, tint=(0.8, 0.85, 1.0), stars=stars)
    CN.sun(elev=sun_elev, az=sun_az, warmth='noon', strength=sun_strength, check=False)


def earth_mat(name='EarthM', dark=False):
    """Stylised Earth: deep ocean + muted land + cloud streaks from layered noise (no image needed)."""
    m, nb, b, out = M.new(name)
    tc = nb.n('ShaderNodeTexCoord')
    n1 = nb.n('ShaderNodeTexNoise', Scale=5.0, Detail=8.0, Roughness=0.55)
    nb.l(tc, 'Object', n1, 'Vector')
    ramp = nb.n('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.elements[0].position = 0.46
    cr.elements[0].color = (0.012, 0.045, 0.11, 1) if not dark else (0.004, 0.012, 0.03, 1)
    cr.elements[1].position = 0.56
    cr.elements[1].color = (0.12, 0.2, 0.1, 1) if not dark else (0.02, 0.03, 0.02, 1)
    e = cr.elements.new(0.80)
    e.color = (0.35, 0.3, 0.2, 1) if not dark else (0.04, 0.035, 0.03, 1)
    nb.l(n1, 'Fac', ramp, 'Fac')
    n2 = nb.n('ShaderNodeTexNoise', Scale=11.0, Detail=6.0, Roughness=0.6)
    nb.l(tc, 'Object', n2, 'Vector')
    cl = nb.n('ShaderNodeValToRGB')
    cl.color_ramp.elements[0].position = 0.55
    cl.color_ramp.elements[0].color = (0, 0, 0, 1)
    cl.color_ramp.elements[1].position = 0.72
    cl.color_ramp.elements[1].color = (0.9, 0.92, 0.95, 1) if not dark else (0.08, 0.09, 0.11, 1)
    nb.l(n2, 'Fac', cl, 'Fac')
    mix = nb.n('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'ADD'
    mix.inputs['Factor'].default_value = 1.0
    nb.l(ramp, 'Color', mix, 6)
    nb.l(cl, 'Color', mix, 7)
    nb.l(mix, 2, b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.6
    return m


def earth(dark=False):
    """Big stylised Earth (r=1000 u) + a thin blue atmosphere shell that glows at the limb."""
    o = sphere('Earth', tuple(EARTH_C), EARTH_R, earth_mat('EarthM', dark), seg=96)
    am, nb, b, out = M.new('AtmoM')
    M.no_light(am)
    am.node_tree.nodes.remove(b)
    lw = nb.n('ShaderNodeLayerWeight', Blend=0.35)
    pw = nb.math('POWER', lw.outputs['Fresnel'], vb=2.2)
    gain = nb.math('MULTIPLY', pw.outputs[0], vb=1.6, clamp=True)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=3.0)
    em.inputs['Color'].default_value = (0.25, 0.5, 1.0, 1) if not dark else (0.05, 0.1, 0.25, 1)
    mx = nb.n('ShaderNodeMixShader')
    nb.l(gain, 0, mx, 'Fac')
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    a = sphere('Atmosphere', tuple(EARTH_C), EARTH_R * 1.018, am, seg=96)
    a.visible_shadow = False
    return o


def gold():
    return mat_once('SatGold', base=(0.72, 0.5, 0.16), rough=0.28, metal=1.0, bump=0.2)


def panel_mat():
    return mat_once('SatPanel', base=(0.02, 0.04, 0.12), rough=0.25, metal=0.6)


def dish_mat():
    return mat_once('SatDish', base=(0.55, 0.56, 0.58), rough=0.35, metal=0.9)


def flash(name, loc, f0, NF, r0=0.5, r1=9.0, color=(1.0, 0.95, 0.85), strength=14.0, dur=14):
    m = glow_mat(name + 'M', color, strength)
    o = sphere(name, loc, 1.0, m, seg=24)
    for f, s, v in ((max(0, f0 - 1), r0, 0.0), (f0, r0, 1.0), (min(NF, f0 + dur), r1, 0.0)):
        o.scale = (s, s, s)
        o.keyframe_insert('scale', frame=f)
        key_fac(m, [(f, v)])
    return o


def shards(n, center, f0, NF, spread=40.0, size=0.35, seed=3, along=None, speed=1.0, mat=None):
    """n small foil shards flying outward from `center` starting at frame f0 (two keyframes each; Bezier = eased).
    `along` (unit Vector) stretches the cloud along an orbit direction so it reads as a ribbon."""
    rnd = random.Random(seed)
    mt = mat or mat_once('Shard', base=(0.7, 0.62, 0.45), rough=0.3, metal=1.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    proto = bpy.context.active_object
    proto.name = 'ShardProto'
    M.assign(proto, mt)
    proto.hide_render = True
    out = []
    c = Vector(center)
    for i in range(n):
        o = proto.copy()
        o.data = proto.data
        o.name = 'Shard%d' % i
        o.hide_render = False
        link(o)
        d = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)))
        d = d.normalized() if d.length > 1e-6 else Vector((1, 0, 0))
        if along is not None:
            d = (d * 0.35 + Vector(along) * rnd.choice((-1, 1)) * rnd.uniform(0.6, 1.4)).normalized()
        dist = spread * rnd.uniform(0.25, 1.0) * speed
        s = size * rnd.uniform(0.4, 1.8)
        o.scale = (s, s * rnd.uniform(0.3, 1.0), s * rnd.uniform(0.2, 0.8))
        o.rotation_euler = (rnd.uniform(0, 6.28), rnd.uniform(0, 6.28), rnd.uniform(0, 6.28))
        o.location = c
        o.keyframe_insert('location', frame=f0)
        o.keyframe_insert('rotation_euler', frame=f0)
        o.location = c + d * dist
        o.rotation_euler = (rnd.uniform(0, 12), rnd.uniform(0, 12), rnd.uniform(0, 12))
        o.keyframe_insert('location', frame=NF)
        o.keyframe_insert('rotation_euler', frame=NF)
        out.append(o)
    return out


def drift_parts(parts, f0, NF, dist=18.0, seed=5):
    """Big satellite parts (arms, dishes, panels, body) tumble away from the centre after the break."""
    rnd = random.Random(seed)
    for p in parts:
        if p.rotation_mode == 'QUATERNION':
            e = p.rotation_quaternion.to_euler()
            p.rotation_mode = 'XYZ'
            p.rotation_euler = e
        p.keyframe_insert('location', frame=f0)
        p.keyframe_insert('rotation_euler', frame=f0)
        d = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)))
        d = d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))
        p.location = Vector(p.location) + d * dist * rnd.uniform(0.5, 1.2)
        e0 = p.rotation_euler
        p.rotation_euler = (e0[0] + rnd.uniform(-3, 3), e0[1] + rnd.uniform(-3, 3), e0[2] + rnd.uniform(-3, 3))
        p.keyframe_insert('location', frame=NF)
        p.keyframe_insert('rotation_euler', frame=NF)


def orbit_ring(name='OrbitRing', r=ORBIT_R, color=(1.0, 0.72, 0.3), strength=2.0, tilt=90.0, w=0.5, grow=None, NF=60):
    """Thin glowing orbit ring about the Earth centre (polar-ish: tilted 85 deg). grow=(f0,f1) draws it on."""
    m = glow_mat(name + 'M', color, strength)
    o = ring_mesh(name, r, w, 256)
    o.location = tuple(EARTH_C)
    o.rotation_euler = (math.radians(tilt), 0, 0)
    o.data.materials.append(m)
    if grow:
        key_fac(m, [(0, 0.0), (grow[0], 0.0), (grow[1], 1.0)])
    return o


def orbit_point(angle_deg, r=ORBIT_R, tilt=90.0, rz=0.0):
    """World position on the orbit ring at `angle_deg`; tilt 90 / rz 0 = ring in the x-z plane, face-on to a camera looking +y, angle 90 = the origin (where the satellite sits)."""
    a = math.radians(angle_deg)
    p = Vector((math.cos(a) * r, math.sin(a) * r, 0))
    p = Matrix.Rotation(math.radians(rz), 4, 'Z') @ Matrix.Rotation(math.radians(tilt), 4, 'X') @ p
    return p + EARTH_C


def marker(name, loc, r=2.0, color=(1.0, 0.72, 0.3), strength=7.0):
    return sphere(name, loc, r, glow_mat(name + 'M', color, strength), seg=20)


# ---------------------------------------------------------------- shot preamble (as codebatch base_common)
import json as _json
FPS = 30
FRAMES = _json.load(open(os.path.join(HERE, 'frames.json')))


def start(scene_file, vol=False, **kw):
    """args, --nf (default from frames.json), reset, look. Returns (a, NF, sc)."""
    a = core.args()
    NF = arg(a, '--nf', FRAMES[os.path.splitext(os.path.basename(scene_file))[0]], int)
    sc = core.reset()
    look(sc, vol=vol, **kw)
    return a, NF, sc


def wide(cam, NF, move, lens=28, fstop=11, focus=None):
    """One eased kit move for the whole plate (cruise/smootherstep easing; no shake)."""
    assert 20 <= lens <= 60
    cam.shot(0, NF, move, lens=lens, fstop=fstop, focus=focus)
    return cam


def rng(seed):
    return random.Random(seed)



# ================================================================ vela-incident-double-flash-1979 part
def vela_sat(name='Vela', loc=(0, 0, 0), NF=120, spin_deg=10.0, scale=1.0):
    """Many-sided Vela-style satellite: faceted near-sphere covered in dark blue solar cells, gold rims, small sensor
    stubs (generic reconstruction). Slow eased spin."""
    root = Md.empty(name, loc)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.4 * scale, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = name + 'Body'
    body.parent = root
    cells = M.principled('SolarCells', base=(0.02, 0.04, 0.12), rough=0.25, metal=0.6, coat=0.6, rough_noise=0.05, bump=0.3, bump_scale=60)
    M.assign(body, cells)
    wf = body.modifiers.new('Rim', 'WIREFRAME')
    wf.use_replace = False
    wf.thickness = 0.03 * scale
    wf.material_offset = 1
    body.data.materials.append(gold())
    for k, v in enumerate(((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))):
        p = Vector(v) * 1.35 * scale
        cyl(name + 'Sensor%d' % k, p, p * 1.18, 0.12 * scale, gold(), 12).parent = root
    root.rotation_euler = (0, 0, 0)
    root.keyframe_insert('rotation_euler', frame=0)
    root.rotation_euler = (0, math.radians(spin_deg * 0.3), math.radians(spin_deg))
    root.keyframe_insert('rotation_euler', frame=max(NF, 2))
    return root


def double_flash(name, loc, f0, NF, k=1.0, power=4.0e6):
    """Bhangmeter-style double flash: a very short hard blink, then a slower, longer swell (two glow spheres + one
    light keyed in two humps). Eased keys, no strobe."""
    a = flash(name + 'A', loc, f0, NF, r0=2.0 * k, r1=40.0 * k, color=(1.0, 0.98, 0.95), strength=40.0, dur=4)
    b = flash(name + 'B', loc, f0 + 8, NF, r0=10.0 * k, r1=120.0 * k, color=(1.0, 0.86, 0.66), strength=16.0, dur=34)
    bpy.ops.object.light_add(type='POINT', location=loc)
    L = bpy.context.active_object
    L.name = name + 'Light'
    L.data.color = (1.0, 0.9, 0.78)
    L.data.shadow_soft_size = 5.0 * k
    for f, e in ((max(0, f0 - 1), 0.0), (f0, power), (f0 + 3, power * 0.05), (f0 + 8, power * 0.08), (f0 + 20, power * 0.5),
                 (f0 + 42, 0.0)):
        L.data.energy = e
        L.data.keyframe_insert('energy', frame=min(NF, f))
    return a, b, L


def islands(seed=4, sea_z=0.0, scale=1.0):
    """Two dark rocky sub-Antarctic islands (Marion + Prince Edward stand-ins), low cliffs into the sea."""
    gm = M.texture_set('IsleRock', 'rocky_terrain_02', scale=0.05, tint=(0.18, 0.19, 0.17), box=True)
    Wd.terrain('IsleA', size=2600 * scale, res=160, height=260 * scale, scale=0.0014 / scale, center=(0, 0, sea_z - 20), seed=seed,
               mat=gm, island=1.0, sea_level=sea_z)
    Wd.terrain('IsleB', size=1500 * scale, res=120, height=160 * scale, scale=0.002 / scale, center=(-2600 * scale, 2200 * scale, sea_z - 20),
               seed=seed + 3, mat=gm, island=1.0, sea_level=sea_z)


def scope_screen(name, loc, NF, f0=10, f1=None, w=0.5, h=0.38):
    """Analyst's oscilloscope: dark metal box, green-black screen, the double-hump trace draws on f0..f1."""
    f1 = f1 or int(NF * 0.7)
    D = mats()
    root = Md.empty(name, loc)
    boxm(name + 'Box', (0, 0.12, 0), (w + 0.12, 0.3, h + 0.12), D['iron'], 0.01).parent = root
    boxm(name + 'Glass', (0, -0.031, 0), (w, 0.004, h), M.emission(name + 'Scr', (0.02, 0.07, 0.04), 0.6)).parent = root
    pts = []
    for i in range(80):
        x = -w * 0.45 + w * 0.9 * i / 79
        t = i / 79
        y = 0.75 * math.exp(-((t - 0.18) / 0.025) ** 2) + 0.42 * math.exp(-((t - 0.55) / 0.13) ** 2)
        pts.append((x, -0.036, -h * 0.35 + h * 0.75 * y))
    tr = curve_poly(name + 'Trace', [(loc[0] + p[0], loc[1] + p[1], loc[2] + p[2]) for p in pts], 0.0032, glow_mat(name + 'TrM', (0.4, 1.0, 0.55), 9.0))
    grow_curve(tr, [(f0, 0.0), (f1, 1.0)])
    for k in range(5):
        boxm(name + 'Grid%d' % k, (-w * 0.4 + w * 0.2 * k, -0.033, 0), (0.002, 0.001, h * 0.9), M.emission(name + 'GrM', (0.05, 0.25, 0.1), 0.8)).parent = root
    Wd.point(name + 'Spill', (loc[0], loc[1] - 0.4, loc[2]), color=(0.4, 1.0, 0.55), power=4, radius=0.2)
    return root


def sheep(name, loc, yaw=0.0, s=1.0):
    """Low-poly faceless sheep: woolly body ellipsoid, dark head, four legs."""
    wool = mat_once('Wool', base=(0.72, 0.68, 0.6), rough=1.0, bump=0.5, bump_scale=40)
    dark = mat_once('SheepDark', base=(0.06, 0.05, 0.05), rough=0.8)
    root = Md.empty(name, loc)
    root.rotation_euler = (0, 0, math.radians(yaw))
    sphere(name + 'Body', (0, 0, 0.62 * s), 0.38 * s, wool, seg=14, scale=(0.75, 1.25, 0.72)).parent = root
    sphere(name + 'Head', (0, 0.5 * s, 0.75 * s), 0.13 * s, dark, seg=10, scale=(0.8, 1.3, 0.9)).parent = root
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(name + 'Leg', (sx * 0.14 * s, sy * 0.26 * s, 0.0), (sx * 0.14 * s, sy * 0.26 * s, 0.4 * s), 0.03 * s, dark, 6).parent = root
    return root


def paddock(NF, seed=5):
    """Dusk paddock: golden low sun HDRI, soil + grass scans, wire fence."""
    CN.hdri_sun('industrial_sunset_02', sun_az=200, strength=0.9)
    CN.sun(elev=8, az=200, warmth='golden', strength=3.0, check=False)
    gm = M.texture_set('Paddock', 'farm_soil', scale=0.3, tint=(0.36, 0.33, 0.22), box=True)
    Wd.terrain('Field', size=900, res=120, height=5, scale=0.004, center=(0, 200, -0.5), seed=seed, mat=gm)
    CN.scatter('grass_medium_01', 160, (-40, 40, -6, 70), seed=seed)
    CN.scatter('grass_medium_02', 120, (-40, 40, -6, 70), seed=seed + 1)
    D = mats()
    for k in range(14):
        cyl('Post%d' % k, (-30 + 4.6 * k, 4.0, 0), (-30 + 4.6 * k, 4.0, 1.2), 0.05, D['wood'], 8)
    for z in (0.5, 0.9):
        cyl('Wire', (-30, 4.0, z), (30, 4.0, z), 0.004, D['iron'], 4)


def hydrophone_world(NF, f_ring=20):
    """Underwater: deep blue haze volume, faint caustic sun from above, a hydrophone on a long cable, a pale sound
    ring expanding past it."""
    Wd.hdri('qwantani_dawn_puresky', strength=0.05, bg_strength=0.03, tint=(0.2, 0.45, 0.7))
    Wd.fog(center=(0, 40, 0), size=(300, 300, 120), density=0.03, color=(0.12, 0.35, 0.55))
    Wd.spot('Surface', (0, 20, 60), (0, 20, -10), color=(0.5, 0.8, 1.0), power=60000, size_deg=70, blend=0.9, radius=4.0)
    D = mats()
    cyl('Cable', (0, 20, 60), (0, 20, 1.2), 0.02, D['iron'], 6)
    cyl('Phone', (0, 20, 1.2), (0, 20, -0.6), 0.18, D['iron'], 20)
    sph('PhoneTip', (0, 20, -0.6), 0.18, D['iron'], 16, 8)
    rm = glow_mat('SoundRingM', (0.7, 0.9, 1.0), 3.0)
    ring = ring_mesh('SoundRing', r=1.0, w=0.02, n=128)
    M.assign(ring, rm)
    ring.rotation_euler = (math.radians(90), 0, 0)
    ring.location = (0, 120, 0)
    for f, s, v in ((f_ring, 2.0, 0.0), (f_ring + 6, 8.0, 1.0), (min(NF, f_ring + 60), 140.0, 0.0)):
        ring.scale = (s, s, s)
        ring.keyframe_insert('scale', frame=f)
        key_fac(rm, [(f, v)])


def panel_room(d=None, n=7):
    """1980 briefing room: long table, faceless panel members (officer silhouettes), papers, one hanging lamp."""
    d = d or mats()
    wall = M.principled('PanelWall', base=(0.32, 0.30, 0.26), rough=0.85)
    floor = wood_floor('PanelFloor', tint=(0.22, 0.14, 0.08))
    ceil = M.principled('PanelCeil', base=(0.5, 0.48, 0.44), rough=0.9)
    room_shell(9.0, 7.0, 3.0, (0, 2.0, 0), wall, floor, ceil, open_side='WFront')
    Wd.hdri('qwantani_night_puresky', strength=0.03, bg_strength=0.03)
    boxm('LongTable', (0, 2.6, 0.74), (6.4, 1.3, 0.06), d['wood'], 0.01)
    for k in range(n):
        x = -2.7 + 5.4 * k / max(1, n - 1)
        officer('Member%d' % k, (x, 3.6, 0.0), yaw_deg=180.0, d=d)
        chair('Chair%d' % k, (x, 3.5, 0.0), yaw=180.0, d=d)
        paper_stack('Papers%d' % k, (x, 2.5, 0.77), 0.2 * (k % 3 - 1), 3, d)
    sph('HangLamp', (0, 2.6, 2.4), 0.18, M.emission('HangLampM', (1.0, 0.82, 0.55), 10.0), 16, 8)
    Wd.spot('LampKey', (0, 2.6, 2.3), (0, 2.6, 0.7), color=(1.0, 0.8, 0.55), power=900, size_deg=95, blend=0.8, radius=0.2)


def desk_lamp_set(d=None, top=0.76):
    """Dark study: desk + warm lamp pool. Returns desk-top z."""
    d = d or mats()
    wall = M.texture_set('StudyWall', 'wood_table_worn', scale=2.0, tint=(0.18, 0.12, 0.08))
    room_shell(3.0, 3.0, 2.6, (0, 0.5, 0), wall, M.principled('StudyF', base=(0.05, 0.03, 0.02), rough=0.6),
               M.principled('StudyC', base=(0.3, 0.28, 0.25), rough=0.9), open_side='WFront')
    Wd.hdri('fireplace', strength=0.04, bg_strength=0.03)
    boxm('Desk', (0, 0.9, top - 0.025), (1.8, 0.9, 0.05), d['wood'], 0.01)
    sph('LampBulb', (0.6, 1.15, top + 0.45), 0.03, M.emission('StudyBulb', (1.0, 0.8, 0.5), 20.0), 10, 6)
    Wd.spot('StudyKey', (0.55, 1.05, top + 0.5), (0.1, 0.8, top), color=(1.0, 0.74, 0.45), power=90, size_deg=80, blend=0.7, radius=0.04)
    return top

