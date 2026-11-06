"""roswell-project-mogul-1947 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch 2026-11-05, render hold).
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


# =============================================================== roswell-project-mogul-1947 builders
# Period: July 1947 New Mexico + Fort Worth; 1978 interview; 1994 report. No alien imagery anywhere (rule: tell it straight).
# Real artifact (s01, Remotion): PD Marcel debris photo, Fort Worth Star-Telegram 1947 (Commons). Wide plates 24-35 mm.

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


def flower_tape():
    """Cream tape printed with small pink/purple flowers (voronoi cells -> petals). Used for the reflector seam."""
    if bpy.data.materials.get('FlowerTape'):
        return bpy.data.materials['FlowerTape']
    m, nb, b, out = M.new('FlowerTape')
    tc = nb.n('ShaderNodeTexCoord')
    mp = nb.n('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (60, 60, 60)
    nb.l(tc, 'Object', mp, 'Vector')
    vo = nb.n('ShaderNodeTexVoronoi')
    vo.feature = 'F1'
    nb.l(mp, 'Vector', vo, 'Vector')
    ramp = nb.n('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.18
    ramp.color_ramp.elements[0].color = (0.42, 0.16, 0.48, 1)
    ramp.color_ramp.elements[1].position = 0.22
    ramp.color_ramp.elements[1].color = (0.86, 0.82, 0.70, 1)
    nb.l(vo, 'Distance', ramp, 'Fac')
    nb.l(ramp, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.35
    return m


def desert(sun_elev=22, az=200, warmth='golden', strength=4.0, seed=0, center=(0, 0, 0), size=3000, scrub=160,
           haze=0.0012, hdri_rot=60, sky=1.0):
    """High-desert ranch land: dawn HDRI + key sun, rocky dry ground, scrub scatter, light haze."""
    mats()
    Wd.hdri('qwantani_dawn_puresky', strength=0.35 * sky, bg_strength=0.9 * sky, rot=hdri_rot, tint=(1.05, 0.98, 0.9))
    CN.sun(elev=sun_elev, az=az, warmth=warmth, strength=strength)
    gm = M.texture_set('DesertGround', 'dry_ground_rocks', scale=0.25, tint=(0.62, 0.52, 0.40), box=True)
    t = Wd.terrain('Desert', size=size, res=180, height=14, scale=0.0016, center=center, seed=seed, mat=gm)
    Md.subsurf(t, 1, 1)
    cx, cy = center[0], center[1]
    if scrub:
        CN.scatter('dry_branches_medium_01', scrub, (cx - 80, cx + 80, cy - 30, cy + 220), seed=seed + 1, scale=(0.6, 1.3))
        CN.scatter('weed_plant_02', scrub // 2, (cx - 60, cx + 60, cy - 20, cy + 150), seed=seed + 2, scale=(0.7, 1.4))
    if haze:
        Wd.fog(center=(cx, cy + 600, 40), size=(3000, 2400, 120), density=haze, color=(1.0, 0.92, 0.8), anisotropy=0.5,
               height_falloff=1.5)
    return t


def windpump(name, loc, NF, h=9.0):
    """Ranch windmill: 4-leg galvanised lattice tower, 14-blade wheel (spinning slowly), tail vane."""
    mats()
    gv = bpy.data.materials['Galv']
    x, y, z = loc
    root = Md.empty(name, loc)
    objs = []
    for sx, sy in ((1, 1), (1, -1), (-1, -1), (-1, 1)):
        objs.append(cyl(name + 'Leg%d%d' % (sx, sy), (sx * 1.3, sy * 1.3, 0), (sx * 0.25, sy * 0.25, h), 0.05, gv, 8))
    for k in range(4):
        zz = 1.5 + k * 2.0
        w = 1.3 - (1.05 * zz / h)
        for a, b in (((w, w), (w, -w)), ((w, -w), (-w, -w)), ((-w, -w), (-w, w)), ((-w, w), (w, w))):
            objs.append(cyl(name + 'Br%d_%.1f%.1f' % (k, a[0], a[1]), (a[0], a[1], zz), (b[0], b[1], zz), 0.025, gv, 6))
    hub = Md.empty(name + 'Hub', (0, -0.5, h + 0.4), parent=root)
    for k in range(14):
        t = 2 * math.pi * k / 14
        bl = boxm(name + 'Blade%d' % k, (0.95 * math.cos(t), 0, 0.95 * math.sin(t)), (0.22, 0.02, 1.3), gv)
        bl.rotation_euler = (0, -t + math.pi / 2, 0)
        bl.parent = hub
    vane = boxm(name + 'Vane', (0, 1.6, h + 0.4), (0.03, 1.6, 0.8), gv)
    objs.append(vane)
    parent_all(root, objs)
    hub.rotation_euler = (0, 0, 0)
    spin(hub, 'Y', 2.5, NF)
    return root


def fence(name, p0, p1, n=14):
    mats()
    wood = bpy.data.materials['Balsa']
    p0, p1 = Vector(p0), Vector(p1)
    for k in range(n):
        q = p0.lerp(p1, k / (n - 1))
        cyl(name + 'Post%d' % k, (q.x, q.y, q.z), (q.x, q.y, q.z + 1.3), 0.06, wood, 8)
    for zz in (0.5, 0.9, 1.2):
        sag_rope(name + 'Wire%.1f' % zz, (p0.x, p0.y, p0.z + zz), (p1.x, p1.y, p1.z + zz), sag=0.06, n=24, r=0.004,
                 mat=bpy.data.materials['Galv'])


def debris_field(center, radius=12.0, n=70, seed=4, scale=1.0, z=0.02):
    """Scatter of foil sheets, balsa sticks, rubber strips and brown paper (the real recovered debris types)."""
    mats()
    r = rng(seed)
    out = []
    g = bpy.data.materials
    for i in range(n):
        a, d = r.uniform(0, 6.28), radius * math.sqrt(r.random())
        x, y = center[0] + d * math.cos(a), center[1] + d * math.sin(a)
        k = r.random()
        if k < 0.45:
            s = r.uniform(0.2, 0.7) * scale
            out.append(crumple('FoilD%d' % i, (x, y, z), (s, s * r.uniform(0.6, 1.2)), g['Foil'], seed=seed * 100 + i, amp=0.35))
        elif k < 0.75:
            L = r.uniform(0.4, 1.1) * scale
            o = boxm('StickD%d' % i, (x, y, z + 0.01), (L, 0.012 * scale + 0.006, 0.012 * scale + 0.006), g['Balsa'])
            o.rotation_euler = (0, r.uniform(-0.1, 0.1), r.uniform(0, 3.14))
            out.append(o)
        elif k < 0.9:
            L = r.uniform(0.3, 0.8) * scale
            o = boxm('RubD%d' % i, (x, y, z), (L, 0.05 * scale, 0.006), g['Rubber'])
            o.rotation_euler = (0, 0, r.uniform(0, 3.14))
            out.append(o)
        else:
            s = r.uniform(0.3, 0.6) * scale
            out.append(crumple('PaperD%d' % i, (x, y, z), (s, s), g['BrownPaper'], seed=seed * 50 + i, amp=0.2))
    return out


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


def teletype(name, loc, NF):
    """1940s teletype printer: grey cabinet, paper roll (spins), printed sheet growing out of the top."""
    mats()
    grey = M.principled(name + 'Grey', base=(0.30, 0.31, 0.29), rough=0.5, metal=0.3, grime=0.4)
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = [boxm(name + 'Cab', (0, 0, 0.45), (0.7, 0.55, 0.9), grey, 0.02),
         boxm(name + 'Top', (0, -0.05, 0.98), (0.62, 0.45, 0.16), grey, 0.03),
         boxm(name + 'Win', (0, -0.28, 0.98), (0.4, 0.01, 0.1), M.glass(name + 'Glass'))]
    roll = cyl(name + 'Roll', (-0.26, 0.15, 1.12), (0.26, 0.15, 1.12), 0.07, g['Newsprint'], 24)
    o.append(roll)
    sheet = boxm(name + 'Paper', (0, 0.06, 1.06), (0.5, 0.004, 0.02), g['Newsprint'])
    sheet.location = (0, 0.06, 1.06)
    for f, s in ((0, 1.0), (NF, 22.0)):
        sheet.scale = (1, 1, s)
        sheet.location = (0, 0.06, 1.06 + 0.01 * s)
        sheet.keyframe_insert('scale', frame=f)
        sheet.keyframe_insert('location', frame=f)
    M.set_interp(sheet, 'LINEAR')
    rise = 0.01 * 21.0 * 2  # paper top travel over the plate (scale 1 -> 22 about its centre + lift)
    bars = []
    for ln in range(12):
        z0 = 1.04 - ln * 0.035  # starts hidden inside the cabinet top, rises out with the paper
        bar = boxm(name + 'Txt%d' % ln, (0, 0.055, z0), (0.36, 0.001, 0.008), g['Ink'])
        key_loc(bar, [(0, (0, 0.055, z0)), (NF, (0, 0.055, z0 + rise))], interp='LINEAR')
        bars.append(bar)
    parent_all(root, o + [sheet] + bars)
    spin(roll, 'X', -3.0, NF)
    return root


def telephone(name, loc):
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    parent_all(root, [cyl(name + 'Base', (0, 0, 0), (0, 0, 0.06), 0.07, g['BlackEnamel'], 20),
                      cyl(name + 'Stem', (0, 0, 0.06), (0, 0, 0.25), 0.015, g['BlackEnamel'], 10),
                      cyl(name + 'Ear', (-0.06, 0, 0.27), (0.06, 0, 0.27), 0.022, g['BlackEnamel'], 12)])
    return root


def press_camera(name, loc, yaw=0.0, NF=120, flashes=()):
    """Speed-Graphic-style press camera on a tripod with a flash reflector; flashes = frames of bulb pops."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = []
    for k in range(3):
        t = 2 * math.pi * k / 3
        o.append(cyl(name + 'Leg%d' % k, (0.35 * math.cos(t), 0.35 * math.sin(t), 0), (0, 0, 1.35), 0.012, g['Galv'], 6))
    o += [boxm(name + 'Body', (0, 0, 1.45), (0.16, 0.18, 0.16), g['BlackEnamel'], 0.01),
          cyl(name + 'Lens', (0, -0.09, 1.45), (0, -0.2, 1.45), 0.045, g['Chrome'], 16),
          cyl(name + 'Reflector', (0.12, -0.04, 1.55), (0.12, -0.12, 1.55), 0.07, g['Chrome'], 20)]
    parent_all(root, o)
    root.rotation_euler = (0, 0, math.radians(yaw))
    if flashes:
        bpy.context.view_layer.update()
        p = root.matrix_world @ Vector((0.12, -0.15, 1.55))
        L = Wd.point(name + 'Flash', p, color=(0.92, 0.95, 1.0), power=0, radius=0.06)
        keys = [(0, 0)]
        for f in flashes:
            keys += [(f - 1, 0), (f, 2200), (f + 3, 200), (f + 6, 0)]
        key_energy(L, keys)
    return root


def reel_to_reel(name, loc, NF):
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    case = M.principled(name + 'Case', base=(0.12, 0.10, 0.08), rough=0.4, grime=0.2)
    o = [boxm(name + 'Deck', (0, 0, 0.08), (0.46, 0.38, 0.16), case, 0.015),
         boxm(name + 'Plate', (0, 0, 0.162), (0.44, 0.36, 0.004), g['Chrome'])]
    reels = []
    for sx in (-1, 1):
        r = Md.empty(name + 'Reel%d' % sx, (sx * 0.11, 0.05, 0.175), parent=root)
        hub = cyl(name + 'Hub%d' % sx, (0, 0, 0), (0, 0, 0.01), 0.022, g['Chrome'], 16)
        tape = cyl(name + 'Pack%d' % sx, (0, 0, 0.001), (0, 0, 0.008), 0.065 if sx < 0 else 0.045,
                   M.principled(name + 'Tape', base=(0.20, 0.10, 0.05), rough=0.3), 40)
        flange = cyl(name + 'Fl%d' % sx, (0, 0, 0.009), (0, 0, 0.011), 0.09, M.glass(name + 'FlG', tint=(0.8, 0.8, 0.85)), 48)
        for k in range(3):
            sp = boxm(name + 'Sp%d_%d' % (sx, k), (0.05 * math.cos(k * 2.09), 0.05 * math.sin(k * 2.09), 0.012),
                      (0.07, 0.008, 0.002), g['Chrome'])
            sp.rotation_euler = (0, 0, k * 2.09)
            sp.parent = r
        for x in (hub, tape, flange):
            x.parent = r
        spin(r, 'Z', -6.0, NF)
        reels.append(r)
    parent_all(root, o)
    mic = cyl(name + 'Mic', (0.35, -0.05, 0.0), (0.35, -0.05, 0.22), 0.012, g['Chrome'], 10)
    sphere(name + 'MicHead', (0.35, -0.05, 0.25), 0.035, g['BlackEnamel'], 16)
    return root


def books(name, loc, n=7, seed=2):
    """Stack of 1980s paperbacks with blank, muted covers (no alien art)."""
    r = rng(seed)
    root = Md.empty(name, loc)
    z = 0.0
    o = []
    for k in range(n):
        c = (r.uniform(0.1, 0.5), r.uniform(0.08, 0.3), r.uniform(0.08, 0.35))
        m = M.principled(name + 'C%d' % k, base=c, rough=0.5, coat=0.3, grime=0.2)
        t = r.uniform(0.025, 0.045)
        b = boxm(name + 'B%d' % k, (r.uniform(-0.02, 0.02), r.uniform(-0.02, 0.02), z + t / 2), (0.13, 0.20, t), m, 0.003)
        b.rotation_euler = (0, 0, r.uniform(-0.25, 0.25))
        o.append(b)
        pg = boxm(name + 'P%d' % k, (b.location.x + 0.003, b.location.y, z + t / 2), (0.126, 0.195, t * 0.86),
                  bpy.data.materials['Newsprint'])
        pg.rotation_euler = b.rotation_euler
        o.append(pg)
        z += t
    parent_all(root, o)
    return root


def archive(name, length=24, rows=2, seed=5):
    """Records archive: two long steel shelf rows of document boxes, aisle along +Y, ceiling lamps."""
    mats()
    r = rng(seed)
    steel = M.principled(name + 'Steel', base=(0.32, 0.34, 0.33), rough=0.4, metal=0.7, grime=0.3)
    card = M.principled(name + 'Card', base=(0.55, 0.45, 0.32), rough=0.85, grime=0.3)
    card2 = M.principled(name + 'Card2', base=(0.45, 0.40, 0.33), rough=0.85, grime=0.3)
    for sx in (-1.2, 1.2):
        for lv in range(5):
            boxm('%sShelf%.0f_%d' % (name, sx, lv), (sx, length / 2, 0.15 + lv * 0.5), (0.9, length, 0.03), steel)
            y = 0.2
            while y < length - 0.3:
                w = r.uniform(0.32, 0.42)
                out = 0.0 if r.random() > 0.03 else 0.25
                boxm('%sBox%.0f_%d_%.1f' % (name, sx, lv, y), (sx - math.copysign(out, sx), y + w / 2, 0.15 + lv * 0.5 + 0.17),
                     (0.8, w - 0.02, 0.3), card if r.random() > 0.4 else card2, 0.004)
                y += w
        for k in range(int(length / 2) + 1):
            for sy in (-0.42, 0.42):
                cyl('%sPost%.0f_%d_%.2f' % (name, sx, k, sy), (sx + sy, k * 2, 0), (sx + sy, k * 2, 2.5), 0.02, steel, 6)
    boxm(name + 'Floor', (0, length / 2, -0.02), (6, length + 4, 0.04), M.texture_set(name + 'Fl', 'concrete_floor_worn_001', scale=2.0, tint=(0.4, 0.4, 0.4)))
    for k in range(5):
        y = 2 + k * (length - 4) / 4
        cyl('%sLampC%d' % (name, k), (0, y, 3.0), (0, y, 2.85), 0.18, M.emission(name + 'LampM', (1.0, 0.9, 0.75), 3.0), 20)
        Wd.spot('%sLamp%d' % (name, k), (0, y, 2.8), (0, y, 0), color=(1.0, 0.88, 0.7), power=260, size_deg=75, blend=0.7)
    Wd.fog(center=(0, length / 2, 1.5), size=(5, length + 2, 3.2), density=0.015, color=(1, 0.95, 0.88), anisotropy=0.5)


def binder(name, loc, NF, open_from=0.25, open_to=0.75):
    """Blue Air Force report binder; front cover swings open between open_from..open_to of the shot."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = [boxm(name + 'Back', (0, 0, 0.004), (0.24, 0.31, 0.008), g['ReportBlue'], 0.002),
         boxm(name + 'Pages', (0, 0, 0.018), (0.225, 0.295, 0.02), g['Newsprint'])]
    for ln in range(16):
        o.append(boxm(name + 'Ln%d' % ln, (0, 0.11 - ln * 0.014, 0.0285), (0.17, 0.004, 0.0005), g['Ink']))
    hinge = Md.empty(name + 'Hinge', (-0.12, 0, 0.03), parent=root)
    cover = boxm(name + 'Cover', (0.12, 0, 0.0), (0.24, 0.31, 0.008), g['ReportBlue'], 0.002)
    lab = text_obj(name + 'Label', 'REPORT OF AIR FORCE RESEARCH\nREGARDING THE ROSWELL INCIDENT', (0.12, 0.05, 0.0045),
                   size=0.011, mat=M.principled(name + 'Gold', base=(0.85, 0.75, 0.45), metal=0.9, rough=0.3))
    seal = cyl(name + 'Seal', (0.12, -0.04, 0.004), (0.12, -0.04, 0.0048), 0.03, bpy.data.materials[name + 'Gold'], 32)
    for x in (cover, lab, seal):
        x.parent = hinge
    parent_all(root, o)
    key_rot(hinge, [(0, (0, 0, 0)), (int(NF * open_from), (0, 0, 0)), (int(NF * open_to), (0, math.radians(-172), 0))])
    return root


def reflector(name, loc, s=1.0, tape=True, parent=None):
    """Radar reflector target (box-kite): balsa frame, three crossed foil planes, flower tape on the struts."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc, parent=parent)
    o = []
    for ax in range(3):
        sz = [0.9 * s] * 3
        sz[ax] = 0.002
        f = boxm(name + 'Foil%d' % ax, (0, 0, 0), tuple(sz), g['Foil'])
        o.append(f)
    tm = flower_tape() if tape else g['Balsa']
    for a in ((1, 0, 0), (0, 1, 0), (0, 0, 1)):
        p = Vector(a) * 0.48 * s
        o.append(cyl(name + 'Strut%d%d%d' % a, tuple(-p), tuple(p), 0.008 * s, g['Balsa'], 8))
        o.append(cyl(name + 'Tape%d%d%d' % a, tuple(-p * 0.98), tuple(p * 0.98), 0.0095 * s, tm, 8))
    parent_all(root, o)
    return root


def balloon_train(name, base, NF, n=14, spacing=9.0, rise=(0.0, 25.0), sway=1.5, seed=1):
    """Project Mogul style train: a long line with neoprene balloons up top and radar reflectors + a sonde below."""
    mats()
    g = bpy.data.materials
    r = rng(seed)
    root = Md.empty(name, base)
    line_pts = []
    for k in range(n):
        z = k * spacing
        x = math.sin(k * 0.35) * sway
        line_pts.append((x, 0, z))
        if k >= n // 2:
            b = sphere(name + 'Bal%d' % k, (x, 0, z), r.uniform(1.4, 2.1), g['Neoprene'], 24, scale=(1, 1, 1.15))
            b.parent = root
        elif k % 2 == 1:
            reflector(name + 'Ref%d' % k, (x + 0.6, 0, z), s=1.4, parent=root)
        elif k == 0:
            boxm(name + 'Sonde', (x, 0, z), (0.4, 0.3, 0.5), g['OliveDrab']).parent = root
    ln = curve_poly(name + 'Line', line_pts, bevel=0.02, mat=g['Galv'])
    ln.parent = root
    key_loc(root, [(0, Vector(base) + Vector((0, 0, rise[0]))), (NF, Vector(base) + Vector((0, 0, rise[1])))])
    return root


def hangar(name, loc, L=60, W=40, H=14, yaw=0.0):
    """Arched WWII hangar (half-cylinder roof) with big dark doorway; corrugated galvanised material."""
    mats()
    root = Md.empty(name, loc)
    corr = M.principled(name + 'Corr', base=(0.48, 0.49, 0.47), rough=0.45, metal=0.7, grime=0.45, bump=0.3, bump_scale=8)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=W / 2, depth=L, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = name + 'Roof'
    o.rotation_euler = (math.radians(90), 0, 0)
    o.scale = (1, H / (W / 2), 1)
    M.assign(o, corr)
    door = boxm(name + 'Door', (0, -L / 2 - 0.05, H * 0.35), (W * 0.7, 0.2, H * 0.7), M.principled(name + 'Dark', base=(0.02, 0.02, 0.02), rough=0.9))
    ground = boxm(name + 'Apron', (0, -L / 2 - 20, -0.4), (W * 1.6, 40, 0.8), M.texture_set(name + 'Asph', 'asphalt_02', scale=8, tint=(0.5, 0.5, 0.5)))
    parent_all(root, [o, door, ground])
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def water_tower(name, loc, h=22):
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = []
    for sx, sy in ((1, 1), (1, -1), (-1, -1), (-1, 1)):
        o.append(cyl(name + 'L%d%d' % (sx, sy), (sx * 3, sy * 3, 0), (sx * 2.2, sy * 2.2, h), 0.15, g['Galv'], 8))
    o.append(cyl(name + 'Tank', (0, 0, h), (0, 0, h + 6), 4.0, g['Galv'], 32))
    o.append(sphere(name + 'Cap', (0, 0, h + 6), 4.0, g['Galv'], 24, scale=(1, 1, 0.3)))
    parent_all(root, o)
    return root


def us_flag_pole(name, loc, h=14):
    mats()
    cyl(name, loc, (loc[0], loc[1], loc[2] + h), 0.08, bpy.data.materials['Chrome'], 10)
