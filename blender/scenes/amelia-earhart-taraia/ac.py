"""amelia-earhart-taraia builders (REAL3D, WHAT THEY FOUND). Illustrative reconstruction of Nikumaroro (Kiribati): a
generic ring atoll (NOT survey-accurate), a generic sandspit with a clump of fallen palm trunks, survey ship, drone,
sensor sled, steel tube. No people, no Earhart likeness, no wreck. Drawn plane = generic unmarked twin-engine wireframe.
Camera: smooth eased moves only (kit), no shake."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import numpy as np


# ------------------------------------------------------------------ small utils
def smooth01(x, a, b):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def fnoise(X, Y, s=1.0, ph=0.0):
    return (np.sin(X * 0.021 * s + 1.3 + ph) * np.sin(Y * 0.017 * s + 0.4 + ph)
            + 0.5 * np.sin(X * 0.053 * s + Y * 0.041 * s + ph)
            + 0.25 * np.sin(X * 0.11 * s - Y * 0.09 * s + 2.0 + ph)) / 1.75


def ramp(nb, stops):
    """ColorRamp with exact stops (positions ascending). Creates middle elements at their final positions so
    Blender's re-sorting never scrambles the colours."""
    n = nb.n('ShaderNodeValToRGB')
    cr = n.color_ramp
    e0, e1 = cr.elements[0], cr.elements[1]
    e0.position = stops[0][0]
    e0.color = (*stops[0][1], 1)
    e1.position = stops[-1][0]
    e1.color = (*stops[-1][1], 1)
    for p, c in stops[1:-1]:
        e = cr.elements.new(p)
        e.color = (*c, 1)
    return n


def grid_obj(name, X, Y, Z, colors=None, mat=None, smooth=True):
    """Quad grid from 2D arrays (res+1 x res+1)."""
    ny, nx = X.shape
    co = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1).astype(np.float32)
    i, j = np.meshgrid(np.arange(nx - 1), np.arange(ny - 1))
    a0 = (j * nx + i).ravel()
    quads = np.stack([a0, a0 + 1, a0 + nx + 1, a0 + nx], 1).astype(np.int32)
    me = bpy.data.meshes.new(name)
    me.vertices.add(nx * ny)
    me.vertices.foreach_set('co', co.ravel())
    nf = quads.shape[0]
    me.loops.add(nf * 4)
    me.loops.foreach_set('vertex_index', quads.ravel())
    me.polygons.add(nf)
    me.polygons.foreach_set('loop_start', np.arange(0, nf * 4, 4, dtype=np.int32))
    me.polygons.foreach_set('loop_total', np.full(nf, 4, np.int32))
    me.polygons.foreach_set('use_smooth', np.full(nf, smooth, bool))
    me.update(calc_edges=True)
    me.validate()
    if colors is not None:
        ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
        cc = np.concatenate([colors.reshape(-1, 3), np.ones((nx * ny, 1))], 1).astype(np.float32)
        ca.data.foreach_set('color', cc.ravel())
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    if mat:
        o.data.materials.append(mat)
    return o


# ------------------------------------------------------------------ water surface (semi-transparent over a coloured floor)
def water_surface(name='Water', z=0.0, size=12000.0, center=(0, 0), NF=100, tint=(0.0, 0.07, 0.09), body=0.22,
                  wave=0.10, wscale=0.35):
    me = bpy.data.meshes.new(name)
    s = size / 2
    me.from_pydata([(-s, -s, 0), (s, -s, 0), (s, s, 0), (-s, s, 0)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new(name, me)
    o.location = (center[0], center[1], z)
    bpy.context.scene.collection.objects.link(o)
    m, nb, b, out = M.new(name + 'M')
    m.node_tree.nodes.remove(b)
    tr = nb.n('ShaderNodeBsdfTransparent')
    df = nb.n('ShaderNodeBsdfDiffuse')
    df.inputs['Color'].default_value = (*tint, 1)
    gl = nb.n('ShaderNodeBsdfGlossy')
    gl.inputs['Roughness'].default_value = 0.035
    lw = nb.n('ShaderNodeLayerWeight', Blend=0.12)
    f2 = nb.math('MULTIPLY_ADD', lw.outputs['Fresnel'], vb=0.9)
    f2.inputs[2].default_value = 0.07
    f2.use_clamp = True
    mix1 = nb.n('ShaderNodeMixShader')
    mix1.inputs[0].default_value = body
    nb.l(tr, 'BSDF', mix1, 1)
    nb.l(df, 'BSDF', mix1, 2)
    mix2 = nb.n('ShaderNodeMixShader')
    nb.l(f2, 0, mix2, 'Fac')
    nb.l(mix1, 'Shader', mix2, 1)
    nb.l(gl, 'BSDF', mix2, 2)
    nb.l(mix2, 'Shader', out, 'Surface')
    # ripples: two animated noises -> bump on both shaders
    tc = nb.n('ShaderNodeTexCoord')
    n1 = nb.n('ShaderNodeTexNoise', Scale=wscale * 3.0, Detail=6.0)
    n1.noise_dimensions = '4D'
    nb.l(tc, 'Object', n1, 'Vector')
    M.animate(n1.inputs['W'], 'default_value', [(0, 0.0), (max(NF, 60), 2.5)])
    n2 = nb.n('ShaderNodeTexNoise', Scale=wscale * 0.5, Detail=3.0)
    n2.noise_dimensions = '4D'
    nb.l(tc, 'Object', n2, 'Vector')
    M.animate(n2.inputs['W'], 'default_value', [(0, 0.0), (max(NF, 60), 1.2)])
    ad = nb.math('ADD', n1.outputs['Fac'], n2.outputs['Fac'])
    bp = nb.n('ShaderNodeBump', Strength=wave, Distance=1.0)
    nb.l(ad, 0, bp, 'Height')
    nb.l(bp, 'Normal', gl, 'Normal')
    nb.l(bp, 'Normal', df, 'Normal')
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


# ------------------------------------------------------------------ palms (one mesh, instanced)
def palm_mesh_obj(dry=False):
    bm = bmesh.new()
    rnd = random.Random(11)
    rings = []
    H = 9.0
    for i in range(7):
        t = i / 6
        c = Vector((1.6 * t * t, 0.4 * t * t, H * t))
        r = 0.34 * (1 - 0.45 * t) + 0.05
        rings.append([bm.verts.new(c + Vector((r * math.cos(a), r * math.sin(a), 0))) for a in [k * math.pi * 2 / 5 for k in range(5)]])
    for i in range(6):
        for k in range(5):
            f = bm.faces.new((rings[i][k], rings[i][(k + 1) % 5], rings[i + 1][(k + 1) % 5], rings[i + 1][k]))
            f.material_index = 0
    top = Vector((1.6, 0.4, H))
    for fi in range(9):
        a = fi * math.pi * 2 / 9 + rnd.uniform(-0.2, 0.2)
        L = rnd.uniform(4.4, 5.6)
        dirv = Vector((math.cos(a), math.sin(a), 0))
        side = Vector((-math.sin(a), math.cos(a), 0))
        prev = None
        for s_i in range(5):
            s = s_i / 4
            p = top + dirv * (s * L) + Vector((0, 0, 1.3 * s - 3.0 * s * s + 0.4))
            w = 0.95 * math.sin(math.pi * min(1.0, s * 0.9 + 0.1)) ** 0.7
            pair = (bm.verts.new(p - side * w), bm.verts.new(p + side * w))
            if prev:
                f = bm.faces.new((prev[0], prev[1], pair[1], pair[0]))
                f.material_index = 1
            prev = pair
    me = bpy.data.meshes.new('PalmMesh')
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    me.materials.append(M.principled('PalmTrunk', base=(0.2, 0.15, 0.1), rough=0.8, grime=0.3))
    me.materials.append(M.principled('PalmFrond', base=((0.34, 0.27, 0.15) if dry else (0.06, 0.15, 0.035)), rough=0.55, grime=0.3, rough_noise=0.15))
    return me


def scatter_palms(me, pts, seed=3, scale=(0.7, 1.35)):
    rnd = random.Random(seed)
    for k, (x, y, z) in enumerate(pts):
        o = bpy.data.objects.new('Palm%d' % k, me)
        o.location = (x, y, z - 0.2)
        o.rotation_euler = (0, 0, rnd.uniform(0, 6.283))
        s = rnd.uniform(*scale)
        o.scale = (s, s, s * rnd.uniform(0.85, 1.15))
        bpy.context.scene.collection.objects.link(o)


def day_world(sun_az=250, elev=40, strength=1.0, hdri_strength=1.0):
    """Clear tropical day: Nishita sky + its own sun disc (no separate sun lamp, so light and sky agree)."""
    w = bpy.data.worlds.new('Day')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    nb = M.NB(nt)
    out = nb.n('ShaderNodeOutputWorld')
    sky = nb.n('ShaderNodeTexSky')
    sky.sky_type = 'NISHITA'
    sky.sun_elevation = math.radians(elev)
    sky.sun_rotation = math.radians(sun_az)
    sky.sun_disc = True
    sky.sun_size = math.radians(0.6)
    sky.sun_intensity = strength
    sky.air_density = 1.0
    sky.dust_density = 0.5
    sky.altitude = 0.0
    bg = nb.n('ShaderNodeBackground', Strength=1.0)
    nb.l(sky, 'Color', bg, 'Color')
    nb.l(bg, 'Background', out, 'Surface')
    return w


def deep_plane(z=-60.0, size=60000.0, color=(0.01, 0.07, 0.16)):
    me = bpy.data.meshes.new('DeepPlane')
    s = size / 2
    me.from_pydata([(-s, -s, z), (s, -s, z), (s, s, z), (-s, s, z)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new('DeepPlane', me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(M.principled('DeepM', base=color, rough=0.9))
    return o


# ------------------------------------------------------------------ atoll
class Atoll:
    R0 = 1250.0

    def __init__(self):
        self.lobe_c = None

    @staticmethod
    def wob(th):
        return 90 * np.sin(2 * th + 0.6) + 55 * np.sin(3 * th + 1.9) + 28 * np.sin(5 * th + 0.3) + 14 * np.sin(9 * th + 2.0)

    @staticmethod
    def width(th):
        return 62 + 38 * np.sin(4 * th + 0.5) + 20 * np.sin(7 * th)

    def spit_center(self):
        th = np.array(0.0)
        rc = self.R0 + self.wob(th)
        w = self.width(th)
        return float(rc - w - 55.0), 0.0

    def height(self, X, Y):
        r = np.hypot(X, Y)
        th = np.arctan2(Y, X)
        rc = self.R0 + self.wob(th)
        w = self.width(th)
        d = r - rc
        inner = np.clip(1 - (d / w) ** 2, 0, 1)
        land = 2.2 * np.sqrt(inner) * (0.85 + 0.2 * fnoise(X, Y, 2.2))
        gap = np.exp(-((th - 2.4) / 0.045) ** 2) + np.exp(-((th + 1.25) / 0.05) ** 2) + np.exp(-((th - 3.0) / 0.03) ** 2)
        land = land * (1 - np.clip(gap * 1.6, 0, 1)) - 0.35 * np.clip(gap * 1.6, 0, 1)
        dd_l = np.clip(-d - w, 0, None)
        lag = -(1.2 * smooth01(dd_l, 0, 40) + 7.0 * smooth01(dd_l, 30, 360)) + 0.4 * fnoise(X, Y, 1.0, 3.0)
        heads = np.clip(fnoise(X, Y, 3.1, 1.7) - 0.45, 0, 1) * 9.0 * smooth01(dd_l, 140, 260)
        lag = lag + heads
        dd_o = np.clip(d - w, 0, None)
        out = -(0.8 * smooth01(dd_o, 0, 60)) - 0.25 * np.clip(dd_o - 60, 0, None) + 0.1 * fnoise(X, Y, 1.7)
        z = np.where(np.abs(d) < w, land, np.where(d < 0, lag, out))
        z = np.clip(z, -70, 6)
        # the sandspit lobe pushing into the lagoon
        lx, ly = self.spit_center()
        lobe = 1.15 * np.exp(-(((X - lx) / 95.0) ** 2 + ((Y - ly) / 26.0) ** 2)) - 0.2
        z = np.maximum(z, lobe + 0.1 * fnoise(X, Y, 4.0))
        return z

    def build(self, size=3800.0, res=760, palms=True, NF=100, mono=False, water=True, palm_n=1500):
        xs = np.linspace(-size / 2, size / 2, res + 1)
        X, Y = np.meshgrid(xs, xs)
        Z = self.height(X, Y)
        m, nb, b, out = M.new('AtollGround')
        tc = nb.n('ShaderNodeTexCoord')
        sep = nb.n('ShaderNodeSeparateXYZ')
        nb.l(tc, 'Object', sep, 'Vector')
        mr = nb.n('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = -30.0
        mr.inputs['From Max'].default_value = 3.0
        mr.clamp = True
        nb.l(sep, 'Z', mr, 'Value')
        sand_hi = (0.86, 0.80, 0.66)
        cr = ramp(nb, [
            (0.00, (0.003, 0.025, 0.06)), (0.48, (0.008, 0.075, 0.17)), (0.727, (0.02, 0.26, 0.38)),
            (0.833, (0.10, 0.60, 0.60)), (0.879, (0.36, 0.82, 0.74)), (0.903, (0.78, 0.88, 0.80)),
            (0.913, (0.66, 0.60, 0.46)), (0.93, sand_hi), (0.948, (0.30, 0.34, 0.14)), (0.975, (0.07, 0.15, 0.04)),
            (1.0, (0.05, 0.12, 0.03))])
        nb.l(mr, 'Result', cr, 'Fac')
        nz = nb.n('ShaderNodeTexNoise', Scale=0.07, Detail=7.0)
        nb.l(tc, 'Object', nz, 'Vector')
        mxn = nb.n('ShaderNodeMix')
        mxn.data_type = 'RGBA'
        mxn.blend_type = 'MULTIPLY'
        mxn.inputs['Factor'].default_value = 0.55
        nb.l(cr, 'Color', mxn, 6)
        cn = ramp(nb, [(0.25, (0.62, 0.62, 0.62)), (0.75, (1.25, 1.25, 1.2))])
        nb.l(nz, 'Fac', cn, 'Fac')
        nb.l(cn, 'Color', mxn, 7)
        b.inputs['Roughness'].default_value = 0.85
        bn = nb.n('ShaderNodeTexNoise', Scale=0.9, Detail=8.0)
        nb.l(tc, 'Object', bn, 'Vector')
        bp = nb.n('ShaderNodeBump', Strength=0.35, Distance=0.4)
        nb.l(bn, 'Fac', bp, 'Height')
        nb.l(bp, 'Normal', b, 'Normal')
        rr_ = np.hypot(X, Y); th_ = np.arctan2(Y, X)
        d_ = rr_ - (self.R0 + self.wob(th_)); w_ = self.width(th_)
        foam = (np.exp(-((d_ - w_ - 28) / 7.0) ** 2) * (0.55 + 0.45 * fnoise(X, Y, 6.0))
                + 0.5 * np.exp(-((d_ - w_ - 4) / 4.0) ** 2) + 0.25 * np.exp(-((-d_ - w_ - 6) / 5.0) ** 2))
        col = 1.0 + 2.0 * np.clip(foam, 0, 1)[..., None] * np.ones((1, 1, 3))
        va = nb.n('ShaderNodeVertexColor')
        va.layer_name = 'Col'
        mx2 = nb.n('ShaderNodeMix')
        mx2.data_type = 'RGBA'
        mx2.blend_type = 'MULTIPLY'
        mx2.inputs['Factor'].default_value = 1.0
        nb.l(mxn, 2, mx2, 6)
        nb.l(va, 'Color', mx2, 7)
        nb.l(mx2, 2, b, 'Base Color')
        grid_obj('Atoll', X, Y, Z, colors=col, mat=m)
        deep_plane()
        if water:
            water_surface('AtollWater', z=0.0, size=size * 3.2, NF=NF, tint=(0.0, 0.06, 0.08), body=0.20, wave=0.12, wscale=0.3)
        if palms:
            rnd = random.Random(5)
            pts = []
            lx, ly = self.spit_center()
            tries = 0
            while len(pts) < palm_n and tries < palm_n * 12:
                tries += 1
                th = rnd.uniform(-math.pi, math.pi)
                if tries % 7 == 0:
                    th = rnd.uniform(-0.18, 0.18)       # extra density at the spit end of the ring
                rc = self.R0 + float(self.wob(np.array(th)))
                w = float(self.width(np.array(th)))
                rr = rc + rnd.uniform(-0.8, 0.8) * w
                x, y = rr * math.cos(th), rr * math.sin(th)
                z = float(self.height(np.array([x]), np.array([y]))[0])
                if z > 0.9 and math.hypot(x - lx, y - ly) > 95:
                    pts.append((x, y, z))
            scatter_palms(palm_mesh_obj(), pts)
        return Z


def taraia_shape(center, rot_deg=0.0, scale=1.0, glow_keys=None, z=0.35):
    """The pale 'plane-shaped' patch on the spit: a flat cross of pale crust/debris (illustrative)."""
    m = M.principled('TaraiaPale', base=(0.93, 0.91, 0.84), rough=0.7, grime=0.25, rough_noise=0.15, emission=(1.0, 0.97, 0.85), emit=0.0)
    root = Md.empty('TaraiaShape', (center[0], center[1], z))
    parts = [boxm('TFus', (0, 0, 0), (7.0 * scale, 38.0 * scale, 0.35), m, 0.1),
             boxm('TWing', (0, 2.0 * scale, 0), (36.0 * scale, 7.5 * scale, 0.3), m, 0.1),
             boxm('TTail', (0, -16.0 * scale, 0), (13.0 * scale, 5.0 * scale, 0.3), m, 0.08)]
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(rot_deg))
    if glow_keys:
        b = m.node_tree.nodes['Principled BSDF']
        for f, v in glow_keys:
            b.inputs['Emission Strength'].default_value = v
            b.inputs['Emission Strength'].keyframe_insert('default_value', frame=f)
    return root


# ------------------------------------------------------------------ local sandspit (b09 / b10 / b11 / b12)
def driftwood_mat(name='Driftwood', crust=0.0, bump_scale=14):
    m = M.principled(name, base=(0.30, 0.23, 0.17), rough=0.8, grime=0.55, bump=0.7, bump_scale=bump_scale)
    if crust > 0:
        nt = m.node_tree
        nb = M.NB(nt)
        b = nt.nodes['Principled BSDF']
        tc = nb.n('ShaderNodeTexCoord')
        nz = nb.n('ShaderNodeTexNoise', Scale=11.0, Detail=9.0, Roughness=0.7)
        nb.l(tc, 'Object', nz, 'Vector')
        cr = ramp(nb, [(0.50, (0.0, 0.0, 0.0)), (0.60, (1.0, 1.0, 1.0))])
        nb.l(nz, 'Fac', cr, 'Fac')
        base_src = [l.from_socket for l in nt.links if l.to_socket == b.inputs['Base Color']]
        mx = nb.n('ShaderNodeMix')
        mx.data_type = 'RGBA'
        mx.blend_type = 'MIX'
        if base_src:
            nt.links.new(base_src[0], mx.inputs[6])
        else:
            mx.inputs[6].default_value = (0.3, 0.23, 0.17, 1)
        mx.inputs[7].default_value = (0.95, 0.94, 0.88, 1)
        fa = nb.math('MULTIPLY', cr.outputs[0], vb=crust)
        nb.l(fa, 0, mx, 'Factor')
        nb.l(mx, 2, b, 'Base Color')
        rr = nb.math('SUBTRACT', va=0.82, b=fa.outputs[0])
        nb.l(rr, 0, b, 'Roughness')
    return m


def trunk(name, p0, p1, r0, r1, mat, root_end=True):
    """Tapered log with a flared root end (root_end at p0)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bm = bmesh.new()
    n = 10
    rs = []
    q = d.to_track_quat('Z', 'Y')
    for i in range(n + 1):
        t = i / n
        r = r0 + (r1 - r0) * t
        if root_end and t < 0.12:
            r *= 1 + 0.9 * (1 - t / 0.12) ** 2
        ring = []
        for k in range(9):
            a = k * math.pi * 2 / 9
            v = q @ Vector((r * math.cos(a), r * math.sin(a) * 0.92, t * d.length))
            ring.append(bm.verts.new(p0 + v))
        rs.append(ring)
    for i in range(n):
        for k in range(9):
            bm.faces.new((rs[i][k], rs[i][(k + 1) % 9], rs[i + 1][(k + 1) % 9], rs[i + 1][k]))
    bm.normal_update()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = link(bpy.data.objects.new(name, me))
    o.data.materials.append(mat)
    return o


def spit_height(X, Y):
    ridge = 0.95 * np.exp(-((Y + 2.0) / 24.0) ** 2) * (1 - smooth01(np.abs(X), 120, 200))
    Z = ridge + 0.05 * fnoise(X, Y, 14.0)
    Z = Z - 2.6 * smooth01(Y, 10, 40) - 2.6 * smooth01(-Y, 26, 80)
    Z = Z + 3.1 * np.exp(-((Y - 196.0) / 9.0) ** 2) * (1 - smooth01(np.abs(X), 330, 420))   # far lagoon rim
    return np.maximum(Z, -2.6 + 0.05 * fnoise(X, Y, 9.0))


def spit_z(x, y):
    return float(spit_height(np.array([x]), np.array([y]))[0])


def spit_scene(NF, golden=True, sun_az=250, elev=14, water_z=-0.05, wash=False):
    """Local sandspit: coral-sand ridge running along X, lagoon on +Y, ocean on -Y, palms on the far rim.
    Returns dict with clump objects. Hero clump at the origin."""
    size, res = 420.0, 420
    xs = np.linspace(-size / 2, size / 2, res + 1)
    X, Y = np.meshgrid(xs, xs)
    Z = spit_height(X, Y)
    col = np.ones(X.shape + (3,))
    wet = smooth01(-Z, -0.02, 0.5)
    col[..., 0] = 2.7 - 1.0 * wet
    col[..., 1] = 2.6 - 0.8 * wet
    col[..., 2] = 2.3 - 0.9 * wet
    sm = M.texture_set('SpitSand', 'damp_beach_sand', scale=0.45, tint=(1.5, 1.45, 1.3), box=True)
    nt = sm.node_tree
    nb = M.NB(nt)
    mxs = [n for n in nt.nodes if n.bl_idname == 'ShaderNodeMix']
    if mxs:
        at = nb.n('ShaderNodeVertexColor')
        at.layer_name = 'Col'
        nt.links.new(at.outputs['Color'], mxs[0].inputs[7])
    sandz = np.where(Z < -0.02, Z, Z)
    grid_obj('Spit', X, Y, sandz, colors=col, mat=sm)
    # shallow-water tint on the floor under the lagoon: handled by the water plane
    deep_plane(z=-2.7, size=20000.0, color=(0.04, 0.22, 0.26))
    water_surface('SpitWater', z=water_z, size=6000, NF=NF, tint=(0.0, 0.10, 0.12), body=0.30, wave=0.07, wscale=0.45)
    # far palm rim across the lagoon
    me = palm_mesh_obj()
    rnd = random.Random(8)
    pts = []
    for k in range(150):
        pts.append((rnd.uniform(-330, 330), rnd.uniform(188, 204), 0.7))
    scatter_palms(me, pts, seed=4, scale=(0.9, 1.5))
    # lighting
    if golden:
        dawn_world(sun_az=sun_az, elev=elev, strength=5.5, hdri_strength=1.0)
    return Z


def clump(NF, wash=False, crust=0.35, loc=(0.0, 0.0), seed=2):
    """Clump of fallen palm trunks + roots + dry fronds on the sand (the 'Taraia object'). Returns list of objs."""
    rnd = random.Random(seed)
    wm = driftwood_mat('Driftwood', crust=crust)
    objs = []
    lx, ly = loc
    z0 = spit_z(lx, ly) + 0.38
    # main trunk (fuselage-like), two crossing trunks (wing-like), a tail pair
    spec = [((-8.5, -0.3, z0), (7.5, 0.4, z0 + 0.15), 0.42, 0.28),
            ((-1.5, -6.2, z0 + 0.1), (0.9, 5.8, z0 + 0.25), 0.34, 0.2),
            ((-4.0, 3.5, z0 + 0.2), (3.2, -2.8, z0 + 0.35), 0.3, 0.18),
            ((6.8, 0.3, z0 + 0.1), (10.4, -2.2, z0 + 0.2), 0.22, 0.14),
            ((6.8, 0.5, z0 + 0.1), (10.2, 2.6, z0 + 0.2), 0.22, 0.14),
            ((-6.0, 1.0, z0 + 0.3), (-2.0, -1.6, z0 + 0.5), 0.25, 0.16)]
    for k, (a, b, r0, r1) in enumerate(spec):
        o = trunk('Log%d' % k, (a[0] + lx, a[1] + ly, a[2]), (b[0] + lx, b[1] + ly, b[2]), r0, r1, wm)
        objs.append(o)
    # root masses (spiky ends)
    for k in range(12):
        a = rnd.uniform(0, 6.283)
        base = Vector((-8.6 + lx, -0.3 + ly, z0 + 0.1))
        tip = base + Vector((-1.8 * abs(math.cos(a)) - 0.4, 1.6 * math.sin(a), rnd.uniform(0.0, 1.0)))
        objs.append(trunk('Root%d' % k, base, tip, 0.1, 0.02, wm, root_end=False))
    # dry fronds scattered
    me = palm_mesh_obj(dry=True)
    for k in range(0):
        o = bpy.data.objects.new('Dry%d' % k, me)
        o.location = (lx + rnd.uniform(-9, 9), ly + rnd.uniform(-6, 6), z0 + 0.1)
        o.rotation_euler = (math.radians(88), 0, rnd.uniform(0, 6.283))
        o.scale = (0.5, 0.5, 0.5)
        bpy.context.scene.collection.objects.link(o)
    if wash:
        # branches / small logs in the surf zone that wash away (keyed); the Y-trunk stays
        pass
    return objs


def ytrunk(loc=(0.0, 0.0), z=0.55, yaw=0.0, crust=0.3):
    wm = driftwood_mat('YDrift', crust=crust)
    lx, ly = loc
    parts = [trunk('YStem', (lx, ly, z), (lx + 3.2, ly, z + 0.1), 0.38, 0.3, wm),
             trunk('YArm1', (lx + 3.1, ly, z + 0.1), (lx + 6.0, ly + 1.7, z + 0.5), 0.27, 0.15, wm, root_end=False),
             trunk('YArm2', (lx + 3.1, ly, z + 0.1), (lx + 6.0, ly - 1.8, z + 0.45), 0.26, 0.14, wm, root_end=False)]
    root = Md.empty('YTrunk', (lx, ly, 0))
    for p in parts:
        p.parent = root
    root.location = (0, 0, 0)
    return parts


# ------------------------------------------------------------------ generic twin-engine plane (hologram wireframe)
def wire_mat(name='WirePlane', color=(0.6, 0.92, 1.0), strength=5.0):
    m, nb, b, out = M.new(name)
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=strength)
    em.inputs['Color'].default_value = (*color, 1)
    wf = nb.n('ShaderNodeWireframe')
    wf.inputs['Size'].default_value = 0.05
    mx = nb.n('ShaderNodeMixShader')
    mx.name = 'Mix'
    nb.l(wf, 'Fac', mx, 'Fac')
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    fade = nb.n('ShaderNodeValue')
    fade.name = 'Fade'
    fade.outputs[0].default_value = 1.0
    mul = nb.math('MULTIPLY', wf.outputs['Fac'], fade.outputs[0])
    nb.l(mul, 0, mx, 'Fac')
    return m


def key_fade(m, keys):
    s = m.node_tree.nodes['Fade'].outputs[0]
    for f, v in keys:
        s.default_value = v
        s.keyframe_insert('default_value', frame=f)


def wire_plane(center, span=13.0, yaw_deg=0.0, mat=None):
    """Generic unmarked twin-engine monoplane, ~11 m long, built from subdivided primitives (wireframe shows edges)."""
    root = Md.empty('WirePlane', center)
    parts = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=10, radius=1.0, location=(0, 0, 0))
    fus = bpy.context.active_object
    fus.scale = (0.85, 5.6, 0.85)
    parts.append(fus)
    parts.append(boxm('WWing', (0, 0.6, 0.0), (span, 1.9, 0.16), mat))
    parts.append(boxm('WTail', (0, -5.0, 0.35), (4.2, 1.1, 0.12), mat))
    parts.append(boxm('WFin', (0, -5.1, 1.0), (0.12, 1.2, 1.6), mat))
    for s in (1, -1):
        parts.append(cyl('WEng%d' % s, (s * 2.7, 1.9, -0.05), (s * 2.7, -0.7, -0.05), 0.42, mat, 12))
    for p in parts:
        if p.data.materials:
            p.data.materials[0] = mat
        else:
            p.data.materials.append(mat)
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw_deg))
    return root


# ------------------------------------------------------------------ survey / expedition ship (generic, from mh370 b15a)
def expedition_ship(NF, y_speed=0.06):
    L2, B, DECK, KEEL = 42.0, 16.0, 3.2, -5.2

    def hb(y):
        u = y / L2
        return B / 2 * ((1 - u ** 2.3) ** 0.5 if u > 0 else (1 - abs(u) ** 6) ** 0.5) if abs(u) < 1 else 0.05
    rings = []
    for k in range(41):
        y = -L2 + 2 * L2 * k / 40
        w = max(0.15, hb(y))
        sec = [(w, DECK + 0.6 * max(0, y / L2) ** 2 * 3), (w * 0.98, 0.0), (w * 0.9, -3.0), (w * 0.55, -4.8), (0.0, KEEL)]
        pts = sec + [(-x, z) for x, z in reversed(sec[:-1])]
        rings.append([(x, y, z) for x, z in pts])
    v, f = Md.loft(rings, cap_start=True, cap_end=True)
    hull_m = M.principled('Hull', base=(0.10, 0.13, 0.20), rough=0.35, grime=0.35, rough_noise=0.1)
    white = M.principled('Super', base=(0.82, 0.82, 0.8), rough=0.45, grime=0.25)
    deck_m = M.principled('Deck', base=(0.22, 0.26, 0.24), rough=0.7, grime=0.3)
    steel = M.principled('Steel', base=(0.85, 0.36, 0.06), rough=0.45, metal=0.2)
    win = M.principled('Win', base=(0.01, 0.012, 0.015), rough=0.05, coat=1.0)
    ship = Md.empty('Ship')
    Md.mesh_obj('HullMesh', v, f, parent=ship, smooth=True, mats=(hull_m,))
    parts = [boxm('DeckPlate', (0, -6, DECK + 0.05), (B * 0.94, 2 * L2 * 0.7, 0.1), deck_m)]
    for i, (y, w, h, z) in enumerate(((16, 13, 3.0, DECK + 1.5), (18, 11, 2.8, DECK + 4.4), (20, 9, 2.6, DECK + 7.1))):
        parts.append(boxm('Super%d' % i, (0, y, z), (w, 12 - i * 2, h), white, 0.08))
    parts.append(boxm('Bridge', (0, 21.5, DECK + 9.4), (10, 5.5, 2.0), white, 0.06))
    parts.append(boxm('BridgeWin', (0, 18.7, DECK + 9.6), (9.6, 0.1, 1.0), win))
    parts.append(cyl('Mast', (0, 22, DECK + 10.4), (0, 22, DECK + 17), 0.25, white, 12))
    parts.append(boxm('Funnel', (0, 10, DECK + 4.5), (3, 4, 6), white, 0.1))
    for s in (1, -1):
        parts.append(cyl('AF%d' % s, (s * 5.5, -L2 + 2.5, DECK), (s * 2.0, -L2 - 1.5, DECK + 9.0), 0.35, steel, 12))
    parts.append(cyl('AFtop', (-2.2, -L2 - 1.4, DECK + 9.0), (2.2, -L2 - 1.4, DECK + 9.0), 0.4, steel, 12))
    for p in parts:
        p.parent = ship
    # ship points +Y; sail it along +Y
    for fr in range(0, NF + 1, 2):
        t = fr / 30.0
        ship.location = (0, y_speed * fr, 0.35 * math.sin(t * 0.9))
        ship.rotation_euler = (math.radians(1.2 * math.sin(t * 0.7)), math.radians(2.2 * math.sin(t * 0.55 + 0.6)), 0)
        ship.keyframe_insert('location', frame=fr)
        ship.keyframe_insert('rotation_euler', frame=fr)
    return ship


# ------------------------------------------------------------------ drone / small boat / sled / tube
def quadcopter(name='Drone', loc=(0, 0, 0), scale=1.0, NF=100):
    root = Md.empty(name, loc)
    dark = M.principled('DroneBody', base=(0.06, 0.06, 0.07), rough=0.35, metal=0.2)
    grey = M.principled('DroneArm', base=(0.55, 0.56, 0.58), rough=0.4)
    parts = [boxm(name + 'Body', (0, 0, 0), (0.36, 0.36, 0.1), dark, 0.03)]
    rot = M.principled('Rotor', base=(0.02, 0.02, 0.02), rough=0.5, alpha=0.35)
    discs = []
    for i, (sx, sy) in enumerate(((1, 1), (-1, 1), (1, -1), (-1, -1))):
        parts.append(cyl(name + 'Arm%d' % i, (0, 0, 0), (sx * 0.32, sy * 0.32, 0.02), 0.025, grey, 8))
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.2, depth=0.006, location=(sx * 0.32, sy * 0.32, 0.07))
        d = bpy.context.active_object
        d.name = '%sRotor%d' % (name, i)
        d.data.materials.append(rot)
        d.visible_shadow = False
        parts.append(d)
        discs.append(d)
    for p in parts:
        p.parent = root
    root.scale = (scale,) * 3
    return root


def sensor_sled(name='Sled', loc=(0, 0, 0), scale=1.0):
    root = Md.empty(name, loc)
    yel = M.principled('SledY', base=(0.85, 0.55, 0.06), rough=0.35, coat=0.5)
    blk = M.principled('SledK', base=(0.02, 0.02, 0.02), rough=0.4)
    alu = M.principled('SledA', base=(0.7, 0.72, 0.75), rough=0.3, metal=1.0)
    parts = [cyl(name + 'Body', (0, -0.9, 0), (0, 0.9, 0), 0.17, yel, 20)]
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=0.17, location=(0, 0.9, 0))
    nose = bpy.context.active_object
    nose.scale = (1, 1.5, 1)
    nose.data.materials.append(yel)
    parts.append(nose)
    parts.append(boxm(name + 'Fin1', (0, -0.8, 0.2), (0.02, 0.35, 0.3), blk))
    parts.append(boxm(name + 'Fin2', (0.2, -0.8, 0), (0.3, 0.35, 0.02), blk))
    parts.append(boxm(name + 'Fin3', (-0.2, -0.8, 0), (0.3, 0.35, 0.02), blk))
    parts.append(cyl(name + 'Boom', (0, 0.9, 0.0), (0, 2.2, 0.0), 0.02, alu, 8))
    for p in parts:
        p.parent = root
    root.scale = (scale,) * 3
    return root


def steel_tube(name='Tube', loc=(0, 0, 0.1), length=0.76, r=0.07, yaw=25.0):
    rust = M.principled('TubeRust', base=(0.55, 0.22, 0.08), rough=0.85, metal=0.55, grime=0.6, rough_noise=0.2, bump=0.9, bump_scale=30)
    o = cyl(name, (-length / 2, 0, 0), (length / 2, 0, 0), r, rust, 28)
    root = Md.empty(name + 'Root', loc)
    o.parent = root
    root.rotation_euler = (math.radians(3), math.radians(5), math.radians(yaw))
    return o


def lagoon_floor(NF, extent=140.0, depth=-4.0, ripple=0.06, tint=(0.95, 1.0, 1.0)):
    """Underwater sand floor lit from above: ground plane, aqua fog, ripples via texture bump."""
    xs = np.linspace(-extent, extent, 321)
    X, Y = np.meshgrid(xs, xs)
    Z = depth + ripple * np.sin(X * 1.7 + 0.8 * np.sin(Y * 0.5)) + 0.12 * fnoise(X, Y, 3.0)
    sm = M.texture_set('LagSand', 'damp_beach_sand', scale=0.9, tint=tuple(1.5 * t for t in tint), box=True)
    grid_obj('LagoonFloor', X, Y, Z, mat=sm)
    return Z


def underwater_world(strength=1.6, density=0.03, color=(0.2, 0.62, 0.68), center=(0, 0, -2.0), size=(300, 300, 30)):
    w = bpy.data.worlds.new('UW')
    bpy.context.scene.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.28, 0.36, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = strength
    Wd.fog(center=center, size=size, density=density, color=color, anisotropy=0.5)
