"""oumuamua-2017 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch round 2 2026-11-06, render hold).
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


# =============================================================== oumuamua-2017 builders
# Deep space (star shell, hard sunlight), the inner solar system as an illustrative diagram, Haleakala summit (Maui)
# above the cloud deck, radio dishes. 'Oumuamua = reddish, very elongated tumbling rock (shape uncertain; NASA: up to
# ~400 m long, maybe 10x as long as wide). Wide plates 24-35 mm.
def space_mats():
    if bpy.data.materials.get('OumuRock'):
        return
    M.principled('OumuRock', base=(0.36, 0.22, 0.16), rough=0.9, bump=0.8, bump_scale=8, grime=0.4, rough_noise=0.2)
    M.principled('DomeWhite', base=(0.85, 0.86, 0.86), rough=0.35, metal=0.3)
    M.principled('DishWhite', base=(0.80, 0.80, 0.78), rough=0.45)
    M.principled('SailFoil', base=(0.85, 0.85, 0.9), rough=0.08, metal=1.0)


def stars(n=2600, R=40000, seed=0, strength=12.0):
    """Star shell: tiny emissive quads on a far sphere (one mesh), a few brighter ones; no HDRI needed."""
    r = rng(seed)
    vs, fs = [], []
    for k in range(n):
        z = r.uniform(-1, 1)
        t = r.uniform(0, 2 * math.pi)
        d = Vector((math.sqrt(1 - z * z) * math.cos(t), math.sqrt(1 - z * z) * math.sin(t), z)) * R
        s = R * 0.00028 * (3.0 if r.random() < 0.04 else 1.0)
        a = d.orthogonal().normalized() * s
        b = d.cross(a).normalized() * s
        i = len(vs)
        vs += [d - a - b, d + a - b, d + a + b, d - a + b]
        fs.append((i, i + 1, i + 2, i + 3))
    o = Md.mesh_obj('Stars', vs, fs, smooth=False)
    o.data.materials.append(glow_mat('StarM', color=(0.9, 0.93, 1.0), strength=strength))
    return o


def space(NF, seed=0, sun_dir=(-1, 0.3, 0.15), sun_strength=6.0):
    """Black space, star shell, one hard white sun lamp (no atmosphere)."""
    space_mats()
    Wd.hdri('kloppenheim_02_puresky', strength=0.0, bg_strength=0.0)
    stars(seed=seed)
    d = Vector(sun_dir).normalized()
    el = math.degrees(math.asin(max(-0.99, min(0.99, d.z))))
    az = math.degrees(math.atan2(d.y, d.x))
    CN.sun(elev=el, az=az, warmth='noon', strength=sun_strength, angle=0.5, check=False)


def oumuamua(name, loc, L=40.0, ratio=8.0, seed=0, NF=120, tumble=True):
    """Elongated reddish rock (illustrative, scaled for frame; real size up to ~400 m): lumpy cigar from a squashed UV
    sphere with noise displace; tumbles end over end (non-principal axis = two slow spins)."""
    space_mats()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = (L / 2.0, L / 2.0 / ratio, L / 2.0 / ratio * 0.85)
    tx = bpy.data.textures.new(name + 'Tex', 'CLOUDS')
    tx.noise_scale = 0.35
    md = o.modifiers.new('Disp', 'DISPLACE')
    md.texture = tx
    md.strength = 0.18
    o.data.materials.append(bpy.data.materials['OumuRock'])
    bpy.ops.object.shade_smooth()
    if tumble:
        o.rotation_mode = 'XYZ'
        o.rotation_euler = (0, 0, 0)
        o.keyframe_insert('rotation_euler', frame=0)
        o.rotation_euler = (math.radians(NF * 0.9), math.radians(NF * 0.25), math.radians(NF * 0.4))
        o.keyframe_insert('rotation_euler', frame=NF)
        M.set_interp(o, 'LINEAR')
    return o


def sun_ball(loc, r=60.0, strength=60.0):
    s = sphere('SunBall', loc, r, glow_mat('SunBallM', color=(1.0, 0.92, 0.78), strength=strength), 48)
    Wd.point('SunL', loc, color=(1.0, 0.95, 0.88), power=5.0e9, radius=r)
    return s


def orbit_ring(name, R, z=0.0, color=(0.55, 0.75, 0.9), strength=1.5, n=128):
    pts = [(R * math.cos(2 * math.pi * k / n), R * math.sin(2 * math.pi * k / n), z) for k in range(n)]
    return curve_poly(name, pts, bevel=R * 0.0025 + 0.3, mat=glow_mat(name + 'M', color=color, strength=strength), cyclic=True)


def hyperbola_pts(q=250.0, e=1.2, n=80, span=2.4, z=0.0, tilt=0.0):
    """Points on a hyperbolic path around the Sun at the origin (perihelion q, eccentricity e), illustrative scale."""
    p = q * (1 + e)
    lim = math.acos(-1 / e) * 0.97
    pts = []
    for k in range(n):
        nu = -lim + 2 * lim * k / (n - 1)
        r = p / (1 + e * math.cos(nu))
        pts.append((r * math.cos(nu), r * math.sin(nu), z + r * math.sin(nu) * tilt))
    return pts


def haleakala(NF, seed=0, dusk=True):
    """Maui summit at night: reddish volcanic cinder slopes above a sea of cloud, starry sky, two white domes."""
    space_mats()
    Wd.hdri('qwantani_night_puresky', strength=0.15, bg_strength=0.7, rot=120, tint=(0.8, 0.85, 1.05))
    if dusk:
        CN.sun(elev=-3, az=280, warmth='golden', strength=0.6, check=False)
    Wd.terrain('Summit', size=6000, res=180, height=220, scale=0.0012, center=(0, 1200, -120), seed=seed,
               mat=M.texture_set('Cinder', 'dry_ground_rocks', scale=0.05, tint=(0.45, 0.28, 0.22), box=True))
    Wd.clouds(center=(0, 4000, -700), size=(26000, 26000, 220), density=0.05, coverage=0.5, frames=NF)


def dome(name, loc, r=8.0, slit=True):
    root = Md.empty(name, loc)
    w = bpy.data.materials['DomeWhite']
    parts = [cyl(name + 'Drum', (0, 0, 0), (0, 0, r * 0.9), r, w, 48),
             sphere(name + 'Cap', (0, 0, r * 0.9), r, w, 48, scale=(1, 1, 0.95))]
    if slit:
        parts.append(boxm(name + 'Slit', (0, -r * 0.55, r * 1.45), (r * 0.35, r * 0.6, r * 0.8),
                          M.principled('SlitDark', base=(0.01, 0.01, 0.012), rough=0.9)))
        parts.append(boxm(name + 'Glow', (0, -r * 0.4, r * 1.1), (r * 0.3, 0.1, r * 0.3),
                          glow_mat(name + 'GlowM', color=(1.0, 0.35, 0.25), strength=1.2)))
    parent_all(root, parts)
    return root


def dish(name, loc, d=6.0, alt=60.0, yaw=0.0):
    """Small radio dish on a pedestal (Allen Telescope Array style, ~6 m)."""
    root = Md.empty(name, loc)
    w = bpy.data.materials['DishWhite']
    cyl(name + 'Ped', (0, 0, 0), (0, 0, d * 0.6), d * 0.08, w, 16).parent = root
    cup = sphere(name + 'Cup', (0, 0, 0), d / 2, w, 32, scale=(1, 1, 0.35))
    piv = Md.empty(name + 'Piv', (0, 0, d * 0.7))
    piv.parent = root
    cup.parent = piv
    cyl(name + 'Feed', (0, 0, 0), (0, 0, d * 0.45), d * 0.02, w, 8).parent = piv
    piv.rotation_euler = (math.radians(90 - alt), 0, 0)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root
