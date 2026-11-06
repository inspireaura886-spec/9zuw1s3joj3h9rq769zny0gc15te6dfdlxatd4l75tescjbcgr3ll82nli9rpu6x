"""phoenix-lights-1997 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch round 2 2026-11-06, render hold).
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


# =============================================================== phoenix-lights-1997 builders
# Arizona desert night, 13 Mar 1997. Phoenix grid lights, Sierra Estrella ridge (SW), A-10 proxies (no marks),
# LUU-2 style parachute flares. Wide plates 24-35 mm. Never shown as a craft: the V is five separate point lights.
def desert_mats():
    if bpy.data.materials.get('DesertRock'):
        return
    M.texture_set('DesertRock', 'dry_ground_rocks', scale=0.05, tint=(0.40, 0.33, 0.27), box=True)
    M.principled('JetGrey', base=(0.20, 0.22, 0.21), rough=0.55, metal=0.2, grime=0.35)
    M.principled('Stucco', base=(0.62, 0.55, 0.46), rough=0.9, grime=0.3)
    M.principled('Chute', base=(0.85, 0.82, 0.75), rough=0.9, sss=0.1)
    M.principled('DarkGlass', base=(0.02, 0.025, 0.03), rough=0.1, metal=0.4)
    M.principled('BlackEnamel', base=(0.02, 0.02, 0.022), rough=0.25, metal=0.3, coat=0.4)


def az_night(NF, seed=0, moon=False, city=True, ridge=True, city_center=(0, 2500, 0), city_r=2600):
    """Phoenix valley at night: starry puresky, dark desert floor, the city grid of sodium lights, the Sierra Estrella
    ridge as a black saw-tooth line far to the south-west (+Y), thin haze for glow."""
    desert_mats()
    Wd.hdri('qwantani_night_puresky', strength=0.18, bg_strength=0.55, rot=40, tint=(0.75, 0.82, 1.05))
    if moon:
        Wd.moon(direction=(-0.3, 0.5, 0.3), strength=0.25)
    Wd.terrain('Floor', size=14000, res=180, height=14, scale=0.0016, center=(0, 3000, -2), seed=seed,
               mat=bpy.data.materials['DesertRock'])
    if city:
        Wd.city_lights('Phoenix', center=city_center, radius=city_r, count=4200, seed=seed + 3, color=(1.0, 0.62, 0.3),
                       strength=70.0, size=2.2, cluster=0.55)
        Wd.city_lights('PhoenixW', center=(city_center[0] - 900, city_center[1] + 600, 0), radius=city_r * 0.6,
                       count=1500, seed=seed + 4, color=(0.85, 0.9, 1.0), strength=45.0, size=1.8)
    if ridge:
        estrella((0, 12000, 0), seed=seed)
    Wd.fog(center=(0, 4000, 120), size=(26000, 26000, 260), density=0.00012, color=(0.95, 0.75, 0.55),
           anisotropy=0.5, height_falloff=1.0)


def estrella(center, length=16000, h=1100, seed=0):
    """Sierra Estrella stand-in: long jagged ridge (dark rock), crest normal to the view so lights can set behind it."""
    r = rng(seed + 77)
    n = 60
    bm = bmesh.new()
    top, bot = [], []
    for k in range(n + 1):
        x = center[0] - length / 2 + length * k / n
        z = h * (0.55 + 0.45 * math.sin(k * 0.37 + seed) * 0.5 + r.uniform(-0.18, 0.22))
        top.append(bm.verts.new((x, center[1] + r.uniform(-60, 60), z)))
        bot.append(bm.verts.new((x, center[1] - 900, -5)))
    for k in range(n):
        bm.faces.new((bot[k], bot[k + 1], top[k + 1], top[k]))
    me = bpy.data.meshes.new('Estrella')
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new('Estrella', me))
    o.data.materials.append(M.principled('RidgeRock', base=(0.03, 0.028, 0.026), rough=0.95))
    return o


def vee_lights(name, apex, NF, v=(0, -6.0, 0), spread=55.0, color=(1.0, 0.86, 0.62), strength=900.0, power=4.0e4):
    """Five separate steady point lights in a 60-degree V (one apex, two per arm) moving together at v m/frame.
    They are never joined by a body (witness shape is drawn by the viewer, not the plate)."""
    out = []
    offs = [(0, 0)] + [(s * spread * k * 0.5, -spread * k * 0.866) for k in (1, 2) for s in (-1, 1)]
    for i, (dx, dy) in enumerate(offs):
        p0 = Vector(apex) + Vector((dx, dy, 0))
        o = Md.orb('%s%d' % (name, i), tuple(p0), color=color, strength=strength, power=power, radius=1.4, halo=0.0,
                   f1=NF, seed=i)
        key_loc(o, [(0, p0), (NF, p0 + Vector(v) * NF)], interp='LINEAR')
        out.append(o)
    return out


def a10(name, loc, yaw=0.0, lights=True):
    """A-10-like proxy (~16 m long, 17.5 m straight wing, two pods high on the rear fuselage, twin fins), no markings.
    Steady formation lights (no blink). Nose toward +Y before yaw."""
    root = Md.empty(name, loc)
    g = bpy.data.materials['JetGrey']
    parts = [cyl(name + 'Fus', (0, -8, 0), (0, 8, 0), 0.75, g, 16),
             boxm(name + 'Wing', (0, 0.5, -0.3), (17.5, 2.6, 0.28), g, 0.05),
             boxm(name + 'Stab', (0, -7.2, 0.9), (5.6, 1.4, 0.14), g),
             boxm(name + 'FinL', (-2.8, -7.2, 1.7), (0.12, 1.6, 2.4), g),
             boxm(name + 'FinR', (2.8, -7.2, 1.7), (0.12, 1.6, 2.4), g),
             cyl(name + 'PodL', (-1.4, -5.6, 1.3), (-1.4, -2.4, 1.3), 0.62, g, 14),
             cyl(name + 'PodR', (1.4, -5.6, 1.3), (1.4, -2.4, 1.3), 0.62, g, 14),
             sphere(name + 'Nose', (0, 8, 0), 0.75, g, 16, scale=(1, 1.4, 1))]
    if lights:
        for k, (x, c) in enumerate([(-8.7, (1.0, 0.1, 0.05)), (8.7, (0.1, 1.0, 0.3)), (0, (1.0, 0.95, 0.85))]):
            parts.append(sphere(name + 'Nav%d' % k, (x, 0.5 if x else -8.2, -0.2 if x else 0.3), 0.12,
                                glow_mat(name + 'NavM%d' % k, color=c, strength=60.0), 8))
    parent_all(root, parts)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def flare(name, loc, NF, fall=0.35, delay=0, out_frame=None, strength=900.0, power=1.2e5, smoke=True):
    """LUU-2 style parachute illumination flare: hot white-orange core (glow_mat sphere + point light) under a small
    canopy, sinking slowly (fall m/frame). delay = frame it ignites, out_frame = frame it burns out / sets behind the
    ridge (None = burns past the plate). Steady light, no flicker."""
    p0 = Vector(loc)
    gm = glow_mat(name + 'M', color=(1.0, 0.80, 0.52), strength=strength)
    core_ = sphere(name, tuple(p0), 0.7, gm, 12)
    L = Wd.point(name + 'L', tuple(p0), color=(1.0, 0.72, 0.42), power=power, radius=0.6)
    ch = sphere(name + 'Chute', tuple(p0 + Vector((0, 0, 3.2))), 1.6, bpy.data.materials['Chute'], 12, scale=(1, 1, 0.45))
    for o, off in ((core_, Vector()), (L, Vector()), (ch, Vector((0, 0, 3.2)))):
        key_loc(o, [(0, p0 + off), (NF, p0 + off - Vector((0, 0, fall * NF)))], interp='LINEAR')
    if smoke:
        Wd.fog(center=tuple(p0 + Vector((0, 0, 40))), size=(6, 6, 80), density=0.02, color=(0.9, 0.85, 0.8), anisotropy=0.4)
    ks = [(0, 0.0 if delay else 1.0)]
    if delay:
        ks += [(delay, 0.0), (delay + 6, 1.0)]
    if out_frame:
        ks += [(out_frame, 1.0), (out_frame + 4, 0.0)]
    key_fac(gm, ks)
    key_energy(L, [(f, power * v) for f, v in ks])
    return core_


def flare_row(NF, base=(0, 0, 0), n=8, gap=900.0, alt=1300.0, fall=0.25, stagger=12, seed=0, smoke=False, outs=None):
    """A row of flares dropped one after another along X (the '10 pm lights')."""
    r = rng(seed)
    fl = []
    for k in range(n):
        loc = (base[0] - gap * (n - 1) / 2 + gap * k, base[1] + r.uniform(-120, 120), base[2] + alt + r.uniform(-60, 60))
        fl.append(flare('Flare%d' % k, loc, NF, fall=fall, delay=k * stagger, smoke=smoke,
                        out_frame=(outs[k] if outs else None)))
    return fl


def house(name, loc, w=12.0, d=10.0, h=3.2, yaw=0.0, window_glow=True):
    """Low flat-roof stucco suburban house with one warm window."""
    root = Md.empty(name, loc)
    parts = [boxm(name + 'B', (0, 0, h / 2), (w, d, h), bpy.data.materials['Stucco']),
             boxm(name + 'Roof', (0, 0, h + 0.15), (w + 0.6, d + 0.6, 0.3), M.principled('RoofTar', base=(0.1, 0.09, 0.08), rough=0.8))]
    if window_glow:
        parts.append(boxm(name + 'Win', (w * 0.2, -d / 2 - 0.02, 1.5), (1.6, 0.05, 1.1),
                          glow_mat(name + 'WinM', color=(1.0, 0.72, 0.45), strength=3.0)))
    parent_all(root, parts)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def telescope(name, loc, yaw=0.0, alt_deg=55.0):
    """Amateur 8-inch Dobsonian-ish tube on a tripod."""
    root = Md.empty(name, loc)
    g = M.principled('TubeWhite', base=(0.8, 0.8, 0.78), rough=0.4)
    b = bpy.data.materials['BlackEnamel']
    parts = [cyl(name + 'Leg%d' % k, (0, 0, 1.2), (0.55 * math.cos(k * 2.09), 0.55 * math.sin(k * 2.09), 0), 0.025, b, 8)
             for k in range(3)]
    a = math.radians(alt_deg)
    tip = Vector((0, math.cos(a) * 1.2, 1.25 + math.sin(a) * 1.2))
    parts.append(cyl(name + 'Tube', (0, -math.cos(a) * 0.3, 1.25 - math.sin(a) * 0.3), tuple(tip), 0.12, g, 20))
    parent_all(root, parts)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def capitol(name, loc):
    """Arizona State Capitol stand-in: three-storey block with a low copper dome and a dome light, palm-less."""
    root = Md.empty(name, loc)
    st = bpy.data.materials['Stucco']
    cu = M.principled('Copper', base=(0.55, 0.32, 0.18), rough=0.35, metal=0.9, grime=0.3)
    parts = [boxm(name + 'Body', (0, 0, 7), (42, 20, 14), st),
             cyl(name + 'Drum', (0, 0, 14), (0, 0, 19), 6.5, st, 32),
             sphere(name + 'Dome', (0, 0, 19), 6.5, cu, 32, scale=(1, 1, 0.55))]
    for k in range(8):
        parts.append(cyl(name + 'Col%d' % k, (-10.5 + k * 3, -10.4, 0), (-10.5 + k * 3, -10.4, 10), 0.45, st, 12))
    Wd.spot(name + 'Up', (0, -40, 0.5), (0, 0, 16), color=(1.0, 0.85, 0.65), power=60000, size_deg=35)
    parent_all(root, parts)
    return root
