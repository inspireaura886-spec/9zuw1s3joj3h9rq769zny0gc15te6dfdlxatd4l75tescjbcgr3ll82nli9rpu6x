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


# =============================================================== sodder-children-1945 builders
# Fayetteville, West Virginia, Christmas Eve 1945: a two-storey timber farmhouse with an attic, Christmas lights, two
# 1940s work trucks, a wooden ladder, a winter night; the fire as glow + emissive flame masses + smoke; the morning ruin.
# RULES: no gore, no remains, NO children's faces or child figures close to camera; the billboard and the 1967/68 photo are
# shown only from behind. Wide plates 24-35 mm.


def sod_mats():
    if bpy.data.materials.get('Siding'):
        return
    M.principled('Siding', base=(0.70, 0.68, 0.62), rough=0.8, bump=0.5, bump_scale=8, grime=0.4)
    M.principled('Roof', base=(0.10, 0.09, 0.09), rough=0.75, grime=0.3)
    M.principled('Char', base=(0.02, 0.018, 0.016), rough=0.95, bump=0.8, bump_scale=30)
    M.principled('Ash', base=(0.32, 0.31, 0.30), rough=1.0, bump=0.4, bump_scale=40)
    M.principled('Ladder', base=(0.45, 0.34, 0.20), rough=0.8, grime=0.5)
    M.principled('TruckP', base=(0.08, 0.14, 0.10), rough=0.45, coat=0.2, grime=0.5)
    M.principled('Tyre', base=(0.02, 0.02, 0.02), rough=0.8)
    M.principled('Paper', base=(0.82, 0.79, 0.70), rough=0.9, grime=0.25)
    M.principled('Ink', base=(0.03, 0.03, 0.05), rough=0.6)
    M.principled('Frost', base=(0.30, 0.31, 0.28), rough=0.9, bump=0.3, bump_scale=20)
    M.emission('WinWarm', (1.0, 0.72, 0.42), 6.0)
    M.emission('FireE', (1.0, 0.38, 0.08), 30.0)


def winter_night(NF, seed=0, moon=0.25, ground_size=400):
    """Clear cold night: night HDRI with stars, moon, frosty field, distant tree line (scanned firs)."""
    sod_mats()
    Wd.hdri('qwantani_night_puresky', strength=0.06, bg_strength=0.12, stars=0.4)
    Wd.moon(direction=(-0.4, 0.5, 0.45), strength=moon)
    Wd.terrain('Field', size=ground_size, res=80, height=1.2, scale=0.02, center=(0, 40, -0.2), seed=seed,
               mat=bpy.data.materials['Frost'])
    CN.scatter('pine_tree_01', 40, (-120, 120, 60, 140), seed=seed + 3, scale=(0.9, 1.4))
    CN.scatter('dry_branches_medium_01', 20, (-30, 30, -10, 25), seed=seed + 4, scale=(1.0, 2.0))


def house(name, loc=(0, 0, 0), lit=True, xmas=True, burnt=0.0):
    """Two-storey timber farmhouse ~10 x 8 m, gable roof with attic window; burnt>0 chars the walls."""
    sod_mats()
    x, y, z = loc
    wall = bpy.data.materials['Char'] if burnt > 0.5 else bpy.data.materials['Siding']
    root = Md.empty(name, loc)
    objs = [boxm(name + 'Body', (x, y, z + 3.0), (10.0, 8.0, 6.0), wall),
            boxm(name + 'Step', (x, y - 4.4, z + 0.2), (2.4, 0.8, 0.4), wall)]
    rv = [(x - 5.3, y - 4.3, z + 6.0), (x + 5.3, y - 4.3, z + 6.0), (x, y - 4.3, z + 9.0),
          (x - 5.3, y + 4.3, z + 6.0), (x + 5.3, y + 4.3, z + 6.0), (x, y + 4.3, z + 9.0)]
    objs.append(Md.mesh_obj(name + 'Roof', rv, [(0, 1, 2), (3, 5, 4), (0, 2, 5, 3), (1, 4, 5, 2), (0, 3, 4, 1)],
                            smooth=False, mats=(bpy.data.materials['Roof'],)))
    win = bpy.data.materials['WinWarm'] if lit else M.principled(name + 'WinDark', base=(0.02, 0.02, 0.03), rough=0.1)
    for fl, zz in ((0, 1.6), (1, 4.4)):
        for k in range(4):
            objs.append(boxm(name + 'W%d%d' % (fl, k), (x - 3.6 + 2.4 * k, y - 4.02, z + zz), (0.9, 0.05, 1.3), win))
    objs.append(boxm(name + 'Attic', (x, y - 4.32, z + 7.3), (0.8, 0.05, 0.7), win))
    if xmas:
        for k in range(22):
            g = bpy.data.materials.get('Xmas%d' % (k % 4)) or glow_mat('Xmas%d' % (k % 4), color=((1, 0.2, 0.2), (0.2, 1, 0.3), (0.3, 0.5, 1), (1, 0.8, 0.3))[k % 4], strength=8)
            objs.append(sphere(name + 'Bulb%d' % k, (x - 5.0 + 10.0 * k / 21, y - 4.25, z + 5.95), 0.06, g, 8))
    for o in objs:
        o.parent = root
    root.location = (0, 0, 0)
    return root


def fire(name, center, size, NF, power=30000, seed=0, smoke=True):
    """House fire: emissive flame masses that churn (scale/position keys), warm area lights flickering, a smoke plume.
    Light animation only; the camera never shakes."""
    sod_mats()
    r = rng(seed)
    fm = bpy.data.materials['FireE']
    for k in range(18):
        p = Vector((center[0] + r.uniform(-size[0] / 2, size[0] / 2), center[1] + r.uniform(-size[1] / 2, size[1] / 2),
                    center[2] + r.uniform(0, size[2])))
        o = crumple(name + 'F%d' % k, p, r.uniform(0.8, 2.2), fm, seed=seed * 50 + k, amp=0.5)
        o.scale = (1, 1, 2.0)
        key_loc(o, [(f, p + Vector((0, 0, r.uniform(0, 1.5)))) for f in range(0, NF + 1, 15)])
    for k in range(3):
        li = Wd.point(name + 'L%d' % k, (center[0] + (k - 1) * size[0] / 3, center[1] - size[1] / 2 - 1, center[2] + size[2] / 2),
                      color=(1.0, 0.45, 0.15), power=power / 3, radius=2.0)
        key_energy(li, [(f, power / 3 * r.uniform(0.7, 1.2)) for f in range(0, NF + 1, 5)])
    key_strength(fm, [(f, 30 * r.uniform(0.8, 1.2)) for f in range(0, NF + 1, 5)])
    if smoke:
        sm = fade_mat(name + 'Smoke', base=(0.08, 0.08, 0.085), rough=1.0)
        key_fac(sm, [(0, 0.7)])
        for k in range(16):
            p0 = Vector((center[0] + r.uniform(-3, 3), center[1] + r.uniform(-2, 2), center[2] + size[2] + 3 * k))
            o = crumple(name + 'S%d' % k, p0, 2.0 + 0.5 * k, sm, seed=seed * 70 + k, amp=0.45)
            key_loc(o, [(0, p0), (NF, p0 + Vector((4 + 0.3 * k, 0, 10)))], interp='LINEAR')


def truck(name, loc, yaw=0.0):
    """1940s work truck (generic): cab, hood, flat bed, four wheels, round dead headlights."""
    sod_mats()
    root = Md.empty(name, loc)
    p, t = bpy.data.materials['TruckP'], bpy.data.materials['Tyre']
    objs = [boxm(name + 'Cab', (0, 0.2, 1.55), (1.9, 1.5, 1.3), p, bev=0.12),
            boxm(name + 'Hood', (0, 1.75, 1.2), (1.4, 1.7, 0.8), p, bev=0.15),
            boxm(name + 'Bed', (0, -2.2, 1.05), (2.1, 3.2, 0.25), M.principled(name + 'Wd', base=(0.3, 0.22, 0.14), rough=0.8, grime=0.5))]
    for sx in (-1, 1):
        for sy in (1.7, -2.6):
            objs.append(cyl(name + 'Wh%d%d' % (sx, int(sy)), (sx * 0.85, sy, 0.45), (sx * 1.15, sy, 0.45), 0.45, t, 20))
        objs.append(sphere(name + 'Lamp%d' % sx, (sx * 0.55, 2.62, 1.3), 0.13, M.principled(name + 'Glass%d' % sx, base=(0.6, 0.6, 0.55), rough=0.1, metal=0.3), 12))
    for o in objs:
        o.parent = root
    root.rotation_euler[2] = math.radians(yaw)
    return root


def ladder(name, p0, p1, w=0.5, rungs=14):
    sod_mats()
    m = bpy.data.materials['Ladder']
    a, b = Vector(p0), Vector(p1)
    side = (b - a).cross(Vector((0, 0, 1)))
    side = side.normalized() * (w / 2) if side.length > 1e-6 else Vector((w / 2, 0, 0))
    objs = [cyl(name + 'R1', a - side, b - side, 0.03, m, 8), cyl(name + 'R2', a + side, b + side, 0.03, m, 8)]
    for k in range(1, rungs):
        c = a + (b - a) * (k / rungs)
        objs.append(cyl(name + 'Rung%d' % k, c - side, c + side, 0.018, m, 8))
    root = Md.empty(name, (0, 0, 0))
    return parent_all(root, objs)


def handwriting(name, lines, loc, size=0.012, mat=None, rot=(0, 0, 0)):
    sod_mats()
    out = []
    for i, ln in enumerate(lines):
        out.append(text_obj(name + '%d' % i, ln, (loc[0], loc[1] - i * size * 1.6, loc[2]), size=size,
                            mat=mat or bpy.data.materials['Ink'], rot=rot, align='CENTER'))
    return out


# ---- torus() copied from percy-fawcett-1925 so this slug stands alone


def torus(name, loc, R, r, mat, seg=48, rs=16, rot=(0, 0, 0)):
    rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        rings.append([((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))
                      for b in [2 * math.pi * j / rs for j in range(rs)]])
    rings.append(rings[0])
    v, f = Md.loft(rings)
    o = Md.mesh_obj(name, v, f, smooth=True, mats=(mat,))
    o.location = loc
    o.rotation_euler = rot
    return o


