"""uss-omaha-spherical-uap-2019 shared helpers (code-only batch 2026-11-05, RENDER HOLD: nothing rendered yet).
Built on blender/kit (cine/camera/world/mat/models) with the mh370 CINE v2 budget (24 spp, 6 bounces).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm), close-ups only as accents; every shot one
eased dolly / push / orbit / crane (kit cruise ease); NO shake, kicks or handheld.
Frame-0 artifact: File:USS Omaha (LCS-12) at Naval Station Norfolk on 6 December 2017 (171206-N-ME568-080).JPG, Wikimedia Commons, public domain (US Navy photo); chip "USS Omaha, US Navy photo, PD"; local copy blender/scenes/uss-omaha-spherical-uap-2019/artifact.jpg. The leaked 2019 CIC clip is NOT public domain (Corbell release): it is never shown or traced, every IR picture is our own recreation, chip "recreation"."""
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


# ================================================================ uss-omaha-spherical-uap-2019 builders
# Independence-class LCS (trimaran, ~127 m) at night off San Diego; CIC monitor showing a night-IR picture
# (white-hot greys) of a dark sphere over the sea. Telling rules: 'the Pentagon confirmed the video is real';
# submarine search + size + 1 h = filmmaker's CLAIMS (chips say 'claim'); never 'alien'. The leaked clip itself is
# NOT public domain, so every picture of the object is our own recreation; the frame-0 artifact is the PD Navy
# photo of USS Omaha (LCS-12).
def night_sea(NF, moon=1.6):
    Wd.hdri('qwantani_night_puresky', strength=0.35, bg_strength=0.5, rot=60, tint=(0.75, 0.85, 1.1))
    Wd.moon(direction=(-0.5, 0.7, 0.35), strength=moon, color=(0.62, 0.72, 1.0), angle=0.55)
    Wd.sea_plane(size=240000, z=-3.0, color=(0.003, 0.006, 0.01), rough=0.2, wave=0.15, frames=max(NF, 60))
    return Wd.ocean_wide(center=(0, 0, 0), half=3000, wave_scale=1.4, choppy=1.0, wind=10, time_frames=max(NF, 60),
                         color=(0.003, 0.006, 0.01), rough=0.07)


def ir_sea(NF):
    """Night-IR look: grey water (warmer = lighter), cold dark sky; render with look(sc, sat=0.0)."""
    w = bpy.data.worlds.new('IRSky')
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes.get('Background')
    bg.inputs['Color'].default_value = (0.05, 0.05, 0.05, 1)
    bg.inputs['Strength'].default_value = 1.0
    o = Wd.ocean_wide(center=(0, 0, 0), half=2500, wave_scale=1.3, choppy=1.1, wind=12, time_frames=max(NF, 60),
                      color=(0.42, 0.42, 0.42), rough=0.35)
    Wd.sea_plane(size=200000, z=-3.0, color=(0.38, 0.38, 0.38), rough=0.4, wave=0.2, frames=max(NF, 60))
    CN.sun(elev=55, az=120, warmth=(1, 1, 1), strength=1.6, check=False)
    Wd.fog(center=(0, 600, 60), size=(5000, 5000, 140), density=0.0012, color=(0.8, 0.8, 0.8), anisotropy=0.2)
    return o


def lcs(name='Omaha', lights=True):
    """Generic Independence-class trimaran: slender main hull, two outrigger amas, wide aft flight deck, angular
    faceted superstructure. Hull number omitted. Bow +Y, waterline z=0."""
    g = mat_once('LCSGrey', base=(0.42, 0.44, 0.46), rough=0.5, metal=0.2, grime=0.3, rough_noise=0.08)
    root = Md.empty(name, (0, 0, 0))
    rings, K, N = [], 20, 36
    for j in range(N + 1):
        u = j / N
        y = -63 + 127 * u
        w = 3.2 * (1 - max(0, u - 0.7) / 0.3) ** 0.8 + 0.15
        ring = [(w * math.cos(2 * math.pi * k / K), y, -3.5 + 8.5 * (0.5 + 0.5 * math.sin(2 * math.pi * k / K)) ** 0.9) for k in range(K)]
        rings.append(ring)
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    Md.mesh_obj(name + 'Main', v, f, parent=root, mats=(g,))
    ps = []
    for s in (1, -1):
        ps.append(boxm(name + 'Ama%d' % s, (s * 13.5, -18, 0.8), (2.2, 60, 4.0), g, 0.3))
    ps.append(boxm(name + 'Deck', (0, -30, 6.5), (31.6, 60, 1.6), g, 0.1))
    ps.append(boxm(name + 'Super', (0, 8, 10), (14, 34, 8), g, 0.2))
    br = boxm(name + 'Bridge', (0, 22, 15.5), (12, 10, 3.5), g, 0.2)
    br.rotation_euler = (math.radians(-8), 0, 0)
    ps.append(br)
    ps.append(cyl(name + 'Mast', (0, 14, 14), (0, 12, 28), 0.9, g, 6))
    ps.append(boxm(name + 'Gun', (0, 40, 6.2), (2.6, 3.4, 1.8), g, 0.2))
    for p in ps:
        p.parent = root
    if lights:
        for k, (loc, col) in enumerate(((( -7, 24, 14), (1, 0.05, 0.03)), ((7, 24, 14), (0.05, 1, 0.2)), ((0, 12, 28.5), (1, 1, 0.9)),
                                        ((0, -60, 8), (1, 1, 0.9)))):
            Md.nav_light(name + 'Nav%d' % k, loc, col, root, power=40, strength=50)
        win = M.emission('BridgeWin', (1.0, 0.75, 0.45), 3.0)
        w = boxm(name + 'Win', (0, 27.1, 15.8), (10, 0.05, 1.0), win)
        w.parent = root
    return root


def dark_sphere(name='Sphere', loc=(0, 0, 20), r=0.9, ir=False):
    """The object: matte dark sphere (IR: reads black against warm grey sea). Never glowing, never a craft."""
    m = mat_once('SphereIR' if ir else 'SphereDark', base=(0.0, 0.0, 0.0) if ir else (0.015, 0.015, 0.017), rough=0.9)
    return sphere(name, loc, r, m, seg=32)


def sphere_path(o, NF, x0=-60, x1=10, y=200, z=22, stop=0.45, sink=0.85):
    """Glide left -> right, stop, ease down into the water (keyed; Bezier = eased)."""
    f1, f2 = int(NF * stop), int(NF * sink)
    key_loc(o, [(0, (x0, y, z)), (f1, (x1, y, z)), (int(f1 + (f2 - f1) * 0.3), (x1, y, z)), (f2, (x1, y, -2.0)),
                (NF, (x1, y, -4.0))])
    return f2


def ripples(NF, loc, f0, n=3, rmax=14.0, color=(0.75, 0.85, 1.0)):
    for k in range(n):
        m = glow_mat('Rip%d' % k, color, 0.8)
        o = ring_mesh('RipR%d' % k, 1.0, 0.05, 128)
        o.location = (loc[0], loc[1], 0.15)
        o.data.materials.append(m)
        a = f0 + k * 8
        for f, s in ((a, 0.5), (min(NF, a + 60), rmax)):
            o.scale = (s, s, 1)
            o.keyframe_insert('scale', frame=f)
        key_fac(m, [(max(0, a - 1), 0.0), (a, 0.7), (min(NF, a + 60), 0.0)])


def thermal_screen_mat(name, NF, x0=0.25, x1=0.6, y=0.55, stop=0.45, sink=0.85, empty=False):
    """Monitor picture: grey IR sea noise, darker sky band, black disc on the keyed path (glide, stop, sink), and
    a fine scanline; reticle drawn as separate boxes. UV 0-1 on the screen plane."""
    m, nb, b, out = M.new(name)
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=60.0, Detail=6.0)
    nb.l(tc, 'UV', nz, 'Vector')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'UV', sep, 'Vector')
    sky = nb.math('GREATER_THAN', sep.outputs['Y'], vb=0.72)
    sea = nb.math('MULTIPLY', nz.outputs['Fac'], vb=0.55)
    base = nb.math('MULTIPLY', sea.outputs[0], nb.math('SUBTRACT', va=1.0, b=sky.outputs[0]).outputs[0])
    skyv = nb.math('MULTIPLY', sky.outputs[0], vb=0.12)
    img = nb.math('ADD', base.outputs[0], skyv.outputs[0])
    mp = nb.n('ShaderNodeMapping')
    nb.l(tc, 'UV', mp, 'Vector')
    loc = mp.inputs['Location']
    f1, f2 = int(NF * stop), int(NF * sink)
    for f, (u, v) in ((0, (x0, y)), (f1, (x1, y)), (int(f1 + (f2 - f1) * 0.3), (x1, y)), (f2, (x1, 0.3)), (NF, (x1, 0.25))):
        loc.default_value = (-u, -v, 0)
        loc.keyframe_insert('default_value', frame=f)
    gr = nb.n('ShaderNodeTexGradient')
    gr.gradient_type = 'SPHERICAL'
    nb.l(mp, 'Vector', gr, 'Vector')
    disc = nb.math('GREATER_THAN', gr.outputs['Fac'], vb=0.97)
    if empty:
        disc = nb.math('MULTIPLY', disc.outputs[0], vb=0.0)
    keep = nb.math('SUBTRACT', va=1.0, b=disc.outputs[0])
    lum = nb.math('MULTIPLY', img.outputs[0], keep.outputs[0])
    em = nb.n('ShaderNodeEmission', Strength=2.2)
    nb.l(lum, 0, em, 'Color')
    nb.l(em, 'Emission', out, 'Surface')
    return m


def screen_plane(name, w, h, loc, mat, rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    me.from_pydata([(-w / 2, 0, -h / 2), (w / 2, 0, -h / 2), (w / 2, 0, h / 2), (-w / 2, 0, h / 2)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for lp, q in zip(me.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[lp.index].uv = q
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(mat)
    return o


def cic_room(NF, hero_mat, n=5, seated=3):
    """Combat Information Center: dark blue-lit room, a row of consoles with dim tactical screens, the hero
    monitor (IR picture) in the middle with a reticle, seated operator silhouettes (backs only, no faces)."""
    wall = mat_once('CICWall', base=(0.05, 0.055, 0.065), rough=0.8, grime=0.3)
    desk = mat_once('CICDesk', base=(0.08, 0.085, 0.09), rough=0.5, metal=0.3)
    frame = mat_once('CICFrame', base=(0.01, 0.01, 0.012), rough=0.35, metal=0.4)
    dim = M.emission('CICDim', (0.25, 0.45, 0.6), 0.9)
    boxm('CICFloor', (0, 0, -0.02), (12, 9, 0.04), M.texture_set('CICFl', 'metal_plate', scale=6.0, tint=(0.2, 0.2, 0.22)))
    boxm('CICCeil', (0, 0, 2.6), (12, 9, 0.04), wall)
    boxm('CICBack', (0, 3.0, 1.3), (12, 0.1, 2.6), wall)
    boxm('CICL', (-6, 0, 1.3), (0.1, 9, 2.6), wall)
    boxm('CICR', (6, 0, 1.3), (0.1, 9, 2.6), wall)
    mid = n // 2
    hero = None
    for i in range(n):
        x = (i - mid) * 1.6
        boxm('CDesk%d' % i, (x, 2.2, 0.38), (1.4, 0.8, 0.76), desk, 0.01)
        boxm('CMon%d' % i, (x, 2.45, 1.2), (0.9, 0.06, 0.62), frame, 0.008)
        s = screen_plane('CScr%d' % i, 0.82, 0.54, (x, 2.41, 1.2), hero_mat if i == mid else dim)
        if i == mid:
            hero = s
            ret = M.emission('Reticle', (0.85, 0.85, 0.85), 1.5)
            boxm('RetH', (x, 2.405, 1.2), (0.12, 0.002, 0.004), ret)
            boxm('RetV', (x, 2.405, 1.2), (0.004, 0.002, 0.08), ret)
    for k in range(seated):
        x = (k - seated // 2) * 1.6 + (0.0 if k != seated // 2 else 0.35)
        operator('Op%d' % k, (x, 1.35, 0))
    Wd.area('CICBlue', (0, 0, 2.5), (0, 1, 0), color=(0.35, 0.5, 0.9), power=60, size=5.0)
    Wd.area('CICSpill', (0, 1.9, 1.2), (0, 0.5, 1.0), color=(0.8, 0.85, 0.9), power=10, size=0.9)
    Wd.fog(center=(0, 0, 1.3), size=(11.8, 8.8, 2.5), density=0.015, color=(0.8, 0.85, 0.95), anisotropy=0.4)
    Wd.hdri('qwantani_night_puresky', strength=0.01, bg_strength=0.0)
    return hero


def operator(name, loc):
    """Seated sailor seen from behind: chair + torso + head, navy coverall. No face, no insignia."""
    cloth = mat_once('NavyCloth', base=(0.04, 0.06, 0.1), rough=0.85, bump=0.2, bump_scale=200)
    hair = mat_once('Hair', base=(0.02, 0.015, 0.012), rough=0.6)
    chair = mat_once('CICChair', base=(0.03, 0.03, 0.035), rough=0.7)
    root = Md.empty(name, loc)
    ps = [boxm(name + 'Seat', (0, 0, 0.46), (0.5, 0.5, 0.08), chair, 0.02),
          boxm(name + 'Back', (0, -0.25, 0.8), (0.46, 0.06, 0.55), chair, 0.02),
          cyl(name + 'Torso', (0, 0.0, 0.52), (0, 0.08, 1.15), 0.2, cloth, 14),
          sphere(name + 'Head', (0, 0.1, 1.32), 0.115, hair, seg=16)]
    for p in ps:
        p.parent = root
    return root


def submarine(name='Sub', loc=(0, 0, -60), L=110.0):
    hullm = mat_once('SubHull', base=(0.02, 0.022, 0.025), rough=0.55, bump=0.2, bump_scale=8)
    root = Md.empty(name, loc)
    rings, K, N = [], 20, 30
    for j in range(N + 1):
        u = j / N
        r = 5.0 * (min(1, u / 0.12) ** 0.5) * (1 - max(0, u - 0.7) / 0.3) ** 1.3 + 0.2
        rings.append([(r * math.cos(2 * math.pi * k / K), -L / 2 + L * u, r * math.sin(2 * math.pi * k / K)) for k in range(K)])
    rings = rings[::-1]
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    Md.mesh_obj(name + 'Hull', v, f, parent=root, mats=(hullm,))
    s = boxm(name + 'Sail', (0, 18, 7.5), (2.6, 12, 6.0), hullm, 0.6)
    s.parent = root
    for sg in (1, -1):
        p = boxm(name + 'Plane%d' % sg, (sg * 4.5, 19, 8.5), (6.5, 2.4, 0.3), hullm, 0.1)
        p.parent = root
        t = boxm(name + 'Tail%d' % sg, (sg * 3.0, -50, 0), (5.0, 3.0, 0.3), hullm, 0.1)
        t.parent = root
    lamp = Wd.spot(name + 'Lamp', (loc[0], loc[1] + 50, loc[2] - 3), (loc[0], loc[1] + 90, loc[2] - 40),
                   color=(0.8, 0.9, 1.0), power=60000, size_deg=22, blend=0.5, radius=0.2)
    return root, lamp


def deep_water(depth_fog=0.03, color=(0.06, 0.16, 0.24), floor_z=-110.0, floor=True):
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.0)
    Wd.fog(center=(0, 0, floor_z / 2), size=(1200, 1200, -floor_z + 20), density=depth_fog, color=color, anisotropy=0.7,
           noise=0.3, noise_scale=0.04)
    if floor:
        CN.ground('Seabed', 'damp_beach_sand', (2400, 2400), center=(0, 0, floor_z), tile_m=6.0, tint=(0.25, 0.25, 0.24))


def pentagon(name='Pentagon', r_out=140.0, rings=5, h=23.0):
    """Five concentric pentagonal office rings + courtyard (seen from the air, generic, no signage)."""
    roof = mat_once('PRoof', base=(0.3, 0.3, 0.3), rough=0.7, grime=0.3)
    wall = mat_once('PWall', base=(0.62, 0.6, 0.56), rough=0.8, grime=0.25)
    grass = mat_once('PGrass', base=(0.08, 0.12, 0.05), rough=0.95)
    for k in range(rings):
        r = r_out - k * 18
        vx = [(r * math.cos(math.radians(90 + 72 * i)), r * math.sin(math.radians(90 + 72 * i))) for i in range(5)]
        for i in range(5):
            (x0, y0), (x1, y1) = vx[i], vx[(i + 1) % 5]
            L = math.hypot(x1 - x0, y1 - y0)
            o = boxm('%sR%d_%d' % (name, k, i), ((x0 + x1) / 2, (y0 + y1) / 2, h / 2), (L + 9, 10, h), wall)
            o.rotation_euler = (0, 0, math.atan2(y1 - y0, x1 - x0))
            t = boxm('%sT%d_%d' % (name, k, i), ((x0 + x1) / 2, (y0 + y1) / 2, h + 0.3), (L + 9, 10.4, 0.6), roof)
            t.rotation_euler = o.rotation_euler
    sphere('Courtyard', (0, 0, 0.05), 1.0, grass, scale=(r_out * 0.35, r_out * 0.35, 0.02), seg=10)
    CN.ground('Lots', 'asphalt_02', (1600, 1600), tile_m=8.0, tint=(0.4, 0.4, 0.42))
    Wd.city_lights('PLights', center=(0, 0, 0.3), radius=700, count=900, seed=4, strength=30.0)
