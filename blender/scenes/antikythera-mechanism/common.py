"""antikythera-mechanism shared helpers (REAL3D, CINE v2 look as mh370; code-only batch round 2 2026-11-06, render hold).
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


# =============================================================== antikythera-mechanism builders
# Aegean off Antikythera (wreck ~45 m), Athens museum, CT/X-ray lab, reconstructed mechanism (illustrative, after
# Freeth et al. 2021). Corroded bronze = green-grey patina. Wide plates 24-35 mm, close-ups as accents.
def anti_mats():
    if bpy.data.materials.get('Patina'):
        return
    M.principled('Patina', base=(0.20, 0.30, 0.24), rough=0.85, metal=0.3, grime=0.6, bump=0.5, bump_scale=40, rough_noise=0.3)
    M.principled('BronzeNew', base=(0.72, 0.48, 0.24), rough=0.32, metal=1.0, grime=0.15)
    M.principled('Terracotta', base=(0.55, 0.30, 0.18), rough=0.8, grime=0.4, bump=0.1)
    M.principled('Marble', base=(0.82, 0.80, 0.76), rough=0.45, sss=0.08, grime=0.35)
    M.principled('CaseWood', base=(0.30, 0.20, 0.12), rough=0.7, grime=0.3)
    M.principled('MuseumGlass', base=(0.9, 0.95, 1.0), rough=0.02, transmission=0.95, alpha=0.25)
    M.principled('Felt', base=(0.06, 0.06, 0.07), rough=0.95)
    M.principled('BoatWhite', base=(0.78, 0.76, 0.70), rough=0.6, grime=0.4)


def gear(name, loc, r=0.03, teeth=60, thick=0.002, mat=None, rot=(0, 0, 0), hole=0.15):
    """Flat spur gear: triangular teeth (as the mechanism's hand-cut teeth) on a disc, extruded `thick`."""
    anti_mats()
    bm = bmesh.new()
    vs = []
    h = max(r * 0.06, 0.0012)
    for k in range(teeth * 2):
        t = math.pi * k / teeth
        rr = r + (h if k % 2 == 0 else 0)
        vs.append(bm.verts.new((rr * math.cos(t), rr * math.sin(t), 0)))
    f = bm.faces.new(vs)
    ex = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in ex['geom'] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z += thick
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(mat or bpy.data.materials['BronzeNew'])
    return o


def gear_train(prefix, origin, n=30, seed=0, mat=None, spread=0.07, layers=4):
    """n meshing-looking gears packed in a few layers (illustrative train, not a solved layout). Returns list."""
    r = rng(seed)
    out = []
    for k in range(n):
        rr = r.uniform(0.006, 0.032) if k else 0.065
        x = 0 if k == 0 else r.uniform(-spread, spread)
        y = 0 if k == 0 else r.uniform(-spread * 0.6, spread * 0.6)
        z = (k % layers) * 0.004
        g = gear('%s%d' % (prefix, k), (origin[0] + x, origin[1] + y, origin[2] + z), r=rr, teeth=max(15, int(rr * 2400)),
                 mat=mat)
        out.append(g)
    return out


def lump(name, loc, size=(0.18, 0.15, 0.05), seed=0, gear_hint=True):
    """Corroded fragment A stand-in: a crusted slab of green patina with the big four-spoke wheel half visible."""
    anti_mats()
    o = crumple(name, loc, (size[0], size[1]), bpy.data.materials['Patina'], seed=seed, amp=size[2], res=7)
    if gear_hint:
        g = gear(name + 'B1', (loc[0] + 0.01, loc[1], loc[2] + size[2] * 0.4), r=0.065, teeth=223, thick=0.003,
                 mat=bpy.data.materials['Patina'])
        for k in range(4):
            boxm(name + 'Sp%d' % k, (loc[0] + 0.01, loc[1], loc[2] + size[2] * 0.4 + 0.0015), (0.12, 0.008, 0.003),
                 bpy.data.materials['Patina']).rotation_euler = (0, 0, math.radians(45 * k))
    return o


def seabed(NF, seed=0, depth=45.0, area=120):
    """Underwater at ~45 m: sand and rock floor, blue-green volume, sun shafts from far above, marine snow."""
    anti_mats()
    Wd.hdri('kloppenheim_02_puresky', strength=0.05, bg_strength=0.0)
    CN.sun(elev=70, az=150, warmth='noon', strength=3.5)
    Wd.terrain('Seabed', size=area * 4, res=140, height=3.0, scale=0.03, center=(0, area, 0), seed=seed,
               mat=M.texture_set('SeaSand', 'damp_beach_sand', scale=0.15, tint=(0.55, 0.62, 0.58)))
    Wd.fog(center=(0, area, depth / 2), size=(area * 4, area * 4, depth + 6), density=0.035, color=(0.25, 0.62, 0.72),
           anisotropy=0.75)
    dust((0, 20, 8), (60, 60, 16), n=900, seed=seed, color=(0.8, 0.95, 1.0), strength=0.3, r=0.02)
    r = rng(seed)
    rk = M.texture_set('SeaRock', 'rocky_terrain_02', scale=0.2, tint=(0.35, 0.40, 0.36), box=True)
    for k in range(18):
        sphere('Rock%d' % k, (r.uniform(-40, 40), r.uniform(5, 120), 0), r.uniform(0.8, 3.5), rk, 16, scale=(1.4, 1, 0.6))


def amphora(name, loc, rot=(0, 0, 0), s=1.0):
    """Roman-era transport amphora (~1.1 m), lathe profile."""
    anti_mats()
    prof = [(0.0, 0.0), (0.05, 0.05), (0.16, 0.25), (0.19, 0.55), (0.16, 0.75), (0.07, 0.85), (0.06, 1.05), (0.08, 1.1)]
    rings = []
    for rr, z in prof:
        rings.append([(rr * s * math.cos(t * math.pi / 8), rr * s * math.sin(t * math.pi / 8), z * s) for t in range(16)])
    o = Md.mesh_obj(name, *Md.loft(rings, cap_start=True))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(bpy.data.materials['Terracotta'])
    return o


def statue(name, loc, yaw=0.0, lying=True, mat=None):
    """Bronze/marble statue stand-in (faceless figure, heroic scale), lying on the seabed or standing on a plinth."""
    anti_mats()
    f = figure(name, loc, yaw=yaw, mat=mat or bpy.data.materials['Patina'], h=2.0)
    if lying:
        f.rotation_euler = (math.radians(88), 0, math.radians(yaw))
        f.location = (loc[0], loc[1], loc[2] + 0.25)
    return f


def mechanism(name, loc, scale=1.0, crank_keys=None, NF=120, open_front=True):
    """Reconstructed mechanism (illustrative): wooden case ~34 x 18 x 9 cm (size uncertain), bronze front plate with
    the zodiac/calendar rings, Sun and Moon pointers, moon-phase ball, side crank; returns (root, crank, pointers)."""
    anti_mats()
    s = scale
    root = Md.empty(name, loc)
    w = bpy.data.materials['CaseWood']
    b = bpy.data.materials['BronzeNew']
    parts = [boxm(name + 'Case', (0, 0, 0.17 * s), (0.18 * s, 0.09 * s, 0.34 * s), w, 0.004 * s),
             cyl(name + 'Ring1', (0, -0.046 * s, 0.20 * s), (0, -0.047 * s, 0.20 * s), 0.075 * s, b, 64),
             cyl(name + 'Ring2', (0, -0.048 * s, 0.20 * s), (0, -0.049 * s, 0.20 * s), 0.060 * s,
                 M.principled('DialFace', base=(0.55, 0.40, 0.22), rough=0.4, metal=0.9), 64)]
    for k in range(36):
        t = 2 * math.pi * k / 36
        parts.append(boxm(name + 'Tick%d' % k, (math.cos(t) * 0.07 * s, -0.050 * s, 0.20 * s + math.sin(t) * 0.07 * s),
                          (0.001 * s, 0.001 * s, 0.006 * s), M.principled('Engrave', base=(0.1, 0.07, 0.04), rough=0.6)))
    # pivots sit at the dial centre / crank axle; their children are built RELATIVE to the pivot (parenting has no inverse)
    sun_p = Md.empty(name + 'SunPivot', (0, -0.052 * s, 0.20 * s))
    moon_p = Md.empty(name + 'MoonPivot', (0, -0.054 * s, 0.20 * s))
    boxm(name + 'SunPtr', (0, 0, 0.035 * s), (0.003 * s, 0.002 * s, 0.07 * s), b).parent = sun_p
    sphere(name + 'SunBall', (0, -0.001 * s, 0.065 * s), 0.006 * s, glow_mat(name + 'SunG', color=(1.0, 0.75, 0.35),
           strength=4.0), 16).parent = sun_p
    boxm(name + 'MoonPtr', (0, 0, 0.04 * s), (0.002 * s, 0.002 * s, 0.08 * s), b).parent = moon_p
    mb = sphere(name + 'MoonBall', (0, -0.002 * s, 0.055 * s), 0.008 * s, M.principled('MoonHalf', base=(0.85, 0.85, 0.82),
                rough=0.4), 24)
    mb.parent = moon_p
    crank = Md.empty(name + 'CrankPivot', (0.092 * s, 0, 0.20 * s))
    cyl(name + 'Axle', (-0.002 * s, 0, 0), (0.018 * s, 0, 0), 0.004 * s, b).parent = crank
    boxm(name + 'Arm', (0.018 * s, 0, -0.02 * s), (0.004 * s, 0.006 * s, 0.05 * s), b).parent = crank
    cyl(name + 'Knob', (0.018 * s, 0, -0.045 * s), (0.038 * s, 0, -0.045 * s), 0.005 * s, w).parent = crank
    parent_all(root, parts + [sun_p, moon_p, crank])
    if crank_keys:
        for f, turns in crank_keys:
            crank.rotation_euler = (math.radians(360 * turns), 0, 0)
            crank.keyframe_insert('rotation_euler', frame=f)
            sun_p.rotation_euler = (0, math.radians(-360 * turns / 4.0), 0)
            sun_p.keyframe_insert('rotation_euler', frame=f)
            moon_p.rotation_euler = (0, math.radians(-360 * turns / 4.0 * 13.37), 0)
            moon_p.keyframe_insert('rotation_euler', frame=f)
    return root, crank, (sun_p, moon_p)


def museum(seed=0, size=(14, 10, 4.5)):
    """Dark museum gallery (Athens), stone floor, one display case with a downlight."""
    anti_mats()
    sx, sy, sz = size
    Wd.hdri('kloppenheim_02_puresky', strength=0.02, bg_strength=0.0)
    boxm('Floor', (0, 0, -0.02), (sx, sy, 0.04), M.texture_set('MuseumFloor', 'concrete_floor_worn_001', scale=0.5,
         tint=(0.5, 0.48, 0.45)))
    wall = M.principled('MuseumWall', base=(0.12, 0.14, 0.17), rough=0.9)
    boxm('WallB', (0, sy / 2, sz / 2), (sx, 0.1, sz), wall)
    boxm('WallL', (-sx / 2, 0, sz / 2), (0.1, sy, sz), wall)
    boxm('WallR', (sx / 2, 0, sz / 2), (0.1, sy, sz), wall)
    boxm('Plinth', (0, 0, 0.5), (0.9, 0.7, 1.0), M.principled('PlinthM', base=(0.08, 0.08, 0.09), rough=0.7))
    boxm('Vitrine', (0, 0, 1.3), (0.86, 0.66, 0.6), bpy.data.materials['MuseumGlass'])
    Wd.spot('Down', (0, -0.2, sz - 0.2), (0, 0, 1.02), color=(1.0, 0.88, 0.72), power=900, size_deg=22, blend=0.6)
    Wd.fog(center=(0, 0, sz / 2), size=(sx, sy, sz), density=0.03, color=(1.0, 0.95, 0.88), anisotropy=0.6)
    dust((0, 0, 2), (4, 4, 3), n=300, seed=seed)


def antikythera_coast(NF, seed=0, sun_elev=10, az=250):
    """Aegean at Antikythera: open sea, steep scrubby island cliffs, a 1900 sponge-diving boat."""
    anti_mats()
    Wd.hdri('qwantani_dawn_puresky', strength=0.35, bg_strength=0.9, rot=az)
    CN.sun(elev=sun_elev, az=az, warmth='golden', strength=3.0)
    Wd.sea_plane(size=60000, z=0, color=(0.01, 0.05, 0.08), rough=0.12, wave=0.25, frames=NF)
    rk = M.texture_set('Cliff', 'rocky_terrain_02', scale=0.02, tint=(0.52, 0.45, 0.36), box=True)
    Wd.terrain('Island', size=3000, res=170, height=260, scale=0.0018, center=(0, 1700, -40), seed=seed, mat=rk,
               island=0.6)
    Wd.fog(center=(0, 1500, 60), size=(8000, 8000, 160), density=0.0006, color=(1.0, 0.92, 0.82), anisotropy=0.5)
