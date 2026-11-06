"""mars-methane-spikes-curiosity-2014 shared helpers (REAL3D + CINE v2, code batch 2026-11-05, subagent codebatch; NOT
rendered yet). Base helpers copied from mh370-seven-handshakes-2014/common.py. Rules: 14-18 shots, mostly WIDE (24-35 mm),
close-ups as accents; smooth eased dolly/push/orbit/crane only (NO shake). Rover/orbiter are GENERIC (no NASA/ESA logos).
Methane is invisible: the cyan gas volume is an ILLUSTRATION (Remotion labels it). Never imply Martian life."""
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




# ---------------------------------------------------------------- Mars builders (generic, no agency logos)
MARS_SKY_DAY = dict(up=(0.42, 0.3, 0.22), mid=(0.78, 0.55, 0.38), down=(0.25, 0.14, 0.08))
MARS_SKY_DUSK = dict(up=(0.06, 0.07, 0.12), mid=(0.45, 0.32, 0.3), down=(0.08, 0.05, 0.035))
MARS_SKY_NIGHT = dict(up=(0.004, 0.005, 0.01), mid=(0.012, 0.01, 0.012), down=(0.003, 0.002, 0.002))


def mars_world(kind='day', sun_elev=22.0, sun_az=120.0, sun_strength=4.0, haze=True, haze_density=0.0009,
               haze_center=(0, 0, 60), haze_size=(9000, 9000, 220)):
    """Butterscotch Mars sky (direction gradient), pale low sun, thin dust haze. kind: day | dusk | night."""
    sky = {'day': MARS_SKY_DAY, 'dusk': MARS_SKY_DUSK, 'night': MARS_SKY_NIGHT}[kind]
    gradient_world('MarsSky', light=0.45 if kind != 'night' else 0.6, **sky)
    col = {'day': (1.0, 0.93, 0.85), 'dusk': (1.0, 0.82, 0.68), 'night': (0.55, 0.62, 0.8)}[kind]
    s = CN.sun(elev=sun_elev, az=sun_az, warmth=col, strength=sun_strength, angle=0.6, check=False)
    if haze:
        CN.haze(center=haze_center, size=haze_size, density=haze_density, color=(0.95, 0.72, 0.52), anisotropy=0.55,
                noise=0.2, noise_scale=0.004, height_falloff=0.8)
    return s


def mars_rock_mat(name='MarsRock', scale=0.25):
    return M.texture_set(name, 'dry_ground_rocks', scale=scale, tint=(0.66, 0.36, 0.2), box=True)


CRATER = dict(rim_r=3200.0, rim_h=320.0, mound_h=520.0, mound_r=1100.0, noise_h=22.0, seed=2)


def crater_height(x, y, rim_r=3200.0, rim_h=320.0, mound_h=520.0, mound_r=1100.0, noise_h=22.0, seed=2):
    from mathutils import noise as N
    r = math.sqrt(x * x + y * y)
    rim = rim_h * math.exp(-((r - rim_r) / (0.12 * rim_r)) ** 2)
    if r > rim_r:
        rim += rim_h * 0.55 * min(1.0, (r - rim_r) / (0.2 * rim_r))
    mound = mound_h * math.exp(-(r / mound_r) ** 2)
    return rim + mound + N.fractal(Vector((x * 0.0012 + seed, y * 0.0012, 0)), 0.6, 2.0, 6) * noise_h


def crater(name='Gale', size=9000.0, res=240, center=(0, 0, 0)):
    """Gale-like crater: flat floor, raised rim ring, broad central mound (Mount Sharp-like), fractal noise on top.
    Geometry follows crater_height() so rovers can be set on the floor exactly."""
    verts, faces = [], []
    n = res
    for j in range(n + 1):
        for i in range(n + 1):
            x = (i / n - 0.5) * size
            y = (j / n - 0.5) * size
            verts.append((x, y, crater_height(x, y, **CRATER)))
    for j in range(n):
        for i in range(n):
            k = j * (n + 1) + i
            faces.append((k, k + 1, k + n + 2, k + n + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    o = link(bpy.data.objects.new(name, me))
    o.location = center
    o.data.materials.append(mars_rock_mat(name + 'M', scale=0.02))
    return o


def on_floor(x, y, dz=0.0):
    return (x, y, crater_height(x, y, **CRATER) + dz)


def mars_ground(name='Floor', size=400.0, center=(0, 0, 0), rocks=60, seed=4):
    """Near ground: textured plane (dry_ground_rocks, rust tint) + scattered displaced rocks."""
    g = CN.ground(name, 'dry_ground_rocks', (size, size), center=center, tile_m=3.0, tint=(0.66, 0.36, 0.2))
    rk = M.texture_set(name + 'Rk', 'rocky_terrain_02', scale=0.6, tint=(0.45, 0.24, 0.14), box=True)
    rnd = random.Random(seed)
    for k in range(rocks):
        x, y = rnd.uniform(-size * 0.2, size * 0.2), rnd.uniform(-size * 0.05, size * 0.3)
        if abs(x) < 4 and abs(y) < 5:
            continue
        s = rnd.uniform(0.08, 0.6) * (1.0 if rnd.random() > 0.15 else 2.5)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=s, location=(center[0] + x, center[1] + y, center[2] + s * 0.3))
        o = bpy.context.active_object
        o.name = '%sRock%d' % (name, k)
        o.scale = (rnd.uniform(0.8, 1.4), rnd.uniform(0.8, 1.3), rnd.uniform(0.45, 0.8))
        o.rotation_euler = (0, 0, rnd.uniform(0, 6.28))
        d = o.modifiers.new('D', 'DISPLACE')
        t = bpy.data.textures.new('%sRT%d' % (name, k), 'CLOUDS')
        t.noise_scale = 0.5
        d.texture = t
        d.strength = 0.25 * s
        o.data.materials.append(rk)
    return g


def rover(name='Rover', loc=(0, 0, 0), yaw=0.0, mast_yaw=(0.0, 0.0), NF=100, wheel_wear=0.0):
    """Generic six-wheel nuclear rover (Curiosity-class proportions, ~3 m long), NO logos/flags.
    Front = +X. mast_yaw (start, end) degrees animates the mast head pan."""
    root = Md.empty(name, loc)
    white = M.principled(name + 'White', base=(0.72, 0.7, 0.66), rough=0.5, grime=0.7, rough_noise=0.3)
    alu = M.principled(name + 'Alu', base=(0.62, 0.62, 0.62), rough=0.35, metal=1.0, grime=0.5)
    dark = M.principled(name + 'Dark', base=(0.05, 0.05, 0.05), rough=0.45)
    gold = M.principled(name + 'Gold', base=(0.85, 0.6, 0.2), rough=0.25, metal=1.0, bump=0.3, bump_scale=30)
    dust = (0.5, 0.33, 0.22)
    wheelm = M.principled(name + 'Wheel', base=(0.5, 0.48, 0.45), rough=0.4, metal=0.85, grime=0.9,
                          bump=0.5 + wheel_wear, bump_scale=14)
    parts = []
    parts.append(boxm(name + 'Body', (0, 0, 1.0), (2.2, 1.6, 0.55), white, 0.04))
    parts.append(boxm(name + 'Deck', (0, 0, 1.3), (2.3, 1.7, 0.05), alu, 0.01))
    # RTG at the back (angled finned cylinder)
    rtg = cyl(name + 'RTG', (-1.15, 0, 1.15), (-1.75, 0, 1.55), 0.3, dark, 18)
    parts.append(rtg)
    for k in range(6):
        a = k * math.pi / 3
        parts.append(boxm(name + 'Fin%d' % k, (-1.45 + 0.0, 0.32 * math.cos(a), 1.35 + 0.32 * math.sin(a)), (0.5, 0.04, 0.12), dark))
    # wheels + rocker-bogie
    for side in (1, -1):
        y = side * 1.15
        for i, x in enumerate((1.05, 0.0, -1.05)):
            w = cyl('%sW%d%d' % (name, i, side), (x, y - 0.22, 0.26), (x, y + 0.22, 0.26), 0.26, wheelm, 28)
            parts.append(w)
            parts.append(cyl('%sHub%d%d' % (name, i, side), (x, y - 0.24 * side, 0.26), (x, y - 0.27 * side, 0.26), 0.09, dark, 14))
            parts.append(cyl('%sLeg%d%d' % (name, i, side), (x, y, 0.42), (x * 0.5, side * 0.9, 0.85), 0.045, alu, 10))
        parts.append(cyl('%sRocker%d' % (name, side), (1.05, y, 0.5), (-1.05, y, 0.5), 0.05, alu, 10))
    # high-gain antenna disc + low-gain post
    parts.append(cyl(name + 'HGA', (-0.3, -0.55, 1.34), (-0.3, -0.55, 1.42), 0.3, white, 24))
    parts.append(cyl(name + 'LGA', (-0.7, 0.55, 1.33), (-0.7, 0.55, 1.75), 0.03, alu, 8))
    # folded arm with turret at the front
    parts.append(cyl(name + 'Arm1', (1.15, 0.4, 1.0), (1.55, 0.0, 0.9), 0.06, alu, 10))
    parts.append(cyl(name + 'Arm2', (1.55, 0.0, 0.9), (1.25, -0.45, 0.85), 0.05, alu, 10))
    parts.append(boxm(name + 'Turret', (1.25, -0.5, 0.8), (0.32, 0.32, 0.3), gold, 0.03))
    for p in parts:
        p.parent = root
    # mast: post + head (pans)
    mast = Md.empty(name + 'Mast', (0.85, 0.5, 1.3))
    mast.parent = root
    post = cyl(name + 'Post', (0, 0, 0), (0, 0, 0.85), 0.05, alu, 12)
    post.parent = mast
    head = boxm(name + 'Head', (0, 0, 0.98), (0.36, 0.55, 0.22), white, 0.03)
    head.parent = mast
    for s in (1, -1):
        e = cyl(name + 'Eye%d' % s, (0.18, s * 0.12, 0.98), (0.22, s * 0.12, 0.98), 0.045, dark, 14)
        e.parent = mast
    for f, yv in ((0, mast_yaw[0]), (NF, mast_yaw[1])):
        mast.rotation_euler = (0, 0, math.radians(yv))
        mast.keyframe_insert('rotation_euler', frame=f)
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def gas(name, center, size, density_keys, color=(0.55, 0.9, 0.95), emit=0.25, noise_scale=1.4, rise=0.0, NF=100):
    """Methane VISUALISED (the real gas is invisible): soft noisy volume, density keyed per frame
    (density_keys = [(frame, density)]); emission keeps it readable at night. Label as illustration in Remotion.
    rise > 0 lifts + spreads the volume over the shot (daytime mixing)."""
    o = Wd.box(name, center, size)
    m = bpy.data.materials.new(name + 'M')
    m.use_nodes = True
    nt = m.node_tree
    nb = M.NB(nt)
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    out = nt.nodes['Material Output']
    pv = nb.n('ShaderNodeVolumePrincipled', Density=0.0, Anisotropy=0.3)
    pv.inputs['Color'].default_value = (*color, 1)
    try:
        pv.inputs['Emission Color'].default_value = (*color, 1)
        pv.inputs['Emission Strength'].default_value = emit
    except Exception:
        pass
    tc = nb.n('ShaderNodeTexCoord')
    nzz = nb.n('ShaderNodeTexNoise', Scale=noise_scale * 3, Detail=5.0, Roughness=0.6)
    nzz.noise_dimensions = '4D'
    nb.l(tc, 'Object', nzz, 'Vector')
    M.animate(nzz.inputs['W'], 'default_value', [(0, 0.0), (max(NF, 2), 0.4)])
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Generated', sep, 'Vector')
    # soft edges: fade with height (top) and towards the box walls
    fz = nb.math('SUBTRACT', va=1.0, b=sep.outputs['Z'])
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].position = 0.45
    cr.color_ramp.elements[1].position = 0.75
    nb.l(nzz, 'Fac', cr, 'Fac')
    shape = nb.math('MULTIPLY', cr.outputs['Color'], b=fz.outputs[0])
    dv = nb.n('ShaderNodeValue')
    dv.name = 'Dens'
    for f, v in density_keys:
        dv.outputs[0].default_value = v
        dv.outputs[0].keyframe_insert('default_value', frame=f)
    dens = nb.math('MULTIPLY', shape.outputs[0], b=dv.outputs[0])
    nb.l(dens, 0, pv, 'Density')
    nb.l(pv, 'Volume', out, 'Volume')
    o.data.materials.append(m)
    if rise:
        for f, (z, s) in ((0, (center[2], 1.0)), (NF, (center[2] + rise, 1.0 + rise / max(size[2], 0.1)))):
            o.location = (center[0], center[1], z)
            o.scale = (s, s, s)
            o.keyframe_insert('location', frame=f)
            o.keyframe_insert('scale', frame=f)
    return o


def orbiter(name='Orbiter', loc=(0, 0, 0), scale=1.0):
    """Generic trace-gas orbiter: gold-foil bus, two long solar wings, dish; no agency marks."""
    root = Md.empty(name, loc)
    gold = M.principled(name + 'MLI', base=(0.85, 0.58, 0.18), rough=0.22, metal=1.0, bump=0.35, bump_scale=18)
    cell = M.principled(name + 'Cells', base=(0.02, 0.03, 0.09), rough=0.18, metal=0.3, coat=0.8)
    alu = M.principled(name + 'Alu', base=(0.7, 0.72, 0.75), rough=0.3, metal=1.0)
    parts = [boxm(name + 'Bus', (0, 0, 0), (3.2, 2.0, 2.0), gold, 0.04)]
    for s in (1, -1):
        parts.append(cyl(name + 'Yoke%d' % s, (0, s * 1.0, 0), (0, s * 2.0, 0), 0.05, alu, 10))
        for k in range(2):
            parts.append(boxm('%sPanel%d_%d' % (name, s, k), (0, s * (3.2 + k * 2.5), 0), (2.2, 2.4, 0.05), cell))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1.1, location=(0, 0, 1.35))
    dish = bpy.context.active_object
    dish.name = name + 'Dish'
    dish.scale = (1, 1, 0.25)
    M.assign(dish, alu)
    parts.append(dish)
    for p in parts:
        p.parent = root
    root.scale = (scale, scale, scale)
    return root


def mars_globe(name='Mars', r=100.0):
    """Procedural Mars: rust base, darker albedo patches, white polar caps, thin pale-orange limb."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=r, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    m, nb, b, out = M.new(name + 'M')
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=2.2, Detail=10.0, Roughness=0.62)
    nb.l(tc, 'Object', nz, 'Vector')
    cr = nb.n('ShaderNodeValToRGB')
    el = cr.color_ramp.elements
    el[0].position, el[0].color = 0.38, (0.16, 0.07, 0.04, 1)
    el[1].position, el[1].color = 0.62, (0.62, 0.32, 0.16, 1)
    nb.l(nz, 'Fac', cr, 'Fac')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Object', sep, 'Vector')
    az = nb.math('ABSOLUTE', nb.math('DIVIDE', sep.outputs['Z'], vb=r).outputs[0])
    cap = nb.n('ShaderNodeMapRange')
    cap.inputs['From Min'].default_value = 0.9
    cap.inputs['From Max'].default_value = 0.95
    nb.l(az, 0, cap, 'Value')
    mx = nb.n('ShaderNodeMix')
    mx.data_type = 'RGBA'
    nb.l(cap, 'Result', mx, 'Factor')
    nb.l(cr, 'Color', mx, 6)
    mx.inputs[7].default_value = (0.85, 0.83, 0.8, 1)
    nb.l(mx, 2, b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.85
    bp = nb.n('ShaderNodeBump', Strength=0.25)
    nb.l(nz, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    o.data.materials.append(m)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=r * 1.012, location=(0, 0, 0))
    a = bpy.context.active_object
    a.name = name + 'Atmo'
    bpy.ops.object.shade_smooth()
    am, nb2, b2, out2 = M.new(name + 'AtmoM')
    M.no_light(am)
    am.node_tree.nodes.remove(b2)
    lw = nb2.n('ShaderNodeLayerWeight', Blend=0.3)
    pw = nb2.math('POWER', lw.outputs['Facing'], vb=4.0)
    em = nb2.n('ShaderNodeEmission', Strength=0.9)
    em.inputs['Color'].default_value = (1.0, 0.72, 0.5, 1)
    tr = nb2.n('ShaderNodeBsdfTransparent')
    mxs = nb2.n('ShaderNodeMixShader')
    nb2.l(pw, 0, mxs, 'Fac')
    nb2.l(tr, 'BSDF', mxs, 1)
    nb2.l(em, 'Emission', mxs, 2)
    nb2.l(mxs, 'Shader', out2, 'Surface')
    a.data.materials.append(am)
    a.visible_shadow = False
    return o


def mission_room(NF, img='artifact_pia22328.jpg'):
    """Dim mission-ops room (generic, no logos): big wall screen with the REAL NASA/JPL graphic, console rows."""
    wall = M.principled('OpsWall', base=(0.08, 0.085, 0.09), rough=0.8, grime=0.4)
    floor = M.texture_set('OpsFloor', 'concrete_floor_worn_001', scale=0.4, tint=(0.3, 0.3, 0.31))
    desk = M.principled('OpsDesk', base=(0.12, 0.12, 0.13), rough=0.45, metal=0.2)
    boxm('OpsFloorB', (0, 0, -0.05), (20, 18, 0.1), floor)
    boxm('OpsBack', (0, 4.2, 2.5), (20, 0.2, 5.2), wall)
    boxm('OpsCeil', (0, 0, 5.1), (20, 18, 0.1), wall)
    boxm('OpsSide', (-8.5, 0, 2.5), (0.2, 18, 5.2), wall)
    scr = image_plane('WallScreen', img, 6.4, (0, 4.08, 2.6), rot=(math.radians(90), 0, 0), emit=1.8)
    boxm('ScreenFrame', (0, 4.12, 2.6), (6.7, 0.06, 6.4 * 1080 / 1920 + 0.3), M.principled('Frame', base=(0.02, 0.02, 0.02), rough=0.5))
    for row, y in enumerate((1.2, -0.6, -2.4)):
        boxm('OpsRow%d' % row, (0, y, 0.4 + row * 0.25), (12, 0.9, 0.8), desk, 0.02)
        for k in range(6):
            x = -5 + 2 * k
            boxm('OpsMon%d_%d' % (row, k), (x, y + 0.2, 1.05 + row * 0.25), (0.8, 0.06, 0.5), M.principled('OM', base=(0.03, 0.03, 0.03)))
            uv = image_plane('OpsGlow%d_%d' % (row, k), img, 0.72, (x, y + 0.165, 1.05 + row * 0.25), rot=(math.radians(90), 0, 0), emit=0.6)
    Wd.area('OpsFill', (0, -6, 4.5), (0, 3, 1.5), color=(0.6, 0.7, 0.9), power=120, size=6.0)
    return scr
