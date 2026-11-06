"""usa-32-farrah-2026 shared helpers (code-only, task B 2026-11-06 01:xx IST, RENDER HOLD: nothing rendered yet).
Built on blender/kit (cine/camera/world/mat/models) with the mh370 CINE v2 budget (24 spp, 6 bounces).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm), close-ups only as accents; every shot one
eased dolly / push / orbit / crane (kit cruise ease); NO shake, kicks or handheld.
Frame-0 artifact: File:Titan 23G rocket.gif, Wikimedia Commons, US Air Force photo of Titan II(23)G-01 at Vandenberg, 5 Sep 1988 (the first Titan 23G launch = USA 32's launch), public domain (PD-USGov-Military-Air-Force); chip "Titan II launch, 5 Sep 1988, USAF photo, PD"; local copy artifact.jpg.
Scale: 1 unit = 1 m for the satellite, Earth is a stylised sphere r=1000 u (not to scale) so the limb reads in a wide.
Telling rules: 'analysts say Farrah Three'; cause unknown; shot-down = online question, no government said it; 3,500 fragments = one modelling firm's estimate."""
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



# ================================================================ usa-32-farrah-2026 builders
EARTH_C = Vector((0, 0, -1200.0))
EARTH_R = 1000.0
ORBIT_R = 1200.0          # stylised orbit radius about EARTH_C (satellite sits 200 u above the surface)


def space(sun_az=120, sun_elev=28, sun_strength=3.2, stars=1.0):
    """Black sky with a fine starfield, one hard sun, no volumes (space)."""
    Wd.hdri('qwantani_night_puresky', strength=0.01, bg_strength=0.5, rot=40, tint=(0.8, 0.85, 1.0), stars=stars)
    CN.sun(elev=sun_elev, az=sun_az, warmth='noon', strength=sun_strength, check=False)


def earth_mat(name='EarthM', dark=False):
    """Stylised Earth: deep ocean + muted land + cloud streaks from layered noise (no image needed)."""
    m, nb, b, out = M.new(name)
    tc = nb.n('ShaderNodeTexCoord')
    n1 = nb.n('ShaderNodeTexNoise', Scale=5.0, Detail=8.0, Roughness=0.55)
    nb.l(tc, 'Object', n1, 'Vector')
    ramp = nb.n('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.elements[0].position = 0.46
    cr.elements[0].color = (0.012, 0.045, 0.11, 1) if not dark else (0.004, 0.012, 0.03, 1)
    cr.elements[1].position = 0.56
    cr.elements[1].color = (0.12, 0.2, 0.1, 1) if not dark else (0.02, 0.03, 0.02, 1)
    e = cr.elements.new(0.80)
    e.color = (0.35, 0.3, 0.2, 1) if not dark else (0.04, 0.035, 0.03, 1)
    nb.l(n1, 'Fac', ramp, 'Fac')
    n2 = nb.n('ShaderNodeTexNoise', Scale=11.0, Detail=6.0, Roughness=0.6)
    nb.l(tc, 'Object', n2, 'Vector')
    cl = nb.n('ShaderNodeValToRGB')
    cl.color_ramp.elements[0].position = 0.55
    cl.color_ramp.elements[0].color = (0, 0, 0, 1)
    cl.color_ramp.elements[1].position = 0.72
    cl.color_ramp.elements[1].color = (0.9, 0.92, 0.95, 1) if not dark else (0.08, 0.09, 0.11, 1)
    nb.l(n2, 'Fac', cl, 'Fac')
    mix = nb.n('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'ADD'
    mix.inputs['Factor'].default_value = 1.0
    nb.l(ramp, 'Color', mix, 6)
    nb.l(cl, 'Color', mix, 7)
    nb.l(mix, 2, b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.6
    return m


def earth(dark=False):
    """Big stylised Earth (r=1000 u) + a thin blue atmosphere shell that glows at the limb."""
    o = sphere('Earth', tuple(EARTH_C), EARTH_R, earth_mat('EarthM', dark), seg=96)
    am, nb, b, out = M.new('AtmoM')
    M.no_light(am)
    am.node_tree.nodes.remove(b)
    lw = nb.n('ShaderNodeLayerWeight', Blend=0.35)
    pw = nb.math('POWER', lw.outputs['Fresnel'], vb=2.2)
    gain = nb.math('MULTIPLY', pw.outputs[0], vb=1.6, clamp=True)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=3.0)
    em.inputs['Color'].default_value = (0.25, 0.5, 1.0, 1) if not dark else (0.05, 0.1, 0.25, 1)
    mx = nb.n('ShaderNodeMixShader')
    nb.l(gain, 0, mx, 'Fac')
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    a = sphere('Atmosphere', tuple(EARTH_C), EARTH_R * 1.018, am, seg=96)
    a.visible_shadow = False
    return o


def gold():
    return mat_once('SatGold', base=(0.72, 0.5, 0.16), rough=0.28, metal=1.0, bump=0.2)


def panel_mat():
    return mat_once('SatPanel', base=(0.02, 0.04, 0.12), rough=0.25, metal=0.6)


def dish_mat():
    return mat_once('SatDish', base=(0.55, 0.56, 0.58), rough=0.35, metal=0.9)


def label_text(name, body, loc, size=0.7, rot=(math.radians(90), 0, 0), color=(0.9, 0.9, 0.92), parent=None):
    """Flat stencil text (extruded a hair). Falls back to nothing if no font is available."""
    try:
        cu = bpy.data.curves.new(name, 'FONT')
        cu.body = body
        cu.size = size
        cu.extrude = 0.02
        cu.align_x = 'CENTER'
        o = link(bpy.data.objects.new(name, cu))
        o.location = loc
        o.rotation_euler = rot
        o.data.materials.append(mat_once('Stencil', base=color, rough=0.5))
        if parent:
            o.parent = parent
        return o
    except Exception:
        return None


def satellite(name='USA32', loc=(0, 0, 0), spin_deg=0.0, NF=60, scale=1.0, stencil=False):
    """FARRAH-class 'tuna can': squat gold-foil cylinder, three radial dish antennas on arms, three solar panels.
    Generic (no real-photo claim). Returns (root, parts) where parts are the child objects (for shattering)."""
    root = link(bpy.data.objects.new(name, None))
    root.location = loc
    root.scale = (scale, scale, scale)
    parts = []
    body = cyl(name + 'Body', (0, 0, -1.7), (0, 0, 1.7), 3.0, gold(), seg=40)
    body.parent = root
    parts.append(body)
    for k in range(3):
        ang = math.radians(120 * k + 30)
        dx, dy = math.cos(ang), math.sin(ang)
        arm = cyl('%sArm%d' % (name, k), (dx * 3.0, dy * 3.0, 0.3), (dx * 6.0, dy * 6.0, 0.3), 0.12, dish_mat(), seg=10)
        arm.parent = root
        dish = sphere('%sDish%d' % (name, k), (dx * 6.8, dy * 6.8, 0.3), 1.6, dish_mat(), scale=(0.25, 1.0, 1.0), seg=24)
        dish.rotation_euler = (0, 0, ang)
        dish.parent = root
        ang2 = math.radians(120 * k + 90)
        pn = boxm('%sPanel%d' % (name, k), (math.cos(ang2) * 6.4, math.sin(ang2) * 6.4, -0.8), (4.2, 0.12, 2.2), panel_mat())
        pn.rotation_euler = (0, 0, ang2 + math.pi / 2)
        pn.parent = root
        parts += [arm, dish, pn]
    if stencil:
        label_text(name + 'Tag', 'USA 32', (0, -3.05, 0.2), size=0.9, parent=root)
    if spin_deg:
        for f, z in ((0, 0.0), (NF, math.radians(spin_deg))):
            root.rotation_euler = (0, 0, z)
            root.keyframe_insert('rotation_euler', frame=f)
        M.set_interp(root, 'LINEAR')
    return root, parts


def flash(name, loc, f0, NF, r0=0.5, r1=9.0, color=(1.0, 0.95, 0.85), strength=14.0, dur=14):
    m = glow_mat(name + 'M', color, strength)
    o = sphere(name, loc, 1.0, m, seg=24)
    for f, s, v in ((max(0, f0 - 1), r0, 0.0), (f0, r0, 1.0), (min(NF, f0 + dur), r1, 0.0)):
        o.scale = (s, s, s)
        o.keyframe_insert('scale', frame=f)
        key_fac(m, [(f, v)])
    return o


def shards(n, center, f0, NF, spread=40.0, size=0.35, seed=3, along=None, speed=1.0, mat=None):
    """n small foil shards flying outward from `center` starting at frame f0 (two keyframes each; Bezier = eased).
    `along` (unit Vector) stretches the cloud along an orbit direction so it reads as a ribbon."""
    rnd = random.Random(seed)
    mt = mat or mat_once('Shard', base=(0.7, 0.62, 0.45), rough=0.3, metal=1.0)
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    proto = bpy.context.active_object
    proto.name = 'ShardProto'
    M.assign(proto, mt)
    proto.hide_render = True
    out = []
    c = Vector(center)
    for i in range(n):
        o = proto.copy()
        o.data = proto.data
        o.name = 'Shard%d' % i
        o.hide_render = False
        link(o)
        d = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)))
        d = d.normalized() if d.length > 1e-6 else Vector((1, 0, 0))
        if along is not None:
            d = (d * 0.35 + Vector(along) * rnd.choice((-1, 1)) * rnd.uniform(0.6, 1.4)).normalized()
        dist = spread * rnd.uniform(0.25, 1.0) * speed
        s = size * rnd.uniform(0.4, 1.8)
        o.scale = (s, s * rnd.uniform(0.3, 1.0), s * rnd.uniform(0.2, 0.8))
        o.rotation_euler = (rnd.uniform(0, 6.28), rnd.uniform(0, 6.28), rnd.uniform(0, 6.28))
        o.location = c
        o.keyframe_insert('location', frame=f0)
        o.keyframe_insert('rotation_euler', frame=f0)
        o.location = c + d * dist
        o.rotation_euler = (rnd.uniform(0, 12), rnd.uniform(0, 12), rnd.uniform(0, 12))
        o.keyframe_insert('location', frame=NF)
        o.keyframe_insert('rotation_euler', frame=NF)
        out.append(o)
    return out


def drift_parts(parts, f0, NF, dist=18.0, seed=5):
    """Big satellite parts (arms, dishes, panels, body) tumble away from the centre after the break."""
    rnd = random.Random(seed)
    for p in parts:
        if p.rotation_mode == 'QUATERNION':
            e = p.rotation_quaternion.to_euler()
            p.rotation_mode = 'XYZ'
            p.rotation_euler = e
        p.keyframe_insert('location', frame=f0)
        p.keyframe_insert('rotation_euler', frame=f0)
        d = Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0, 1)))
        d = d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))
        p.location = Vector(p.location) + d * dist * rnd.uniform(0.5, 1.2)
        e0 = p.rotation_euler
        p.rotation_euler = (e0[0] + rnd.uniform(-3, 3), e0[1] + rnd.uniform(-3, 3), e0[2] + rnd.uniform(-3, 3))
        p.keyframe_insert('location', frame=NF)
        p.keyframe_insert('rotation_euler', frame=NF)


def orbit_ring(name='OrbitRing', r=ORBIT_R, color=(1.0, 0.72, 0.3), strength=2.0, tilt=90.0, w=0.5, grow=None, NF=60):
    """Thin glowing orbit ring about the Earth centre (polar-ish: tilted 85 deg). grow=(f0,f1) draws it on."""
    m = glow_mat(name + 'M', color, strength)
    o = ring_mesh(name, r, w, 256)
    o.location = tuple(EARTH_C)
    o.rotation_euler = (math.radians(tilt), 0, 0)
    o.data.materials.append(m)
    if grow:
        key_fac(m, [(0, 0.0), (grow[0], 0.0), (grow[1], 1.0)])
    return o


def orbit_point(angle_deg, r=ORBIT_R, tilt=90.0, rz=0.0):
    """World position on the orbit ring at `angle_deg`; tilt 90 / rz 0 = ring in the x-z plane, face-on to a camera looking +y, angle 90 = the origin (where the satellite sits)."""
    a = math.radians(angle_deg)
    p = Vector((math.cos(a) * r, math.sin(a) * r, 0))
    p = Matrix.Rotation(math.radians(rz), 4, 'Z') @ Matrix.Rotation(math.radians(tilt), 4, 'X') @ p
    return p + EARTH_C


def marker(name, loc, r=2.0, color=(1.0, 0.72, 0.3), strength=7.0):
    return sphere(name, loc, r, glow_mat(name + 'M', color, strength), seg=20)
