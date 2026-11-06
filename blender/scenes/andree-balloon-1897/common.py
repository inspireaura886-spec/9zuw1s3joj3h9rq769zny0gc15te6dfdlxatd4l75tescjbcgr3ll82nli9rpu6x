"""andree-balloon-1897 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch 2026-11-05, render hold).
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


# ---- shared builders copied from roswell-project-mogul-1947 so this slug stands alone


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


# =============================================================== andree-balloon-1897 builders
# Svalbard / pack ice 1897, Kvitoya 1930, Stockholm darkroom 1930. Balloon ~20.5 m varnished silk + net + basket + drag
# ropes. Remains are never shown. Wide plates 24-35 mm.
BAL_R = 10.2


def ice_mats():
    if bpy.data.materials.get('Snow'):
        return
    M.principled('Snow', base=(0.86, 0.89, 0.93), rough=0.62, sss=0.06, bump=0.25, bump_scale=6, rough_noise=0.1)
    M.principled('IceBlue', base=(0.55, 0.70, 0.80), rough=0.2, sss=0.15, transmission=0.2, bump=0.2, bump_scale=4)
    M.principled('Silk', base=(0.58, 0.46, 0.30), rough=0.38, coat=0.3, grime=0.2, bump=0.04, bump_scale=10)
    M.principled('NetCord', base=(0.12, 0.10, 0.08), rough=0.9)
    M.principled('Wicker', base=(0.40, 0.30, 0.18), rough=0.85, bump=0.6, bump_scale=120)
    M.principled('Canvas', base=(0.55, 0.50, 0.40), rough=0.9, bump=0.2, bump_scale=60, grime=0.3)
    M.principled('OldWood', base=(0.30, 0.22, 0.14), rough=0.8, grime=0.5)
    M.principled('Leather', base=(0.18, 0.11, 0.06), rough=0.6, grime=0.3)


def arctic(NF, sun_elev=6, az=200, strength=2.6, haze=0.0012, seed=0, floes=70, area=1500, water=True, warmth='golden'):
    """Pack ice under a low polar sun: dark leads (sea plane), scattered snow-covered floes, pressure ridges, haze."""
    mats()
    ice_mats()
    Wd.hdri('qwantani_dawn_puresky', strength=0.35, bg_strength=0.8, rot=az, tint=(0.85, 0.92, 1.08))
    CN.sun(elev=sun_elev, az=az, warmth=warmth, strength=strength)
    if water:
        Wd.sea_plane(size=60000, z=-0.3, color=(0.004, 0.008, 0.012), rough=0.08, wave=0.05, frames=NF)
    base = Wd.terrain('PackIce', size=area * 2, res=160, height=2.5, scale=0.004, center=(0, area * 0.6, 0.0), seed=seed,
                      mat=bpy.data.materials['Snow'])
    r = rng(seed)
    for k in range(floes):
        floe('Floe%d' % k, (r.uniform(-area, area), r.uniform(-area * 0.2, area * 1.6), 0.2), r.uniform(8, 40), seed=seed * 100 + k)
    for k in range(10):
        x, y = r.uniform(-area * 0.8, area * 0.8), r.uniform(0, area * 1.4)
        pressure_ridge('Ridge%d' % k, (x, y), (x + r.uniform(-120, 120), y + r.uniform(30, 160)), n=24, seed=k)
    if haze:
        Wd.fog(center=(0, area, 40), size=(area * 3, area * 3, 120), density=haze, color=(0.85, 0.9, 1.0), anisotropy=0.5,
               height_falloff=1.2)
    return base


def floe(name, center, radius, seed=0, thick=1.2, n=14):
    """Irregular ice floe: jittered polygon, extruded, snow top."""
    r = rng(seed)
    bm = bmesh.new()
    vs = []
    for k in range(n):
        t = 2 * math.pi * k / n
        rr = radius * r.uniform(0.65, 1.15)
        vs.append(bm.verts.new((rr * math.cos(t), rr * math.sin(t), 0)))
    f = bm.faces.new(vs)
    ex = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in ex['geom'] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += thick
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    o.location = (center[0], center[1], center[2] - thick * 0.7)
    o.data.materials.append(bpy.data.materials['Snow'])
    I.bevel(o, 0.3)
    return o


def pressure_ridge(name, p0, p1, n=20, seed=0, h=2.2):
    """Row of tilted, jumbled ice blocks along a line."""
    r = rng(seed)
    p0, p1 = Vector((*p0, 0)), Vector((*p1, 0))
    for k in range(n):
        q = p0.lerp(p1, k / (n - 1)) + Vector((r.uniform(-2, 2), r.uniform(-2, 2), 0))
        s = (r.uniform(1.0, 3.0), r.uniform(0.6, 2.0), r.uniform(0.8, h))
        b = boxm('%sB%d' % (name, k), (q.x, q.y, s[2] * 0.3), s, bpy.data.materials['IceBlue' if k % 3 == 0 else 'Snow'], 0.12)
        b.rotation_euler = (r.uniform(-0.5, 0.5), r.uniform(-0.5, 0.5), r.uniform(0, 3.14))


def balloon(name, loc, NF, ropes=True, crew=False, sag=0.0):
    """Hydrogen balloon (Ornen look): silk sphere r~10 m with cord net, load ring, suspension lines, wicker basket with a
    flat roof, three drag ropes. sag 0..1 flattens it (downed balloon, s10/s15)."""
    ice_mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    zc = 16.0
    env = sphere(name + 'Env', (0, 0, zc), BAL_R, g['Silk'], 48, scale=(1, 1, 1.0 - 0.5 * sag))
    env.parent = root
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=BAL_R * 1.01, location=(0, 0, zc))
    net = bpy.context.active_object
    net.name = name + 'Net'
    net.scale = (1, 1, 1.0 - 0.5 * sag)
    wf = net.modifiers.new('W', 'WIREFRAME')
    wf.thickness = 0.04
    M.assign(net, g['NetCord'])
    net.parent = root
    if sag > 0:
        d = env.modifiers.new('Wrinkle', 'DISPLACE')
        tex = bpy.data.textures.new(name + 'WrT', 'CLOUDS')
        tex.noise_scale = 2.5
        d.texture = tex
        d.strength = 1.2 * sag
        net.modifiers.new('Wrinkle', 'DISPLACE').texture = tex
    ring_z = 3.6 if sag == 0 else 1.6
    bpy.ops.mesh.primitive_torus_add(major_radius=1.4, minor_radius=0.07, location=(0, 0, ring_z))
    ring = bpy.context.active_object
    ring.name = name + 'Ring'
    M.assign(ring, g['OldWood'])
    ring.parent = root
    if sag == 0:
        for k in range(16):
            t = 2 * math.pi * k / 16
            curve_poly(name + 'Sus%d' % k, [(1.4 * math.cos(t), 1.4 * math.sin(t), ring_z),
                                            (BAL_R * 0.86 * math.cos(t), BAL_R * 0.86 * math.sin(t), zc - BAL_R * 0.5)],
                       bevel=0.012, mat=g['NetCord']).parent = root
        bz = 1.6
        bk = cyl(name + 'Basket', (0, 0, bz - 0.8), (0, 0, bz + 0.8), 1.0, g['Wicker'], 32)
        roof = cyl(name + 'Roof', (0, 0, bz + 0.8), (0, 0, bz + 0.86), 1.05, g['Canvas'], 32)
        for x in (bk, roof):
            x.parent = root
        for k in range(4):
            t = 2 * math.pi * k / 4
            curve_poly(name + 'Hang%d' % k, [(math.cos(t), math.sin(t), bz + 0.8), (1.4 * math.cos(t), 1.4 * math.sin(t), ring_z)],
                       bevel=0.015, mat=g['NetCord']).parent = root
        if crew:
            for k in range(3):
                t = 2 * math.pi * k / 3 + 0.4
                fg = figure(name + 'Crew%d' % k, (0.55 * math.cos(t), 0.55 * math.sin(t), bz + 0.86), yaw=math.degrees(t) + 90, h=1.75)
                fg.parent = root
        if ropes:
            for k in range(3):
                t = 2 * math.pi * k / 3
                pts = [(0.9 * math.cos(t), 0.9 * math.sin(t), bz - 0.8)]
                for j in range(1, 10):
                    pts.append((0.9 * math.cos(t) - j * 5.0, 0.9 * math.sin(t) + math.sin(j + k) * 0.6, max(-loc[2] + 0.1, bz - 0.8 - j * 2.2)))
                curve_poly(name + 'Drag%d' % k, pts, bevel=0.05, mat=g['NetCord']).parent = root
    else:
        bk = cyl(name + 'Basket', (0, -0.8, 0.9), (0, 0.8, 0.9), 0.95, g['Wicker'], 32)
        bk.location = (BAL_R * 0.9, 3, 0.95)
        bk.parent = root
        for k in range(5):
            sag_rope(name + 'Line%d' % k, (k - 2, 0, 1.0), (BAL_R * 0.9, 3 + k * 0.2, 1.4), sag=0.8, r=0.02, mat=g['NetCord']).parent = root
    return root


def balloon_house(name, loc, h=26.0, rr=12.5):
    """Danes Island balloon shed: tall octagonal open-topped plank house."""
    ice_mats()
    root = Md.empty(name, loc)
    plank = M.texture_set(name + 'Plank', 'wood_table_worn', scale=0.3, tint=(0.36, 0.27, 0.18), box=True)
    o = []
    for k in range(8):
        t = 2 * math.pi * (k + 0.5) / 8
        w = 2 * rr * math.tan(math.pi / 8)
        if k == 2:
            continue  # open bay toward the sea (launch side)
        p = boxm(name + 'Wall%d' % k, (rr * math.cos(t), rr * math.sin(t), h / 2), (0.4, w, h), plank)
        p.rotation_euler = (0, 0, t)
        o.append(p)
        for j in range(5):
            bm = boxm(name + 'Beam%d_%d' % (k, j), (rr * 1.03 * math.cos(t), rr * 1.03 * math.sin(t), 2 + j * 5.5), (0.3, w, 0.3), bpy.data.materials['OldWood'])
            bm.rotation_euler = (0, 0, t)
            o.append(bm)
    parent_all(root, o)
    return root


def sledge(name, loc, yaw=0.0):
    ice_mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = [boxm(name + 'RunL', (-0.3, 0, 0.05), (0.05, 3.2, 0.1), g['OldWood']), boxm(name + 'RunR', (0.3, 0, 0.05), (0.05, 3.2, 0.1), g['OldWood']),
         boxm(name + 'Load', (0, 0, 0.4), (0.62, 2.4, 0.5), g['Canvas'], 0.05)]
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def tent(name, loc, yaw=0.0, L=3.0, W=2.2, H=1.6):
    ice_mats()
    v = [(-W / 2, -L / 2, 0), (W / 2, -L / 2, 0), (0, -L / 2, H), (-W / 2, L / 2, 0), (W / 2, L / 2, 0), (0, L / 2, H)]
    f = [(0, 1, 2), (3, 5, 4), (0, 2, 5, 3), (1, 4, 5, 2)]
    o = Md.mesh_obj(name, v, f, smooth=False, mats=(bpy.data.materials['Canvas'],))
    o.location = loc
    o.rotation_euler = (0, 0, math.radians(yaw))
    return o


def sealer(name, loc, yaw=0.0, L=30.0):
    """Small Norwegian sealing vessel: dark wooden hull, wheelhouse, two masts (generic)."""
    ice_mats()
    root = Md.empty(name, loc)
    hull = M.principled(name + 'Hull', base=(0.08, 0.07, 0.06), rough=0.6, grime=0.5)
    rings = []
    for j in range(15):
        u = j / 14
        y = (u - 0.5) * L
        w = 3.4 * math.sin(math.pi * (0.08 + 0.84 * u)) ** 0.6
        rings.append([(-w, y, 2.2), (-w * 0.8, y, -1.8), (0, y, -2.4), (w * 0.8, y, -1.8), (w, y, 2.2)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    Md.mesh_obj(name + 'Body', v, f, parent=root, smooth=True, mats=(hull,))
    wh = boxm(name + 'House', (0, -5, 3.6), (3.2, 4, 2.8), M.principled(name + 'HouseM', base=(0.55, 0.50, 0.42), rough=0.7, grime=0.4), 0.05)
    m1 = cyl(name + 'Mast1', (0, 6, 2), (0, 6, 20), 0.18, bpy.data.materials['OldWood'], 10)
    m2 = cyl(name + 'Mast2', (0, -9, 2), (0, -9, 16), 0.15, bpy.data.materials['OldWood'], 10)
    parent_all(root, [wh, m1, m2])
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def kvitoya(NF, seed=2, dusk=False):
    """Kvitoya: smooth ice-cap dome over a narrow stony beach (Andreeneset), dark sea, scattered floes."""
    mats()
    ice_mats()
    Wd.hdri('qwantani_dawn_puresky', strength=0.3 if not dusk else 0.15, bg_strength=0.75 if not dusk else 0.35, rot=150,
            tint=(0.85, 0.92, 1.08) if not dusk else (0.8, 0.8, 1.05))
    CN.sun(elev=8 if not dusk else 1.5, az=150, warmth='golden', strength=2.6 if not dusk else 1.2)
    Wd.sea_plane(size=60000, z=-0.3, color=(0.004, 0.008, 0.012), rough=0.07, wave=0.12, frames=NF)
    cap = Wd.terrain('IceCap', size=6000, res=180, height=160, scale=0.0004, center=(0, 3200, 0), seed=seed, mat=bpy.data.materials['Snow'], island=1.0)
    stones = M.texture_set('Stones', 'rocky_terrain_02', scale=0.15, tint=(0.33, 0.31, 0.29), box=True)
    Wd.terrain('Beach', size=900, res=120, height=3, scale=0.02, center=(0, 120, 0.2), seed=seed + 3, mat=stones)
    r = rng(seed)
    for k in range(30):
        floe('KFloe%d' % k, (r.uniform(-1500, 1500), r.uniform(-1600, -150), 0.2), r.uniform(4, 22), seed=seed * 50 + k)
    Wd.fog(center=(0, 600, 30), size=(6000, 6000, 90), density=0.0016 if not dusk else 0.0022, color=(0.86, 0.9, 1.0), anisotropy=0.5)
