"""Procedural hero models (no third-party meshes needed): 1960s-70s rear-engine airliner (Caravelle-like, generic,
no airline marks), glowing unknown light orbs, blinking aircraft lights, small fishing boat."""
import bpy, math, random
from mathutils import Vector, Matrix
from . import mat as M
from . import world as Wd


def mesh_obj(name, verts, faces, parent=None, smooth=True, mats=()):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    for p in me.polygons:
        p.use_smooth = smooth
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    for m in mats:
        me.materials.append(m)
    if parent:
        o.parent = parent
    return o


def loft(rings, cap_start=False, cap_end=False):
    """rings: list of equal-length vertex rings -> (verts, faces), closed around each ring."""
    n = len(rings[0])
    verts = [v for r in rings for v in r]
    faces = []
    for j in range(len(rings) - 1):
        for i in range(n):
            a = j * n + i
            b = j * n + (i + 1) % n
            faces.append((a, b, b + n, a + n))
    if cap_start:
        faces.append(tuple(reversed(range(n))))
    if cap_end:
        k = (len(rings) - 1) * n
        faces.append(tuple(range(k, k + n)))
    return verts, faces


def subsurf(o, lv=1, rlv=2):
    m = o.modifiers.new('Sub', 'SUBSURF')
    m.levels = lv
    m.render_levels = rlv
    return m


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    bpy.context.scene.collection.objects.link(e)
    if parent:
        e.parent = parent
    return e


def naca(t, n=16):
    """Symmetric NACA 00xx: returns closed ring of (chord_frac, half_thickness) TE->upper->LE->lower."""
    cs = [0.5 * (1 - math.cos(math.pi * i / (n - 1))) for i in range(n)]
    yt = lambda c: 5 * t * (0.2969 * math.sqrt(c) - 0.126 * c - 0.3516 * c * c + 0.2843 * c ** 3 - 0.1036 * c ** 4)
    up = [(c, yt(c)) for c in reversed(cs)]
    lo = [(c, -yt(c)) for c in cs[1:-1]]
    return up + lo


def wing(name, root, span, chord_r, chord_t, sweep, dihedral, t_r=0.12, t_t=0.10, side=1, vertical=False,
         stations=8, parent=None, mats=()):
    """Swept tapered wing. root = LE point at the root; chord runs toward -Y. side=+1 right, -1 left."""
    rings = []
    for s in range(stations):
        u = s / (stations - 1)
        ch = chord_r + (chord_t - chord_r) * u
        tt = t_r + (t_t - t_r) * u
        d = span * u
        le_y = root[1] - math.tan(math.radians(sweep)) * d
        ring = []
        for c, h in naca(tt):
            if vertical:
                ring.append((root[0] + h * ch, le_y - c * ch, root[2] + d))
            else:
                ring.append((root[0] + side * d, le_y - c * ch, root[2] + math.tan(math.radians(dihedral)) * d + h * ch))
        rings.append(ring)
    v, f = loft(rings, cap_end=True)
    if side < 0 and not vertical:
        f = [tuple(reversed(x)) for x in f]
    o = mesh_obj(name, v, f, parent=parent, mats=mats)
    return o


def blink(obj_light, emit_socket, period_f=30, on_f=4, f0=0, f1=900, energy=200, strength=50, phase=0, double=False):
    """Keyframe a flashing light (CONSTANT steps): beacon (period 30 f) or double strobe."""
    pts = []
    f = f0 - phase
    while f < f1 + period_f:
        pts += [(f, 1), (f + on_f, 0)]
        if double:
            pts += [(f + on_f + 3, 1), (f + 2 * on_f + 3, 0)]
        f += period_f
    pts = [(max(f0, a), b) for a, b in pts]
    for fr, on in pts:
        if obj_light:
            obj_light.data.energy = energy * on
            obj_light.data.keyframe_insert('energy', frame=fr)
        if emit_socket is not None:
            emit_socket.default_value = strength * on
            emit_socket.keyframe_insert('default_value', frame=fr)
    if obj_light:
        M.set_interp(obj_light.data, 'CONSTANT')


def nav_light(name, loc, color, parent, power=30, strength=40, radius=0.06, blink_kw=None):
    me = bpy.data.meshes.new(name)
    o = bpy.data.objects.new(name + '_bulb', me)
    bpy.context.scene.collection.objects.link(o)
    import bmesh
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=radius)
    bm.to_mesh(me)
    bm.free()
    o.parent = parent
    o.location = loc
    m = M.emission(name + '_m', color, strength)
    me.materials.append(m)
    o.visible_shadow = False
    L = Wd.point(name, (0, 0, 0), color=color, power=power, radius=0.02)
    L.parent = parent
    L.location = Vector(loc) + Vector((0, 0, 0))
    if blink_kw:
        es = m.node_tree.nodes['Emission'].inputs['Strength']
        blink(L, es, energy=power, strength=strength, **blink_kw)
    return o, L


def airliner(name='Airliner', loc=(0, 0, 0), cabin_glow=4.0, livery=(0.05, 0.12, 0.33), seed=3, f1=900, lights=True):
    """Rear-engine twinjet ~32 m long, nose toward +Y. Returns the root empty (animate that)."""
    rnd = random.Random(seed)
    root = empty(name, loc)
    R = 1.6
    # ---------- fuselage ----------
    def prof(y):
        if y > 11:
            u = min(1, (16.2 - y) / 5.2)
            r = R * max(0.02, (1 - (1 - u) ** 2.4)) ** 0.5
            zc = -0.22 * (1 - u) ** 2
        elif y > -7:
            r, zc = R, 0.0
        else:
            u = min(1, (-7 - y) / 9.6)
            r = R * (1 - 0.86 * u ** 1.25)
            zc = (R - r) * 0.88
        return r, zc
    ys = [16.2 - i * 0.25 for i in range(0, 21)] + [11 - i * 0.6 for i in range(1, 30)] + [-7 - i * 0.4 for i in range(1, 25)]
    ys = sorted(set(round(y, 3) for y in ys), reverse=True)
    rings = []
    K = 36
    for y in ys:
        r, zc = prof(y)
        rings.append([(r * math.cos(2 * math.pi * k / K), y, zc + 1.04 * r * math.sin(2 * math.pi * k / K)) for k in range(K)])
    v, f = loft(rings, cap_start=True, cap_end=True)
    paint = M.new('AirlinerPaint')
    pm, nb, b, out = paint
    b.inputs['Roughness'].default_value = 0.24
    b.inputs['Coat Weight'].default_value = 0.6
    b.inputs['Coat Roughness'].default_value = 0.08
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Object', sep, 'Vector')
    # livery: belly polished metal / white top / dark cheatline through the windows
    cr = nb.n('ShaderNodeValToRGB')
    el = cr.color_ramp.elements
    el[0].position, el[0].color = 0.0, (0.42, 0.44, 0.47, 1)
    el[1].position, el[1].color = 1.0, (0.78, 0.78, 0.76, 1)
    e2 = el.new(0.36); e2.color = (0.42, 0.44, 0.47, 1)
    e3 = el.new(0.40); e3.color = (0.76, 0.76, 0.74, 1)
    e4 = el.new(0.53); e4.color = (0.76, 0.76, 0.74, 1)
    e5 = el.new(0.535); e5.color = (*livery, 1)
    e6 = el.new(0.62); e6.color = (*livery, 1)
    e7 = el.new(0.625); e7.color = (0.78, 0.78, 0.76, 1)
    zr = nb.n('ShaderNodeMapRange')
    zr.inputs['From Min'].default_value = -1.7
    zr.inputs['From Max'].default_value = 1.7
    nb.l(sep, 'Z', zr, 'Value')
    nb.l(zr, 'Result', cr, 'Fac')
    # subtle grime/panel breakup
    nz = nb.n('ShaderNodeTexNoise', Scale=1.5, Detail=10.0, Roughness=0.65)
    nb.l(tc, 'Object', nz, 'Vector')
    mx = nb.n('ShaderNodeMix')
    mx.data_type = 'RGBA'
    mx.blend_type = 'MULTIPLY'
    mf = nb.n('ShaderNodeMapRange')
    mf.inputs['To Min'].default_value = 0.0
    mf.inputs['To Max'].default_value = 0.25
    nb.l(nz, 'Fac', mf, 'Value')
    nb.l(mf, 'Result', mx, 'Factor')
    nb.l(cr, 'Color', mx, 6)
    mx.inputs[7].default_value = (0.55, 0.53, 0.5, 1)
    nb.l(mx, 2, b, 'Base Color')
    metal = nb.math('LESS_THAN', zr.outputs['Result'], vb=0.38)
    mm = nb.math('MULTIPLY', metal.outputs[0], vb=0.85)
    nb.l(mm, 0, b, 'Metallic')
    # panel lines: thin dark grooves from a brick texture as bump
    br = nb.n('ShaderNodeTexBrick')
    br.inputs['Scale'].default_value = 0.35
    br.inputs['Mortar Size'].default_value = 0.004
    br.inputs['Mortar Smooth'].default_value = 0.0
    nb.l(tc, 'Object', br, 'Vector')
    bp = nb.n('ShaderNodeBump', Strength=0.12, Distance=0.005)
    nb.l(br, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    glass_dark = M.principled('CockpitGlass', base=(0.01, 0.012, 0.015), rough=0.03, coat=1.0, spec=0.8)
    fus = mesh_obj(name + '_Fuselage', v, f, parent=root, mats=(pm, glass_dark))
    # windshield faces -> slot 1
    for p in fus.data.polygons:
        c = p.center
        r, zc = prof(c.y)
        if 12.3 < c.y < 14.2 and c.z > zc + 0.42 * r and abs(c.x) < 1.2:
            p.material_index = 1
    subsurf(fus, 1, 2)
    # ---------- cabin windows (warm, a few dark) ----------
    win_on = M.emission('CabinWindow', (1.0, 0.72, 0.42), cabin_glow)
    win_off = M.principled('CabinWindowOff', base=(0.02, 0.02, 0.025), rough=0.05, coat=1.0)
    wv, wf, wv2, wf2 = [], [], [], []
    a = math.asin(0.38 / (1.04 * R))
    for side in (1, -1):
        for i in range(30):
            y = 9.4 - i * 0.54
            if -7.0 > y:
                continue
            on = rnd.random() > 0.12
            cx, cz = side * (R * math.cos(a) + 0.012), 0.38
            pts = []
            for k in range(10):
                t = 2 * math.pi * k / 10
                pts.append((cx, y + 0.11 * math.cos(t), cz + 0.15 * math.sin(t) - 0.03 * math.cos(2 * t)))
            tgt_v, tgt_f = (wv, wf) if on else (wv2, wf2)
            k0 = len(tgt_v)
            tgt_v += pts
            tgt_f.append(tuple(range(k0, k0 + 10)) if side > 0 else tuple(reversed(range(k0, k0 + 10))))
    mesh_obj(name + '_WinOn', wv, wf, parent=root, smooth=False, mats=(win_on,)).visible_shadow = False
    mesh_obj(name + '_WinOff', wv2, wf2, parent=root, smooth=False, mats=(win_off,))
    # cabin light spill on the wing roots (very subtle)
    # ---------- wings + tail ----------
    wingm = M.principled('WingMetal', base=(0.55, 0.57, 0.6), rough=0.33, metal=0.85, rough_noise=0.1, grime=0.25)
    for s in (1, -1):
        wing(name + '_Wing%d' % s, (s * 1.2, 3.2, -0.95), 16.5, 6.6, 2.0, 20, 3.5, 0.13, 0.10, side=s, parent=root,
             mats=(wingm,))
        # horizontal stabiliser on the fin (cruciform)
        wing(name + '_Stab%d' % s, (s * 0.15, -12.1, 3.1), 5.3, 3.0, 1.3, 30, 2, 0.10, 0.09, side=s, parent=root,
             mats=(pm,))
    fin = wing(name + '_Fin', (0, -9.6, 1.2), 5.8, 5.6, 2.4, 38, 0, 0.11, 0.09, vertical=True, parent=root, mats=(pm,))
    # ---------- rear engines ----------
    nac = M.principled('Nacelle', base=(0.6, 0.62, 0.64), rough=0.28, metal=0.9, rough_noise=0.08, grime=0.3)
    dark = M.principled('EngineDark', base=(0.02, 0.02, 0.02), rough=0.5, metal=0.6)
    for s in (1, -1):
        cx, cy, cz = s * 2.65, -8.4, 0.75
        rings = []
        Kn = 28
        for j in range(19):
            u = j / 18
            r = 0.62 + 0.12 * math.sin(min(1, u / 0.3) * math.pi / 2) - 0.25 * max(0, (u - 0.7) / 0.3) ** 1.5
            if j == 0:
                r = 0.55
            rings.append([(cx + r * math.cos(2 * math.pi * k / Kn), cy - u * 5.2, cz + r * math.sin(2 * math.pi * k / Kn)) for k in range(Kn)])
        v, f = loft(rings)
        o = mesh_obj(name + '_Nac%d' % s, v, f, parent=root, mats=(nac,))
        subsurf(o, 1, 1)
        # intake + exhaust discs
        for yy, rr in ((cy - 0.05, 0.56), (cy - 5.15, 0.47)):
            pts = [(cx + rr * math.cos(2 * math.pi * k / Kn), yy, cz + rr * math.sin(2 * math.pi * k / Kn)) for k in range(Kn)]
            mesh_obj(name + '_Disc', pts, [tuple(range(Kn))], parent=root, mats=(dark,))
        # pylon
        pv = [(s * 1.3, cy - 1.2, cz - 0.15), (s * 2.1, cy - 1.2, cz - 0.1), (s * 2.1, cy - 3.8, cz - 0.1), (s * 1.3, cy - 3.8, cz - 0.15),
              (s * 1.3, cy - 1.2, cz + 0.15), (s * 2.1, cy - 1.2, cz + 0.1), (s * 2.1, cy - 3.8, cz + 0.1), (s * 1.3, cy - 3.8, cz + 0.15)]
        pf = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
        mesh_obj(name + '_Pylon', pv, pf, parent=root, smooth=False, mats=(nac,))
    if lights:
        tipz = -0.95 + math.tan(math.radians(3.5)) * 16.5
        tipy = 3.2 - math.tan(math.radians(20)) * 16.5 - 0.6
        nav_light(name + '_NavR', (16.5 + 1.2, tipy, tipz), (0.05, 1.0, 0.25), root, power=25, strength=60)   # starboard green
        nav_light(name + '_NavL', (-16.5 - 1.2, tipy, tipz), (1.0, 0.03, 0.02), root, power=25, strength=60)  # port red
        nav_light(name + '_Tail', (0, -16.3, 1.25), (1, 1, 1), root, power=12, strength=30)
        nav_light(name + '_BeaconT', (0, 1.0, 1.72), (1.0, 0.05, 0.02), root, power=120, strength=120,
                  blink_kw=dict(period_f=30, on_f=3, f1=f1))
        nav_light(name + '_BeaconB', (0, 1.0, -1.72), (1.0, 0.05, 0.02), root, power=120, strength=120,
                  blink_kw=dict(period_f=30, on_f=3, f1=f1, phase=15))
        for s in (1, -1):
            nav_light(name + '_Strobe%d' % s, (s * (16.5 + 1.25), tipy - 0.4, tipz), (1, 1, 1), root, power=800,
                      strength=400, radius=0.05, blink_kw=dict(period_f=36, on_f=1, f1=f1, double=True, phase=7))
    return root


def orb(name, loc, color=(1.0, 0.06, 0.02), strength=400.0, power=2.0e5, radius=3.0, halo=0.0, pulse=0.0, f1=900,
        seed=0):
    """Unknown light: emissive core + point light (+ optional volumetric halo). pulse = slow breathing amount."""
    import bmesh
    e = empty(name, loc)
    me = bpy.data.meshes.new(name + '_core')
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=radius)
    bm.to_mesh(me)
    bm.free()
    core = bpy.data.objects.new(name + '_core', me)
    bpy.context.scene.collection.objects.link(core)
    core.parent = e
    m = M.emission(name + '_m', color, strength)
    me.materials.append(m)
    core.visible_shadow = False
    L = Wd.point(name + '_L', (0, 0, 0), color=color, power=power, radius=radius)
    L.parent = e
    if halo:
        me2 = bpy.data.meshes.new(name + '_halo')
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=10, radius=radius * 6)
        bm.to_mesh(me2)
        bm.free()
        h = bpy.data.objects.new(name + '_halo', me2)
        bpy.context.scene.collection.objects.link(h)
        h.parent = e
        hm = bpy.data.materials.new(name + '_haloV')
        hm.use_nodes = True
        M.no_light(hm)
        nt = hm.node_tree
        nt.nodes.remove(nt.nodes['Principled BSDF'])
        nb = M.NB(nt)
        tc = nb.n('ShaderNodeTexCoord')
        vm = nb.n('ShaderNodeVectorMath')
        vm.operation = 'LENGTH'
        nb.l(tc, 'Object', vm, 'Vector')
        fall = nb.math('SUBTRACT', va=1.0, b=vm.outputs['Value'], clamp=True)
        p2 = nb.math('POWER', fall.outputs[0], vb=2.0)
        d = nb.math('MULTIPLY', p2.outputs[0], vb=halo)
        ev = nb.n('ShaderNodeEmission')
        ev.inputs['Color'].default_value = (*color, 1)
        nb.l(d, 0, ev, 'Strength')
        nb.l(ev, 'Emission', nt.nodes['Material Output'], 'Volume')
        me2.materials.append(hm)
        h.visible_shadow = False
    if pulse:
        es = m.node_tree.nodes['Emission'].inputs['Strength']
        rnd = random.Random(seed)
        for fr in range(0, f1 + 1, 6):
            k = 1 + pulse * math.sin(fr * 0.21 + seed) * (0.6 + 0.4 * rnd.random())
            es.default_value = strength * k
            es.keyframe_insert('default_value', frame=fr)
            L.data.energy = power * k
            L.data.keyframe_insert('energy', frame=fr)
    return e


def fly(obj, keys, interp='BEZIER'):
    """keys: [(frame, loc, rot_deg_xyz), ...] on an object (airliner root, orb, boat...)."""
    for fr, loc, rot in keys:
        obj.location = loc
        obj.keyframe_insert('location', frame=fr)
        if rot is not None:
            obj.rotation_euler = [math.radians(a) for a in rot]
            obj.keyframe_insert('rotation_euler', frame=fr)
    M.set_interp(obj, interp)
    return obj


def boat(name='Boat', loc=(0, 0, 0), length=9.0, cabin_light=True):
    """Small wooden fishing boat: lofted hull + wheelhouse + mast lamp."""
    root = empty(name, loc)
    rings = []
    K = 20
    for j in range(17):
        u = j / 16
        y = (u - 0.5) * length
        w = 1.4 * math.sin(math.pi * min(1, (u * 1.08))) ** 0.6 + 0.02
        dep = 1.0 * (0.4 + 0.6 * math.sin(math.pi * u) ** 0.5)
        ring = []
        for k in range(K):
            t = k / (K - 1)
            ang = math.pi * t
            ring.append((-w * math.cos(ang), y, -dep * math.sin(ang) + 0.5 + 0.25 * (2 * u - 1) ** 2))
        rings.append(ring)
    # open hull: connect rings without wrapping
    verts = [p for r in rings for p in r]
    faces = []
    for j in range(len(rings) - 1):
        for i in range(K - 1):
            a = j * K + i
            faces.append((a, a + 1, a + 1 + K, a + K))
    hullm = M.principled('Hull', base=(0.32, 0.06, 0.04), rough=0.6, grime=0.5, rough_noise=0.2, bump=0.2, bump_scale=12)
    h = mesh_obj(name + '_Hull', verts, faces, parent=root, mats=(hullm,))
    sol = h.modifiers.new('Sol', 'SOLIDIFY')
    sol.thickness = 0.06
    subsurf(h, 1, 2)
    deck = M.principled('Deck', base=(0.35, 0.28, 0.2), rough=0.8, grime=0.4, bump=0.3, bump_scale=30)
    wh = Wd.box(name + '_House', (0, -0.8, 1.35), (1.6, 1.8, 1.4))
    wh.parent = root
    wh.data.materials.append(M.principled('House', base=(0.75, 0.74, 0.7), rough=0.7, grime=0.5))
    mast = Wd.box(name + '_Mast', (0, 0.6, 2.8), (0.08, 0.08, 4.0))
    mast.parent = root
    mast.data.materials.append(deck)
    if cabin_light:
        nav_light(name + '_Lamp', (0, 0.6, 4.7), (1.0, 0.85, 0.6), root, power=60, strength=40)
        Wd.point(name + '_Cabin', (0, -0.8, 1.4), color=(1, 0.7, 0.4), power=30).parent = root
    return root
