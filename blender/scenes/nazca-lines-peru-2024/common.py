"""nazca-lines-peru-2024 shared helpers (code-only batch 2026-11-05, RENDER HOLD: nothing rendered yet).
Built on blender/kit (cine/camera/world/mat/models) with the mh370 CINE v2 budget (24 spp, 6 bounces).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm), close-ups only as accents; every shot one
eased dolly / push / orbit / crane (kit cruise ease); NO shake, kicks or handheld.
Frame-0 artifact: File:Lineas de Nazca, Nazca, Peru, 2015-07-29, DD 52.JPG (Diego Delso), Wikimedia Commons, CC BY-SA 4.0; chip "Photo: Diego Delso, CC BY-SA 4.0" (attribution + share-alike apply to the finished Short); local copy blender/scenes/nazca-lines-peru-2024/artifact.jpg (no sign-in). PNAS 2024 figures (Sakai et al.) are NOT used: licence not checked as reusable."""
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


# ================================================================ nazca-lines-peru-2024 builders
# Nazca pampa: dark iron-oxide stones over pale ground; lines are the pale ground where stones were cleared
# (light ribbons slightly below the stone layer). Figures here are simplified tracings, not survey-accurate copies;
# the frame-0 artifact is the real CC BY-SA 4.0 aerial photo (Diego Delso). 2024 AI finds = small 'relief-type'
# figures beside walking trails (humans, llamas, killer whales with knives).
def pampa(NF, sun_az=60.0, elev=32.0, warmth='noon', size=12000, haze=True):
    CN.hdri_sun('kloppenheim_02_puresky', sun_az=sun_az, strength=1.0)
    CN.sun(elev=elev, az=sun_az, warmth=warmth, strength=4.2, check=False)
    CN.ground('Pampa', 'dry_ground_rocks', (size, size), tile_m=4.0, tint=(0.62, 0.36, 0.22))
    if haze:
        CN.haze(center=(0, 0, 120), size=(size, size, 240), density=0.0004, color=(1.0, 0.9, 0.8))


def line_mat():
    return mat_once('GlyphLine', base=(0.78, 0.66, 0.5), rough=1.0, bump=0.25, bump_scale=30, grime=0.15)


def hummingbird(name='Hummingbird', loc=(0, 0, 0), scale=1.0, w=1.2):
    """Simplified single-line hummingbird (~95 m beak to tail at scale 1): long beak, head, body, two feathered
    wings, tail fan."""
    m = line_mat()
    s = scale
    def T(pts):
        return [(loc[0] + x * s, loc[1] + y * s) for x, y in pts]
    beak = [(0, 48), (0, 20)]
    head = [(0, 20)] + [(6 * math.sin(a), 14 + 6 * math.cos(a)) for a in [i * math.pi / 8 for i in range(17)]]
    body = [(-5, 10), (-6, -10), (-3, -25), (3, -25), (6, -10), (5, 10)]
    tail = [(-3, -25), (-8, -44), (-4, -36), (0, -46), (4, -36), (8, -44), (3, -25)]
    out = [ribbon(name + 'Beak', T(beak), w, m), ribbon(name + 'Head', T(head), w, m), ribbon(name + 'Body', T(body), w, m),
           ribbon(name + 'Tail', T(tail), w, m)]
    for sg in (1, -1):
        wing = [(sg * 5, 4)]
        for k in range(5):
            wing += [(sg * (14 + 7 * k), 10 - 3 * k), (sg * (18 + 7 * k), 2 - 3 * k)]
        wing += [(sg * 6, -6)]
        out.append(ribbon(name + 'Wing%d' % sg, T(wing), w, m))
    return out


def monkey(name='Monkey', loc=(0, 0, 0), scale=1.0, w=1.0):
    """Monkey with the famous spiral tail (Archimedean spiral) and zigzag body/limbs."""
    m = line_mat()
    s = scale
    sp = [(30 + (2 + 1.6 * t) * math.cos(t), -10 + (2 + 1.6 * t) * math.sin(t)) for t in [i * 0.2 for i in range(70)]]
    body = [(-20, 20), (-10, 30), (0, 22), (10, 30), (20, 18), (14, 4), (24, -6), (14, -16), (8, -6), (0, -18),
            (-8, -8), (-16, -18), (-24, -4), (-14, 6), (-20, 20)]
    T = lambda pts: [(loc[0] + x * s, loc[1] + y * s) for x, y in pts]
    return [ribbon(name + 'Tail', T(sp[::-1]), w, m), ribbon(name + 'Body', T(body), w, m)]


def spider(name='Spider', loc=(0, 0, 0), scale=1.0, w=0.9):
    m = line_mat()
    T = lambda pts: [(loc[0] + x * scale, loc[1] + y * scale) for x, y in pts]
    body = [(5 * math.cos(a), 8 * math.sin(a)) for a in [i * math.pi / 10 for i in range(21)]]
    out = [ribbon(name + 'Body', T(body), w, m)]
    for k in range(4):
        for sg in (1, -1):
            out.append(ribbon(name + 'Leg%d%d' % (k, sg), T([(sg * 4, 4 - 3 * k), (sg * 16, 10 - 4 * k), (sg * 22, -2 - 6 * k)]), w, m))
    return out


def long_lines(n=7, seed=9, L=(800, 2500), w=2.2):
    """The long straight lines / trapezoids that run for kilometres across the pampa."""
    rr = random.Random(seed)
    m = line_mat()
    out = []
    for k in range(n):
        a = rr.uniform(0, math.pi)
        c = Vector((rr.uniform(-600, 600), rr.uniform(-600, 600)))
        d = Vector((math.cos(a), math.sin(a))) * rr.uniform(*L) / 2
        out.append(ribbon('LongLine%d' % k, [tuple(c - d), tuple(c + d)], w * rr.uniform(0.8, 2.5), m, z=0.015))
    return out


def stones(center=(0, 0), radius=12.0, n=900, seed=4, cleared=None):
    """Loose dark iron-oxide stones (close shots). cleared=(p0, p1, half_width): keep a path free (the line)."""
    rr = random.Random(seed)
    m = mat_once('OxideStone', base=(0.16, 0.07, 0.04), rough=0.55, bump=0.5, bump_scale=40, grime=0.2)
    verts, faces = [], []
    for i in range(n):
        x, y = center[0] + rr.uniform(-radius, radius), center[1] + rr.uniform(-radius, radius)
        if cleared:
            p0, p1, hw = Vector(cleared[0]), Vector(cleared[1]), cleared[2]
            ab = p1 - p0
            t = max(0, min(1, (Vector((x, y)) - p0).dot(ab) / ab.length_squared))
            if (p0 + ab * t - Vector((x, y))).length < hw:
                continue
        s = rr.uniform(0.03, 0.09)
        b = len(verts)
        h = s * rr.uniform(0.4, 0.8)
        verts += [(x - s, y - s, 0), (x + s, y - s, 0), (x + s, y + s, 0), (x - s, y + s, 0),
                  (x - s * 0.7, y - s * 0.7, h), (x + s * 0.7, y - s * 0.7, h), (x + s * 0.7, y + s * 0.7, h), (x - s * 0.7, y + s * 0.7, h)]
        faces += [(b, b + 1, b + 5, b + 4), (b + 1, b + 2, b + 6, b + 5), (b + 2, b + 3, b + 7, b + 6), (b + 3, b, b + 4, b + 7),
                  (b + 4, b + 5, b + 6, b + 7)]
    return Md.mesh_obj('Stones', verts, faces, smooth=False, mats=(m,))


def foothills(center=(0, 900, 0), seed=3, height=90.0, size=2400):
    m = mat_once('HillRock', base=(0.45, 0.28, 0.17), rough=0.95, bump=0.6, bump_scale=3, grime=0.3)
    return Wd.terrain('Foothills', size=size, res=180, height=height, scale=0.0016, center=center, seed=seed, mat=m)


def slope_figure(name, kind, loc, scale=1.0, tilt=18.0, yaw=0.0, w=0.35):
    """Small relief-type figure (~5-20 m) on a gentle hillside beside a trail: 'orca' (with a knife), 'human',
    'llama'. Built flat then tilted to the slope."""
    m = line_mat()
    if kind == 'orca':
        body = [(9 * math.cos(a), 3.2 * math.sin(a) * (1 - 0.4 * math.cos(a))) for a in [i * math.pi / 12 for i in range(25)]]
        fin = [(-1, 2.6), (1, 5.5), (2.5, 2.4)]
        tail = [(-9, 0), (-12, 2.5), (-11, 0), (-12, -2.5), (-9, 0)]
        knife_ = [(4, -2.6), (5, -5.0), (7.5, -7.5), (5.6, -5.2)]
        parts = [body, fin, tail, knife_]
    elif kind == 'human':
        head = [(1.5 * math.cos(a), 6 + 1.5 * math.sin(a)) for a in [i * math.pi / 8 for i in range(17)]]
        parts = [head, [(0, 4.5), (0, -1)], [(-3, 2.5), (0, 3.5), (3, 2.5)], [(-2, -5), (0, -1), (2, -5)]]
    else:
        parts = [[(-5, 0), (4, 0), (4, -4), (4, 0), (6, 4), (7, 4.5), (5.5, 3)], [(-5, 0), (-5, -4)], [(-3, 0), (-3, -4)],
                 [(2, 0), (2, -4)], [(-5, 0), (-6.5, 1)]]
    root = Md.empty(name, loc)
    for i, p in enumerate(parts):
        o = ribbon('%s%d' % (name, i), [(x * scale, y * scale) for x, y in p], w * scale, m, z=0.02)
        o.parent = root
    root.rotation_euler = (math.radians(tilt), 0, math.radians(yaw))
    return root


def trail(name='Trail', pts=((-200, -20), (-80, 0), (0, 4), (90, -10), (220, 10)), w=1.4):
    m = mat_once('TrailM', base=(0.6, 0.48, 0.36), rough=1.0, grime=0.2)
    return ribbon(name, pts, w, m, z=0.012)


def ai_grid(NF, center=(0, 0), n=10, cell=60.0, hits=(), seed=6, f_on=0.15, f_all=0.75, color=(0.6, 0.95, 0.9)):
    """Survey grid floating 1 m above the pampa: faint cells, 'hit' cells lighting up one after another."""
    rr = random.Random(seed)
    edge = glow_mat('GridEdge', color, 1.2)
    key_fac(edge, [(0, 0.0), (int(NF * f_on), 0.55), (NF, 0.45)])
    half = n * cell / 2
    for k in range(n + 1):
        x = center[0] - half + k * cell
        ribbon('GX%d' % k, [(x, center[1] - half), (x, center[1] + half)], 0.6, edge, z=1.0)
        y = center[1] - half + k * cell
        ribbon('GY%d' % k, [(center[0] - half, y), (center[0] + half, y)], 0.6, edge, z=1.0)
    hit = list(hits) or [(rr.randrange(n), rr.randrange(n)) for _ in range(int(n * n * 0.18))]
    for idx, (i, j) in enumerate(hit):
        m = glow_mat('Hit%d' % idx, color, 2.4)
        x0, y0 = center[0] - half + i * cell, center[1] - half + j * cell
        ribbon('HitC%d' % idx, [(x0 + 3, y0 + 3), (x0 + cell - 3, y0 + 3), (x0 + cell - 3, y0 + cell - 3), (x0 + 3, y0 + cell - 3)],
               1.2, m, z=1.1, closed=True)
        f = int(NF * f_on + (NF * (f_all - f_on)) * idx / max(1, len(hit)))
        key_fac(m, [(max(0, f - 1), 0.0), (f, 1.0), (NF, 0.75)])


def light_plane(name='Plane', loc=(0, 0, 300)):
    """Small high-wing light aircraft (generic, no markings)."""
    w = mat_once('PlaneWhite', base=(0.8, 0.8, 0.78), rough=0.4)
    root = Md.empty(name, loc)
    ps = [cyl(name + 'Fus', (0, -4, 0), (0, 3.5, 0), 0.6, w, 16), boxm(name + 'Wing', (0, 0.8, 0.75), (11, 1.5, 0.15), w, 0.05),
          boxm(name + 'Stab', (0, -3.9, 0.3), (3.6, 0.9, 0.08), w), boxm(name + 'Fin', (0, -3.9, 1.0), (0.1, 1.0, 1.3), w)]
    for p in ps:
        p.parent = root
    return root


def hiker(name, loc, yaw=0.0):
    """1920s field archaeologist silhouette, back to camera / far: hat, jacket, stick. No face."""
    jacket = mat_once('Jacket', base=(0.2, 0.16, 0.11), rough=0.85)
    hatm = mat_once('Hat', base=(0.32, 0.27, 0.2), rough=0.8)
    root = Md.empty(name, loc)
    ps = [cyl(name + 'LegL', (-0.1, 0, 0), (-0.1, 0.05, 0.86), 0.075, jacket, 10),
          cyl(name + 'LegR', (0.1, 0, 0), (0.1, -0.08, 0.86), 0.075, jacket, 10),
          cyl(name + 'Body', (0, 0, 0.86), (0, 0, 1.45), 0.2, jacket, 14),
          sphere(name + 'Head', (0, 0, 1.6), 0.11, jacket, seg=16),
          cyl(name + 'Brim', (0, 0, 1.68), (0, 0, 1.69), 0.24, hatm, 20),
          cyl(name + 'Crown', (0, 0, 1.68), (0, 0, 1.8), 0.12, hatm, 16),
          cyl(name + 'Stick', (0.3, 0.2, 0), (0.28, 0.12, 1.25), 0.015, hatm, 6)]
    for p in ps:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def walk(o, NF, p0, p1):
    key_loc(o, [(0, p0), (NF, p1)], interp='LINEAR')
