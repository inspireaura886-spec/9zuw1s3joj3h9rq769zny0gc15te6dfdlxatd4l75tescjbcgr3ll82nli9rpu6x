"""Interior sets: 1970s jet cockpit (captain's view through the windshield) and a 1970s radar control room
with an animated PPI scope (rotating sweep, phosphor afterglow, range rings, coast clutter, moving blips)."""
import bpy, math, random
import numpy as np
from mathutils import Vector
from . import mat as M, world as Wd, models as Md


def _img(name, arr):
    h, w = arr.shape[:2]
    im = bpy.data.images.new(name, w, h, alpha=False)
    rgba = np.ones((h, w, 4), np.float32)
    rgba[..., :3] = arr[..., :3]
    im.pixels.foreach_set(rgba.ravel())
    return im


def gauge_face(name, kind=0, seed=0, size=256):
    """Black dial, white ticks, needle; slight warm backlight. Returns an image."""
    rnd = random.Random(seed)
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    c = (size - 1) / 2
    dx, dy = (x - c) / c, (y - c) / c
    r = np.sqrt(dx * dx + dy * dy)
    th = np.arctan2(dy, dx)
    img = np.zeros((size, size, 3), np.float32) + 0.012
    ring = (np.abs(r - 0.92) < 0.025)
    img[ring] = 0.25
    nt = [12, 10, 8, 16][kind % 4]
    a = (th / (2 * np.pi) * nt) % 1.0
    ticks = ((a < 0.06) | (a > 0.94)) & (r > 0.70) & (r < 0.86)
    minor = (((th / (2 * np.pi) * nt * 5) % 1.0) < 0.12) & (r > 0.78) & (r < 0.86)
    img[minor] = 0.5
    img[ticks] = 0.95
    ang = rnd.uniform(-2.5, 2.5)
    ux, uy = math.cos(ang), math.sin(ang)
    along = dx * ux + dy * uy
    perp = np.abs(-dx * uy + dy * ux)
    needle = (along > -0.12) & (along < 0.78) & (perp < 0.025 * (1 - along * 0.6))
    img[needle] = np.array([1.0, 0.92, 0.7])
    hub = r < 0.07
    img[hub] = 0.15
    if kind % 4 == 3:  # attitude indicator: dark sky/ground split
        img[(dy > 0.05) & (r < 0.7)] = np.array([0.06, 0.04, 0.02])
        img[(dy <= 0.05) & (r < 0.7)] = np.array([0.03, 0.05, 0.09])
        img[(np.abs(dy - 0.05) < 0.015) & (r < 0.7)] = 0.9
    img[r > 1.0] = 0.0
    return _img(name, img)


def disc(name, center, normal, radius, mat, parent=None, n=32):
    nrm = Vector(normal).normalized()
    q = nrm.to_track_quat('Z', 'Y')
    pts, uvs = [], []
    for k in range(n):
        t = 2 * math.pi * k / n
        p = q @ Vector((math.cos(t) * radius, math.sin(t) * radius, 0))
        pts.append(tuple(Vector(center) + p))
        uvs.append((0.5 + 0.5 * math.cos(t), 0.5 + 0.5 * math.sin(t)))
    o = Md.mesh_obj(name, pts, [tuple(range(n))], parent=parent, smooth=False, mats=(mat,))
    uv = o.data.uv_layers.new()
    for li, loop in enumerate(o.data.loops):
        uv.data[li].uv = uvs[loop.vertex_index]
    return o


def bevel(o, w=0.01, seg=3):
    b = o.modifiers.new('Bev', 'BEVEL')
    b.width = w
    b.segments = seg
    b.limit_method = 'ANGLE'
    return b


def cockpit(panel_glow=1.2, seed=5):
    """Captain's seat at origin looking +Y. Windshield ~1.2 m ahead. Returns dict of key objects/points."""
    rnd = random.Random(seed)
    root = Md.empty('Cockpit')
    leather = M.principled('Glareshield', base=(0.018, 0.018, 0.02), rough=0.75, bump=0.25, bump_scale=120, rough_noise=0.15)
    paint = M.principled('PanelPaint', base=(0.06, 0.065, 0.07), rough=0.55, grime=0.4, rough_noise=0.2, bump=0.05)
    frame = M.principled('FrameMetal', base=(0.09, 0.09, 0.095), rough=0.45, metal=0.6, grime=0.4)
    glass = M.thin_glass('Windshield', refl=0.06)  # thin pane: no refraction stripes (2026-11-02)
    # windshield frame: three panes, pillars, top + sill
    pillars = [(-0.95, 1.30), (-0.35, 1.42), (0.35, 1.42), (0.95, 1.30)]
    for i, (x, y) in enumerate(pillars):
        o = Wd.box('Pillar%d' % i, (x, y + 0.1, 0.68), (0.06, 0.06, 0.82))
        o.rotation_euler = (math.radians(-18), 0, math.atan2(-x, 4) * 0.4)
        o.data.materials.append(frame)
        bevel(o, 0.015)
        o.parent = root
    top = Wd.box('WsTop', (0, 1.30, 1.10), (2.2, 0.35, 0.06))
    top.data.materials.append(frame)
    top.parent = root
    sill = Wd.box('Glareshield', (0, 1.08, 0.24), (2.1, 0.42, 0.10))
    sill.data.materials.append(leather)
    bevel(sill, 0.04, 4)
    sill.parent = root
    for i in range(3):
        x0, x1 = pillars[i][0], pillars[i + 1][0]
        y0, y1 = pillars[i][1], pillars[i + 1][1]
        pv = [(x0, y0 - 0.04, 0.30), (x1, y1 - 0.04, 0.30), (x1, y1 + 0.30, 1.08), (x0, y0 + 0.30, 1.08)]
        Md.mesh_obj('Pane%d' % i, pv, [(0, 1, 2, 3)], parent=root, smooth=False, mats=(glass,))
    # instrument panel (below glareshield) with backlit gauges
    pan = Wd.box('Panel', (0, 1.12, -0.06), (2.0, 0.08, 0.52))
    pan.rotation_euler = (math.radians(-12), 0, 0)
    pan.data.materials.append(paint)
    pan.parent = root
    gl = []
    k = 0
    for row, z in enumerate((0.09, -0.07, -0.21)):
        for col in range(-6, 7):
            if rnd.random() < 0.15:
                continue
            x = col * 0.135 + (0.06 if row % 2 else 0)
            r = 0.05 if abs(col) > 2 else 0.058
            im = gauge_face('gauge%d' % k, kind=(col + row) % 4, seed=k)
            m, nb, b, out = M.new('Gauge%d' % k)
            M.no_light(m)
            m.node_tree.nodes.remove(b)
            tx = nb.n('ShaderNodeTexImage')
            tx.image = im
            em = nb.n('ShaderNodeEmission', Strength=panel_glow)
            nb.l(tx, 'Color', em, 'Color')
            gb = nb.n('ShaderNodeBsdfGlossy', Roughness=0.15)
            fr = nb.n('ShaderNodeLayerWeight', Blend=0.12)
            blk = nb.n('ShaderNodeEmission', Strength=0.0)
            mxs = nb.n('ShaderNodeMixShader')
            nb.l(fr, 'Fresnel', mxs, 'Fac')
            nb.l(blk, 'Emission', mxs, 1)
            nb.l(gb, 'BSDF', mxs, 2)
            ad = nb.n('ShaderNodeAddShader')
            nb.l(em, 'Emission', ad, 0)
            nb.l(mxs, 'Shader', ad, 1)
            nb.l(ad, 'Shader', out, 'Surface')
            # tilt with the panel
            zz = z
            yy = 1.12 - 0.045 - (zz + 0.06) * math.tan(math.radians(12))
            disc('GaugeFace%d' % k, (x, yy, zz), (0, -1, math.tan(math.radians(12))), r, m, parent=root)
            ring = disc('GaugeRim%d' % k, (x, yy + 0.002, zz), (0, -1, math.tan(math.radians(12))), r * 1.18, frame, parent=root)
            gl.append((x, yy, zz))
            k += 1
    # warm-white flood lamp under the glareshield (dim)
    Wd.area('PanelFlood', (0, 0.95, 0.15), (0, 1.15, -0.2), color=(1.0, 0.8, 0.6), power=3.0, size=1.6)
    # side console + yoke column silhouette
    col = Wd.box('YokeColumn', (-0.0, 0.85, -0.35), (0.09, 0.09, 0.55))
    col.rotation_euler = (math.radians(-25), 0, 0)
    col.data.materials.append(frame)
    col.parent = root
    yoke = Wd.box('Yoke', (0, 0.74, -0.05), (0.42, 0.05, 0.06))
    yoke.data.materials.append(leather)
    bevel(yoke, 0.02)
    yoke.parent = root
    for s in (-1, 1):
        h = Wd.box('YokeHorn', (s * 0.2, 0.74, -0.12), (0.05, 0.05, 0.16))
        h.data.materials.append(leather)
        bevel(h, 0.02)
        h.parent = root
    # side walls / roof (dark, so light only enters through the glass)
    wallm = M.principled('Wall', base=(0.05, 0.05, 0.055), rough=0.8, bump=0.1)
    for nm, c, s in (('WallL', (-1.15, 0.5, 0.3), (0.06, 1.8, 1.6)), ('WallR', (1.15, 0.5, 0.3), (0.06, 1.8, 1.6)),
                     ('Roof', (0, 0.4, 1.16), (2.4, 1.9, 0.06)), ('Floor', (0, 0.4, -0.75), (2.4, 1.9, 0.06))):
        o = Wd.box(nm, c, s)
        o.data.materials.append(wallm)
        o.parent = root
    # side windows (small) in walls are omitted: the light story comes from the front
    return {'root': root, 'gauges': gl}


def ppi_material(name='PPI', sweep_s=4.0, frames=200, blips=(), seed=0, glow=6.0, clutter=0.6, t0=0.0, floor=0.0):
    """Animated radar scope on a UV disc. blips = [((x0,y0),(x1,y1), brightness)] in [-1,1] scope space over frames.
    Everything (rings, coast clutter, blips) is modulated by the phosphor afterglow behind the rotating beam.
    Optional (2026-11-03, dc-radar): floor = blip afterglow floor (0..1, blips never fully fade; default 0 = old look);
    a blip may carry a 4th item vis = [(frame, 0..1), ...] keyed visibility (vanish / return)."""
    m, nb, b, out = M.new(name)
    M.no_light(m)
    nt = m.node_tree
    nt.nodes.remove(b)
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'UV', sep, 'Vector')
    px = nb.math('MULTIPLY_ADD', sep.outputs['X'], va=None, vb=2.0)
    px.inputs[2].default_value = -1.0
    py = nb.math('MULTIPLY_ADD', sep.outputs['Y'], vb=2.0)
    py.inputs[2].default_value = -1.0
    comb = nb.n('ShaderNodeCombineXYZ')
    nb.l(px, 0, comb, 'X')
    nb.l(py, 0, comb, 'Y')
    rlen = nb.n('ShaderNodeVectorMath')
    rlen.operation = 'LENGTH'
    nb.l(comb, 'Vector', rlen, 'Vector')
    r = rlen.outputs['Value']
    ang = nb.math('ARCTAN2', py.outputs[0], px.outputs[0])
    # time (keyed linear): beam angle = -2pi * t / sweep
    tv = nb.n('ShaderNodeValue')
    tv.outputs[0].default_value = t0
    tv.outputs[0].keyframe_insert('default_value', frame=0)
    tv.outputs[0].default_value = t0 + frames / 30.0
    tv.outputs[0].keyframe_insert('default_value', frame=frames)
    beam = nb.math('MULTIPLY', tv.outputs[0], vb=2 * math.pi / sweep_s)
    # time since beam passed this angle (clockwise sweep), in turns
    d = nb.math('ADD', beam.outputs[0], ang.outputs[0])
    d2 = nb.math('DIVIDE', d.outputs[0], vb=2 * math.pi)
    fr = nb.math('FRACT', d2.outputs[0])
    after = nb.math('MULTIPLY', fr.outputs[0], vb=-5.0)
    glowc = nb.math('EXPONENT', after.outputs[0])
    beamline = nb.math('LESS_THAN', fr.outputs[0], vb=0.0028)
    # range rings
    r5 = nb.math('MULTIPLY', r, vb=5.0)
    rf = nb.math('FRACT', r5.outputs[0])
    rd = nb.math('ABSOLUTE', nb.math('SUBTRACT', rf.outputs[0], vb=0.5).outputs[0])
    rings = nb.math('GREATER_THAN', rd.outputs[0], vb=0.485)
    rings2 = nb.math('MULTIPLY', rings.outputs[0], vb=0.35)
    # coast clutter: thresholded noise in scope space
    nz = nb.n('ShaderNodeTexNoise', Scale=2.2, Detail=8.0, Roughness=0.7)
    nz.noise_dimensions = '4D'
    nz.inputs['W'].default_value = seed
    nb.l(comb, 'Vector', nz, 'Vector')
    cl = nb.n('ShaderNodeMapRange')
    cl.inputs['From Min'].default_value = 0.56
    cl.inputs['From Max'].default_value = 0.62
    nb.l(nz, 'Fac', cl, 'Value')
    speck = nb.n('ShaderNodeTexWhiteNoise')
    nb.l(comb, 'Vector', speck, 'Vector')
    sp = nb.math('GREATER_THAN', speck.outputs['Value'], vb=0.992)
    clut = nb.math('ADD', nb.math('MULTIPLY', cl.outputs['Result'], vb=clutter).outputs[0], nb.math('MULTIPLY', sp.outputs[0], vb=0.5).outputs[0])
    tot = nb.math('ADD', rings2.outputs[0], clut.outputs[0])
    bsum = None
    for i, bp in enumerate(blips):
        p0, p1, br = bp[0], bp[1], bp[2]
        vis = bp[3] if len(bp) > 3 else None
        vv = nb.n('ShaderNodeCombineXYZ')
        for axis, a0, a1 in (('X', p0[0], p1[0]), ('Y', p0[1], p1[1])):
            vv.inputs[axis].default_value = a0
            vv.inputs[axis].keyframe_insert('default_value', frame=0)
            vv.inputs[axis].default_value = a1
            vv.inputs[axis].keyframe_insert('default_value', frame=frames)
        dist = nb.n('ShaderNodeVectorMath')
        dist.operation = 'DISTANCE'
        nb.l(comb, 'Vector', dist, 0)
        nb.l(vv, 'Vector', dist, 1)
        bl = nb.n('ShaderNodeMapRange')
        bl.inputs['From Min'].default_value = 0.035
        bl.inputs['From Max'].default_value = 0.0
        bl.inputs['To Max'].default_value = br
        nb.l(dist, 'Value', bl, 'Value')
        bout = bl.outputs['Result']
        if vis:
            vn = nb.n('ShaderNodeValue')
            for f, v in vis:
                vn.outputs[0].default_value = v
                vn.outputs[0].keyframe_insert('default_value', frame=f)
            bout = nb.math('MULTIPLY', bout, vn.outputs[0]).outputs[0]
        tot = nb.math('ADD', tot.outputs[0], bout)
        bsum = bout if bsum is None else nb.math('ADD', bsum, bout).outputs[0]
    lit = nb.math('MULTIPLY', tot.outputs[0], glowc.outputs[0])
    if floor and bsum is not None:
        lit = nb.math('ADD', lit.outputs[0], nb.math('MULTIPLY', bsum, vb=floor).outputs[0])
    base = nb.math('ADD', lit.outputs[0], nb.math('MULTIPLY', beamline.outputs[0], vb=1.5).outputs[0])
    inside = nb.math('LESS_THAN', r, vb=0.98)
    fin = nb.math('MULTIPLY', base.outputs[0], inside.outputs[0])
    fin2 = nb.math('ADD', fin.outputs[0], nb.math('MULTIPLY', inside.outputs[0], vb=0.012).outputs[0])
    em = nb.n('ShaderNodeEmission')
    em.inputs['Color'].default_value = (0.25, 1.0, 0.35, 1)
    st = nb.math('MULTIPLY', fin2.outputs[0], vb=glow)
    nb.l(st, 0, em, 'Strength')
    # glass reflection layer on top (fresnel-weighted gloss added to the phosphor)
    gls = nb.n('ShaderNodeBsdfGlossy', Roughness=0.12)
    fres = nb.n('ShaderNodeFresnel', IOR=1.5)
    blk = nb.n('ShaderNodeEmission', Strength=0.0)
    mix = nb.n('ShaderNodeMixShader')
    nb.l(fres, 'Fac', mix, 'Fac')
    nb.l(blk, 'Emission', mix, 1)
    nb.l(gls, 'BSDF', mix, 2)
    add = nb.n('ShaderNodeAddShader')
    nb.l(em, 'Emission', add, 0)
    nb.l(mix, 'Shader', add, 1)
    nb.l(add, 'Shader', out, 'Surface')
    return m


def radar_room(frames=120, blips=(), seed=2, haze=0.02, t0=0.0, floor=0.0):
    """Dark ATC radar room: hero PPI console at origin (scope face up, tilted toward the operator), 2 background
    consoles with their own scopes (bokeh), green spill, desk lamp, smoky haze."""
    root = Md.empty('RadarRoom')
    console = M.principled('Console', base=(0.07, 0.085, 0.08), rough=0.42, metal=0.3, grime=0.5, rough_noise=0.15, bump=0.06)
    dark = M.principled('Bezel', base=(0.02, 0.02, 0.022), rough=0.35, metal=0.7)
    floor = M.texture_set('Floor', 'concrete_floor_worn_001', scale=0.5, tint=(0.35, 0.35, 0.35))
    wall = M.texture_set('Wall', 'rough_concrete', scale=0.4, tint=(0.22, 0.24, 0.24))
    # hero console: body + sloped wedge top (18 deg) carrying the round scope
    body = Wd.box('ConsoleBody', (0, 0, 0.42), (1.3, 0.9, 0.84))
    body.data.materials.append(console)
    bevel(body, 0.02)
    wv = [(-0.65, -0.45, 0.84), (0.65, -0.45, 0.84), (0.65, 0.45, 0.84), (-0.65, 0.45, 0.84),
          (-0.65, -0.45, 0.88), (0.65, -0.45, 0.88), (0.65, 0.45, 1.18), (-0.65, 0.45, 1.18)]
    wf = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    wedge = Md.mesh_obj('ConsoleTop', wv, wf, smooth=False, mats=(console,))
    bevel(wedge, 0.015)
    sl = math.atan2(0.30, 0.90)
    nrm = (0, -math.sin(sl), math.cos(sl))
    zc = 0.88 + 0.30 * 0.5 + 0.004
    ppi = ppi_material('PPI_hero', frames=frames, blips=blips, seed=seed, t0=t0, floor=floor)
    disc('Bezel', (0, 0.0, zc), nrm, 0.34, dark, n=48)
    disc('Scope', (0, -0.002 * nrm[1], zc + 0.003), nrm, 0.30, ppi, n=64)
    # knobs / buttons row
    knob = M.principled('Knob', base=(0.03, 0.03, 0.03), rough=0.4)
    for i in range(7):
        k = Wd.box('Knob%d' % i, (-0.45 + i * 0.15, -0.40, 0.90), (0.05, 0.05, 0.04))
        k.data.materials.append(knob)
        bevel(k, 0.02)
    lamp_m = M.emission('Indicator', (1.0, 0.45, 0.1), 6)
    for i in range(5):
        Md.mesh_obj('Ind%d' % i, [(0.30 + i * 0.06, -0.456, 0.70), (0.33 + i * 0.06, -0.456, 0.70), (0.33 + i * 0.06, -0.456, 0.72), (0.30 + i * 0.06, -0.456, 0.72)], [(0, 1, 2, 3)], mats=(lamp_m,))
    # background consoles
    for j, (x, y) in enumerate(((-2.1, 2.6), (1.9, 3.2), (-0.2, 4.6))):
        bb = Wd.box('BgCon%d' % j, (x, y, 0.5), (1.2, 0.9, 1.0))
        bb.data.materials.append(console)
        pm = ppi_material('PPI_bg%d' % j, frames=frames, seed=seed + j + 1, glow=4.0, t0=t0 + 1.3 * j)
        disc('BgScope%d' % j, (x, y - 0.2, 1.05), (0, -0.34, 0.94), 0.28, pm, n=40)
    # room
    fl = Wd.box('RoomFloor', (0, 1.5, -0.02), (12, 12, 0.04))
    fl.data.materials.append(floor)
    for nm, c, s in (('BackWall', (0, 6.5, 2), (12, 0.1, 4.5)), ('LWall', (-4.5, 1.5, 2), (0.1, 12, 4.5))):
        o = Wd.box(nm, c, s)
        o.data.materials.append(wall)
    # green spill from the scope + a hooded desk lamp cone through the haze
    Wd.area('ScopeSpill', (0, -0.1, 1.15), (0, -0.8, 1.7), color=(0.3, 1.0, 0.4), power=6, size=0.5)
    Wd.spot('DeskLamp', (0.9, -0.6, 2.4), (0.4, 0.1, 0.9), color=(1.0, 0.78, 0.5), power=260, size_deg=38, blend=0.6, radius=0.08)
    Wd.spot('BgLamp', (-2.4, 3.6, 3.2), (-2.1, 2.6, 0.5), color=(1.0, 0.8, 0.55), power=180, size_deg=30, blend=0.5)
    Wd.fog(center=(0, 1.5, 1.8), size=(10, 11, 3.8), density=haze, color=(0.85, 0.85, 0.82), anisotropy=0.45,
           noise=0.6, noise_scale=0.6)
    return root
