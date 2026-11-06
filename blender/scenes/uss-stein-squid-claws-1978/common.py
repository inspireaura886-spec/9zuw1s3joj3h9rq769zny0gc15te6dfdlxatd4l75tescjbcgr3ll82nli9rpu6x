"""uss-stein-squid-claws-1978 shared helpers (code-only batch 2026-11-05, RENDER HOLD: nothing rendered yet).
Built on blender/kit (cine/camera/world/mat/models) with the mh370 CINE v2 budget (24 spp, 6 bounces).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm), close-ups only as accents; every shot one
eased dolly / push / orbit / crane (kit cruise ease); NO shake, kicks or handheld.
Frame-0 artifact: File:USS Stein (FF-1065) underway in the Pacific Ocean on 2 March 1987 (6418711).jpg, Wikimedia Commons, public domain (US Navy photo, PH2 Hensley); chip "US Navy photo, public domain"; local copy blender/scenes/uss-stein-squid-claws-1978/artifact.jpg (no sign-in). No real 1978 dome photo is used (licence unclear)."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P, interiors as I
from kit import cine as CN
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
R = random.Random(7)


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def look(sc, samples=24, vol=True, glare=0.35, glare_thr=1.0, vignette=0.24, sat=0.95, lift=(0.99, 1.0, 1.03),
         gain=(1.03, 1.0, 0.97)):
    """CINE v2 setup at an affordable sample/bounce budget (same budget as mh370)."""
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


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def mat_once(name, **kw):
    return bpy.data.materials.get(name) or M.principled(name, **kw)


# ---------------------------------------------------------------- materials
def glow_mat(name, color=(0.55, 0.9, 1.0), strength=6.0):
    """Emission mixed with Transparent; animate nodes['Mix'].inputs[0] (0 = invisible, 1 = full glow). No light."""
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


def key_fac(m, keys):
    s = m.node_tree.nodes['Mix'].inputs[0]
    for f, v in keys:
        s.default_value = v
        s.keyframe_insert('default_value', frame=f)


def image_mat(name, img, emit=1.4, rough=0.6):
    """Real-artifact print / screen: image as base colour + emission (readable in a dim set)."""
    m, nb, b, out = M.new(name)
    tex = nb.n('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.join(HERE, img), check_existing=True)
    tex.interpolation = 'Cubic'
    nb.l(tex, 'Color', b, 'Base Color')
    nb.l(tex, 'Color', b, 'Emission Color')
    b.inputs['Emission Strength'].default_value = emit
    b.inputs['Roughness'].default_value = rough
    return m, tex.image


# ---------------------------------------------------------------- geometry
def ring_mesh(name, r=1.0, w=0.02, n=128):
    vs, fs = [], []
    for k in range(n):
        t = 2 * math.pi * k / n
        vs += [((r - w / 2) * math.cos(t), (r - w / 2) * math.sin(t), 0), ((r + w / 2) * math.cos(t), (r + w / 2) * math.sin(t), 0)]
    for k in range(n):
        a, b = 2 * k, 2 * ((k + 1) % n)
        fs.append((a, b, b + 1, a + 1))
    return Md.mesh_obj(name, vs, fs, smooth=False)


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


def ribbon(name, pts, w=1.0, mat=None, z=0.02, closed=False):
    """Flat strip of width w following a 2D polyline at height z (geoglyph lines, trails, slashes on flat ground)."""
    P2 = [Vector((p[0], p[1])) for p in pts]
    if closed:
        P2 = P2 + [P2[0]]
    vs, fs = [], []
    for i, p in enumerate(P2):
        d = (P2[min(i + 1, len(P2) - 1)] - P2[max(i - 1, 0)])
        d = d.normalized() if d.length > 1e-6 else Vector((1, 0))
        n = Vector((-d.y, d.x)) * (w / 2)
        vs += [(p.x + n.x, p.y + n.y, z), (p.x - n.x, p.y - n.y, z)]
    for i in range(len(P2) - 1):
        fs.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    o = Md.mesh_obj(name, vs, fs, smooth=False, mats=(mat,) if mat else ())
    return o


def cyl(name, p0, p1, r, mat, seg=20):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def sphere(name, loc, r, mat, scale=(1, 1, 1), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.shade_smooth()
    M.assign(o, mat)
    return o


def boxm(name, c, s, mat, bev=0.0):
    o = Wd.box(name, c, s)
    o.data.materials.append(mat)
    if bev:
        I.bevel(o, bev)
    return o


def key_loc(o, keys, interp='BEZIER'):
    for f, p in keys:
        o.location = p
        o.keyframe_insert('location', frame=f)
    M.set_interp(o, interp)


def ease_cam(cam, NF, move, lens, fstop=8.0, focus=None):
    """Every shot: one eased move (kit cruise ease), never shake / kick / handheld."""
    cam.shot(0, NF, move, lens=lens, fstop=fstop, focus=focus)
    return cam


# ---------------------------------------------------------------- real-artifact set (frame 0-3 s: the real public-domain / CC file)
def artifact_set(img, style='lightbox', warm=(1.0, 0.8, 0.55), h=1.1):
    """The real artifact (Commons file in this folder as artifact.jpg) shown as a print on a lightbox table
    ('lightbox'), pinned on a wall board ('wall') or on a monitor ('monitor'), in a dim room.
    Returns the artifact centre (focus / look target)."""
    m, im = image_mat('ArtifactM', img, emit=1.6 if style != 'monitor' else 2.4)
    w = h * im.size[0] / max(1, im.size[1])
    floor = M.texture_set('ArtFloor', 'concrete_floor_worn_001', scale=3.0, tint=(0.22, 0.22, 0.24))
    wall = mat_once('ArtWall', base=(0.05, 0.05, 0.055), rough=0.85, grime=0.3)
    wood = M.texture_set('ArtWood', 'wood_table_worn', scale=1.5, tint=(0.5, 0.42, 0.34))
    dark = mat_once('ArtFrame', base=(0.015, 0.015, 0.017), rough=0.4, metal=0.3)
    boxm('ArtFloorB', (0, 0, -0.02), (12, 12, 0.04), floor)
    boxm('ArtBack', (0, 3.0, 2.0), (12, 0.1, 4.0), wall)
    boxm('ArtL', (-4.0, 0, 2.0), (0.1, 12, 4.0), wall)
    if style == 'lightbox':
        boxm('ArtTable', (0, 0.4, 0.42), (2.4, 1.4, 0.84), wood, 0.01)
        boxm('ArtBox', (0, 0.4, 0.88), (w + 0.12, h + 0.12, 0.06), dark, 0.005)
        me = bpy.data.meshes.new('ArtPrint')
        me.from_pydata([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)], [], [(0, 1, 2, 3)])
        c = Vector((0, 0.4, 0.915))
    else:
        me = bpy.data.meshes.new('ArtPrint')
        me.from_pydata([(-w / 2, 0, -h / 2), (w / 2, 0, -h / 2), (w / 2, 0, h / 2), (-w / 2, 0, h / 2)], [], [(0, 1, 2, 3)])
        c = Vector((0, 2.9, 1.55))
        boxm('ArtBoard', (0, 2.95, 1.55), (w + 0.25, 0.04, h + 0.25), dark if style == 'monitor' else wood, 0.01)
        if style == 'monitor':
            boxm('ArtStand', (0, 2.95, 0.7), (0.12, 0.08, 1.0), dark)
            boxm('ArtDesk', (0, 2.4, 0.38), (3.0, 1.0, 0.76), wood, 0.01)
    uv = me.uv_layers.new()
    for lp, q in zip(me.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[lp.index].uv = q
    o = link(bpy.data.objects.new('ArtPrint', me))
    o.location = c
    o.data.materials.append(m)
    CN.practical('ArtLamp', (0.9, c.y - 1.2, c.z + 1.4), tuple(c), kelvin_rgb=warm, power=60, cone=55)
    Wd.area('ArtFill', (-2.0, -2.5, 2.4), tuple(c), color=(0.6, 0.7, 0.9), power=25, size=2.0)
    Wd.fog(center=(0, 0.5, 2.0), size=(7.8, 5.0, 3.9), density=0.01, color=(0.85, 0.85, 0.9), anisotropy=0.4)
    Wd.hdri('kloppenheim_02_puresky', strength=0.02, bg_strength=0.0)
    return c


def artifact_move(c, style='lightbox', amount=0.22):
    """Slow eased push toward the artifact (lightbox: from above-front; wall/monitor: straight on)."""
    if style == 'lightbox':
        return C.dolly(c + Vector((0.15, -1.55, 1.05)), c + Vector((0.05, -1.15, 0.80)), look=c)
    return C.push_in(c + Vector((0.2, -2.6, 0.1)), c, amount=amount)


# ================================================================ uss-stein-squid-claws-1978 builders
# Knox-class frigate, ~134 m, bow +Y, waterline z=0 (at sea) or keel on blocks (dry dock). The sonar sits in a
# bulbous rubber-coated (NOFOUL) bow dome. Facts on screen only: cuts over ~8% of the dome, curved hooks in the cuts
# (squid sucker-rim hooks, bigger than any then known). The '4 ft' gash and '150 ft' animal are CLAIMS: never draw
# a squid to a measurable scale against the ship, keep it a silhouette in murk.
HULL_L = 134.0


def navy_grey(name='NavyGrey'):
    return mat_once(name, base=(0.30, 0.32, 0.34), rough=0.55, metal=0.15, grime=0.35, rough_noise=0.1)


def hull_halfwidth(u):
    """u 0 (stern) .. 1 (bow): Knox beam ~14.3 m, fine entry forward, transom aft."""
    return 7.15 * (1 - (2 * u - 1) ** 6) ** 0.5 * (0.55 + 0.45 * min(1, u * 3)) * (1 - 0.65 * max(0, u - 0.78) / 0.22)


def frigate(name='Stein', keel_z=-7.5, deck_z=6.0, dome=True):
    root = Md.empty(name, (0, 0, 0))
    g = navy_grey()
    red = mat_once('Antifoul', base=(0.22, 0.05, 0.04), rough=0.7, grime=0.4)
    rings = []
    K, N = 24, 40
    for j in range(N + 1):
        u = j / N
        y = -HULL_L / 2 + u * HULL_L
        w = max(0.25, hull_halfwidth(u))
        kz = keel_z + 2.5 * max(0, u - 0.85) / 0.15
        ring = []
        for k in range(K):
            t = 2 * math.pi * k / K
            cx, cz = math.cos(t), math.sin(t)
            z = (deck_z + kz) / 2 + (deck_z - kz) / 2 * (abs(cz) ** 0.6) * (1 if cz >= 0 else -1)
            x = w * (abs(cx) ** 0.5) * (1 if cx >= 0 else -1)
            ring.append((x, y, z))
        rings.append(ring)
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    hull = Md.mesh_obj(name + 'Hull', v, f, parent=root, mats=(g,))
    Md.subsurf(hull, 1, 1)
    boot = boxm(name + 'Boot', (0, 0, keel_z / 2 - 0.2), (13.6, HULL_L * 0.86, -keel_z), red)
    boot.parent = root
    boot.display_type = 'WIRE'
    boot.hide_render = True   # waterline boot kept as a guide only (hull paint stays grey)
    parts = [boxm(name + 'Bridge', (0, 22, deck_z + 4.5), (10, 12, 9), g, 0.1),
             boxm(name + 'Mack', (0, 4, deck_z + 9), (6, 9, 14), g, 0.1),
             boxm(name + 'Hangar', (0, -26, deck_z + 3), (11, 18, 6), g, 0.1),
             boxm(name + 'Asroc', (0, 38, deck_z + 1.4), (3.4, 5, 2.8), g, 0.05),
             boxm(name + 'Gun', (0, 50, deck_z + 1.4), (3.2, 4, 2.4), g, 0.2)]
    parts.append(cyl(name + 'Barrel', (0, 51, deck_z + 1.6), (0, 57, deck_z + 1.8), 0.13, g, 12))
    parts.append(cyl(name + 'Mast', (0, 6, deck_z + 16), (0, 6, deck_z + 30), 0.6, g, 12))
    for p in parts:
        p.parent = root
    d = None
    if dome:
        d = sonar_dome(name + 'Dome', (0, HULL_L / 2 - 14, keel_z - 1.6))
        d.parent = root
    return root, d


def sonar_dome(name, loc, length=11.0, r=2.4):
    rub = mat_once('NOFOUL', base=(0.035, 0.035, 0.04), rough=0.62, bump=0.3, bump_scale=60, grime=0.25)
    return sphere(name, loc, 1.0, rub, scale=(r, length / 2, r * 0.95), seg=64)


def dome_point(dome, u, v, lift=0.01):
    """Point on the dome ellipsoid surface: u along length (-1 aft .. 1 fwd), v around (rad, 0 = starboard)."""
    sx, sy, sz = dome.scale
    c = dome.matrix_world.translation if dome.parent is None else dome.parent.matrix_world @ dome.location
    rr = math.sqrt(max(0.0, 1 - u * u))
    n = Vector((rr * math.cos(v), u, rr * math.sin(v)))
    p = Vector((n.x * sx, n.y * sy, n.z * sz))
    return c + p + n.normalized() * lift


def slashes(dome, n=26, seed=11, max_len=1.2, claws=True):
    """Cuts across ~8% of the dome: dark ragged grooves (thin tubes) with a curved hook stuck in most of them."""
    rr = random.Random(seed)
    cut = mat_once('CutDark', base=(0.008, 0.007, 0.007), rough=0.9)
    lip = mat_once('CutLip', base=(0.09, 0.085, 0.08), rough=0.75)
    out = []
    for i in range(n):
        u0, v0 = rr.uniform(-0.2, 0.85), rr.uniform(-1.2, 1.2) + (math.pi if i % 2 else 0)
        L = rr.uniform(0.25, 1.0) * max_len
        du, dv = rr.uniform(-0.12, 0.12), L / 2.4
        pts = [tuple(dome_point(dome, u0 + du * t, v0 + dv * t + 0.015 * math.sin(9 * t), 0.004)) for t in [k / 10 for k in range(11)]]
        o = curve_poly('Cut%d' % i, pts, bevel=0.018, mat=cut)
        curve_poly('Lip%d' % i, [tuple(Vector(p) + Vector((0, 0.01, 0.01))) for p in pts], bevel=0.008, mat=lip)
        out.append((o, pts))
        if claws and i % 5 != 4:
            p = Vector(pts[rr.randrange(3, 8)])
            claw('Claw%d' % i, p, size=rr.uniform(0.03, 0.05), yaw=rr.uniform(0, 360))
    return out


def claw(name, loc, size=0.04, yaw=0.0, tilt=35.0):
    """Squid sucker-rim hook: hollow-looking curved cone (lofted along a quarter arc), amber keratin."""
    ker = mat_once('Keratin', base=(0.62, 0.48, 0.28), rough=0.32, sss=0.15, coat=0.4)
    rings, K, N = [], 12, 14
    for j in range(N + 1):
        t = j / N
        a = t * math.pi * 0.55
        cx, cz = size * 1.2 * (1 - math.cos(a)), size * 1.6 * math.sin(a)
        r = size * 0.42 * (1 - t) ** 0.9 + size * 0.02
        rings.append([(cx + r * math.cos(2 * math.pi * k / K) * math.cos(a), r * math.sin(2 * math.pi * k / K),
                       cz - r * math.cos(2 * math.pi * k / K) * math.sin(a)) for k in range(K)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    o = Md.mesh_obj(name, v, f, mats=(ker,))
    o.location = loc
    o.rotation_euler = (math.radians(tilt), 0, math.radians(yaw))
    return o


def sea_day(NF, sun_az=210.0, elev=24.0):
    CN.hdri_sun('kloppenheim_02_puresky', sun_az=sun_az, strength=1.0)
    CN.sun(elev=elev, az=sun_az, warmth='noon', strength=3.2, check=False)
    Wd.sea_plane(size=240000, z=-3.0, color=(0.006, 0.02, 0.03), rough=0.14, wave=0.15, frames=max(NF, 60))
    return Wd.ocean_wide(center=(0, 0, 0), half=3500, wave_scale=1.6, choppy=0.9, wind=11, time_frames=max(NF, 60),
                         color=(0.006, 0.02, 0.03), rough=0.08)


def underwater(depth_fog=0.035, color=(0.12, 0.32, 0.42), sun=True, surface_z=0.0):
    """Murky Pacific: blue scattering volume, dim sun from above, the water surface seen from below."""
    w = Wd.hdri('kloppenheim_02_puresky', strength=0.15, bg_strength=0.0, tint=(0.4, 0.7, 0.9))
    if sun:
        CN.sun(elev=70, az=200, warmth='noon', strength=2.5, check=False)
    Wd.fog(center=(0, 0, surface_z - 120), size=(900, 900, 240), density=depth_fog, color=color, anisotropy=0.75,
           noise=0.3, noise_scale=0.05)
    surf = mat_once('SurfUnder', base=(0.2, 0.45, 0.55), rough=0.05, transmission=0.9, ior=1.33)
    boxm('SurfaceUnder', (0, 0, surface_z + 0.05), (2000, 2000, 0.1), surf)
    return w


def sonar_pings(NF, center, n=4, rmax=60.0, die=True):
    """Expanding sonar rings from the dome that weaken and stop (the set 'went dead')."""
    mats = []
    for k in range(n):
        m = glow_mat('Ping%d' % k, (0.5, 0.95, 1.0), 2.5)
        o = ring_mesh('PingR%d' % k, 1.0, 0.03, 160)
        o.location = center
        o.rotation_euler = (math.radians(90), 0, 0)
        o.data.materials.append(m)
        f0 = int(k * NF / (n + 0.5))
        for f, s in ((f0, 1.0), (f0 + int(NF / 2.2), rmax)):
            o.scale = (s, s, s)
            o.keyframe_insert('scale', frame=f)
        peak = 1.0 * (1 - k / n) if die else 1.0
        key_fac(m, [(max(0, f0 - 1), 0.0), (f0, peak), (f0 + int(NF / 2.2), 0.0)])
        mats.append(m)
    return mats


def drydock(NF, block_h=5.5, length=200.0, width=34.0, depth=14.0):
    """Graving dock: concrete floor + stepped walls, tall keel blocks (the dome hangs ~1.6 m above the floor),
    overcast daylight + work lights. Returns the keel height (ship.location.z = 7.5 + returned value)."""
    CN.hdri_sun('kloppenheim_02_puresky', sun_az=150, strength=1.2)
    CN.sun(elev=35, az=150, warmth='noon', strength=2.4, check=False)
    con = M.texture_set('DockCon', 'rough_concrete', scale=40.0, tint=(0.55, 0.55, 0.56))
    floor = M.texture_set('DockFloor', 'concrete_floor_worn_001', scale=30.0, tint=(0.4, 0.4, 0.42))
    boxm('DockFloorB', (0, 0, -0.5), (width, length, 1.0), floor)
    for s in (1, -1):
        for k in range(4):
            boxm('Altar%d_%d' % (s, k), (s * (width / 2 + 1.5 * k + 0.75), 0, depth * (k + 1) / 8),
                 (1.5, length, depth * (k + 1) / 4), con)
        boxm('Quay%d' % s, (s * (width / 2 + 14), 0, depth - 0.5), (16, length, 1.0), con)
    wood = M.texture_set('KeelWood', 'wood_table_worn', scale=1.0, tint=(0.35, 0.28, 0.2))
    for k in range(18):
        boxm('KeelBlk%d' % k, (0, -60 + k * 6.5, block_h / 2), (1.6, 1.6, block_h), con if k % 2 else wood)
    for k in range(4):
        CN.practical('WorkLight%d' % k, (12, -30 + k * 25, depth + 2), (0, -30 + k * 25, 0), power=4000, cone=80)
    CN.haze(center=(0, 0, 8), size=(width + 40, length, 18), density=0.003, color=(0.85, 0.86, 0.88))
    return block_h


def worker(name, loc, yaw=0.0, hat=True):
    """Backlit dock worker silhouette (no face): overalls, helmet. Simple primitives, read at medium/wide only."""
    cloth = mat_once('Overall', base=(0.08, 0.1, 0.14), rough=0.85, bump=0.2, bump_scale=200)
    skin = mat_once('Shade', base=(0.12, 0.09, 0.08), rough=0.7)
    root = Md.empty(name, loc)
    ps = [cyl(name + 'LegL', (-0.11, 0, 0), (-0.11, 0, 0.85), 0.08, cloth, 10),
          cyl(name + 'LegR', (0.11, 0, 0), (0.11, 0, 0.85), 0.08, cloth, 10),
          cyl(name + 'Torso', (0, 0, 0.85), (0, 0, 1.45), 0.19, cloth, 14),
          cyl(name + 'ArmL', (-0.24, 0, 1.42), (-0.28, 0.05, 0.9), 0.06, cloth, 8),
          cyl(name + 'ArmR', (0.24, 0, 1.42), (0.3, 0.25, 1.05), 0.06, cloth, 8),
          sphere(name + 'Head', (0, 0, 1.62), 0.12, skin, seg=16)]
    if hat:
        ps.append(sphere(name + 'Hat', (0, 0, 1.68), 0.135, mat_once('Helmet', base=(0.7, 0.7, 0.68), rough=0.4), (1, 1, 0.6), 16))
    for p in ps:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def knife(name, loc, rot=(0, 0, 0)):
    steel = mat_once('Steel', base=(0.7, 0.71, 0.73), rough=0.18, metal=1.0)
    grip = mat_once('Grip', base=(0.05, 0.035, 0.025), rough=0.6)
    root = Md.empty(name, loc)
    b = boxm(name + 'Blade', (0, 0.09, 0), (0.022, 0.16, 0.003), steel)
    h = boxm(name + 'Handle', (0, -0.05, 0), (0.026, 0.11, 0.02), grip, 0.004)
    b.parent = root
    h.parent = root
    root.rotation_euler = rot
    return root


def lab_table(seed=2):
    """Navy lab bench: steel tray with Stein hooks (big) beside reference squid hooks (small), ruler, lamp."""
    steel = mat_once('TrayS', base=(0.6, 0.61, 0.63), rough=0.3, metal=1.0)
    wood = M.texture_set('LabWood', 'wood_table_worn', scale=1.2, tint=(0.45, 0.4, 0.34))
    boxm('LabFloor', (0, 0, -0.02), (10, 10, 0.04), M.texture_set('LabFl', 'concrete_floor_worn_001', scale=3.0, tint=(0.3, 0.3, 0.32)))
    boxm('LabBack', (0, 2.5, 1.8), (10, 0.1, 3.6), mat_once('LabWall', base=(0.32, 0.36, 0.34), rough=0.8, grime=0.3))
    boxm('Bench', (0, 0.3, 0.45), (2.2, 1.0, 0.9), wood, 0.01)
    boxm('Tray', (0, 0.25, 0.915), (0.6, 0.4, 0.03), steel, 0.006)
    rr = random.Random(seed)
    for k in range(6):
        claw('BigHook%d' % k, (-0.2 + 0.08 * k, 0.25 + rr.uniform(-0.08, 0.08), 0.94), size=0.05, yaw=rr.uniform(0, 360), tilt=80)
    for k in range(6):
        claw('RefHook%d' % k, (0.45 + 0.03 * k, 0.1, 0.915), size=0.012, yaw=rr.uniform(0, 360), tilt=80)
    ruler = mat_once('Ruler', base=(0.85, 0.8, 0.62), rough=0.5)
    boxm('Ruler', (0.1, 0.0, 0.905), (0.6, 0.04, 0.004), ruler)
    try:
        CN.place('desk_lamp_arm_01', (0.85, 0.55, 0.9), rot=(0, 0, -2.2), scale=1.0)
    except Exception:
        pass
    CN.practical('LabLamp', (0.6, -0.2, 1.6), (0, 0.25, 0.92), power=80, cone=50)
    Wd.area('LabWin', (-3, -1, 2.5), (0, 0.3, 0.9), color=(0.75, 0.85, 1.0), power=200, size=3.0)
    return Vector((0, 0.25, 0.94))


def squid_silhouette(name, loc, mantle=1.0, yaw=0.0):
    """Unscaled deep-water silhouette (mantle + fins + 8 arms + 2 long tentacles). Always in murk, never measured."""
    flesh = mat_once('SquidFlesh', base=(0.22, 0.07, 0.05), rough=0.4, sss=0.3, coat=0.3)
    root = Md.empty(name, loc)
    rings, K = [], 16
    for j in range(13):
        t = j / 12
        r = mantle * 0.18 * math.sin(min(1.0, t * 1.15) * math.pi * 0.5) * (1 - 0.6 * t) + 0.01
        rings.append([(r * math.cos(2 * math.pi * k / K), -t * mantle * 2.2, r * math.sin(2 * math.pi * k / K)) for k in range(K)])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    Md.mesh_obj(name + 'Mantle', v, f, parent=root, mats=(flesh,))
    for k in range(10):
        a = 2 * math.pi * k / 10
        L = mantle * (4.5 if k in (0, 5) else 1.6)
        pts = [(math.cos(a) * 0.1 * mantle * (1 + 2 * t) + 0.1 * mantle * math.sin(3 * t + k),
                L * t + 0.05, math.sin(a) * 0.1 * mantle * (1 + 2 * t)) for t in [i / 9 for i in range(10)]]
        o = curve_poly(name + 'Arm%d' % k, pts, bevel=0.03 * mantle, mat=flesh)
        o.data.bevel_factor_mapping_end = 'SPLINE'
        o.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root
