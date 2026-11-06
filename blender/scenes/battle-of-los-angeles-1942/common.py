"""battle-of-los-angeles-1942 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch 2026-11-05, render hold).
User rules: 14-18 shots, mostly WIDE 24-35 mm, close-ups as accents; every plate one eased kit move, never shake.
Frame counts per plate in frames.json (script estimate 2.6 w/s at 30 fps + 8 handle frames); --nf overrides."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P, interiors as I
from kit import cine as CN
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def look(sc, samples=24, vol=True, glare=0.35, glare_thr=1.0, vignette=0.24, sat=0.95, lift=(0.99, 1.0, 1.03),
         gain=(1.03, 1.0, 0.97)):
    """CINE v2 setup at an affordable budget (24 spp, 6 bounces, 8 transparent, vol steps <= 48), as mh370."""
    CN.setup(sc, samples=samples, adaptive=0.03, vol=vol, vol_step=4.0, glare=glare, glare_thr=glare_thr,
             vignette=vignette, sat=sat, lift=lift, gain=gain)
    cy = sc.cycles
    cy.max_bounces = 6
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 4
    cy.transparent_max_bounces = 8
    cy.sample_clamp_indirect = 6.0
    try:
        cy.volume_max_steps = 48 if vol else 16
    except Exception:
        pass
    return sc


def go(cam, NF, a, sc, meter=None, target=0.24):
    return CN.render(cam, NF, a, sc, meter_frame=meter, target=target)


import json as _json
FRAMES = _json.load(open(os.path.join(HERE, 'frames.json')))  # plate -> nf from the script timing (2.6 w/s, 30 fps)


def start(scene_file, vol=True, **kw):
    """Common shot preamble: args, --nf (default from frames.json), reset, look. Returns (a, NF, sc)."""
    a = core.args()
    NF = arg(a, '--nf', FRAMES[os.path.splitext(os.path.basename(scene_file))[0]], int)
    sc = core.reset()
    look(sc, vol=vol, **kw)
    return a, NF, sc


def wide(cam, NF, move, lens=28, fstop=11, focus=None):
    """One eased move for the whole plate (the kit moves all use cruise/smootherstep easing; no shake)."""
    assert 20 <= (lens if not isinstance(lens, (tuple, list)) else lens[0]) <= 60
    cam.shot(0, NF, move, lens=lens, fstop=fstop, focus=focus)
    return cam


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def rng(seed):
    return random.Random(seed)


# ---------------------------------------------------------------- materials
def glow_mat(name, color=(0.55, 0.9, 1.0), strength=6.0):
    """Emission mixed with Transparent; animate nodes['Mix'].inputs[0] (0 = invisible, 1 = full glow)."""
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


def fade_mat(name, base=(0.5, 0.5, 0.5), rough=0.8):
    """Principled + Transparent mix (puffs, smoke cards): key nodes['Mix'].inputs[0] 0 = gone, 1 = solid."""
    m, nb, b, out = M.new(name)
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Roughness'].default_value = rough
    tr = nb.n('ShaderNodeBsdfTransparent')
    mx = nb.n('ShaderNodeMixShader')
    mx.name = 'Mix'
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(b, 'BSDF', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    mx.inputs[0].default_value = 1.0
    try:
        m.blend_method = 'HASHED'
    except Exception:
        pass
    return m


def key_fac(m, keys):
    s = m.node_tree.nodes['Mix'].inputs[0]
    for f, v in keys:
        s.default_value = v
        s.keyframe_insert('default_value', frame=f)


def key_strength(m, keys):
    e = [n for n in m.node_tree.nodes if n.bl_idname == 'ShaderNodeEmission'][0]
    for f, v in keys:
        e.inputs['Strength'].default_value = v
        e.inputs['Strength'].keyframe_insert('default_value', frame=f)


def key_energy(light_obj, keys):
    for f, v in keys:
        light_obj.data.energy = v
        light_obj.data.keyframe_insert('energy', frame=f)


def key_loc(o, keys, interp=None):
    for f, v in keys:
        o.location = v
        o.keyframe_insert('location', frame=f)
    if interp:
        M.set_interp(o, interp)


def key_rot(o, keys):
    for f, v in keys:
        o.rotation_euler = v
        o.keyframe_insert('rotation_euler', frame=f)


def key_scale(o, keys):
    for f, v in keys:
        o.scale = v if isinstance(v, (tuple, list)) else (v, v, v)
        o.keyframe_insert('scale', frame=f)


def spin(o, axis, deg_per_frame, NF):
    """Constant spin (props, reels) with LINEAR keys."""
    i = 'XYZ'.index(axis)
    r0 = list(o.rotation_euler)
    for f in (0, NF):
        r = list(r0)
        r[i] = r0[i] + math.radians(deg_per_frame * f)
        o.rotation_euler = r
        o.keyframe_insert('rotation_euler', index=i, frame=f)
    M.set_interp(o, 'LINEAR')


# ---------------------------------------------------------------- geometry
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


def grow_curve(o, keys):
    cu = o.data
    cu.bevel_factor_mapping_end = 'SPLINE'
    for f, v in keys:
        cu.bevel_factor_end = v
        cu.keyframe_insert('bevel_factor_end', frame=f)


def sag_rope(name, p0, p1, sag=1.0, n=16, r=0.02, mat=None):
    p0, p1 = Vector(p0), Vector(p1)
    pts = []
    for k in range(n + 1):
        t = k / n
        q = p0.lerp(p1, t)
        q.z -= sag * 4 * t * (1 - t)
        pts.append(tuple(q))
    return curve_poly(name, pts, bevel=r, mat=mat)


def text_obj(name, body, loc, size=0.1, mat=None, rot=(0, 0, 0), align='CENTER', extrude=0.0):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    cu.size = size
    cu.align_x = align
    cu.align_y = 'CENTER'
    cu.extrude = extrude
    o = link(bpy.data.objects.new(name, cu))
    o.location = loc
    o.rotation_euler = rot
    if mat:
        o.data.materials.append(mat)
    return o


def cyl(name, p0, p1, r, mat, seg=20):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=max(d.length, 1e-4), location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def boxm(name, c, s, mat, bev=0.0):
    o = Wd.box(name, c, s)
    o.data.materials.append(mat)
    if bev:
        I.bevel(o, bev)
    return o


def sphere(name, loc, r, mat, seg=32, scale=(1, 1, 1), smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=max(8, seg // 2), radius=r, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    if smooth:
        bpy.ops.object.shade_smooth()
    M.assign(o, mat)
    return o


def parent_all(root, objs):
    for o in objs:
        o.parent = root
    return root


def crumple(name, loc, size, mat, seed=0, amp=0.25, res=6, rot_z=None):
    """Crumpled sheet (foil, paper, canvas): subdivided grid with random vertex lift, flat-ish on the ground."""
    r = rng(seed)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res, y_subdivisions=res, size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    for v in o.data.vertices:
        v.co.z += r.uniform(-amp, amp) * 0.5 + abs(v.co.x * v.co.y) * r.uniform(0, amp)
        v.co.x += r.uniform(-0.06, 0.06)
        v.co.y += r.uniform(-0.06, 0.06)
    o.scale = (size[0], size[1], size[0] * 0.5)
    o.rotation_euler = (r.uniform(-0.15, 0.15), r.uniform(-0.15, 0.15), r.uniform(0, 6.28) if rot_z is None else rot_z)
    M.assign(o, mat)
    o.modifiers.new('Solid', 'SOLIDIFY').thickness = 0.002
    return o


def figure(name, loc, yaw=0.0, mat=None, h=1.78, pose='stand', coat=None):
    """Simple faceless mannequin silhouette (wide shots only; no faces by rule)."""
    root = Md.empty(name, loc)
    mat = mat or M.principled(name + 'Cloth', base=(0.05, 0.05, 0.055), rough=0.85)
    s = h / 1.78
    parts = [cyl(name + 'LegL', (-0.1 * s, 0, 0), (-0.09 * s, 0, 0.85 * s), 0.075 * s, mat, 10),
             cyl(name + 'LegR', (0.1 * s, 0, 0), (0.09 * s, 0, 0.85 * s), 0.075 * s, mat, 10),
             cyl(name + 'Torso', (0, 0, 0.85 * s), (0, 0, 1.45 * s), 0.19 * s, coat or mat, 12),
             sphere(name + 'Head', (0, 0, 1.6 * s), 0.11 * s, mat, 12)]
    if pose == 'reach':
        parts += [cyl(name + 'ArmL', (-0.22 * s, 0, 1.4 * s), (-0.3 * s, 0.45 * s, 1.55 * s), 0.05 * s, coat or mat, 8),
                  cyl(name + 'ArmR', (0.22 * s, 0, 1.4 * s), (0.3 * s, 0.45 * s, 1.6 * s), 0.05 * s, coat or mat, 8)]
    elif pose == 'haul':
        parts += [cyl(name + 'ArmL', (-0.22 * s, 0, 1.4 * s), (-0.25 * s, -0.25 * s, 1.0 * s), 0.05 * s, coat or mat, 8),
                  cyl(name + 'ArmR', (0.22 * s, 0, 1.4 * s), (0.25 * s, -0.25 * s, 1.0 * s), 0.05 * s, coat or mat, 8)]
        root.rotation_euler = (math.radians(12), 0, 0)
    else:
        parts += [cyl(name + 'ArmL', (-0.23 * s, 0, 1.42 * s), (-0.27 * s, 0.02, 0.8 * s), 0.05 * s, coat or mat, 8),
                  cyl(name + 'ArmR', (0.23 * s, 0, 1.42 * s), (0.27 * s, 0.02, 0.8 * s), 0.05 * s, coat or mat, 8)]
    parent_all(root, parts)
    root.rotation_euler[2] = math.radians(yaw)
    return root


def fly_line(obj, NF, p0, v, step=1):
    p0, v = Vector(p0), Vector(v)
    for f in range(0, NF + 1, step):
        obj.location = p0 + v * f
        obj.keyframe_insert('location', frame=f)
    M.set_interp(obj, 'LINEAR')


def dust(center, size, n=400, seed=3, color=(1.0, 0.95, 0.85), strength=0.6, r=0.004):
    """Floating dust motes for interiors (tiny emissive points, catch the key light). One mesh, cheap."""
    rr = rng(seed)
    vs, fs = [], []
    for i in range(n):
        x, y, z = (center[0] + rr.uniform(-size[0] / 2, size[0] / 2), center[1] + rr.uniform(-size[1] / 2, size[1] / 2),
                   center[2] + rr.uniform(-size[2] / 2, size[2] / 2))
        k = len(vs)
        vs += [(x - r, y, z - r), (x + r, y, z - r), (x + r, y, z + r), (x - r, y, z + r)]
        fs.append((k, k + 1, k + 2, k + 3))
    o = Md.mesh_obj('Dust', vs, fs, smooth=False, mats=(M.emission('DustM', color, strength),))
    o.visible_shadow = False
    return o


# ---- 1940s office set (same builders as roswell-project-mogul-1947, copied so this slug stands alone)


def mats():
    g = bpy.data.materials.get
    if g('Foil'):
        return
    M.principled('Foil', base=(0.82, 0.83, 0.85), rough=0.18, metal=1.0, rough_noise=0.25, bump=0.15, bump_scale=60)
    M.principled('Balsa', base=(0.62, 0.48, 0.30), rough=0.7, grime=0.2, bump=0.05)
    M.principled('Rubber', base=(0.03, 0.028, 0.025), rough=0.6, grime=0.3)
    M.principled('BrownPaper', base=(0.42, 0.30, 0.18), rough=0.85, bump=0.1, bump_scale=120)
    M.principled('Newsprint', base=(0.78, 0.75, 0.66), rough=0.9, grime=0.25)
    M.principled('Ink', base=(0.02, 0.02, 0.02), rough=0.6)
    M.principled('BlackEnamel', base=(0.02, 0.02, 0.022), rough=0.25, metal=0.3, coat=0.4)
    M.principled('Chrome', base=(0.8, 0.8, 0.8), rough=0.12, metal=1.0)
    M.principled('OliveDrab', base=(0.20, 0.21, 0.12), rough=0.6, grime=0.35)
    M.principled('Galv', base=(0.55, 0.56, 0.55), rough=0.35, metal=0.8, grime=0.4)
    M.principled('Neoprene', base=(0.55, 0.45, 0.32), rough=0.45, sss=0.05, alpha=0.92)
    M.principled('ReportBlue', base=(0.05, 0.10, 0.28), rough=0.45, grime=0.15)


def room(size=(7, 6, 3.0), wood_walls=True, window=True, sun_power=1400, sun_dir=(-0.5, -1, -0.45), seed=0):
    """1940s office shell: worn wood floor, panelled or plaster walls, window with venetian blind (slat shadows)."""
    mats()
    sx, sy, sz = size
    floor = M.texture_set('OfficeFloor', 'wood_table_worn', scale=1.5, tint=(0.55, 0.42, 0.30))
    wall = (M.texture_set('Panel', 'wood_table_worn', scale=0.6, tint=(0.36, 0.24, 0.15), rough_mul=0.8) if wood_walls
            else M.principled('Plaster', base=(0.55, 0.52, 0.45), rough=0.9, grime=0.35))
    boxm('Floor', (0, 0, -0.02), (sx, sy, 0.04), floor)
    boxm('Ceil', (0, 0, sz + 0.02), (sx, sy, 0.04), M.principled('CeilM', base=(0.6, 0.58, 0.52), rough=0.9))
    boxm('WallB', (0, sy / 2, sz / 2), (sx, 0.1, sz), wall)
    boxm('WallL', (-sx / 2, 0, sz / 2), (0.1, sy, sz), wall)
    boxm('WallF', (0, -sy / 2, sz / 2), (sx, 0.1, sz), wall)
    if window:
        # right wall with a window hole (4 boxes) + blind slats; a strong area light outside = sun through blinds
        wx, wz, ww, wh = 0.4, 1.6, 1.8, 1.4
        boxm('WallR1', (sx / 2, -sy / 4 - ww / 4 + wx / 2, sz / 2), (0.1, sy / 2 - ww / 2 + wx, sz), wall)
        boxm('WallR2', (sx / 2, sy / 4 + ww / 4 + wx / 2, sz / 2), (0.1, sy / 2 - ww / 2 - wx, sz), wall)
        boxm('WallR3', (sx / 2, wx, (wz - wh / 2) / 2), (0.1, ww, wz - wh / 2), wall)
        boxm('WallR4', (sx / 2, wx, (sz + wz + wh / 2) / 2), (0.1, ww, sz - wz - wh / 2), wall)
        slat = M.principled('Slat', base=(0.75, 0.72, 0.62), rough=0.6)
        for k in range(18):
            s = boxm('Slat%d' % k, (sx / 2 - 0.08, wx, wz - wh / 2 + 0.04 + k * wh / 18), (0.05, ww, 0.02), slat)
            s.rotation_euler = (math.radians(35), 0, 0)
        d = Vector(sun_dir).normalized()
        Wd.area('SunWin', (sx / 2 + 2.5, wx, wz + 1.2), (sx / 2 - 2.0, wx - 1.0, 0.0), color=(1.0, 0.86, 0.66),
                power=sun_power, size=0.6)
    else:
        boxm('WallR', (sx / 2, 0, sz / 2), (0.1, sy, sz), wall)
    Wd.area('Fill', (0, -sy / 2 + 0.6, sz - 0.3), (0, 0, 0.5), color=(0.8, 0.85, 1.0), power=60, size=3.0)
    Wd.fog(center=(0, 0, sz / 2), size=(sx - 0.2, sy - 0.2, sz - 0.1), density=0.02, color=(1.0, 0.95, 0.88),
           anisotropy=0.55)
    dust((0, 0, 1.5), (sx * 0.7, sy * 0.7, 2.0), n=500, seed=seed)


def desk(name, loc, w=1.6, d=0.8, h=0.76):
    mats()
    wood = M.texture_set(name + 'Wood', 'wood_table_worn', scale=1.0, tint=(0.40, 0.27, 0.16))
    x, y, z = loc
    boxm(name + 'Top', (x, y, z + h - 0.025), (w, d, 0.05), wood, 0.006)
    for sx in (-1, 1):
        boxm(name + 'Ped%d' % sx, (x + sx * (w / 2 - 0.22), y, z + (h - 0.05) / 2), (0.42, d - 0.06, h - 0.05), wood, 0.005)
    return z + h


def typewriter(name, loc, yaw=0.0):
    """Black 1940s office typewriter: body, 4 rows of round keys, platen, carriage, paper sheet."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = [boxm(name + 'Body', (0, 0, 0.07), (0.42, 0.34, 0.14), g['BlackEnamel'], 0.02),
         cyl(name + 'Platen', (-0.26, 0.10, 0.17), (0.26, 0.10, 0.17), 0.03, g['Rubber'], 20),
         boxm(name + 'Carriage', (0, 0.12, 0.15), (0.6, 0.08, 0.04), g['Chrome'], 0.005),
         boxm(name + 'Sheet', (0, 0.13, 0.30), (0.24, 0.005, 0.26), g['Newsprint'])]
    for row in range(4):
        for k in range(10 - (row % 2)):
            x = -0.17 + k * 0.037 + (row % 2) * 0.018
            y = -0.13 + row * 0.035
            o.append(cyl(name + 'K%d_%d' % (row, k), (x, y, 0.135 + row * 0.012), (x, y, 0.15 + row * 0.012), 0.012,
                         g['Chrome'], 10))
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def newspaper(name, loc, rot=(0, 0, 0), size=(0.58, 0.40), headline='RAAF CAPTURES FLYING SAUCER',
              sub='ON RANCH IN ROSWELL REGION'):
    """Front page (recreated wording of the PD Roswell Daily Record 8 Jul 1947 headline) + grey text columns."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    w, h = size
    o = [boxm(name + 'Sheet', (0, 0, 0), (w, h, 0.002), g['Newsprint'])]
    t = text_obj(name + 'Head', headline, (0, h * 0.32, 0.002), size=w * 0.072, mat=g['Ink'])
    o.append(t)
    o.append(text_obj(name + 'Sub', sub, (0, h * 0.21, 0.002), size=w * 0.035, mat=g['Ink']))
    gm = M.principled(name + 'Col', base=(0.35, 0.34, 0.31), rough=0.9)
    for c in range(5):
        for ln in range(14):
            o.append(boxm(name + 'L%d_%d' % (c, ln), (-w * 0.4 + c * w * 0.2, h * 0.12 - ln * h * 0.042, 0.0015),
                          (w * 0.17, h * 0.012, 0.0008), gm))
    parent_all(root, o)
    root.rotation_euler = rot
    return root


def telephone(name, loc):
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    parent_all(root, [cyl(name + 'Base', (0, 0, 0), (0, 0, 0.06), 0.07, g['BlackEnamel'], 20),
                      cyl(name + 'Stem', (0, 0, 0.06), (0, 0, 0.25), 0.015, g['BlackEnamel'], 10),
                      cyl(name + 'Ear', (-0.06, 0, 0.27), (0.06, 0, 0.27), 0.022, g['BlackEnamel'], 12)])
    return root


# =============================================================== battle-of-los-angeles-1942 builders
# Night of 24-25 Feb 1942, LA basin. Period kit: SCR-270-style radar + A-scope, 3-inch AA guns in sandbag pits,
# carbon-arc searchlights. Generic submarine (no insignia). No casualties shown. Wide plates 24-35 mm.

def aim(o, target, frame=None):
    """Point a light/object's -Z at target (quaternion); keys it when frame is given."""
    o.rotation_mode = 'QUATERNION'
    d = Vector(target) - o.location
    o.rotation_quaternion = d.to_track_quat('-Z', 'Y')
    if frame is not None:
        o.keyframe_insert('rotation_quaternion', frame=frame)


def la_night(NF, moon=0.5, seed=0, city=True, blackout=None, haze=0.00045, hills=True, sea=True):
    """LA basin at night: dim moonless-ish sky, hills to the north, sea to the west, a city-light carpet.
    blackout = (f0, f1): the city lights fade out over those frames (keyed on the light-strength math node)."""
    mats()
    Wd.hdri('qwantani_night_puresky', strength=0.12, bg_strength=0.35, rot=30, tint=(0.75, 0.85, 1.1), stars=0.25)
    Wd.moon(direction=(-0.4, 0.7, 0.25), strength=moon, color=(0.62, 0.72, 1.0), angle=0.6)
    gm = M.texture_set('Basin', 'dry_ground_rocks', scale=0.02, tint=(0.22, 0.22, 0.2), box=True)
    Wd.terrain('Basin', size=24000, res=200, height=6, scale=0.0004, center=(0, 6000, -2), seed=seed, mat=gm)
    if hills:
        hm = M.texture_set('Hills', 'forest_ground_04', scale=0.01, tint=(0.2, 0.21, 0.18), box=True)
        Wd.terrain('Hills', size=26000, res=160, height=900, scale=0.00025, center=(0, 26000, -60), seed=seed + 5, mat=hm)
    if sea:
        Wd.sea_plane(size=60000, z=-1.0, color=(0.002, 0.004, 0.007), rough=0.12, wave=0.15, frames=NF)
    towns = []
    if city:
        for k, (cx, cy, rr, cnt) in enumerate(((0, 5000, 2600, 2600), (-3200, 7500, 1800, 1400), (3500, 8200, 2000, 1600),
                                               (1200, 11000, 2400, 1500), (-1800, 3200, 1400, 900))):
            towns.append(Wd.city_lights('City%d' % k, center=(cx, cy, 9), radius=rr, count=cnt, seed=seed + k,
                                        strength=40, size=2.5, cluster=0.5))
        if blackout:
            for k, t in enumerate(towns):
                f0 = blackout[0] + k * max(1, (blackout[1] - blackout[0]) // 8)
                city_strength(t, [(0, 40), (f0, 40), (min(blackout[1], f0 + 20), 0.0)])
    if haze:
        Wd.fog(center=(0, 6000, 1500), size=(24000, 24000, 3000), density=haze, color=(0.7, 0.75, 0.85), anisotropy=0.6)
    return towns


def city_strength(o, keys):
    """Key the brightness of a kit city_lights object (its MULTIPLY math node carries `strength`)."""
    m = o.data.materials[0]
    node = None
    for n in m.node_tree.nodes:
        if n.bl_idname == 'ShaderNodeMath' and n.operation == 'MULTIPLY' and not n.inputs[1].is_linked:
            node = n
    if node is None:
        o.hide_render = False
        o.keyframe_insert('hide_render', frame=keys[-2][0])
        o.hide_render = True
        o.keyframe_insert('hide_render', frame=keys[-1][0])
        return
    for f, v in keys:
        node.inputs[1].default_value = v
        node.inputs[1].keyframe_insert('default_value', frame=f)


def searchlight(name, loc, NF, path, power=3.0e6, cone=1.6):
    """Carbon-arc searchlight: a narrow spot that draws a beam in the haze; path = [(frame, target), ...] eased sweep."""
    L = Wd.spot(name, loc, path[0][1], color=(0.82, 0.88, 1.0), power=power, size_deg=cone, blend=0.15, radius=0.6)
    L.data.shadow_soft_size = 0.6
    for f, tgt in path:
        aim(L, tgt, frame=f)
    return L


def beams(NF, apex=(0, 6000, 3200), n=12, seed=1, spread=4500, converge=(0.3, 0.8), area=((-6000, 6000), (1500, 10000))):
    """n searchlights scattered across the basin; they sweep, then converge on the apex between converge[0..1]."""
    r = rng(seed)
    out = []
    for k in range(n):
        loc = (r.uniform(*area[0]), r.uniform(*area[1]), 5)
        a = (Vector(apex) + Vector((r.uniform(-spread, spread), r.uniform(-spread, spread), r.uniform(-800, 600))))
        b = Vector(apex) + Vector((r.uniform(-120, 120), r.uniform(-120, 120), r.uniform(-60, 60)))
        path = [(0, a), (int(NF * converge[0]), a.lerp(b, 0.3)), (int(NF * converge[1]), b), (NF, b + Vector((40, 0, 20)))]
        out.append(searchlight('SL%d' % k, loc, NF, path))
    return out


def flak(NF, center=(0, 6000, 3000), n=24, seed=2, spread=(3000, 3000, 700), f0=0, f1=None, puff=60.0):
    """Anti-aircraft bursts: a 3-frame flash (emissive core + point light) leaving a dark smoke puff that grows/fades."""
    r = rng(seed)
    f1 = f1 or NF
    smoke = fade_mat('FlakSmoke', base=(0.06, 0.06, 0.06), rough=1.0)
    for k in range(n):
        p = Vector(center) + Vector((r.uniform(-spread[0], spread[0]), r.uniform(-spread[1], spread[1]), r.uniform(-spread[2], spread[2])))
        f = r.randint(f0, max(f0 + 1, f1 - 8))
        fm = glow_mat('FlashM%d' % k, color=(1.0, 0.75, 0.45), strength=60)
        c = sphere('Flash%d' % k, p, 12.0, fm, 12)
        key_fac(fm, [(0, 0), (f - 1, 0), (f, 1), (f + 3, 0)])
        L = Wd.point('FlashL%d' % k, p, color=(1.0, 0.7, 0.4), power=0, radius=5)
        key_energy(L, [(0, 0), (f - 1, 0), (f, 4.0e7), (f + 3, 0)])
        sm = fade_mat('Puff%d' % k, base=(0.07, 0.07, 0.07), rough=1.0)
        s = sphere('Puff%d' % k, p, 1.0, sm, 16)
        key_scale(s, [(0, 0.01), (f, 0.01), (f + 2, puff * 0.5), (min(NF, f + 60), puff)])
        key_fac(sm, [(0, 0), (f, 0), (f + 2, 0.9), (min(NF, f + 90), 0.0)])
        s.visible_shadow = False


def aa_gun(name, loc, NF, yaw=0.0, elev=55, shots=()):
    """3-inch AA gun in a sandbag pit: pedestal, cradle, long barrel, sandbag ring; muzzle flash light at shot frames."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    sand = M.principled(name + 'Sand', base=(0.33, 0.28, 0.20), rough=0.95, bump=0.3, bump_scale=30)
    o = []
    for k in range(22):
        t = 2 * math.pi * k / 22
        for lv in range(3):
            o.append(sphere(name + 'Bag%d_%d' % (k, lv), (3.6 * math.cos(t + lv * 0.14), 3.6 * math.sin(t + lv * 0.14), 0.2 + lv * 0.32), 0.3,
                            sand, 10, scale=(1.6, 0.9, 0.55)))
    o += [cyl(name + 'Ped', (0, 0, 0), (0, 0, 1.4), 0.45, g['OliveDrab'], 20),
          boxm(name + 'Deck', (0, 0, 0.15), (3.0, 3.0, 0.3), g['OliveDrab'], 0.03)]
    mount = Md.empty(name + 'Mount', (0, 0, 1.5), parent=root)
    e = math.radians(elev)
    bl = cyl(name + 'Barrel', (0, 0, 0), (0, 4.6 * math.cos(e), 4.6 * math.sin(e)), 0.09, g['OliveDrab'], 16)
    cr = boxm(name + 'Cradle', (0, 0.3, 0.2), (0.7, 1.6, 0.6), g['OliveDrab'], 0.04)
    for x in (bl, cr):
        x.parent = mount
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    if shots:
        bpy.context.view_layer.update()
        mz = root.matrix_world @ Vector((0, 4.8 * math.cos(e), 1.5 + 4.8 * math.sin(e)))
        L = Wd.point(name + 'Muzzle', mz, color=(1.0, 0.72, 0.4), power=0, radius=0.4)
        fm = glow_mat(name + 'MuzM', color=(1.0, 0.75, 0.4), strength=40)
        fl = sphere(name + 'MuzF', mz, 0.6, fm, 12, scale=(1, 1, 1.8))
        lk, fk = [(0, 0)], [(0, 0)]
        for f in shots:
            lk += [(f - 1, 0), (f, 6.0e5), (f + 2, 0)]
            fk += [(f - 1, 0), (f, 1), (f + 2, 0)]
        key_energy(L, lk)
        key_fac(fm, fk)
    return root


def radar_antenna(name, loc, yaw=0.0):
    """SCR-270-style search radar: lattice mast with a wide dipole array (4 x 8 dipoles + reflector screen), trailer."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = []
    for sx in (-1, 1):
        o.append(cyl(name + 'Mast%d' % sx, (sx * 1.0, 0, 0), (sx * 0.4, 0, 16), 0.1, g['Galv'], 8))
    for k in range(8):
        o.append(cyl(name + 'Rung%d' % k, (-1.0 + k * 0.075, 0, k * 2), (1.0 - k * 0.075, 0, k * 2), 0.04, g['Galv'], 6))
    for r_ in range(4):
        for c in range(8):
            x, z = -5.6 + c * 1.6, 14 + r_ * 1.4
            o.append(cyl(name + 'Dip%d_%d' % (r_, c), (x - 0.6, -0.3, z), (x + 0.6, -0.3, z), 0.025, g['Chrome'], 6))
    scr = boxm(name + 'Screen', (0, 0.25, 16.1), (13.2, 0.04, 6.0), M.principled(name + 'Mesh', base=(0.3, 0.3, 0.3), metal=0.8, rough=0.5, alpha=0.6))
    o.append(scr)
    tr = boxm(name + 'Trailer', (7, 3, 1.6), (2.6, 6.5, 2.6), g['OliveDrab'], 0.05)
    o.append(tr)
    win = boxm(name + 'Win', (5.69, 3, 1.9), (0.02, 1.0, 0.5), M.emission(name + 'WinM', (0.5, 1.0, 0.55), 6.0))
    o.append(win)
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    Wd.point(name + 'Spill', (loc[0] + 5.3, loc[1] + 3, loc[2] + 1.9), color=(0.5, 1.0, 0.55), power=120, radius=0.4)
    return root


def ascope(name, loc, NF, blip_at=0.35, seed=4):
    """A-scope CRT: round green screen with a horizontal trace, noise 'grass', one target spike rising at blip_at."""
    mats()
    r = rng(seed)
    root = Md.empty(name, loc)
    body = M.principled(name + 'Body', base=(0.12, 0.13, 0.11), rough=0.5, metal=0.4, grime=0.5)
    o = [boxm(name + 'Panel', (0, 0.06, 0), (0.9, 0.12, 0.7), body, 0.02),
         cyl(name + 'Bezel', (0, -0.005, 0), (0, -0.03, 0), 0.2, bpy.data.materials['BlackEnamel'], 48),
         cyl(name + 'Glass', (0, -0.03, 0), (0, -0.032, 0), 0.17, M.emission(name + 'Phos', (0.05, 0.25, 0.08), 0.6), 48)]
    tm = M.emission(name + 'Trace', (0.45, 1.0, 0.5), 9.0)
    o.append(boxm(name + 'Base', (0, -0.034, -0.05), (0.30, 0.001, 0.004), tm))
    for k in range(34):
        x = -0.14 + k * 0.0085
        hgt = r.uniform(0.004, 0.018)
        o.append(boxm(name + 'Grass%d' % k, (x, -0.034, -0.05 + hgt / 2), (0.002, 0.001, hgt), tm))
    spike = boxm(name + 'Blip', (0.05, -0.0345, -0.05), (0.006, 0.001, 0.12), tm)
    f = int(NF * blip_at)
    for ff, s in ((0, 0.01), (f, 0.01), (f + 8, 1.0), (NF, 1.0)):
        spike.scale = (1, 1, s)
        spike.location = (0.05, -0.0345, -0.05 + 0.06 * s)
        spike.keyframe_insert('scale', frame=ff)
        spike.keyframe_insert('location', frame=ff)
    o.append(spike)
    for k in range(5):
        o.append(cyl(name + 'Knob%d' % k, (-0.3 + k * 0.15, -0.01, -0.28), (-0.3 + k * 0.15, -0.05, -0.28), 0.025, bpy.data.materials['Chrome'], 16))
    parent_all(root, o)
    return root


def submarine(name, loc, yaw=0.0, L=100.0):
    """Generic WWII fleet submarine silhouette (no insignia): tapered hull, conning tower, deck gun."""
    mats()
    root = Md.empty(name, loc)
    hull = M.principled(name + 'Hull', base=(0.05, 0.055, 0.06), rough=0.45, metal=0.4, grime=0.5)
    rings = []
    for j in range(25):
        u = j / 24
        y = (u - 0.5) * L
        rad = 4.0 * (math.sin(math.pi * min(1, u / 0.12) / 2) if u < 0.12 else (1 - max(0, (u - 0.8) / 0.2) ** 1.6))
        rad = max(rad, 0.15)
        rings.append([(rad * math.cos(2 * math.pi * k / 20), y, rad * 0.75 * math.sin(2 * math.pi * k / 20)) for k in range(20)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    h = Md.mesh_obj(name + 'Body', v, f, parent=root, mats=(hull,))
    tw = boxm(name + 'Tower', (0, 6, 4.5), (3.0, 10, 4.5), hull, 0.4)
    gun = cyl(name + 'Gun', (0, 20, 3.4), (0, 26, 4.4), 0.12, hull, 12)
    gb = boxm(name + 'GunB', (0, 20, 3.0), (1.2, 1.8, 1.0), hull, 0.05)
    parent_all(root, [tw, gun, gb])
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def derrick(name, loc, h=26):
    """Oil derrick: tapering 4-leg lattice tower."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = []
    for sx, sy in ((1, 1), (1, -1), (-1, -1), (-1, 1)):
        o.append(cyl(name + 'L%d%d' % (sx, sy), (sx * 3, sy * 3, 0), (sx * 0.6, sy * 0.6, h), 0.12, g['Balsa'], 6))
    for k in range(6):
        z = 3 + k * 4
        w = 3 - 2.4 * z / h
        o.append(cyl(name + 'B%d' % k, (-w, -w, z), (w, w, z + 4), 0.06, g['Balsa'], 6))
        o.append(cyl(name + 'C%d' % k, (w, -w, z), (-w, w, z + 4), 0.06, g['Balsa'], 6))
    parent_all(root, o)
    return root


def car1940(name, loc, yaw=0.0, headlights=True):
    """Generic 1940s sedan: rounded body + fenders, cabin, wheels, hooded (blackout) headlights."""
    root = Md.empty(name, loc)
    paint = M.principled(name + 'Paint', base=(0.03, 0.04, 0.05), rough=0.25, metal=0.6, coat=0.8, grime=0.15)
    tyre = M.principled(name + 'Tyre', base=(0.02, 0.02, 0.02), rough=0.8)
    o = [sphere(name + 'Body', (0, 0, 0.75), 1.0, paint, 32, scale=(0.95, 2.5, 0.42)),
         sphere(name + 'Cabin', (0, -0.3, 1.2), 1.0, paint, 32, scale=(0.8, 1.2, 0.45)),
         boxm(name + 'Glass', (0, 0.62, 1.28), (1.3, 0.05, 0.38), M.glass(name + 'G', dark=0.6))]
    for sx in (-1, 1):
        for sy in (-1, 1):
            o.append(sphere(name + 'Fender%d%d' % (sx, sy), (sx * 0.78, sy * 1.45, 0.6), 1.0, paint, 24, scale=(0.32, 0.65, 0.38)))
            w = cyl(name + 'Wheel%d%d' % (sx, sy), (sx * 0.7, sy * 1.45, 0.38), (sx * 0.95, sy * 1.45, 0.38), 0.36, tyre, 24)
            o.append(w)
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    if headlights:
        bpy.context.view_layer.update()
        for sx in (-1, 1):
            p = root.matrix_world @ Vector((sx * 0.6, 2.35, 0.75))
            t = root.matrix_world @ Vector((sx * 0.6, 12, -0.5))
            Wd.spot(name + 'Head%d' % sx, p, t, color=(1.0, 0.85, 0.6), power=40, size_deg=50, blend=0.8, radius=0.04)
    return root


def street(name, NF, length=120, houses=10, seed=3):
    """Dark 1940s residential street: asphalt, kerbs, bungalows with dark windows, lamp posts (switched off)."""
    r = rng(seed)
    asp = M.texture_set(name + 'Asph', 'asphalt_02', scale=0.2, tint=(0.35, 0.35, 0.35), box=True)
    boxm(name + 'Road', (0, length / 2, -0.05), (10, length, 0.1), asp)
    conc = M.texture_set(name + 'Walk', 'rough_concrete', scale=0.5, tint=(0.4, 0.4, 0.38), box=True)
    lawn = M.texture_set(name + 'Lawn', 'forest_ground_04', scale=0.3, tint=(0.25, 0.27, 0.2), box=True)
    for sx in (-1, 1):
        boxm(name + 'Walk%d' % sx, (sx * 6.5, length / 2, 0.08), (3, length, 0.16), conc)
        boxm(name + 'Lawn%d' % sx, (sx * 16, length / 2, 0.02), (16, length, 0.04), lawn)
        for k in range(houses):
            y = 6 + k * (length - 12) / max(1, houses - 1)
            wcol = r.choice(((0.62, 0.58, 0.5), (0.5, 0.52, 0.5), (0.6, 0.52, 0.42)))
            hm = M.principled('%sH%d_%d' % (name, sx, k), base=wcol, rough=0.85, grime=0.3)
            boxm('%sHouse%d_%d' % (name, sx, k), (sx * 17, y, 2.0), (9, 8, 4.0), hm, 0.04)
            roof = boxm('%sRoof%d_%d' % (name, sx, k), (sx * 17, y, 4.6), (10, 9, 1.2),
                        M.principled('%sRf%d_%d' % (name, sx, k), base=(0.12, 0.10, 0.09), rough=0.9))
            roof.scale = (1, 1, 1)
            for wy in (-2, 2):
                boxm('%sWin%d_%d_%d' % (name, sx, k, wy), (sx * 12.45, y + wy, 2.2), (0.05, 1.2, 1.1),
                     M.principled('DarkWin', base=(0.01, 0.01, 0.012), rough=0.1))
        for k in range(0, length, 30):
            CN.place('street_lamp_01', (sx * 5.6, k + 8, 0), rot=(0, 0, math.radians(90 if sx < 0 else -90)))


def weather_balloon(name, loc, NF, drift=(8, 2, 3)):
    root = Md.empty(name, loc)
    latex = M.principled(name + 'Latex', base=(0.85, 0.82, 0.75), rough=0.4, sss=0.1, alpha=0.95)
    b = sphere(name + 'Ball', (0, 0, 0), 2.0, latex, 32, scale=(1, 1, 1.12))
    sd = boxm(name + 'Sonde', (0, 0, -9), (0.3, 0.2, 0.4), bpy.data.materials['Newsprint'])
    ln = curve_poly(name + 'Cord', [(0, 0, -2.2), (0.1, 0, -5), (0, 0, -8.8)], bevel=0.01, mat=bpy.data.materials['Ink'])
    parent_all(root, [b, sd, ln])
    key_loc(root, [(0, Vector(loc)), (NF, Vector(loc) + Vector(drift))], interp='LINEAR')
    return root


def smoke_layer(center, size, density=0.004, color=(0.35, 0.35, 0.36)):
    Wd.fog(center=center, size=size, density=density, color=color, anisotropy=0.3, noise=0.7, noise_scale=0.002)
