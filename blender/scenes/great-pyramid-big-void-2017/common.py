"""great-pyramid-big-void-2017 shared helpers (code-only batch 2026-11-05, RENDER HOLD: nothing rendered yet).
Built on blender/kit (cine/camera/world/mat/models) with the mh370 CINE v2 budget (24 spp, 6 bounces).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm), close-ups only as accents; every shot one
eased dolly / push / orbit / crane (kit cruise ease); NO shake, kicks or handheld.
Frame-0 artifact: File:East-West cut view of the Great Pyramid and front view of the North face Chevron area.png, Wikimedia Commons, CC BY 4.0 (ScanPyramids / Nature 2017 figure), credit chip "ScanPyramids, CC BY 4.0"; local copy blender/scenes/great-pyramid-big-void-2017/artifact.jpg (no sign-in)"""
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


# ================================================================ great-pyramid-big-void-2017 builders
# Units: metres. Pyramid base centre at origin, +Y = north (entrance side), apex z = 146.6.
# Interior layout is a simplified diagram after the ScanPyramids/Nature 2017 E-W cut (the real file is the frame-0
# artifact): descending + ascending passages, Queen's Chamber, Grand Gallery, King's Chamber, Big Void above the
# Grand Gallery, North Face Corridor behind the chevrons. Never shows people inside, no invented 'treasure'.
BASE, HGT = 230.3, 146.6


def limestone(name='Limestone', tint=(0.70, 0.58, 0.42)):
    return mat_once(name, base=tint, rough=0.92, bump=0.6, bump_scale=6.0, grime=0.35, rough_noise=0.12)


def desert(NF, sun_az=115.0, elev=9.0, haze=True, strength=4.0):
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=sun_az, strength=0.9)
    s = CN.sun(elev=elev, az=sun_az, warmth='golden', strength=strength, check=False)
    CN.ground('Sand', 'dry_ground_rocks', (9000, 9000), tile_m=5.0, tint=(1.0, 0.8, 0.58))
    if haze:
        CN.haze(center=(0, 0, 160), size=(9000, 9000, 320), density=0.0005, color=(1.0, 0.9, 0.78))
    return s


def great_pyramid(name='Khufu', courses=56, cut=False, loc=(0, 0, 0)):
    """Stepped core courses (casing long gone). cut=True keeps only the +X half so the E-W section faces -X."""
    root = Md.empty(name, loc)
    m = limestone()
    m2 = limestone('Limestone2', (0.64, 0.53, 0.39))
    for k in range(courses):
        z0, z1 = HGT * k / courses, HGT * (k + 1) / courses
        s = BASE * (1 - z0 / HGT)
        if s < 0.8:
            break
        if cut:
            o = boxm('%sC%02d' % (name, k), (s / 4, 0, (z0 + z1) / 2), (s / 2, s, z1 - z0), m if k % 3 else m2)
        else:
            o = boxm('%sC%02d' % (name, k), (0, 0, (z0 + z1) / 2), (s, s, z1 - z0), m if k % 3 else m2)
        o.parent = root
    return root


def recess(name, a, b, hgt, mat, x=-0.25, th=0.5):
    """Dark passage drawn on the section face from a=(y,z) to b=(y,z) (inclined box)."""
    (y0, z0), (y1, z1) = a, b
    L = math.hypot(y1 - y0, z1 - z0)
    o = boxm(name, (x, (y0 + y1) / 2, (z0 + z1) / 2), (th, L, hgt), mat)
    o.rotation_euler = (math.atan2(z1 - z0, y1 - y0), 0, 0)
    return o


def interior_section():
    """Known spaces as dark recesses on the cut face; returns dict of hero points."""
    cav = mat_once('Cavity', base=(0.012, 0.009, 0.007), rough=1.0)
    recess('Descending', (58, 17), (20, -2), 1.2, cav)
    recess('Ascending', (36, 9), (22, 21.5), 1.2, cav)
    recess('GrandGallery', (22, 22), (-24, 44), 8.6, cav)
    recess('QueenPass', (22, 21.5), (2.5, 21.5), 1.2, cav)
    boxm('QueensChamber', (-0.25, 0, 24), (0.5, 5.2, 6.2), cav)
    recess('KingPass', (-24, 43.5), (-31, 43.5), 1.1, cav)
    boxm('KingsChamber', (-0.25, -36, 46.5), (0.5, 10.5, 5.8), cav)
    for k in range(5):
        boxm('Relief%d' % k, (-0.25, -36, 51 + 2.2 * k), (0.5, 10.5, 1.0), cav)
    boxm('NFCorridor', (-0.25, 53, 25), (0.5, 9.0, 2.0), cav)
    return {'void': Vector((-0.3, -4, 54)), 'queen': Vector((-0.3, 0, 24)), 'gallery': Vector((-0.3, 0, 33)),
            'nfc': Vector((-0.3, 53, 25))}


def big_void(alt=False, color=(0.55, 0.85, 1.0), strength=3.0):
    """ScanPyramids Big Void (SP-BV), >= 30 m, Grand-Gallery-like section, above the gallery. alt=True adds the
    published inclined hypothesis as a second, fainter glow. Returns the glow materials (animate with key_fac)."""
    mh = glow_mat('VoidH', color, strength)
    boxm('VoidHoriz', (-0.4, -4, 54), (0.6, 30, 8.0), mh)
    mats = [mh]
    if alt:
        mi = glow_mat('VoidIncl', (0.6, 1.0, 0.75), strength * 0.8)
        o = boxm('VoidIncl', (-0.45, -2, 51), (0.6, 30, 8.0), mi)
        o.rotation_euler = (math.atan2(22, 46), 0, 0)
        mats.append(mi)
    return mats


def muon_rain(NF, n=70, area=(-150, 150, -150, 150), top=420, bottom=-40, seed=3, groups=5, color=(0.7, 0.9, 1.0),
              strength=5.0, bevel=0.12, through=None):
    """Cosmic-ray muons as thin streaks falling near-vertically (zenith-peaked angles), staggered growth over NF.
    through=(centre Vector, radius): extra streaks forced through that region (more muons pass an empty space)."""
    rr = random.Random(seed)
    objs = []
    for g in range(groups):
        m = glow_mat('Muon%d' % g, color, strength * rr.uniform(0.7, 1.1))
        cu = bpy.data.curves.new('MuonC%d' % g, 'CURVE')
        cu.dimensions = '3D'
        cu.bevel_depth = bevel
        for i in range(n // groups):
            x, y = rr.uniform(area[0], area[1]), rr.uniform(area[2], area[3])
            if through is not None and i % 3 == 0:
                x, y = through[0].x + rr.uniform(-1, 1) * through[1], through[0].y + rr.uniform(-1, 1) * through[1]
            th = rr.gauss(0, 0.18)
            ph = rr.uniform(0, 2 * math.pi)
            dx, dy = math.tan(th) * math.cos(ph), math.tan(th) * math.sin(ph)
            sp = cu.splines.new('POLY')
            sp.points.add(1)
            sp.points[0].co = (x + dx * (top - bottom), y + dy * (top - bottom), top, 1)
            sp.points[1].co = (x, y, bottom, 1)
        o = link(bpy.data.objects.new('Muons%d' % g, cu))
        o.data.materials.append(m)
        o.visible_shadow = False
        f0 = int(NF * g / (groups + 1))
        grow_curve(o, [(f0, 0.0), (min(NF, f0 + int(NF * 0.45)), 1.0)])
        key_fac(m, [(f0, 0.0), (f0 + 6, 1.0), (NF, 0.65)])
        objs.append(o)
    return objs


def detector(name, loc, yaw=0.0):
    """Muon detector stack (emulsion-film / scintillator box) with a small status LED."""
    dark = mat_once('DetBox', base=(0.06, 0.065, 0.07), rough=0.45, metal=0.5, grime=0.2)
    plate = mat_once('DetPlate', base=(0.55, 0.56, 0.58), rough=0.3, metal=0.9)
    led = M.emission('DetLED', (0.3, 1.0, 0.45), 8.0)
    root = Md.empty(name, loc)
    parts = [boxm(name + 'Body', (0, 0, 0.35), (1.2, 0.8, 0.7), dark, 0.02)]
    for k in range(4):
        parts.append(boxm(name + 'P%d' % k, (0, 0, 0.74 + 0.05 * k), (1.1, 0.72, 0.02), plate))
    parts.append(boxm(name + 'Led', (0.5, -0.41, 0.6), (0.06, 0.01, 0.03), led))
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def stone_room(name, size=(5.2, 5.8, 6.2), gable=True, tint=(0.66, 0.56, 0.44)):
    """Granite/limestone chamber around the origin (floor z=0), open nowhere: camera sits inside."""
    m = limestone(name + 'M', tint)
    sx, sy, sz = size
    boxm(name + 'F', (0, 0, -0.1), (sx + 0.4, sy + 0.4, 0.2), m)
    for s in (1, -1):
        boxm(name + 'Wx%d' % s, (s * (sx / 2 + 0.1), 0, sz / 2), (0.2, sy + 0.4, sz), m)
        boxm(name + 'Wy%d' % s, (0, s * (sy / 2 + 0.1), sz / 2), (sx + 0.4, 0.2, sz), m)
    if gable:
        for s in (1, -1):
            o = boxm(name + 'G%d' % s, (s * sx / 4, 0, sz + sx / 4 - 0.2), (sx / 2 * 1.45, sy + 0.4, 0.5), m)
            o.rotation_euler = (0, math.radians(-s * 40), 0)
    else:
        boxm(name + 'Ceil', (0, 0, sz + 0.1), (sx + 0.4, sy + 0.4, 0.2), m)
    return m


def grand_gallery(L=47.0, slope=26.0):
    """Grand Gallery as a straight inclined hall: ramp floor, 7 corbelled courses per wall, narrow roof slot,
    modern handrail light strips. Built along +Y rising by `slope` deg from origin. Returns (bottom, top) points."""
    m = limestone('GalleryM', (0.72, 0.62, 0.48))
    a = math.radians(slope)
    root = Md.empty('Gallery', (0, 0, 0))
    parts = [boxm('GFloor', (0, L / 2, -0.15), (2.1, L, 0.3), m)]
    for k in range(7):
        w = 2.1 + 0.0 - 0.0
        x = 1.05 - 0.075 * k
        for s in (1, -1):
            parts.append(boxm('GCourse%d_%d' % (k, s), (s * (x + 0.5), L / 2, 2.3 + 0.9 * k), (1.0, L, 0.9), m))
    for s in (1, -1):
        parts.append(boxm('GLow%d' % s, (s * 1.55, L / 2, 1.15), (1.0, L, 2.3), m))
    parts.append(boxm('GRoof', (0, L / 2, 8.75), (2.4, L, 0.3), m))
    strip = M.emission('GStrip', (1.0, 0.78, 0.5), 6.0)
    for s in (1, -1):
        parts.append(boxm('GStrip%d' % s, (s * 0.9, L / 2, 0.75), (0.04, L, 0.04), strip))
    for p in parts:
        p.parent = root
    root.rotation_euler = (a, 0, 0)
    return Vector((0, 0, 0)), Vector((0, L * math.cos(a), L * math.sin(a)))


def nf_corridor(L=9.0, w=2.1):
    """North Face Corridor: ~9 m long, ~2 m wide, gabled (chevron) limestone roof, empty floor; open at y=0
    where a crack lets the endoscope in. Origin at the crack, corridor along +Y."""
    m = limestone('NFCM', (0.68, 0.58, 0.45))
    boxm('NFloor', (0, L / 2, -0.1), (w, L, 0.2), m)
    for s in (1, -1):
        boxm('NWall%d' % s, (s * (w / 2 + 0.15), L / 2, 0.6), (0.3, L, 1.2), m)
        o = boxm('NRoof%d' % s, (s * w / 4, L / 2, 1.2 + w / 4), (w / 2 * 1.5, L, 0.35), m)
        o.rotation_euler = (0, math.radians(-s * 45), 0)
    boxm('NEnd', (0, L + 0.15, 1.0), (w + 0.6, 0.3, 2.4), m)
    for s in (1, -1):
        boxm('NCrackWall%d' % s, (s * (w / 4 + 0.05), -0.15, 1.0), (w / 2 - 0.05, 0.3, 2.4), m)
    return m


def endoscope(NF, path_y=(0.0, 3.2), z=1.0, tip_power=6.0):
    """6 mm endoscope cable with a bright tip light creeping in through the crack (keyed along +Y)."""
    cab = mat_once('ScopeCable', base=(0.02, 0.02, 0.02), rough=0.35, metal=0.2)
    c = cyl('ScopeCable', (0, -1.0, z), (0, path_y[1], z), 0.006, cab, 10)
    tip = Wd.point('ScopeTip', (0, path_y[0], z), color=(0.9, 0.95, 1.0), power=tip_power, radius=0.01)
    key_loc(tip, [(0, (0, path_y[0], z)), (NF, (0, path_y[1], z))])
    head = sphere('ScopeHead', (0, path_y[0], z), 0.01, M.emission('ScopeLens', (0.9, 0.95, 1.0), 20.0), seg=12)
    key_loc(head, [(0, (0, path_y[0], z)), (NF, (0, path_y[1], z))])
    c.scale = (1, 1, 1)
    return tip


def block_wall(name='Blocks', nx=16, nz=9, size=(1.3, 1.0), origin=(0, 0, 0), seed=5):
    """Wall of jittered limestone blocks facing -Y (the 'millions of blocks' read)."""
    rr = random.Random(seed)
    ms = [limestone('BlkA', (0.70, 0.58, 0.42)), limestone('BlkB', (0.62, 0.52, 0.38)),
          limestone('BlkC', (0.75, 0.64, 0.48))]
    ox, oy, oz = origin
    for j in range(nz):
        off = (j % 2) * size[0] / 2
        for i in range(nx):
            w = size[0] * rr.uniform(0.85, 1.12)
            boxm('%s%d_%d' % (name, i, j), (ox + i * size[0] + off, oy + rr.uniform(-0.04, 0.04), oz + j * size[1] + size[1] / 2),
                 (w - 0.03, size[0] * 0.9, size[1] - 0.03), ms[rr.randrange(3)], 0.02)


def chevrons(loc=(0, 0, 0), span=6.0):
    """The paired gabled 'chevron' blocks on the north face above the original entrance."""
    m = limestone('ChevM', (0.74, 0.63, 0.47))
    for row in range(2):
        for s in (1, -1):
            o = boxm('Chev%d_%d' % (row, s), (loc[0] + s * span / 4, loc[1], loc[2] + row * 2.0 + span / 4),
                     (span / 2 * 1.45, 1.6, 1.4), m, 0.04)
            o.rotation_euler = (0, math.radians(-s * 40), 0)
