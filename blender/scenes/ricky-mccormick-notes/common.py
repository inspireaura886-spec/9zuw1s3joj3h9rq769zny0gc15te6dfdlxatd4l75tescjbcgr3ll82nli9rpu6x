"""Shared helpers for ricky-mccormick-notes (REAL3D, 30-35 s A/B Short, 2026-11-04, main-mccormick).
Sensitivity: real victim, living family -> NO body, NO figure, NO death reconstruction. Objects and places only.
Camera: smooth eased dolly / push-in / orbit / crane only (kit cruise ease). NO shake, kicks or handheld.
Assets: CC0 Poly Haven (kit/assets.json: farm_soil, denim_fabric, wood_table_worn, magnifying_glass_01,
desk_lamp_arm_01, painted_wooden_chair_01, cardboard_box_01) + the two FBI note scans (public domain, US gov) in this dir."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def setup(sc, exposure=1.0, vol=True, samples=20, glare=0.5, vignette=0.38, sat=0.92, lift=(0.99, 1.0, 1.05),
          gain=(1.04, 1.0, 0.95)):
    core.setup_render(sc, samples=samples, look='AgX - Medium High Contrast', exposure=exposure,
                      vol_step=2.0 if vol else 8.0, vol_max_steps=64 if vol else 16, bounces=5, clamp_ind=4.0)
    core.finish(sc, glare=glare, glare_thr=1.0, glare_size=7, vignette=vignette, lift=lift, gain=gain, sat=sat)


def finish_cam(cam, NF, a, sc):
    cam.bake(0, NF - 1)
    sc.frame_start, sc.frame_end = 0, NF - 1
    core.render(a, sc)


# ---------- generic geometry ----------
def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def grid(name, w, h, nx=24, ny=24, z_fn=None):
    """Subdivided plane w x h (x, y) centred at origin, UV 0..1; z_fn(u, v) bends it (paper curl)."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new()
    vs = [[None] * (nx + 1) for _ in range(ny + 1)]
    for j in range(ny + 1):
        for i in range(nx + 1):
            u, v = i / nx, j / ny
            z = z_fn(u, v) if z_fn else 0.0
            vs[j][i] = bm.verts.new(((u - 0.5) * w, (v - 0.5) * h, z))
    for j in range(ny):
        for i in range(nx):
            f = bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
            for lp, (di, dj) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                lp[uvl].uv = ((i + di) / nx, (j + dj) / ny)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return link(bpy.data.objects.new(name, me))


def paper_mat(name, img=None, base=(0.86, 0.84, 0.78), rough=0.82, ink_gain=1.0):
    """Matte paper. img = path or bpy image: scan multiplied in (scan white -> paper colour)."""
    m, nb, b, out = M.new(name)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = 0.25
    try:
        b.inputs['Subsurface Weight'].default_value = 0.05
    except Exception:
        pass
    if img is not None:
        t = nb.n('ShaderNodeTexImage')
        t.image = img if not isinstance(img, str) else bpy.data.images.load(img, check_existing=True)
        t.interpolation = 'Cubic'
        mx = nb.n('ShaderNodeMix')
        mx.data_type = 'RGBA'
        mx.blend_type = 'MULTIPLY'
        mx.inputs['Factor'].default_value = 1.0
        mx.inputs[7].default_value = (*base, 1)
        nb.l(t, 'Color', mx, 6)
        nb.l(mx, 2, b, 'Base Color')
    else:
        b.inputs['Base Color'].default_value = (*base, 1)
    # fibre bump
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=260.0, Detail=6.0)
    nb.l(tc, 'Object', nz, 'Vector')
    bp = nb.n('ShaderNodeBump', Strength=0.08, Distance=0.001)
    nb.l(nz, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    return m


def paper(name, img, loc, w=0.216, h=0.279, rot=(0, 0, 0), curl=0.004, base=(0.86, 0.84, 0.78)):
    """A sheet (US letter by default) lying at loc with a soft curl at the corners."""
    def z(u, v):
        return curl * ((2 * u - 1) ** 2 * 0.6 + (2 * v - 1) ** 4 * 0.4) + 0.0004
    o = grid(name, w, h, 30, 38, z)
    o.location = loc
    o.rotation_euler = rot
    M.assign(o, paper_mat(name + '_M', img, base=base))
    return o


def lined_paper_img(name='Lined', w=850, h=1100):
    """Ruled notebook paper (pale blue rules, red margin), procedural, no text."""
    import numpy as np
    img = np.ones((h, w, 3), np.float32) * np.array([0.93, 0.91, 0.85], np.float32)
    rnd = np.random.default_rng(4)
    img *= (1 - 0.03 * rnd.random((h, w, 1))).astype(np.float32)
    for y in range(140, h, 34):
        img[y:y + 2, :] = np.array([0.55, 0.68, 0.86])
    img[:, 120:122] = np.array([0.85, 0.45, 0.45])
    from kit import interiors as I
    return I._img(name, img[::-1])


def place_col(col, loc, rot_z=0.0, scale=1.0, ground=True, name=None):
    """Instance a glTF collection so its bbox bottom-centre sits at loc (Poly Haven models are metre scale)."""
    mn, mx = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for o in col.all_objects:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    if mn.x > 1e8:
        return P.instance(col, loc, rot_z, scale, name)
    col.instance_offset = ((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z if ground else (mn.z + mx.z) / 2)
    e = P.instance(col, loc, rot_z, scale, name)
    e['size'] = tuple(mx - mn)
    return e


def model(aid, loc, rot_z=0.0, scale=1.0, ground=True):
    return place_col(P.gltf(aid), loc, rot_z, scale, ground, name='inst_' + aid)


# ---------- corn ----------
def corn_plant(name='Corn', height=1.9, seed=0):
    """One maize plant: tapered stalk + 9-11 arching strap leaves + tassel. Mesh at origin, base at z=0."""
    rnd = random.Random(seed)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    # stalk: 8-sided tapered tube
    seg, rings = 8, 10
    prev = None
    for k in range(rings + 1):
        z = height * 0.86 * k / rings
        r = 0.016 * (1 - 0.55 * k / rings)
        ring = [bm.verts.new((r * math.cos(2 * math.pi * s / seg), r * math.sin(2 * math.pi * s / seg), z)) for s in range(seg)]
        if prev:
            for s in range(seg):
                bm.faces.new((prev[s], prev[(s + 1) % seg], ring[(s + 1) % seg], ring[s]))
        prev = ring
    # leaves: ribbons that rise then droop
    nleaf = rnd.randint(9, 11)
    for li in range(nleaf):
        z0 = height * (0.12 + 0.68 * li / nleaf)
        ang = li * 2.4 + rnd.uniform(-0.3, 0.3)          # phyllotaxis-ish, alternate sides
        L = rnd.uniform(0.55, 0.85) * (1.0 - 0.35 * li / nleaf)
        wmax = rnd.uniform(0.045, 0.065)
        d = Vector((math.cos(ang), math.sin(ang), 0))
        side = Vector((-d.y, d.x, 0))
        n = 9
        row = []
        for k in range(n + 1):
            t = k / n
            out = L * t
            up = 0.34 * L * math.sin(min(1.0, t * 1.3) * math.pi * 0.65) - 0.45 * L * t * t
            c = d * out + Vector((0, 0, z0 + up))
            wv = wmax * math.sin(math.pi * min(1.0, 0.12 + t * 0.9)) * (1 - 0.7 * t)
            twist = rnd.uniform(-0.2, 0.2) * t
            s = (side * math.cos(twist) + Vector((0, 0, math.sin(twist)))) * wv
            row.append((bm.verts.new(c - s), bm.verts.new(c + s), bm.verts.new(c + Vector((0, 0, wv * 0.18)))))
        for k in range(n):
            a, b = row[k], row[k + 1]
            bm.faces.new((a[0], b[0], b[2], a[2]))
            bm.faces.new((a[2], b[2], b[1], a[1]))
    # tassel
    top = height * 0.86
    for t in range(6):
        ang = t * 1.05
        v0 = bm.verts.new((0, 0, top))
        v1 = bm.verts.new((0.004, 0, top))
        v2 = bm.verts.new((0.12 * math.cos(ang), 0.12 * math.sin(ang), top + 0.16))
        bm.faces.new((v0, v1, v2))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    return o


def corn_mat():
    m, nb, b, out = M.new('CornLeaf')
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=3.0, Detail=4.0)
    nb.l(tc, 'Object', nz, 'Vector')
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (0.035, 0.07, 0.025, 1)
    cr.color_ramp.elements[1].color = (0.09, 0.13, 0.04, 1)
    nb.l(nz, 'Fac', cr, 'Fac')
    nb.l(cr, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.55
    b.inputs['Specular IOR Level'].default_value = 0.4
    try:
        b.inputs['Subsurface Weight'].default_value = 0.0
        b.inputs['Transmission Weight'].default_value = 0.12
    except Exception:
        pass
    return m


def cornfield(rows=(-6, 6), y=(-4, 60), spacing_row=0.76, spacing=0.26, lane=0.0, clearing=None, seed=11,
              flattened=None):
    """Rows along +Y. lane = x of the camera's furrow (kept clear between two rows).
    clearing = (cx, cy, r): no standing plants there; flattened = (cx, cy, r): lay ~30 broken stalks flat inside."""
    rnd = random.Random(seed)
    col = bpy.data.collections.new('CornProto')
    bpy.context.scene.collection.children.link(col)
    mat = corn_mat()
    protos = []
    for k in range(5):
        p = corn_plant('Corn%d' % k, height=rnd.uniform(1.75, 2.05), seed=seed + k)
        p.data.materials.append(mat)
        c2 = bpy.data.collections.new('CornP%d' % k)
        col.children.link(c2)
        c2.objects.link(p)
        protos.append(c2)
    bpy.context.view_layer.layer_collection.children['CornProto'].exclude = True
    n = 0
    for r in range(rows[0], rows[1] + 1):
        x = lane + (r + 0.5) * spacing_row
        yy = y[0]
        while yy < y[1]:
            yy += spacing * rnd.uniform(0.8, 1.2)
            px, py = x + rnd.uniform(-0.05, 0.05), yy
            if clearing and (px - clearing[0]) ** 2 + (py - clearing[1]) ** 2 < clearing[2] ** 2:
                continue
            e = P.instance(protos[rnd.randrange(5)], (px, py, 0), rnd.uniform(0, 6.283), rnd.uniform(0.9, 1.1))
            e.rotation_euler = (rnd.uniform(-0.04, 0.04), rnd.uniform(-0.04, 0.04), e.rotation_euler[2])
            n += 1
    if flattened:
        cx, cy, rr = flattened
        for k in range(26):
            a = rnd.uniform(0, 6.283); d = rr * math.sqrt(rnd.random())
            e = P.instance(protos[rnd.randrange(5)], (cx + d * math.cos(a), cy + d * math.sin(a), 0.03),
                           rnd.uniform(0, 6.283), rnd.uniform(0.8, 1.0))
            e.rotation_euler = (rnd.uniform(1.35, 1.52), 0, rnd.uniform(0, 6.283))
    print('IA3D corn instances', n)
    return n


def soil(size=(40, 90), center=(0, 25, 0)):
    o = grid('Soil', size[0], size[1], 2, 2)
    o.location = center
    m = M.texture_set('SoilM', 'farm_soil', scale=size[0] / 2.5, tint=(0.55, 0.5, 0.45))
    if 'Principled BSDF' not in m.node_tree.nodes or not os.path.isdir(os.path.join(M.A(), 'tex', 'farm_soil')):
        m = M.principled('SoilFallback', base=(0.05, 0.04, 0.03), rough=0.95, bump=0.3)
    M.assign(o, m)
    return o


# ---------- interiors ----------
def dark_room(floor_tex='concrete_floor_worn_001', wall=(0.035, 0.037, 0.04), size=(8, 8, 3.2)):
    """Bare dark office: floor, back + side walls (out of focus behind the desk)."""
    sx, sy, sz = size
    f = grid('Floor', sx, sy, 2, 2)
    M.assign(f, M.texture_set('FloorM', floor_tex, scale=3.0, tint=(0.5, 0.5, 0.5)))
    wm = M.principled('Wall', base=wall, rough=0.85, grime=0.3)
    for nm, loc, rot in (('WallB', (0, sy / 2, sz / 2), (math.pi / 2, 0, 0)),
                         ('WallL', (-sx / 2, 0, sz / 2), (math.pi / 2, 0, math.pi / 2)),
                         ('WallR', (sx / 2, 0, sz / 2), (math.pi / 2, 0, -math.pi / 2))):
        w = grid(nm, sx if nm == 'WallB' else sy, sz, 2, 2)
        w.location = loc
        w.rotation_euler = rot
        M.assign(w, wm)
    return f


def desk(top=0.76, w=1.5, d=0.8, loc=(0, 0, 0), tex='wood_table_worn'):
    """Simple heavy desk: textured top slab + dark legs/pedestal. Returns top z."""
    x, y, _ = loc
    t = Wd.box('DeskTop', (x, y, top - 0.02), (w, d, 0.04))
    M.assign(t, M.texture_set('DeskM', tex, scale=1.2, tint=(0.75, 0.68, 0.6), box=True))
    lm = M.principled('DeskLeg', base=(0.03, 0.025, 0.02), rough=0.6)
    for sx in (-1, 1):
        p = Wd.box('Ped%d' % sx, (x + sx * (w / 2 - 0.22), y, (top - 0.04) / 2), (0.4, d * 0.92, top - 0.04))
        M.assign(p, lm)
    return top


def lamp_light(target, loc=(-0.45, -0.1, 1.35), power=60, color=(1.0, 0.78, 0.52), size_deg=70):
    """Warm desk-lamp pool: spot + soft fill so shadows are not pitch black."""
    s = Wd.spot('LampKey', loc, target, color=color, power=power, size_deg=size_deg, blend=0.6, radius=0.06)
    return s


def haze(center=(0, 0, 1.4), size=(6, 6, 3), density=0.02):
    return Wd.fog(center=center, size=size, density=density, color=(0.85, 0.82, 0.78), anisotropy=0.45,
                  noise=0.35, noise_scale=0.6)


# ---------- ink stroke + pen ----------
def scribble_points(x0, y0, z, letters=4, h=0.009, w=0.007, seed=3):
    """Shaky block-ish letter strokes left->right (generic marks, no real text). Returns list of (x, y, z)."""
    rnd = random.Random(seed)
    pts = []
    x = x0
    for k in range(letters):
        shape = rnd.choice(['N', 'C', 'E', 'L', 'S'])
        base = [(0, 0), (0, 1), (1, 0), (1, 1)] if shape == 'N' else \
               [(1, 1), (0, 1), (0, 0), (1, 0)] if shape == 'C' else \
               [(1, 1), (0, 1), (0, 0.5), (0.8, 0.5), (0, 0.5), (0, 0), (1, 0)] if shape == 'E' else \
               [(0, 1), (0, 0), (1, 0)] if shape == 'L' else \
               [(1, 1), (0, 0.8), (1, 0.3), (0, 0)]
        for (u, v) in base:
            pts.append((x + u * w + rnd.gauss(0, 0.0008), y0 + v * h + rnd.gauss(0, 0.0008), z))
        x += w * 1.6
    return pts


def ink_curve(pts, name='Ink', bevel=0.00045, grow=None):
    """Poly curve with a thin round bevel; grow=[(frame, 0..1)] animates bevel_factor_end (stroke being written)."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = bevel
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    o = link(bpy.data.objects.new(name, cu))
    M.assign(o, M.principled('InkM', base=(0.01, 0.012, 0.03), rough=0.35, spec=0.6))
    if grow:
        cu.bevel_factor_mapping_end = 'SPLINE'
        for f, v in grow:
            cu.bevel_factor_end = v
            cu.keyframe_insert('bevel_factor_end', frame=f)
    return o


def pen(name='Pen', length=0.14, r=0.0045):
    """Cheap ballpoint: navy barrel, chrome tip, clip. Origin at the tip; points along +Z."""
    root = Md.empty(name)
    bar = bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=length * 0.82, location=(0, 0, length * 0.18 + length * 0.41))
    b = bpy.context.active_object; b.name = name + '_barrel'; b.parent = root
    M.assign(b, M.principled('PenBarrel', base=(0.02, 0.03, 0.09), rough=0.25, coat=0.6))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.0002, radius2=r * 0.95, depth=length * 0.18, location=(0, 0, length * 0.09))
    t = bpy.context.active_object; t.name = name + '_tip'; t.parent = root
    M.assign(t, M.principled('PenTip', base=(0.8, 0.8, 0.82), rough=0.18, metal=1.0))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(r * 1.25, 0, length * 0.78))
    c = bpy.context.active_object; c.scale = (0.0009, 0.0018, length * 0.18); c.parent = root
    M.assign(c, M.principled('PenClip', base=(0.7, 0.7, 0.72), rough=0.2, metal=1.0))
    for o in (b, t, c):
        for p in o.data.polygons:
            p.use_smooth = True
    return root


def envelope_mat(i):
    tones = [(0.82, 0.78, 0.68), (0.74, 0.66, 0.5), (0.88, 0.86, 0.8), (0.7, 0.62, 0.48)]
    return M.principled('Env%d' % i, base=tones[i % 4], rough=0.85, grime=0.25, bump=0.05, bump_scale=120)
