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


# =============================================================== otzi-iceman builders
# Tisenjoch pass, Otztal Alps, 3,210 m: rock ridges, old snow, a melting glacier gully; a Copper Age traveller (living,
# faceless, fur cape, bow, quiver) for reconstruction shots; a 2001 radiology room with lightboxes; a generic glass anatomy
# silhouette (NOT his remains) for the arrow path. RULE: his body is shown only as a distant, low, dark silhouette in the ice
# or not at all. Wide plates 24-35 mm.


def alp_mats():
    if bpy.data.materials.get('SnowA'):
        return
    M.principled('SnowA', base=(0.86, 0.88, 0.92), rough=0.6, sss=0.06, bump=0.3, bump_scale=6, rough_noise=0.1)
    M.principled('GlacierIce', base=(0.55, 0.70, 0.80), rough=0.15, sss=0.2, transmission=0.25, bump=0.2, bump_scale=4)
    M.principled('Fur', base=(0.22, 0.16, 0.10), rough=0.95, bump=0.9, bump_scale=200)
    M.principled('Hide', base=(0.30, 0.22, 0.14), rough=0.85, grime=0.4)
    M.principled('Yew', base=(0.42, 0.25, 0.12), rough=0.6)
    M.principled('Copper', base=(0.80, 0.45, 0.25), rough=0.35, metal=1.0, grime=0.3)
    M.principled('Flint', base=(0.30, 0.28, 0.26), rough=0.3, coat=0.3, bump=0.4, bump_scale=80)
    M.principled('Film', base=(0.02, 0.03, 0.04), rough=0.2, alpha=0.9)
    M.principled('DarkShape', base=(0.05, 0.04, 0.035), rough=0.9)


def alps(NF, seed=0, sun_elev=18, az=140, warmth='noon', haze=0.0015, gully=True, snowfall=0):
    """Tisenjoch-like pass: big rock massifs, old snow fields, a shallow glacier gully with a melt line."""
    alp_mats()
    Wd.hdri('kloppenheim_02_puresky', strength=0.4, bg_strength=0.9, rot=az, tint=(0.9, 0.95, 1.05))
    CN.sun(elev=sun_elev, az=az, warmth=warmth, strength=3.4)
    rock = M.texture_set('AlpRock', 'rocky_terrain_02', scale=0.03, tint=(0.42, 0.40, 0.38), box=True)
    Wd.terrain('Massif', size=6000, res=180, height=900, scale=0.0007, center=(0, 2600, -60), seed=seed + 1, mat=rock)
    Wd.terrain('Pass', size=600, res=140, height=14, scale=0.012, center=(0, 120, -2), seed=seed, mat=bpy.data.materials['SnowA'])
    r = rng(seed)
    for k in range(30):
        crumple('Rock%d' % k, (r.uniform(-120, 120), r.uniform(10, 260), 0.5), r.uniform(1.0, 5.0), rock, seed=seed * 40 + k, amp=0.45)
    if gully:
        g = Wd.terrain('Gully', size=40, res=60, height=0.8, scale=0.1, center=(0, 30, -0.3), seed=seed + 5,
                       mat=bpy.data.materials['GlacierIce'])
        g.scale = (1.0, 0.35, 1.0)
    if haze:
        Wd.fog(center=(0, 1500, 150), size=(5000, 4000, 400), density=haze, color=(0.85, 0.9, 1.0), anisotropy=0.5,
               height_falloff=1.0)
    if snowfall:
        flake = M.principled('Flake', base=(0.95, 0.96, 1.0), rough=0.5)
        for k in range(snowfall):
            p0 = Vector((r.uniform(-12, 12), r.uniform(0, 30), r.uniform(1, 9)))
            s = sphere('Flake%d' % k, p0, 0.02, flake, 6)
            key_loc(s, [(0, p0), (NF, p0 + Vector((r.uniform(2, 5), 0.3, -r.uniform(2, 4))))], interp='LINEAR')


def hiker(name, loc, yaw=0.0, col=(0.55, 0.12, 0.10)):
    """1991 hiker silhouette: bright jacket, rucksack (faceless)."""
    alp_mats()
    f = figure(name, loc, yaw=yaw, coat=M.principled(name + 'Jkt', base=col, rough=0.6))
    boxm(name + 'Ruck', (0, -0.2, 1.2), (0.38, 0.22, 0.5), M.principled(name + 'RuckM', base=(0.1, 0.12, 0.15), rough=0.7), bev=0.04).parent = f
    return f


def traveller(name, loc, yaw=0.0):
    """Copper Age traveller (reconstruction, faceless): fur cape cone, hide leggings, bow stave over the shoulder, quiver."""
    alp_mats()
    f = figure(name, loc, yaw=yaw, mat=bpy.data.materials['Hide'], coat=bpy.data.materials['Fur'])
    cape = Md.mesh_obj(name + 'Cape', [(0, 0, 1.5), *[(0.38 * math.cos(2 * math.pi * k / 10), 0.30 * math.sin(2 * math.pi * k / 10), 0.75) for k in range(10)]],
                       [(0, 1 + k, 1 + (k + 1) % 10) for k in range(10)], smooth=True, mats=(bpy.data.materials['Fur'],))
    cape.parent = f
    bow = cyl(name + 'Bow', (0.18, -0.15, 0.3), (0.05, -0.18, 2.0), 0.015, bpy.data.materials['Yew'], 8)
    bow.parent = f
    q = cyl(name + 'Quiver', (-0.15, -0.2, 0.9), (-0.05, -0.22, 1.6), 0.06, bpy.data.materials['Hide'], 10)
    q.parent = f
    return f


def lightbox(name, loc, w=0.9, h=0.7, rot_z=0.0, strength=3.0):
    """Wall lightbox: emissive cool-white panel in a metal frame."""
    alp_mats()
    root = Md.empty(name, loc)
    boxm(name + 'Frame', (0, 0, 0), (w + 0.06, 0.06, h + 0.06), M.principled(name + 'Fr', base=(0.6, 0.6, 0.6), rough=0.4, metal=0.6)).parent = root
    boxm(name + 'Panel', (0, -0.032, 0), (w, 0.004, h), M.emission(name + 'Glow', (0.85, 0.92, 1.0), strength)).parent = root
    root.rotation_euler[2] = rot_z
    return root


def xray_film(name, loc, rot_z=0.0, point=True, glow=1.0):
    """Schematic chest film on a lightbox (NOT his real radiograph): dark sheet, pale rib arcs + shoulder blade, and a small
    bright triangle under the left shoulder blade when point=True. Returns the point object (or None)."""
    alp_mats()
    root = Md.empty(name, loc)
    boxm(name + 'Sheet', (0, -0.04, 0), (0.42, 0.003, 0.52), bpy.data.materials['Film']).parent = root
    bone = M.emission(name + 'Bone', (0.75, 0.8, 0.85), 1.6 * glow)
    for k in range(7):
        zz = 0.17 - 0.055 * k
        for sx in (-1, 1):
            pts = [(sx * 0.02, -0.045, zz), (sx * 0.10, -0.045, zz + 0.02), (sx * 0.17, -0.045, zz - 0.02), (sx * 0.18, -0.045, zz - 0.07)]
            curve_poly(name + 'Rib%d%d' % (k, sx), pts, bevel=0.004, mat=bone).parent = root
    cyl(name + 'Spine', (0, -0.045, 0.22), (0, -0.045, -0.24), 0.008, bone, 8).parent = root
    blade = Md.mesh_obj(name + 'Blade', [(0.06, -0.044, 0.20), (0.17, -0.044, 0.19), (0.10, -0.044, 0.02)], [(0, 1, 2)], smooth=False,
                        mats=(M.emission(name + 'BladeE', (0.6, 0.65, 0.7), 0.8 * glow),))
    blade.parent = root
    pt = None
    if point:
        pt = Md.mesh_obj(name + 'Point', [(0.115, -0.046, 0.075), (0.135, -0.046, 0.06), (0.11, -0.046, 0.045)], [(0, 1, 2)],
                         smooth=False, mats=(M.emission(name + 'PointE', (1.0, 0.97, 0.9), 6.0 * glow),))
        pt.parent = root
    root.rotation_euler[2] = rot_z
    return pt


def glass_body(name, loc, yaw=0.0):
    """Generic anatomy-class glass silhouette (head, torso, arms) - a teaching figure, not his remains."""
    alp_mats()
    g = M.glass(name + 'Glass', tint=(0.85, 0.92, 1.0), rough=0.08)
    f = figure(name, loc, yaw=yaw, mat=g, coat=g)
    return f


def flint_point(name, loc, size=0.04, rot=(0, 0, 0)):
    alp_mats()
    s = size
    v = [(0, s, 0), (-s * 0.45, -s * 0.5, 0), (s * 0.45, -s * 0.5, 0), (0, 0, s * 0.12), (0, 0, -s * 0.12)]
    f = [(0, 1, 3), (1, 2, 3), (2, 0, 3), (1, 0, 4), (2, 1, 4), (0, 2, 4)]
    o = Md.mesh_obj(name, v, f, smooth=False, mats=(bpy.data.materials['Flint'],))
    o.location = loc
    o.rotation_euler = rot
    return o


def copper_axe(name, loc, rot_z=0.0):
    """Yew haft (~60 cm) with a small copper blade lashed in the fork (reconstruction)."""
    alp_mats()
    root = Md.empty(name, loc)
    cyl(name + 'Haft', (0, -0.3, 0.03), (0, 0.3, 0.03), 0.018, bpy.data.materials['Yew'], 10).parent = root
    blade = Md.mesh_obj(name + 'Blade', [(-0.02, 0.27, 0.03), (0.06, 0.29, 0.03), (0.08, 0.34, 0.03), (-0.02, 0.33, 0.03)],
                        [(0, 1, 2, 3)], smooth=False, mats=(bpy.data.materials['Copper'],))
    blade.parent = root
    sol = M.principled(name + 'Bind', base=(0.18, 0.12, 0.06), rough=0.9)
    cyl(name + 'Lash', (0, 0.25, 0.03), (0, 0.3, 0.03), 0.024, sol, 10).parent = root
    root.rotation_euler[2] = rot_z
    return root
