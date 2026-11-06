"""yonaguni-monument-1986 shared helpers (REAL3D + CINE v2, code batch 2026-11-05, subagent codebatch; NOT rendered yet).
Base helpers copied from mh370-seven-handshakes-2014/common.py. TELLING RULE: natural rock. The terraces are built as
natural bedding-plane slabs split by joints (no carved blocks, no masonry). Divers are faceless generic silhouettes
(no likeness of Aratake, Kimura or Schoch). Smooth eased dolly/push/orbit/crane only (NO shake), mostly WIDE 24-35 mm."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P, interiors as I
from kit import cine as CN
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def look(sc, samples=24, vol=True, glare=0.35, glare_thr=1.0, vignette=0.24, sat=0.95, lift=(0.99, 1.0, 1.03),
         gain=(1.03, 1.0, 0.97)):
    """CINE v2 setup at an affordable sample/bounce budget."""
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


def key_strength(m, keys):
    es = [n for n in m.node_tree.nodes if n.bl_idname == 'ShaderNodeEmission']
    if not es:
        print('IA WARN key_strength: no Emission node in', m.name, flush=True)
        return
    e = es[0]
    for f, v in keys:
        e.inputs['Strength'].default_value = v
        e.inputs['Strength'].keyframe_insert('default_value', frame=f)


# ---------------------------------------------------------------- geometry
def ring_mesh(name, r=1.0, w=0.02, n=128):
    """Flat annulus in XY, inner r-w/2 outer r+w/2."""
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


def text_obj(name, body, loc, size=0.1, mat=None, rot=(0, 0, 0), align='LEFT', extrude=0.0):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    cu.size = size
    cu.align_x = align
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
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
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


# ---------------------------------------------------------------- aircraft: generic wide-body twin (777-like silhouette)



# ---------------------------------------------------------------- dawn ocean (southern Indian Ocean)
def dawn_world(sun_az=70.0, elev=7.0, strength=4.0, hdri_strength=0.9):
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=sun_az, strength=hdri_strength)
    return CN.sun(elev=elev, az=sun_az, warmth='golden', strength=strength, check=False)


def swell_ocean(NF, half=4500.0, wave_scale=2.2, wind=16.0, choppy=0.9, color=(0.006, 0.014, 0.02), rough=0.08,
                center=(0, 0, 0)):
    Wd.sea_plane(size=240000, z=center[2] - 2.5 * wave_scale, color=color, rough=max(rough, 0.12), wave=0.15, frames=max(NF, 60))
    return Wd.ocean_wide(center=center, half=half, wave_scale=wave_scale, choppy=choppy, wind=wind, time_frames=max(NF, 60),
                         color=color, rough=rough)


def space_world(stars=1.0, seed=0.0):
    """Black space with a fine star field in every direction (no horizon glow)."""
    w = bpy.data.worlds.new('Space')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nb = M.NB(nt)
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nb.n('ShaderNodeOutputWorld')
    tc = nb.n('ShaderNodeTexCoord')
    vo = nb.n('ShaderNodeTexVoronoi', Scale=900.0)
    nb.l(tc, 'Generated', vo, 'Vector')
    st = nb.math('POWER', nb.math('SUBTRACT', va=1.0, b=vo.outputs['Distance']).outputs[0], vb=70.0)
    nz = nb.n('ShaderNodeTexNoise', Scale=30.0)
    nb.l(tc, 'Generated', nz, 'Vector')
    st2 = nb.math('MULTIPLY', st.outputs[0], nz.outputs['Fac'])
    st3 = nb.math('MULTIPLY', st2.outputs[0], vb=stars * 2.5)
    bg = nb.n('ShaderNodeBackground')
    bg.inputs['Color'].default_value = (0.8, 0.85, 1.0, 1)
    nb.l(st3, 0, bg, 'Strength')
    lp = nb.n('ShaderNodeLightPath')
    mx = nb.n('ShaderNodeMixShader')
    blk = nb.n('ShaderNodeBackground', Strength=0.0)
    nb.l(lp, 'Is Camera Ray', mx, 'Fac')
    nb.l(blk, 'Background', mx, 1)
    nb.l(bg, 'Background', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    return w


# ---------------------------------------------------------------- code-batch helpers (2026-11-05, subagent codebatch)
def gradient_world(name, up=(0.2, 0.5, 0.6), mid=(0.02, 0.1, 0.14), down=(0.0, 0.01, 0.015), strength=1.0, light=0.35):
    """Direction-gradient world (no HDRI): camera rays see up/mid/down colours; lighting rays get `light` x strength."""
    w = bpy.data.worlds.new(name)
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nb = M.NB(nt)
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nb.n('ShaderNodeOutputWorld')
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Generated', sep, 'Vector')
    mr = nb.n('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = -1.0
    mr.inputs['From Max'].default_value = 1.0
    nb.l(sep, 'Z', mr, 'Value')
    cr = nb.n('ShaderNodeValToRGB')
    el = cr.color_ramp.elements
    el[0].position, el[0].color = 0.25, (*down, 1)
    el[1].position, el[1].color = 0.92, (*up, 1)
    e = el.new(0.52)
    e.color = (*mid, 1)
    nb.l(mr, 'Result', cr, 'Fac')
    bg = nb.n('ShaderNodeBackground', Strength=strength)
    nb.l(cr, 'Color', bg, 'Color')
    bg2 = nb.n('ShaderNodeBackground', Strength=strength * light)
    nb.l(cr, 'Color', bg2, 'Color')
    lp = nb.n('ShaderNodeLightPath')
    mx = nb.n('ShaderNodeMixShader')
    nb.l(lp, 'Is Camera Ray', mx, 'Fac')
    nb.l(bg2, 'Background', mx, 1)
    nb.l(bg, 'Background', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    return w


def water_volume(center, size, scatter=(0.25, 0.6, 0.7), absorb=(0.1, 0.45, 0.55), density=0.03, anisotropy=0.75):
    """Bounded sea-water volume: forward scatter (sun shafts) + blue-green absorption = depth falloff."""
    o = Wd.fog(center=center, size=size, density=density, color=scatter, anisotropy=anisotropy)
    o.name = 'Water'
    try:
        pv = [n for n in o.data.materials[0].node_tree.nodes if n.bl_idname == 'ShaderNodeVolumePrincipled'][0]
        pv.inputs['Absorption Color'].default_value = (*absorb, 1)
    except Exception as e:
        print('IA WARN water absorption not set:', e, flush=True)
    return o


def caustic_gobo(NF, z=0.0, size=600.0, scale=0.08, speed=0.25, holes=0.45):
    """Light-only rippled sheet at the sea surface: breaks the sun into moving shafts/caustic dapples.
    Invisible to the camera; transparent where the noise is high."""
    me = bpy.data.meshes.new('Gobo')
    s = size / 2
    me.from_pydata([(-s, -s, z), (s, -s, z), (s, s, z), (-s, s, z)], [], [(0, 1, 2, 3)])
    o = link(bpy.data.objects.new('Gobo', me))
    m, nb, b, out = M.new('GoboM')
    m.node_tree.nodes.remove(b)
    tc = nb.n('ShaderNodeTexCoord')
    vo = nb.n('ShaderNodeTexVoronoi', Scale=scale * size / 10)
    vo.voronoi_dimensions = '4D'
    vo.feature = 'DISTANCE_TO_EDGE'
    nb.l(tc, 'Generated', vo, 'Vector')
    M.animate(vo.inputs['W'], 'default_value', [(0, 0.0), (max(NF, 2), speed * NF / 30.0)])
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].position = 0.0
    cr.color_ramp.elements[1].position = holes * 0.25
    nb.l(vo, 'Distance', cr, 'Fac')
    tr = nb.n('ShaderNodeBsdfTransparent')
    df = nb.n('ShaderNodeBsdfDiffuse')
    df.inputs['Color'].default_value = (0.0, 0.0, 0.0, 1)
    mx = nb.n('ShaderNodeMixShader')
    nb.l(cr, 'Color', mx, 'Fac')
    nb.l(df, 'BSDF', mx, 1)
    nb.l(tr, 'BSDF', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    o.data.materials.append(m)
    o.visible_camera = False
    o.visible_glossy = False
    o.visible_diffuse = False
    m.blend_method = 'HASHED'
    return o


def surface_from_below(NF, z=0.0, size=2000.0, tint=(0.55, 0.85, 0.9), strength=1.6, scale=0.02):
    """Camera-visible bright, rippling underside of the sea surface (emission sheen with Snell-window falloff)."""
    me = bpy.data.meshes.new('SeaCeil')
    s = size / 2
    me.from_pydata([(-s, -s, z), (s, -s, z), (s, s, z), (-s, s, z)], [], [(0, 3, 2, 1)])
    o = link(bpy.data.objects.new('SeaCeil', me))
    m, nb, b, out = M.new('SeaCeilM')
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=scale * size, Detail=6.0, Roughness=0.6)
    nz.noise_dimensions = '4D'
    nb.l(tc, 'Generated', nz, 'Vector')
    M.animate(nz.inputs['W'], 'default_value', [(0, 0.0), (max(NF, 2), 0.02 * NF)])
    em = nb.n('ShaderNodeEmission', Strength=strength)
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (tint[0] * 0.35, tint[1] * 0.35, tint[2] * 0.35, 1)
    cr.color_ramp.elements[1].color = (*tint, 1)
    nb.l(nz, 'Fac', cr, 'Fac')
    nb.l(cr, 'Color', em, 'Color')
    nb.l(em, 'Emission', out, 'Surface')
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def underwater(NF, depth=30.0, half=300.0, sun_az=60.0, sun_elev=62.0, sun_strength=5.0, density=0.03,
               scatter=(0.25, 0.6, 0.7), absorb=(0.1, 0.45, 0.55), up=(0.25, 0.62, 0.7), mid=(0.02, 0.12, 0.16),
               down=(0.0, 0.012, 0.02), gobo=True, ceiling=True):
    """Sea from inside: gradient world, high sun through a caustic gobo, water volume from seabed (z=-depth) to 0."""
    gradient_world('Sea', up=up, mid=mid, down=down, strength=1.0, light=0.4)
    sun = CN.sun(elev=sun_elev, az=sun_az, warmth=(0.9, 0.97, 1.0), strength=sun_strength, angle=2.5, check=False)
    if gobo:
        caustic_gobo(NF, z=0.5, size=half * 2.2)
    if ceiling:
        surface_from_below(NF, z=0.0, size=half * 6)
    water_volume((0, 0, -depth / 2 - 1), (half * 2, half * 2, depth + 2), scatter=scatter, absorb=absorb, density=density)
    return sun


def image_mat(name, path, emit=0.0, rough=0.5, fallback=(0.3, 0.3, 0.3)):
    """Principled with an image (from the scene dir) as base colour; emit > 0 makes it a lit screen."""
    m, nb, b, out = M.new(name)
    p = path if os.path.isabs(path) else os.path.join(HERE, path)
    if os.path.exists(p):
        tx = nb.n('ShaderNodeTexImage')
        tx.image = bpy.data.images.load(p, check_existing=True)
        tx.extension = 'EXTEND'
        nb.l(tx, 'Color', b, 'Base Color')
        if emit:
            nb.l(tx, 'Color', b, 'Emission Color')
    else:
        print('IA WARN missing image', p, flush=True)
        b.inputs['Base Color'].default_value = (*fallback, 1)
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Strength'].default_value = emit
    return m


def image_plane(name, path, width, loc, rot=(0, 0, 0), aspect=None, emit=0.0, rough=0.5):
    """Flat plane sized to the image aspect (UVs 0-1), centred at loc. aspect = h/w override."""
    p = path if os.path.isabs(path) else os.path.join(HERE, path)
    if aspect is None:
        aspect = 0.75
        if os.path.exists(p):
            im = bpy.data.images.load(p, check_existing=True)
            if im.size[0]:
                aspect = im.size[1] / im.size[0]
    w, h = width / 2, width * aspect / 2
    me = bpy.data.meshes.new(name)
    me.from_pydata([(-w, -h, 0), (w, -h, 0), (w, h, 0), (-w, h, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for li, c in zip(range(4), ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[li].uv = c
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(image_mat(name + 'M', path, emit=emit, rough=rough))
    return o


def loft(name, length, sections, n=20, prof=None):
    """Lofted body along +X from 0..length. sections: list of (u, half_width, half_height, z_offset) (u 0 = nose).
    prof(u, t) optional extra radial multiplier. Returns object (smooth, closed ends)."""
    bm = bmesh.new()
    rings = []
    for (u, hw, hh, zo) in sections:
        ring = []
        for k in range(n):
            t = 2 * math.pi * k / n
            mul = prof(u, t) if prof else 1.0
            ring.append(bm.verts.new((u * length, hw * mul * math.cos(t), zo + hh * mul * math.sin(t))))
        rings.append(ring)
    for a, b in zip(rings[:-1], rings[1:]):
        for k in range(n):
            bm.faces.new((a[k], a[(k + 1) % n], b[(k + 1) % n], b[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    for p in me.polygons:
        p.use_smooth = True
    return o


def fin_mesh(name, pts2d, thick=0.05):
    """Flat fin from a 2-D outline (x, y) in the XZ plane, given thickness along Y."""
    bm = bmesh.new()
    top = [bm.verts.new((x, thick / 2, y)) for x, y in pts2d]
    bot = [bm.verts.new((x, -thick / 2, y)) for x, y in pts2d]
    bm.faces.new(top)
    bm.faces.new(list(reversed(bot)))
    k = len(pts2d)
    for i in range(k):
        bm.faces.new((top[i], bot[i], bot[(i + 1) % k], top[(i + 1) % k]))
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me))
    return o


def swim_keys(obj, NF, length, amp=0.08, period=60, phase=0.0, from_u=0.45):
    """Vertical tail-beat by two shape keys (up / down) on a mesh built along +X (nose at x=0).
    Displacement grows ~((u-from_u)/(1-from_u))^2 behind from_u. Keyed sinusoidally (no camera motion)."""
    me = obj.data
    if not me.shape_keys:
        obj.shape_key_add(name='Basis')
    ups = obj.shape_key_add(name='Up')
    dns = obj.shape_key_add(name='Down')
    for i, v in enumerate(me.vertices):
        u = v.co.x / length
        w = max(0.0, (u - from_u) / (1 - from_u)) ** 2
        ups.data[i].co.z = v.co.z + amp * length * w
        dns.data[i].co.z = v.co.z - amp * length * w
    step = max(2, period // 8)
    for f in range(0, NF + step, step):
        s = math.sin(2 * math.pi * f / period + phase)
        ups.value, dns.value = max(0.0, s), max(0.0, -s)
        ups.keyframe_insert('value', frame=f)
        dns.keyframe_insert('value', frame=f)
    return obj


def move_line(obj, NF, p0, v, step=2):
    """Constant-velocity path (m per frame); keys every `step` frames, linear."""
    for f in range(0, NF + step, step):
        obj.location = (p0[0] + v[0] * f, p0[1] + v[1] * f, p0[2] + v[2] * f)
        obj.keyframe_insert('location', frame=f)
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
    return obj


def pulse_rings(prefix, center, n, f0, every, grow, life, color=(0.55, 0.9, 1.0), strength=6.0, w=0.03, rot=(0, 0, 0)):
    """n expanding glow rings (sound visualised), one every `every` frames from f0; each grows to `grow` x and fades."""
    out = []
    for k in range(n):
        fs = f0 + k * every
        rg = ring_mesh('%s%d' % (prefix, k), r=1.0, w=w)
        m = glow_mat('%sM%d' % (prefix, k), color=color, strength=strength)
        rg.data.materials.append(m)
        rg.location = center
        rg.rotation_euler = rot
        for f, s in ((0, 0.01), (fs, 0.3), (fs + life, grow)):
            rg.scale = (s, s, s)
            rg.keyframe_insert('scale', frame=f)
        key_fac(m, [(0, 0.0), (max(0, fs - 1), 0.0), (fs, 0.9), (fs + life // 3, 0.55), (fs + life, 0.0)])
        rg.visible_shadow = False
        out.append(rg)
    return out


def seabed(name, size, depth, height=3.0, scale=0.02, seed=1, tid='rocky_terrain_02', tint=(0.32, 0.34, 0.33), res=160,
           tex_scale=0.2):
    mat = M.texture_set(name + 'M', tid, scale=tex_scale, tint=tint, box=True)
    o = Wd.terrain(name, size=size, res=res, height=height, scale=scale, center=(0, 0, -depth), seed=seed, mat=mat)
    return o
def uv_plane(name, w, h, loc, rot=(0, 0, 0), mat=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for li, c in zip(range(4), ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[li].uv = c
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    if mat:
        o.data.materials.append(mat)
    return o


def listening_room(NF, hero_img='artifact_spectrogram.jpg', n_desks=4, lamp=True, trace=False):
    """1980s-90s Navy listening station (generic, no insignia): long console desk under low light, CRT-style screens,
    a strip-chart recorder feeding paper, chair, mug. Hero screen at (0, 0, 1.25) faces -Y.
    Returns dict of key objects. Nobody is in the room (no faces)."""
    wall = M.principled('RoomWall', base=(0.09, 0.1, 0.1), rough=0.8, grime=0.5)
    floor = M.texture_set('RoomFloor', 'concrete_floor_worn_001', scale=0.5, tint=(0.35, 0.36, 0.36))
    desk = M.principled('Desk', base=(0.16, 0.17, 0.16), rough=0.45, metal=0.3, grime=0.5, rough_noise=0.2)
    bezel = M.principled('Bezel', base=(0.05, 0.05, 0.05), rough=0.4)
    boxm('Floor', (0, 0, -0.05), (16, 14, 0.1), floor)
    boxm('BackWall', (0, 2.2, 1.6), (16, 0.2, 3.4), wall)
    boxm('SideWall', (-6.5, -1, 1.6), (0.2, 8, 3.4), wall)
    boxm('Ceil', (0, -1, 3.3), (16, 14, 0.1), wall)
    boxm('Console', (0, 0.5, 0.42), (2.0 * n_desks + 1.0, 1.1, 0.84), desk, 0.02)
    boxm('ConsoleTop', (0, 0.35, 0.86), (2.0 * n_desks + 1.0, 1.4, 0.05), desk, 0.01)
    scr = {}
    for k in range(n_desks):
        x = (k - (n_desks - 1) / 2) * 2.0
        boxm('Mon%d' % k, (x, 0.75, 1.3), (1.0, 0.6, 0.8), bezel, 0.04)
        if trace and k == n_desks // 2:
            continue           # the animated trace screen sits on this monitor (no coplanar double screen)
        if k == n_desks // 2 - 1 or n_desks == 1:
            s = image_plane('HeroScreen', hero_img, 0.86, (x, 0.44, 1.32), rot=(math.radians(90), 0, 0), emit=2.2)
            scr['hero'] = s
        else:
            sm = spectro_trace_mat('ScrM%d' % k, NF, rise=(10 + 20 * k, 140 + 10 * k), band_y=0.2 + 0.05 * k, trace_y=(0.3, 0.33),
                                   glow=1.6)
            scr['s%d' % k] = uv_plane('Scr%d' % k, 0.86, 0.62, (x, 0.44, 1.32), rot=(math.radians(90), 0, 0), mat=sm)
    if trace:
        tm = spectro_trace_mat('TraceM', NF, rise=(int(NF * 0.15), int(NF * 0.7)), band_y=0.2, trace_y=(0.62, 0.66), glow=3.0)
        scr['trace'] = uv_plane('TraceScreen', 0.86, 0.62, (2.0 * (n_desks // 2) - (n_desks - 1), 0.44, 1.32),
                                rot=(math.radians(90), 0, 0), mat=tm)
    # strip-chart recorder: paper roll + paper sheet spilling over the desk edge, textured with the real gram
    boxm('Recorder', (-(n_desks) * 1.0 - 0.1, 0.4, 1.0), (0.7, 0.5, 0.3), bezel, 0.03)
    paper = image_plane('Paper', hero_img, 0.55, (-(n_desks) * 1.0 - 0.1, -0.1, 0.89), rot=(0, 0, math.radians(90)),
                        aspect=2.2, rough=0.7)
    for f, y in ((0, -0.1), (NF, -0.35)):
        paper.location[1] = y
        paper.keyframe_insert('location', frame=f)
    # chair (empty) + mug
    chm = M.principled('Chair', base=(0.05, 0.06, 0.07), rough=0.6)
    boxm('ChairSeat', (0.6, -0.9, 0.5), (0.55, 0.55, 0.08), chm, 0.03)
    boxm('ChairBack', (0.6, -1.17, 0.85), (0.5, 0.06, 0.6), chm, 0.03)
    cyl('ChairPost', (0.6, -0.9, 0.08), (0.6, -0.9, 0.46), 0.03, chm, 10)
    cyl('Mug', (1.3, 0.05, 0.885), (1.3, 0.05, 0.99), 0.045, M.principled('MugM', base=(0.6, 0.6, 0.58), rough=0.3), 18)
    if lamp:
        CN.practical('DeskLamp', (-1.8, -0.3, 2.4), (-1.0, 0.3, 0.9), power=55, cone=60)
        Wd.area('Fill', (2, -4, 2.6), (0, 0.5, 1.0), color=(0.55, 0.7, 0.9), power=60, size=3.0)
    return scr




# ---------------------------------------------------------------- Yonaguni builders (natural sandstone terraces)
def sandstone_mat(name='Sandstone', algae=0.55, scale=0.35):
    """Box-mapped rocky_terrain_02 tinted to grey-tan Miocene sandstone; top faces get a green-brown algae film."""
    m = M.texture_set(name, 'rocky_terrain_02', scale=scale, tint=(0.52, 0.47, 0.38), box=True)
    try:
        nt = m.node_tree
        nb = M.NB(nt)
        b = nt.nodes['Principled BSDF']
        src = [l.from_socket for l in nt.links if l.to_socket == b.inputs['Base Color']]
        geo = nb.n('ShaderNodeNewGeometry')
        sep = nb.n('ShaderNodeSeparateXYZ')
        nb.l(geo, 'Normal', sep, 'Vector')
        mr = nb.n('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = 0.55
        mr.inputs['From Max'].default_value = 0.9
        nb.l(sep, 'Z', mr, 'Value')
        mx = nb.n('ShaderNodeMix')
        mx.data_type = 'RGBA'
        nb.l(nb.math('MULTIPLY', mr.outputs['Result'], vb=algae), 0, mx, 'Factor')
        if src:
            nt.links.new(src[0], mx.inputs[6])
        else:
            mx.inputs[6].default_value = (0.52, 0.47, 0.38, 1)
        mx.inputs[7].default_value = (0.2, 0.24, 0.12, 1)
        nb.l(mx, 2, b, 'Base Color')
    except Exception as e:
        print('IA WARN algae mix skipped:', e, flush=True)
    return m


def slab(name, c, s, mat, bev=0.08, rough=0.12, seed=0):
    """One sandstone block: bevelled box + low displace so edges are worn, never CG-sharp."""
    o = boxm(name, c, s, mat, 0.0)
    I.bevel(o, bev)
    sub = o.modifiers.new('S', 'SUBSURF')
    sub.levels = 2
    sub.render_levels = 2
    d = o.modifiers.new('D', 'DISPLACE')
    t = bpy.data.textures.new(name + 'T', 'CLOUDS')
    t.noise_scale = 0.6
    t.noise_depth = 3
    d.texture = t
    d.strength = rough
    d.texture_coords = 'GLOBAL'
    return o


def terraces(prefix='T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, mat=None, seed=3, wall_side=True):
    """Natural stepped terraces (the 'Main Terrace'): stacked bedding-plane slabs, each split by vertical joints into
    2-4 blocks with hairline gaps, set on a broad bedrock base that is continuous with the sea floor. Steps rise
    toward +Y. Returns list of slab objects (layer, block)."""
    mat = mat or sandstone_mat(prefix + 'Stone')
    rnd = random.Random(seed)
    ox, oy, oz = origin
    out = []
    base = slab(prefix + 'Base', (ox, oy + steps * tread / 2, oz - 2.0), (width + 12, steps * tread + 14, 4.0), mat, bev=0.3, rough=0.35)
    out.append(base)
    for i in range(steps):
        depth = (steps - i) * tread + 4.0
        cy = oy + i * tread + depth / 2
        z = oz + i * rise + rise / 2
        nblk = rnd.choice((2, 3, 3, 4))
        cuts = sorted(rnd.uniform(0.2, 0.8) for _ in range(nblk - 1))
        xs = [0.0] + cuts + [1.0]
        w = width - i * 0.6
        for k in range(nblk):
            x0 = ox - w / 2 + xs[k] * w + 0.06
            x1 = ox - w / 2 + xs[k + 1] * w - 0.06
            o = slab('%sL%dB%d' % (prefix, i, k), ((x0 + x1) / 2, cy, z), (x1 - x0, depth, rise - 0.04), mat,
                     bev=0.1, rough=0.1 + 0.05 * rnd.random())
            out.append(o)
    if wall_side:
        # sheer side wall (the 'right-angled walls'): tall jointed blocks on -X
        for k in range(4):
            out.append(slab('%sWall%d' % (prefix, k), (ox - width / 2 - 2.2, oy + 2 + k * 4.2, oz + steps * rise / 2),
                            (3.6, 4.0, steps * rise + 1.0), mat, bev=0.12, rough=0.18))
    return out


def faceless_diver(name='Diver', loc=(0, 0, 0), yaw=0.0, NF=100, torch=False, kick=40):
    """Generic scuba diver silhouette: dark suit, mask as a dark glossy band (no face), tank, fins kicking (keyed)."""
    root = Md.empty(name, loc)
    suit = M.principled(name + 'Suit', base=(0.02, 0.025, 0.03), rough=0.5, coat=0.2)
    tankm = M.principled(name + 'Tank', base=(0.55, 0.56, 0.58), rough=0.3, metal=0.8)
    finm = M.principled(name + 'FinM', base=(0.05, 0.08, 0.1), rough=0.4)
    torso = cyl(name + 'Torso', (-0.35, 0, 0), (0.35, 0, 0), 0.2, suit, 18)
    head = cyl(name + 'Head', (0.38, 0, 0.02), (0.6, 0, 0.04), 0.13, suit, 18)
    mask = boxm(name + 'Mask', (0.6, 0, 0.06), (0.06, 0.18, 0.09), M.principled(name + 'MaskM', base=(0.01, 0.01, 0.012), rough=0.05, coat=1.0), 0.02)
    tank = cyl(name + 'Tank', (-0.3, 0, 0.24), (0.3, 0, 0.24), 0.09, tankm, 16)
    parts = [torso, head, mask, tank]
    for s in (1, -1):
        parts.append(cyl('%sArm%d' % (name, s), (0.25, s * 0.18, 0), (0.55, s * 0.32, -0.12), 0.055, suit, 10))
        leg = Md.empty('%sHip%d' % (name, s), (-0.35, s * 0.1, 0))
        leg.parent = root
        th = cyl('%sLeg%d' % (name, s), (0, 0, 0), (-0.8, 0, 0), 0.07, suit, 10)
        th.parent = leg
        fin = boxm('%sFin%d' % (name, s), (-1.0, 0, 0), (0.45, 0.2, 0.02), finm, 0.01)
        fin.parent = leg
        ph = 0 if s > 0 else kick // 2
        for f in range(0, NF + 10, max(4, kick // 4)):
            a = 14 * math.sin(2 * math.pi * (f + ph) / kick)
            leg.rotation_euler = (0, math.radians(a), 0)
            leg.keyframe_insert('rotation_euler', frame=f)
    for p in parts:
        p.parent = root
    if torch:
        tl = Wd.spot(name + 'Torch', (0.62, -0.25, -0.05), (3.0, -0.25, -0.6), color=(1.0, 0.95, 0.85), power=180, size_deg=28, blend=0.5)
        tl.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    # bubbles from the regulator, rising and wobbling gently (keyed, not camera shake)
    bm_ = M.glass(name + 'Bubble', tint=(0.9, 0.97, 1.0), rough=0.0)
    rnd = random.Random(len(name))
    for k in range(10):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=rnd.uniform(0.012, 0.035))
        b = bpy.context.active_object
        b.name = '%sBub%d' % (name, k)
        M.assign(b, bm_)
        b.parent = root
        f0 = rnd.randint(0, 40)
        for f in (0, NF):
            t = (f + f0) % 60 / 60.0 if f else f0 / 60.0
            b.location = (0.62 + 0.05 * math.sin(k), 0.0, 0.1 + 2.5 * t + (2.0 if f else 0.0))
            b.keyframe_insert('location', frame=f)
    return root


def hammerhead(name='Shark', length=3.2, NF=100, beat=40, tint=(0.32, 0.36, 0.4)):
    """Generic hammerhead silhouette: lofted body + flat cephalofoil + dorsal + tall caudal; tail beat by shape keys."""
    sec = [(0.0, 0.02, 0.02, 0), (0.06, 0.06, 0.05, 0), (0.2, 0.09, 0.08, 0), (0.45, 0.08, 0.075, 0), (0.7, 0.05, 0.05, 0.005),
           (0.9, 0.025, 0.025, 0.01), (1.0, 0.012, 0.012, 0.01)]
    body = loft(name + 'Body', length, [(u, a * length, b * length, c * length) for (u, a, b, c) in sec], n=16)
    head = Wd.box(name + 'Foil', (0.03 * length, 0, 0), (0.07 * length, 0.42 * length / 1.6, 0.025 * length))
    m = M.principled(name + 'Skin', base=tint, rough=0.45, coat=0.2)
    for o in (body, head):
        o.data.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT')
    head.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    body = bpy.context.active_object
    body.name = name + 'Body'
    swim_keys(body, NF, length, amp=0.05, period=beat, from_u=0.4)
    root = Md.empty(name, (0, 0, 0))
    body.parent = root
    d = fin_mesh(name + 'Dorsal', [(0, 0), (0.12 * length, 0), (0.05 * length, 0.16 * length)], thick=0.02)
    d.location = (0.32 * length, 0, 0.07 * length)
    d.data.materials.append(m)
    d.parent = root
    return root


def sea_floor(depth=28.0, size=500.0):
    return CN.ground('SeaFloor', 'damp_beach_sand', (size, size), center=(0, 0, -depth - 2.0), tile_m=4.0, tint=(0.62, 0.6, 0.52))


def boat_table(NF, prints=(('artifact_stair.jpg', (0.0, 0.0), 8.0), ('artifact_terraces.jpg', (0.42, 0.18), -14.0)),
               headline=False):
    """Dive-boat cabin table in morning light: the REAL CC0 photo prints, a dive mask, a coil of rope.
    headline=True adds a generic tabloid page (no real masthead) beside the prints."""
    top = CN.ground('TableTop', 'wood_table_worn', (2.4, 1.4), center=(0, 0, 0.75), tile_m=1.2)
    boxm('TableBody', (0, 0, 0.37), (2.3, 1.3, 0.72), M.principled('TBody', base=(0.18, 0.12, 0.08), rough=0.7), 0.02)
    out = {}
    for k, (img, (x, y), rot) in enumerate(prints):
        p = image_plane('Print%d' % k, img, 0.42, (x - 0.15, y - 0.05, 0.752 + 0.0015 * k), rot=(0, 0, math.radians(rot)), rough=0.35)
        out['print%d' % k] = p
    # dive mask: dark rubber skirt + lens
    rub = M.principled('MaskRub', base=(0.03, 0.03, 0.035), rough=0.6)
    boxm('MaskFrame', (0.55, -0.32, 0.79), (0.2, 0.09, 0.07), rub, 0.03)
    boxm('MaskLens', (0.55, -0.37, 0.795), (0.17, 0.005, 0.05), M.glass('MaskGlass', tint=(0.9, 0.95, 1.0)), 0.0)
    pts = [(-0.75 + 0.14 * math.cos(t * 0.35), 0.35 + 0.14 * math.sin(t * 0.35), 0.765 + 0.012 * (t / 18.0)) for t in range(0, 90)]
    curve_poly('Rope', pts, bevel=0.012, mat=M.principled('RopeM', base=(0.55, 0.48, 0.36), rough=0.8, bump=0.4, bump_scale=60))
    if headline:
        paper = M.principled('Newsprint', base=(0.78, 0.76, 0.7), rough=0.85, grime=0.3)
        pg = boxm('Paper', (-0.74, -0.15, 0.7525), (0.5, 0.66, 0.0012), paper)
        pg.rotation_euler = (0, 0, math.radians(-6))
        ink = M.principled('Ink', base=(0.03, 0.03, 0.03), rough=0.7)
        t1 = text_obj('Head1', 'LOST CITY', (-0.95, 0.06, 0.7545), size=0.07, mat=ink, rot=(0, 0, math.radians(-6)))
        t2 = text_obj('Head2', 'UNDER THE SEA?', (-0.95, -0.02, 0.7545), size=0.055, mat=ink, rot=(0, 0, math.radians(-6)))
        for i in range(9):
            boxm('Col%d' % i, (-0.76 - 0.004 * i, -0.12 - 0.035 * i, 0.7538), (0.4, 0.008, 0.0006), M.principled('ColM%d' % i, base=(0.25, 0.25, 0.25), rough=0.8))
        out['paper'] = pg
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=210, strength=0.6)
    CN.sun(elev=18, az=210, warmth='golden', strength=3.0, check=False)
    Wd.area('Window', (1.6, -1.2, 1.6), (0, 0, 0.75), color=(1.0, 0.92, 0.8), power=90, size=1.4)
    # cabin walls
    wm = M.principled('CabinWall', base=(0.55, 0.53, 0.48), rough=0.7, grime=0.5)
    boxm('CabinBack', (0, 1.4, 1.2), (5, 0.08, 2.4), wm)
    boxm('CabinFloor', (0, 0, -0.02), (5, 4, 0.04), M.principled('Deck', base=(0.3, 0.27, 0.22), rough=0.8))
    return out


def lab_sample(NF):
    """Geology bench: a layered sandstone chunk (bedding bands) under a desk lamp, warm interior."""
    CN.hdri_sun('fireplace', strength=0.35)
    top = CN.ground('Bench', 'wood_table_worn', (1.8, 1.0), center=(0, 0, 0.8), tile_m=1.0)
    boxm('BenchBody', (0, 0, 0.39), (1.7, 0.9, 0.78), M.principled('BB', base=(0.15, 0.11, 0.08), rough=0.7), 0.02)
    m, nb, b, out = M.new('SampleM')
    tc = nb.n('ShaderNodeTexCoord')
    wv = nb.n('ShaderNodeTexWave', Scale=6.0, Distortion=2.5, Detail=6.0)
    wv.wave_type = 'BANDS'
    wv.bands_direction = 'Z'
    nb.l(tc, 'Object', wv, 'Vector')
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (0.42, 0.37, 0.29, 1)
    cr.color_ramp.elements[1].color = (0.62, 0.56, 0.45, 1)
    nb.l(wv, 'Fac', cr, 'Fac')
    nb.l(cr, 'Color', b, 'Base Color')
    nz = nb.n('ShaderNodeTexNoise', Scale=60.0, Detail=8.0)
    nb.l(tc, 'Object', nz, 'Vector')
    bp = nb.n('ShaderNodeBump', Strength=0.6, Distance=0.004)
    nb.l(nz, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    b.inputs['Roughness'].default_value = 0.9
    bpy.ops.mesh.primitive_cube_add(size=0.16, location=(0, 0, 0.87))
    s = bpy.context.active_object
    s.name = 'Sample'
    s.scale = (1.4, 1.0, 0.7)
    I.bevel(s, 0.02)
    sub = s.modifiers.new('S', 'SUBSURF')
    sub.levels = 3
    sub.render_levels = 3
    d = s.modifiers.new('D', 'DISPLACE')
    t = bpy.data.textures.new('SampleT', 'CLOUDS')
    t.noise_scale = 0.05
    d.texture = t
    d.strength = 0.018
    s.data.materials.append(m)
    try:
        CN.place('desk_lamp_arm_01', (-0.55, 0.3, 0.8), rot=(0, 0, math.radians(30)), scale=1.0)
    except Exception as e:
        print('IA WARN lamp model:', e, flush=True)
    CN.practical('Lamp', (-0.35, 0.15, 1.35), (0, 0, 0.87), power=45, cone=55)
    boxm('BackWall', (0, 0.8, 1.4), (4, 0.06, 2.4), M.principled('LabWall', base=(0.2, 0.19, 0.17), rough=0.8))
    return s


def coast_steps(NF):
    """Above water at dawn: a low sea cliff with the same kind of natural stepped sandstone ledges on the shore."""
    dawn_world(sun_az=80, elev=9, strength=4.5, hdri_strength=1.0)
    swell_ocean(NF, half=1500, wave_scale=0.7, wind=8, choppy=1.0, color=(0.01, 0.04, 0.05), center=(0, 0, -0.4))
    st = sandstone_mat('ShoreStone', algae=0.25)
    terraces('S', origin=(0, 6, -1.2), steps=5, rise=1.1, tread=1.8, width=16, mat=st, seed=9, wall_side=False)
    cliff = Wd.terrain('Cliff', size=400, res=120, height=26, scale=0.01, center=(0, 120, 6), seed=7,
                       mat=M.texture_set('CliffM', 'rocky_terrain_02', scale=0.25, tint=(0.45, 0.42, 0.34), box=True))
    return cliff
