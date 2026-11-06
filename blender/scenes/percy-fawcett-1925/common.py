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


# =============================================================== percy-fawcett-1925 builders
# Mato Grosso / Upper Xingu 1925: dry forest edge -> closed rainforest, buriti palms, a brown river, Dead Horse Camp
# (tent, packs, a horse skull is NOT shown, only white stones), campfire + smoke seen from far away, a lab bench (1951 jaw
# vs spare denture), a city shop counter (signet ring), and an aerial of moated pre-Columbian towns (c. AD 1200, after
# Heckenberger). Faceless figures, wide plates 24-35 mm, close-ups as accents only.


def jungle_mats():
    if bpy.data.materials.get('Leaf'):
        return
    M.principled('Leaf', base=(0.05, 0.13, 0.04), rough=0.55, sss=0.08, bump=0.3, bump_scale=30, rough_noise=0.2)
    M.principled('LeafDry', base=(0.20, 0.18, 0.07), rough=0.7, sss=0.05, bump=0.3, bump_scale=30)
    M.principled('Bark', base=(0.16, 0.12, 0.09), rough=0.85, bump=0.6, bump_scale=60, grime=0.4)
    M.principled('PalmBark', base=(0.22, 0.18, 0.13), rough=0.85, bump=0.5, bump_scale=25, grime=0.3)
    M.principled('RiverW', base=(0.10, 0.07, 0.03), rough=0.06, spec=0.6, transmission=0.0)
    M.principled('Khaki', base=(0.42, 0.37, 0.25), rough=0.85, grime=0.3)
    M.principled('Canvas', base=(0.55, 0.50, 0.40), rough=0.9, bump=0.2, bump_scale=60, grime=0.3)
    M.principled('Paper', base=(0.80, 0.76, 0.64), rough=0.9, grime=0.3)
    M.principled('Ink', base=(0.03, 0.03, 0.05), rough=0.6)
    M.principled('DarkEarth', base=(0.05, 0.035, 0.025), rough=0.95)
    M.principled('Brass', base=(0.75, 0.55, 0.25), rough=0.25, metal=1.0, grime=0.2)
    M.principled('Gold', base=(0.95, 0.72, 0.35), rough=0.18, metal=1.0)
    M.principled('Bone', base=(0.70, 0.66, 0.56), rough=0.7, grime=0.4)
    M.principled('Pink', base=(0.70, 0.40, 0.38), rough=0.4, coat=0.3)


def broadleaf(name, loc, h=24.0, crown=7.0, seed=0, dry=False):
    """Rainforest tree: slightly leaning trunk + buttress flare + 4-6 crumpled leaf masses."""
    jungle_mats()
    r = rng(seed)
    x, y, z = loc
    top = (x + r.uniform(-1.2, 1.2), y + r.uniform(-1.2, 1.2), z + h)
    parts = [cyl(name + 'Trunk', (x, y, z - 0.5), top, 0.35 + h * 0.012, bpy.data.materials['Bark'], 12),
             cyl(name + 'Flare', (x, y, z - 0.2), (x, y, z + 1.6), 0.9 + h * 0.02, bpy.data.materials['Bark'], 10)]
    lm = bpy.data.materials['LeafDry' if dry else 'Leaf']
    for k in range(r.randint(4, 6)):
        c = (top[0] + r.uniform(-crown, crown) * 0.6, top[1] + r.uniform(-crown, crown) * 0.6, top[2] + r.uniform(-1.5, 2.5))
        parts.append(crumple(name + 'Crown%d' % k, c, crown * r.uniform(0.45, 0.75), lm, seed=seed * 10 + k, amp=0.35))
    root = Md.empty(name, (0, 0, 0))
    return parent_all(root, parts)


def palm(name, loc, h=16.0, seed=0):
    """Buriti palm: thin straight trunk + 14 drooping fan fronds (flattened bevelled curves)."""
    jungle_mats()
    r = rng(seed)
    x, y, z = loc
    parts = [cyl(name + 'Trunk', (x, y, z), (x, y, z + h), 0.28, bpy.data.materials['PalmBark'], 10)]
    for k in range(14):
        a = 2 * math.pi * k / 14 + r.uniform(-0.15, 0.15)
        L = r.uniform(3.2, 4.6)
        pts = [(x + math.cos(a) * L * t, y + math.sin(a) * L * t, z + h + 1.2 * t - 2.6 * t * t) for t in (0, 0.3, 0.6, 1.0)]
        fr = curve_poly(name + 'Frond%d' % k, pts, bevel=0.45, mat=bpy.data.materials['Leaf'])
        parts.append(fr)
    root = Md.empty(name, (0, 0, 0))
    return parent_all(root, parts)


def jungle(NF, seed=0, n_trees=60, n_palms=14, area=(-120, 120, -20, 260), lane=None, sun_elev=18, az=120,
           haze=0.012, warmth='late', dry=False, under=True):
    """Upper Xingu forest: HDRI + low sun through haze, textured floor, broadleaf trees + buriti palms, scanned undergrowth.
    lane(x, y) -> True keeps a corridor clear (trail / river / camera)."""
    jungle_mats()
    Wd.hdri('kloppenheim_02_puresky', strength=0.35, bg_strength=0.7, rot=az, tint=(0.95, 1.0, 0.92))
    CN.sun(elev=sun_elev, az=az, warmth=warmth, strength=3.2)
    floor = M.texture_set('JFloor', 'forest_ground_04', scale=0.2, tint=(0.42, 0.36, 0.28), box=True)
    Wd.terrain('JGround', size=900, res=120, height=2.5, scale=0.02, center=(0, 120, -0.4), seed=seed, mat=floor)
    r = rng(seed)
    placed = 0
    tries = 0
    while placed < n_trees and tries < n_trees * 20:
        tries += 1
        x, y = r.uniform(area[0], area[1]), r.uniform(area[2], area[3])
        if lane and lane(x, y):
            continue
        broadleaf('Tree%d' % placed, (x, y, 0), h=r.uniform(16, 32), crown=r.uniform(5, 9), seed=seed * 100 + placed,
                  dry=dry and r.random() < 0.5)
        placed += 1
    for k in range(n_palms):
        x, y = r.uniform(area[0], area[1]), r.uniform(area[2], area[3])
        if lane and lane(x, y):
            continue
        palm('Palm%d' % k, (x, y, 0), h=r.uniform(11, 20), seed=seed * 50 + k)
    if under:
        CN.scatter('weed_plant_02', 70, (area[0] * 0.5, area[1] * 0.5, area[2], area[3] * 0.5), seed=seed + 1,
                   avoid=lane, scale=(1.4, 2.6))
        CN.scatter('grass_medium_01', 120, (area[0] * 0.5, area[1] * 0.5, area[2], area[3] * 0.5), seed=seed + 2,
                   avoid=lane, scale=(1.0, 1.8))
    if haze:
        CN.haze(center=(0, 120, 12), size=(500, 600, 40), density=haze, color=(1.0, 0.95, 0.85), anisotropy=0.7)


def river(name, y0, y1, width=24.0, x=0.0, z=-0.15, bend=10.0):
    """Brown Xingu headwater: a flat glossy mesh strip following a gentle bend, slightly below the bank."""
    jungle_mats()
    vs, fs = [], []
    ys = list(range(int(y0), int(y1) + 1, 10))
    for i, t in enumerate(ys):
        cx = x + bend * math.sin(t * 0.05)
        vs += [(cx - width / 2, t, z), (cx + width / 2, t, z)]
        if i:
            k = 2 * i
            fs.append((k - 2, k - 1, k + 1, k))
    return Md.mesh_obj(name, vs, fs, smooth=False, mats=(bpy.data.materials['RiverW'],))


def on_river(x, y, width=26.0, bend=10.0, cx=0.0):
    return abs(x - (cx + bend * math.sin(y * 0.05))) < width / 2 + 4


def walker(name, loc, yaw=0.0, pack=True, h=1.8):
    """Faceless 1925 explorer silhouette: khaki, broad hat, backpack."""
    jungle_mats()
    f = figure(name, loc, yaw=yaw, h=h, coat=bpy.data.materials['Khaki'], mat=M.principled(name + 'Dk', base=(0.08, 0.07, 0.06), rough=0.85))
    s = h / 1.78
    extra = [cyl(name + 'Brim', (0, 0, 1.70 * s), (0, 0, 1.72 * s), 0.24 * s, bpy.data.materials['Khaki'], 16),
             cyl(name + 'Crown', (0, 0, 1.70 * s), (0, 0, 1.84 * s), 0.12 * s, bpy.data.materials['Khaki'], 12)]
    if pack:
        extra.append(boxm(name + 'Pack', (0, -0.22 * s, 1.15 * s), (0.42 * s, 0.24 * s, 0.55 * s), bpy.data.materials['Canvas'], bev=0.04))
    for o in extra:
        o.parent = f
    return f


def walk(o, NF, p0, p1):
    key_loc(o, [(0, p0), (NF, p1)], interp='LINEAR')


def campfire(name, loc, NF, power=900, flicker=True):
    """Small camp fire: crossed logs, emissive flame cones, a warm point light that breathes (light only; camera never shakes)."""
    jungle_mats()
    x, y, z = loc
    logs = [cyl(name + 'Log%d' % k, (x - 0.6 * math.cos(a), y - 0.6 * math.sin(a), z + 0.05), (x + 0.6 * math.cos(a), y + 0.6 * math.sin(a), z + 0.18),
                0.07, bpy.data.materials['Bark'], 8) for k, a in enumerate((0.2, 1.3, 2.4))]
    fl = M.emission(name + 'Flame', (1.0, 0.45, 0.12), 25.0)
    flames = [sphere(name + 'F%d' % k, (x + 0.12 * math.cos(k * 2.1), y + 0.12 * math.sin(k * 2.1), z + 0.35), 0.18, fl, 12,
                     scale=(1, 1, 2.4)) for k in range(3)]
    li = Wd.point(name + 'Light', (x, y, z + 0.8), color=(1.0, 0.55, 0.25), power=power, radius=0.3)
    if flicker:
        r = rng(7)
        key_energy(li, [(f, power * r.uniform(0.75, 1.15)) for f in range(0, NF + 1, 6)])
        key_strength(fl, [(f, 25.0 * r.uniform(0.7, 1.2)) for f in range(0, NF + 1, 6)])
    return li


def smoke_column(name, base, NF, n=26, rise=60.0, spread=6.0, fade_out=None, seed=0):
    """Thin campfire smoke above the canopy: fading puffs rising and drifting; fade_out=(f0, f1) kills it."""
    m = fade_mat(name + 'M', base=(0.62, 0.62, 0.64), rough=1.0)
    r = rng(seed)
    for k in range(n):
        t = k / n
        p0 = Vector((base[0] + r.uniform(-0.5, 0.5), base[1] + r.uniform(-0.5, 0.5), base[2] + rise * t))
        p1 = p0 + Vector((spread * (0.5 + t), r.uniform(-1, 1), rise * 0.35))
        o = crumple(name + '%d' % k, p0, 1.2 + 4.0 * t, m, seed=seed * 100 + k, amp=0.4)
        key_loc(o, [(0, p0), (NF, p1)], interp='LINEAR')
    if fade_out:
        key_fac(m, [(0, 0.55), (fade_out[0], 0.55), (fade_out[1], 0.0)])
    else:
        key_fac(m, [(0, 0.55)])
    return m


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


def letter(name, loc, text_lines, size=0.012, rot=(0, 0, 0)):
    """Folded 1925 letter on a field table: paper card + handwritten-style lines (font default; comp may overlay real hand)."""
    jungle_mats()
    pap = boxm(name, loc, (0.21, 0.28, 0.0015), bpy.data.materials['Paper'])
    pap.rotation_euler = rot
    objs = []
    for i, ln in enumerate(text_lines):
        t = text_obj(name + 'L%d' % i, ln, (loc[0], loc[1] + 0.09 - i * 0.03, loc[2] + 0.0012), size=size,
                     mat=bpy.data.materials['Ink'], align='CENTER')
        objs.append(t)
    return pap, objs


def moat_ring(name, c, R, w=8.0, mat=None):
    pts = [(c[0] + R * math.cos(2 * math.pi * k / 64), c[1] + R * math.sin(2 * math.pi * k / 64), c[2]) for k in range(64)]
    o = curve_poly(name, pts, bevel=w / 2, mat=mat or bpy.data.materials['DarkEarth'], cyclic=True)
    o.scale = (1, 1, 0.08)
    return o
