"""ghost-blimp-l8 shared helpers (REAL3D, CINE v2 look as mh370; code-only batch 2026-11-05, render hold).
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


# ---- shared set builders copied from roswell-project-mogul-1947 / battle-of-los-angeles-1942 so this slug stands alone


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


# =============================================================== ghost-blimp-l8 builders
# 16 Aug 1942, San Francisco: Treasure Island -> Farallon Islands -> Ocean Beach -> cliff -> Bellevue Ave, Daly City.
# Generic Navy L-class airship (~45 m), 'NAVY' + 'L-8' markings. Crew never shown with faces. Wide plates 24-35 mm.
ENV_L, ENV_R = 45.0, 5.6


def env_profile(u):
    """Envelope radius along its length, u 0 = tail, 1 = nose (fuller nose, long tapered tail)."""
    v = (max(u, 1e-3) ** 0.62) * (max(1 - u, 1e-3) ** 0.42)
    return ENV_R * v / (0.596 ** 0.62 * 0.404 ** 0.42)


def blimp(name, loc=(0, 0, 0), NF=120, sag=None, crew=False, props=True, yaw=0.0):
    """L-class style blimp, nose +Y. sag = [(frame, 0..1)] keys a 'Sag' shape key (deflating envelope).
    crew=True puts two faceless silhouettes behind the gondola glass (s04 only)."""
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    dope = M.principled(name + 'Dope', base=(0.60, 0.61, 0.60), rough=0.42, metal=0.35, grime=0.25, bump=0.05, bump_scale=6)
    rings, NR, NK = [], 44, 36
    for j in range(NR):
        u = j / (NR - 1)
        r = max(env_profile(u), 0.05)
        y = (u - 0.5) * ENV_L
        rings.append([(r * math.cos(2 * math.pi * k / NK), y, r * math.sin(2 * math.pi * k / NK)) for k in range(NK)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    env = Md.mesh_obj(name + 'Env', v, f, parent=root, mats=(dope,))
    Md.subsurf(env, 1, 1)
    if sag:
        env.shape_key_add(name='Basis')
        sk = env.shape_key_add(name='Sag')
        rr = rng(7)
        for i, pt in enumerate(sk.data):
            x, y, z = pt.co
            u = y / ENV_L + 0.5
            mid = 1 - abs(2 * u - 1)
            z = z * (0.45 + 0.25 * (1 - mid)) - ENV_R * 0.55 * mid + rr.uniform(-0.25, 0.25) * mid
            pt.co = Vector((x * 1.08, y, max(z, -ENV_R * 1.25)))
        kb = env.data.shape_keys.key_blocks['Sag']
        for fr, val in sag:
            kb.value = val
            kb.keyframe_insert('value', frame=fr)
    # cruciform tail fins
    fin_m = M.principled(name + 'FinM', base=(0.55, 0.56, 0.55), rough=0.5, grime=0.3)
    for ang in (0, 90, 180, 270):
        a = math.radians(ang)
        fv = [(0, -ENV_L * 0.44, 0), (0, -ENV_L * 0.30, 0), (0, -ENV_L * 0.40, 3.4), (0, -ENV_L * 0.47, 3.2)]
        rot = Matrix.Rotation(a, 3, 'Y')
        fv = [tuple(rot @ (Vector(p) + Vector((0, 0, env_profile(0.1) * 0.7)))) for p in fv]
        fo = Md.mesh_obj(name + 'Fin%d' % ang, fv, [(0, 1, 2, 3)], parent=root, smooth=False, mats=(fin_m,))
        fo.modifiers.new('S', 'SOLIDIFY').thickness = 0.12
    # gondola car + windows
    car_m = M.principled(name + 'CarM', base=(0.50, 0.50, 0.48), rough=0.5, metal=0.4, grime=0.35)
    gl = M.glass(name + 'Glass', dark=0.3)
    gz = -ENV_R - 1.0
    car = boxm(name + 'Car', (0, 3, gz), (2.0, 7.0, 2.0), car_m, 0.25)
    car.parent = root
    for sx in (-1, 1):
        w = boxm(name + 'Win%d' % sx, (sx * 1.01, 4.2, gz + 0.35), (0.02, 4.0, 0.7), gl)
        w.parent = root
    fw = boxm(name + 'WinF', (0, 6.51, gz + 0.35), (1.7, 0.02, 0.8), gl)
    fw.parent = root
    for k in range(4):
        st = cyl(name + 'Sus%d' % k, (0.8 * (1 if k % 2 else -1), 0.5 + (k // 2) * 5, gz + 1.0),
                 (1.6 * (1 if k % 2 else -1), 0.5 + (k // 2) * 5, -ENV_R * 0.8), 0.02, g['Galv'], 6)
        st.parent = root
    # outrigger engines + propellers
    for sx in (-1, 1):
        nac = cyl(name + 'Nac%d' % sx, (sx * 2.8, 4.0, gz + 0.3), (sx * 2.8, 1.8, gz + 0.3), 0.32, car_m, 16)
        arm = cyl(name + 'Arm%d' % sx, (sx * 1.0, 3.0, gz + 0.3), (sx * 2.8, 3.0, gz + 0.3), 0.06, g['Galv'], 8)
        for x in (nac, arm):
            x.parent = root
        hub = Md.empty(name + 'Prop%d' % sx, (sx * 2.8, 1.65, gz + 0.3), parent=root)
        for k in range(2):
            bl = boxm(name + 'Bl%d_%d' % (sx, k), (0, 0, 0), (0.16, 0.04, 2.0), g['BlackEnamel'])
            bl.rotation_euler = (0, math.radians(90 * k), 0)
            bl.parent = hub
        if props:
            spin(hub, 'Y', 40.0, NF)
    # markings
    ink = M.principled(name + 'Mark', base=(0.03, 0.03, 0.035), rough=0.6)
    for sx in (-1, 1):
        t = text_obj(name + 'Navy%d' % sx, 'NAVY', (sx * (ENV_R + 0.05), 0, 0.5), size=3.2, mat=ink,
                     rot=(math.radians(90), 0, math.radians(90 if sx > 0 else -90)))
        t.parent = root
        t2 = text_obj(name + 'L8_%d' % sx, 'L-8', (sx * (env_profile(0.82) + 0.05), ENV_L * 0.33, -1.2), size=1.6, mat=ink,
                      rot=(math.radians(90), 0, math.radians(90 if sx > 0 else -90)))
        t2.parent = root
    # handling lines from the nose
    for k, dx in enumerate((-0.6, 0.6)):
        rp = sag_rope(name + 'Line%d' % k, (dx, ENV_L * 0.47, -1.0), (dx * 3, ENV_L * 0.40, -ENV_R - 14), sag=1.5,
                      n=14, r=0.03, mat=M.principled(name + 'Rope', base=(0.45, 0.38, 0.26), rough=0.9))
        rp.parent = root
    if crew:
        for k, y in enumerate((5.0, 3.6)):
            fg = figure(name + 'Crew%d' % k, (0.3 * (1 if k else -1), y, gz - 0.95), yaw=0, h=1.7)
            fg.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def fly_keys(o, keys, interp='BEZIER'):
    """keys = [(frame, (x,y,z), yaw_deg)] smooth path for the blimp (no shake)."""
    for f, p, yaw in keys:
        o.location = p
        o.rotation_euler = (0, 0, math.radians(yaw))
        o.keyframe_insert('location', frame=f)
        o.keyframe_insert('rotation_euler', frame=f)
    M.set_interp(o, interp)


def marine_day(NF, sun_elev=18, az=110, haze=0.0009, ocean_center=(0, 0, 0), half=4500, sea=True, fog_h=220):
    """Morning over the Pacific off San Francisco: clear sky HDRI, low sun, marine haze, wide FFT ocean."""
    mats()
    Wd.hdri('kloppenheim_02_puresky', strength=0.6, bg_strength=1.0, rot=40, tint=(0.95, 0.98, 1.05))
    CN.sun(elev=sun_elev, az=az, warmth='noon' if sun_elev > 25 else 'golden', strength=3.5)
    if sea:
        Wd.ocean_wide(center=ocean_center, half=half, time_frames=NF)
        Wd.sea_plane(size=60000, z=-0.6, rough=0.1, frames=NF)
    if haze:
        Wd.fog(center=(ocean_center[0], ocean_center[1] + 2000, fog_h / 2), size=(9000, 9000, fog_h), density=haze,
               color=(0.85, 0.9, 0.95), anisotropy=0.5, noise=0.4, noise_scale=0.003)


def farallons(center=(0, 2500, 0), seed=3):
    """Jagged granite islets (Southeast Farallon look): island-masked terrain with rocky texture."""
    rk = M.texture_set('Granite', 'rocky_terrain_02', scale=0.05, tint=(0.38, 0.36, 0.33), box=True)
    a = Wd.terrain('Farallon', size=900, res=140, height=95, scale=0.006, center=center, seed=seed, mat=rk, island=1.0)
    b = Wd.terrain('Farallon2', size=420, res=90, height=55, scale=0.01, center=(center[0] + 700, center[1] + 300, 0),
                   seed=seed + 1, mat=rk, island=1.0)
    return a, b


def oil_slick(name, center, size=260, seed=2):
    """Iridescent-dark slick: thin plane over the waves, glossy black with a noise mask for ragged edges."""
    m, nb, b, out = M.new(name + 'M')
    b.inputs['Base Color'].default_value = (0.004, 0.004, 0.005, 1)
    b.inputs['Roughness'].default_value = 0.03
    b.inputs['Specular IOR Level'].default_value = 0.8
    try:
        b.inputs['Thin Film Thickness'].default_value = 450.0
    except Exception:
        pass
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=3.0, Detail=6.0)
    nb.l(tc, 'Generated', nz, 'Vector')
    gr = nb.n('ShaderNodeTexGradient')
    gr.gradient_type = 'SPHERICAL'
    nb.l(tc, 'Generated', gr, 'Vector')
    mx = nb.math('MULTIPLY', nz.outputs['Fac'], gr.outputs['Fac'])
    th = nb.math('GREATER_THAN', mx.outputs[0], vb=0.18)
    tr = nb.n('ShaderNodeBsdfTransparent')
    mix = nb.n('ShaderNodeMixShader')
    nb.l(th, 0, mix, 'Fac')
    nb.l(tr, 'BSDF', mix, 1)
    nb.l(b, 'BSDF', mix, 2)
    nb.l(mix, 'Shader', out, 'Surface')
    try:
        m.blend_method = 'HASHED'
    except Exception:
        pass
    bpy.ops.mesh.primitive_plane_add(size=size, location=(center[0], center[1], center[2] + 0.35))
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    o.visible_shadow = False
    return o, m


def freighter(name, loc, yaw=0.0, L=134.0):
    """Liberty-type freighter: long hull, three-island superstructure, masts, one funnel (generic, no name)."""
    mats()
    root = Md.empty(name, loc)
    hull = M.principled(name + 'Hull', base=(0.18, 0.19, 0.20), rough=0.55, grime=0.5)
    top = M.principled(name + 'Top', base=(0.40, 0.41, 0.40), rough=0.6, grime=0.4)
    rings = []
    for j in range(17):
        u = j / 16
        y = (u - 0.5) * L
        w = 9.0 * (1 - max(0, (u - 0.8) / 0.2) ** 1.5) * (0.75 + 0.25 * min(1, u / 0.1))
        rings.append([(-w, y, 4), (-w * 0.92, y, -5), (w * 0.92, y, -5), (w, y, 4)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    Md.mesh_obj(name + 'Body', v, f, parent=root, smooth=False, mats=(hull,))
    parts = [boxm(name + 'Mid', (0, 0, 9), (14, 22, 10), top, 0.2), boxm(name + 'Fore', (0, L * 0.35, 6), (14, 14, 4), top, 0.1),
             boxm(name + 'Aft', (0, -L * 0.38, 6.5), (14, 12, 5), top, 0.1),
             cyl(name + 'Funnel', (0, -3, 14), (0, -3, 22), 2.2, bpy.data.materials['BlackEnamel'], 20)]
    for k, y in enumerate((L * 0.22, -L * 0.22, L * 0.42)):
        parts.append(cyl(name + 'Mast%d' % k, (0, y, 4), (0, y, 28), 0.35, top, 10))
    parent_all(root, parts)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def mooring_mast(name, loc, h=24.0):
    mats()
    g = bpy.data.materials
    root = Md.empty(name, loc)
    o = []
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        o.append(cyl(name + 'L%d' % k, (4 * math.cos(a), 4 * math.sin(a), 0), (0.6 * math.cos(a), 0.6 * math.sin(a), h), 0.15, g['Galv'], 8))
    for k in range(6):
        z = 2 + k * 3.6
        w = 4 - 3.4 * z / h
        o.append(cyl(name + 'R%d' % k, (-w, 0, z), (w, 0, z), 0.07, g['Galv'], 6))
        o.append(cyl(name + 'S%d' % k, (0, -w, z), (0, w, z), 0.07, g['Galv'], 6))
    o.append(cyl(name + 'Cone', (0, 0, h), (0, 0, h + 1.5), 0.7, g['Chrome'], 16))
    parent_all(root, o)
    return root


def beach_set(NF, seed=1):
    """Ocean Beach: wide damp sand sloping into the surf, low dunes behind, marine haze."""
    sand = M.texture_set('Sand', 'damp_beach_sand', scale=0.25, tint=(0.62, 0.56, 0.46), box=True)
    t = Wd.terrain('Beach', size=1400, res=140, height=3, scale=0.004, center=(0, -500, 0.4), seed=seed, mat=sand)
    t.rotation_euler = (math.radians(-1.2), 0, 0)
    dune = M.texture_set('Dune', 'damp_beach_sand', scale=0.08, tint=(0.70, 0.64, 0.52), box=True)
    Wd.terrain('Dunes', size=1600, res=120, height=14, scale=0.006, center=(0, -1250, 2), seed=seed + 2, mat=dune)
    Wd.ocean_wide(center=(0, 600, -0.4), half=4500, time_frames=NF, wave_scale=1.6, choppy=1.2)
    Wd.sea_plane(size=60000, z=-0.8, rough=0.1, frames=NF)
    foam = M.principled('Foam', base=(0.85, 0.87, 0.88), rough=0.7, alpha=0.8)
    for k in range(3):
        f = boxm('Foam%d' % k, (0, 160 + k * 18, 0.2), (1400, 6 + k * 2, 0.05), foam)
        key_loc(f, [(0, (0, 160 + k * 18, 0.2)), (NF, (0, 150 + k * 18, 0.2))], interp='LINEAR')


def cabin(name, NF, day=True):
    """Gondola interior (~6.5 x 1.9 m): floor, walls with window strips, pilot seats, control column, radio set with glowing
    dial, headset on a hook, life-raft rack, three parachute packs by the door. Daylight through the glass."""
    mats()
    g = bpy.data.materials
    wall = M.principled(name + 'Wall', base=(0.42, 0.43, 0.40), rough=0.6, metal=0.3, grime=0.45, bump=0.1, bump_scale=40)
    floor = M.texture_set(name + 'Floor', 'metal_plate', scale=2.0, tint=(0.4, 0.4, 0.38))
    boxm(name + 'Floor', (0, 0, -0.02), (1.9, 6.5, 0.04), floor)
    boxm(name + 'Ceil', (0, 0, 2.0), (1.9, 6.5, 0.04), wall)
    for sx in (-1, 1):
        boxm(name + 'Low%d' % sx, (sx * 0.95, 0, 0.45), (0.04, 6.5, 0.9), wall)
        boxm(name + 'High%d' % sx, (sx * 0.95, 0, 1.85), (0.04, 6.5, 0.3), wall)
        boxm(name + 'Glass%d' % sx, (sx * 0.96, 0, 1.3), (0.01, 6.3, 0.8), M.glass(name + 'Gl'))
        for k in range(5):
            boxm(name + 'Frame%d_%d' % (sx, k), (sx * 0.95, -3.0 + k * 1.5, 1.3), (0.05, 0.06, 0.8), wall)
    boxm(name + 'Front', (0, 3.25, 1.0), (1.9, 0.04, 2.0), wall)
    boxm(name + 'Back', (0, -3.25, 1.0), (1.9, 0.04, 2.0), wall)
    seat = M.principled(name + 'Seat', base=(0.25, 0.18, 0.10), rough=0.7, bump=0.2)
    for sx in (-0.45, 0.45):
        boxm(name + 'Seat%.1f' % sx, (sx, 2.2, 0.45), (0.5, 0.5, 0.1), seat, 0.03)
        boxm(name + 'SeatB%.1f' % sx, (sx, 1.95, 0.75), (0.5, 0.06, 0.6), seat, 0.03)
        cyl(name + 'SeatP%.1f' % sx, (sx, 2.2, 0), (sx, 2.2, 0.4), 0.04, g['Galv'], 8)
    cyl(name + 'Column', (0.45, 2.75, 0.0), (0.45, 2.75, 0.9), 0.035, g['BlackEnamel'], 10)
    I.disc(name + 'Wheel', (0.45, 2.7, 0.92), (0, -1, 0.3), 0.18, g['BlackEnamel'])
    boxm(name + 'Panel', (0, 3.15, 1.0), (1.7, 0.15, 0.5), M.principled(name + 'PanelM', base=(0.06, 0.06, 0.06), rough=0.5), 0.02)
    # radio set (port side, behind the seats) with glowing dial
    rad = M.principled(name + 'Radio', base=(0.10, 0.11, 0.10), rough=0.5, metal=0.3, grime=0.4)
    boxm(name + 'RadioBox', (-0.7, 1.0, 1.05), (0.4, 0.6, 0.5), rad, 0.02)
    dial = M.emission(name + 'DialM', (1.0, 0.72, 0.38), 3.0)
    cyl(name + 'Dial', (-0.495, 1.0, 1.12), (-0.49, 1.0, 1.12), 0.06, dial, 24)
    for k in range(3):
        cyl(name + 'Knob%d' % k, (-0.495, 0.82 + k * 0.18, 0.92), (-0.47, 0.82 + k * 0.18, 0.92), 0.022, g['Chrome'], 12)
    Wd.point(name + 'DialGlow', (-0.45, 1.0, 1.12), color=(1.0, 0.72, 0.38), power=1.5, radius=0.05)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.08, minor_radius=0.008, location=(-0.49, 1.35, 1.3), rotation=(0, math.radians(90), 0))
    hs = bpy.context.active_object
    hs.name = name + 'Headset'
    M.assign(hs, g['BlackEnamel'])
    # life raft rack (stbd, aft) + three parachute packs by the door
    raft = M.principled(name + 'Raft', base=(0.75, 0.55, 0.08), rough=0.6, bump=0.3, bump_scale=60)
    cyl(name + 'RaftRoll', (0.55, -1.6, 0.5), (0.55, -0.6, 0.5), 0.28, raft, 24)
    for k in range(3):
        boxm(name + 'Strap%d' % k, (0.55, -1.5 + k * 0.4, 0.5), (0.6, 0.04, 0.6), M.principled(name + 'StrapM', base=(0.2, 0.18, 0.12), rough=0.8))
    pack = M.principled(name + 'Pack', base=(0.30, 0.30, 0.20), rough=0.85, bump=0.3, bump_scale=50)
    for k in range(3):
        boxm(name + 'Chute%d' % k, (-0.75, -2.0 - k * 0.38, 1.25), (0.16, 0.34, 0.45), pack, 0.04)
        cyl(name + 'Hook%d' % k, (-0.92, -2.0 - k * 0.38, 1.5), (-0.8, -2.0 - k * 0.38, 1.5), 0.01, g['Chrome'], 6)
    if day:
        Wd.hdri('kloppenheim_02_puresky', strength=0.9, bg_strength=1.2, rot=60)
        CN.sun(elev=22, az=40, warmth='noon', strength=4.0)
    Wd.area(name + 'Bounce', (0, 0, 1.9), (0, 0, 0), color=(0.95, 0.97, 1.0), power=25, size=1.2)
    dust((0, 0, 1.2), (1.6, 6.0, 1.6), n=300, seed=5)
