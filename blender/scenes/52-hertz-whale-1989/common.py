"""52-hertz-whale-1989 shared helpers (REAL3D + CINE v2, code batch 2026-11-05, subagent codebatch; NOT rendered yet).
Base helpers copied from mh370-seven-handshakes-2014/common.py (look/go/glow/rings/curves/cyl/boxm/dawn/swell/space +
Earth/lonlat). Rules: 14-18 shots, mostly WIDE (24-35 mm), close-ups as accents; smooth eased dolly/push/orbit/crane only
(NO shake); the animal's species is unknown -> generic baleen-whale silhouette; no people's faces (empty listening room).
Sound is visualised as glow rings (illustration, label in Remotion)."""
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



# ---------------------------------------------------------------- Earth (NASA Blue Marble texture, credit in desc)
EARTH_R = 100.0


def lonlat(lon, lat, r=EARTH_R):
    lo, la = math.radians(lon), math.radians(lat)
    return Vector((r * math.cos(la) * math.cos(lo), r * math.cos(la) * math.sin(lo), r * math.sin(la)))


def earth(name='Earth', r=EARTH_R, atmo=True, night=0.0):
    """Sphere with equirect lookup from object coords (lon 0 at +X, east toward +Y), so lonlat() positions match."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=r, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    m, nb, b, out = M.new('EarthM')
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Object', sep, 'Vector')
    lon = nb.math('ARCTAN2', sep.outputs['Y'], sep.outputs['X'])
    u = nb.math('MULTIPLY_ADD', lon.outputs[0], vb=1 / (2 * math.pi))
    u.inputs[2].default_value = 0.5
    zr = nb.math('DIVIDE', sep.outputs['Z'], vb=r)
    lat = nb.math('ARCSINE', zr.outputs[0])
    v = nb.math('MULTIPLY_ADD', lat.outputs[0], vb=1 / math.pi)
    v.inputs[2].default_value = 0.5
    cmb = nb.n('ShaderNodeCombineXYZ')
    nb.l(u, 0, cmb, 'X')
    nb.l(v, 0, cmb, 'Y')
    tex = nb.n('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.join(HERE, 'earth_bluemarble_2048.jpg'), check_existing=True)
    tex.interpolation = 'Cubic'
    tex.extension = 'EXTEND'
    nb.l(cmb, 'Vector', tex, 'Vector')
    nb.l(tex, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.6
    b.inputs['Specular IOR Level'].default_value = 0.35
    o.data.materials.append(m)
    if atmo:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=r * 1.018, location=(0, 0, 0))
        a = bpy.context.active_object
        a.name = 'Atmo'
        bpy.ops.object.shade_smooth()
        am, nb2, b2, out2 = M.new('AtmoM')
        M.no_light(am)
        am.node_tree.nodes.remove(b2)
        lw = nb2.n('ShaderNodeLayerWeight', Blend=0.35)
        pw = nb2.math('POWER', lw.outputs['Facing'], vb=3.0)
        em = nb2.n('ShaderNodeEmission', Strength=1.6)
        em.inputs['Color'].default_value = (0.32, 0.55, 1.0, 1)
        tr = nb2.n('ShaderNodeBsdfTransparent')
        mx = nb2.n('ShaderNodeMixShader')
        nb2.l(pw, 0, mx, 'Fac')
        nb2.l(tr, 'BSDF', mx, 1)
        nb2.l(em, 'Emission', mx, 2)
        nb2.l(mx, 'Shader', out2, 'Surface')
        a.data.materials.append(am)
        a.visible_shadow = False
    return o



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


# ---------------------------------------------------------------- 52-hertz whale builders
WHALE_L = 24.0      # blue-whale-sized silhouette (the real animal's species is unknown: generic baleen whale)


def whale(name='Whale', NF=300, length=WHALE_L, beat=96, amp=0.05, phase=0.0, tint=(0.16, 0.2, 0.25)):
    """Generic baleen whale (no species claimed): lofted body, flippers, small dorsal, flukes; tail beat by shape keys.
    Built nose at x=0 pointing -X after the parent turn, so it swims toward -X... use root rotation to aim."""
    S = [(0.0, 0.02, 0.02, 0.0), (0.02, 0.16, 0.10, -0.02), (0.08, 0.36, 0.25, -0.03), (0.18, 0.52, 0.40, -0.04),
         (0.30, 0.58, 0.46, -0.03), (0.45, 0.54, 0.44, 0.0), (0.60, 0.42, 0.36, 0.02), (0.74, 0.27, 0.24, 0.04),
         (0.86, 0.15, 0.15, 0.05), (0.94, 0.08, 0.09, 0.05), (1.0, 0.05, 0.05, 0.05)]
    sec = [(u, hw * length / 8.0, hh * length / 8.0, zo * length / 8.0) for (u, hw, hh, zo) in S]
    def prof(u, t):          # flatter belly, throat pleats region slightly fuller
        s = math.sin(t)
        return 1.0 - 0.12 * max(0.0, -s) * (1.0 if u > 0.25 else 0.4)
    body = loft(name + 'Body', length, sec, n=28, prof=prof)
    # flukes (horizontal), joined into the body mesh so the shape-key beat moves them
    fl = []
    for sgn in (1, -1):
        pts = [(0.0, 0.0), (0.06, 0.22 * sgn), (0.10, 0.30 * sgn), (0.07, 0.18 * sgn), (0.03, 0.06 * sgn)]
        bmF = bmesh.new()
        top = [bmF.verts.new(((0.985 + x) * length, y * length * 0.5, 0.05 * length / 8 + 0.04)) for x, y in pts]
        bot = [bmF.verts.new(((0.985 + x) * length, y * length * 0.5, 0.05 * length / 8 - 0.04)) for x, y in pts]
        bmF.faces.new(top)
        bmF.faces.new(list(reversed(bot)))
        for i in range(len(pts)):
            bmF.faces.new((top[i], bot[i], bot[(i + 1) % len(pts)], top[(i + 1) % len(pts)]))
        meF = bpy.data.meshes.new(name + 'Fluke%d' % sgn)
        bmF.normal_update()
        bmF.to_mesh(meF)
        bmF.free()
        fl.append(link(bpy.data.objects.new(name + 'Fluke%d' % sgn, meF)))
    # flippers + dorsal (separate, parented: they sit forward of the beat zone)
    mat = M.principled(name + 'Skin', base=tint, rough=0.42, coat=0.35, coat_rough=0.2, rough_noise=0.2, bump=0.25,
                       bump_scale=6, grime=0.35)
    for o in [body] + fl:
        o.data.materials.append(mat)
    bpy.ops.object.select_all(action='DESELECT')
    for o in fl:
        o.select_set(True)
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    body = bpy.context.active_object
    body.name = name + 'Body'
    swim_keys(body, NF, length, amp=amp, period=beat, phase=phase, from_u=0.5)
    root = Md.empty(name, (0, 0, 0))
    body.parent = root
    for sgn in (1, -1):
        f = fin_mesh(name + 'Flip%d' % sgn, [(0, 0), (0.05 * length, 0), (0.035 * length, -0.11 * length), (0.012 * length, -0.1 * length)],
                     thick=0.12)
        f.location = (0.27 * length, sgn * 0.5 * length / 8.0, -0.25 * length / 8.0)
        f.rotation_euler = (math.radians(-90 + sgn * 70), 0, math.radians(-sgn * 18))
        f.data.materials.append(mat)
        f.parent = root
        for fr, a in ((0, 0), (beat // 2, 6), (beat, 0)):
            f.rotation_euler[2] = math.radians(-sgn * (18 + a))
            f.keyframe_insert('rotation_euler', frame=fr)
        if f.animation_data:
            for fc in f.animation_data.action.fcurves:
                fc.modifiers.new('CYCLES')
    d = fin_mesh(name + 'Dorsal', [(0, 0), (0.04 * length, 0), (0.035 * length, 0.022 * length)], thick=0.1)
    d.location = (0.73 * length, 0, 0.22 * length / 8.0)
    d.data.materials.append(mat)
    d.parent = root
    return root


def hydrophone_array(prefix='Hyd', n=7, spacing=14.0, y=0.0, depth=40.0, glow=0.0):
    """Seabed listening array: cylindrical pods on low cradles joined by an armoured trunk cable into the dark."""
    steel = M.principled(prefix + 'Steel', base=(0.18, 0.2, 0.2), rough=0.5, metal=0.8, grime=0.6, rough_noise=0.3)
    rubber = M.principled(prefix + 'Cable', base=(0.03, 0.03, 0.03), rough=0.65, grime=0.4)
    pods = []
    z = -depth + 0.45
    for k in range(n):
        x = (k - n / 2) * spacing
        p = cyl('%sPod%d' % (prefix, k), (x - 1.2, y, z), (x + 1.2, y, z), 0.38, steel, 24)
        boxm('%sCradle%d' % (prefix, k), (x, y, z - 0.32), (1.4, 0.9, 0.2), steel, 0.03)
        pods.append(p)
        if glow:
            g = cyl('%sLed%d' % (prefix, k), (x - 0.02, y + 0.36, z + 0.1), (x + 0.02, y + 0.36, z + 0.1), 0.05,
                    M.emission('%sLedM%d' % (prefix, k), color=(0.5, 0.9, 1.0), strength=glow))
    pts = [((k - n / 2) * spacing * 1.0 + 0.0, y + 0.3 * math.sin(k), z - 0.25) for k in range(-3, n + 30)]
    pts = [(x, yy, z - 0.25) for (x, yy, _) in pts]
    curve_poly(prefix + 'Trunk', pts, bevel=0.09, mat=rubber)
    return pods


def submarine(name='Sub', loc=(0, 0, 0), length=90.0):
    """Generic Cold-War-era attack-sub silhouette (no specific class or markings)."""
    m = M.principled(name + 'Hull', base=(0.02, 0.022, 0.025), rough=0.35, coat=0.2, grime=0.3)
    sec = [(0.0, 0.01, 0.01, 0), (0.03, 0.35, 0.35, 0), (0.12, 0.5, 0.5, 0), (0.75, 0.5, 0.5, 0), (0.92, 0.3, 0.3, 0),
           (1.0, 0.04, 0.04, 0)]
    h = loft(name, length, [(u, a * length / 9, b * length / 9, c) for (u, a, b, c) in sec], n=24)
    h.data.materials.append(m)
    s = boxm(name + 'Sail', (0.25 * length, 0, length / 9 * 0.5 + 2.6), (8.0, 1.6, 5.4), m, 0.4)
    s.parent = h
    h.location = loc
    return h


def spectro_trace_mat(name, NF, rise=(30, 120), band_y=0.22, trace_y=(0.5, 0.62), glow=3.0):
    """Procedural waterfall-spectrogram screen: dark green-black paper, faint low band (other whales),
    one bright trace that climbs from the band to trace_y as frames pass (emission).
    Uses UV (0..1): x = time, y = frequency."""
    m, nb, b, out = M.new(name)
    m.node_tree.nodes.remove(b)
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'UV', sep, 'Vector')
    # low band
    d1 = nb.math('ABSOLUTE', nb.math('SUBTRACT', sep.outputs['Y'], vb=band_y).outputs[0])
    b1 = nb.math('POWER', nb.math('SUBTRACT', va=1.0, b=nb.math('MINIMUM', nb.math('MULTIPLY', d1.outputs[0], vb=18.0).outputs[0], vb=1.0).outputs[0]).outputs[0], vb=2.0)
    # trace: y target value animated, visible only left of a moving write head (x < head)
    ty = nb.n('ShaderNodeValue')
    ty.name = 'TraceY'
    ty.outputs[0].default_value = band_y
    for f, v in ((0, band_y), (rise[0], band_y), (rise[1], trace_y[0]), (NF, trace_y[1])):
        ty.outputs[0].default_value = v
        ty.outputs[0].keyframe_insert('default_value', frame=f)
    d2 = nb.math('ABSOLUTE', nb.math('SUBTRACT', sep.outputs['Y'], b=ty.outputs[0]).outputs[0])
    b2 = nb.math('POWER', nb.math('SUBTRACT', va=1.0, b=nb.math('MINIMUM', nb.math('MULTIPLY', d2.outputs[0], vb=45.0).outputs[0], vb=1.0).outputs[0]).outputs[0], vb=3.0)
    hd = nb.n('ShaderNodeValue')
    hd.name = 'Head'
    for f, v in ((0, 0.15), (NF, 0.95)):
        hd.outputs[0].default_value = v
        hd.outputs[0].keyframe_insert('default_value', frame=f)
    left = nb.math('LESS_THAN', sep.outputs['X'], b=hd.outputs[0])
    b2m = nb.math('MULTIPLY', b2.outputs[0], b=left.outputs[0])
    nz = nb.n('ShaderNodeTexNoise', Scale=140.0, Detail=2.0)
    nb.l(tc, 'UV', nz, 'Vector')
    grain = nb.math('MULTIPLY', nz.outputs['Fac'], vb=0.25)
    tot1 = nb.math('ADD', nb.math('MULTIPLY', b1.outputs[0], vb=0.35).outputs[0], b=grain.outputs[0])
    em1 = nb.n('ShaderNodeEmission')
    em1.inputs['Color'].default_value = (0.35, 0.75, 0.55, 1)
    nb.l(nb.math('MULTIPLY', tot1.outputs[0], vb=glow * 0.5), 0, em1, 'Strength')
    em2 = nb.n('ShaderNodeEmission')
    em2.inputs['Color'].default_value = (0.75, 1.0, 0.85, 1)
    nb.l(nb.math('MULTIPLY', b2m.outputs[0], vb=glow * 2.0), 0, em2, 'Strength')
    ad = nb.n('ShaderNodeAddShader')
    nb.l(em1, 'Emission', ad, 0)
    nb.l(em2, 'Emission', ad, 1)
    nb.l(ad, 'Shader', out, 'Surface')
    return m


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


def buoy(name='Buoy', loc=(0, 0, 0), light=True):
    hull = M.principled(name + 'Paint', base=(0.55, 0.52, 0.45), rough=0.5, grime=0.6)
    b = cyl(name, (loc[0], loc[1], loc[2] - 0.6), (loc[0], loc[1], loc[2] + 0.5), 0.9, hull, 24)
    cyl(name + 'Mast', (loc[0], loc[1], loc[2] + 0.5), (loc[0], loc[1], loc[2] + 2.6), 0.06, hull, 10)
    if light:
        cyl(name + 'Lamp', (loc[0], loc[1], loc[2] + 2.6), (loc[0], loc[1], loc[2] + 2.8), 0.1,
            M.emission(name + 'LampM', color=(1.0, 0.85, 0.6), strength=30.0), 12)
    return b
