"""Night worlds: HDRI sky (Poly Haven CC0), moon key light, volumetric fog, volumetric cloud deck, ocean, terrain."""
import bpy, os, math, random
from mathutils import Vector
from . import mat as M


def hdri(hid='kloppenheim_02_puresky', strength=0.25, rot=0.0, bg_strength=None, tint=(1, 1, 1), stars=0.0):
    """HDRI world. bg_strength lets the visible sky differ from the light it casts (camera ray switch).
    stars > 0 adds a fine procedural starfield on top of the visible sky."""
    w = bpy.data.worlds.new('IA_World')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nb = M.NB(nt)
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nb.n('ShaderNodeOutputWorld')
    tc = nb.n('ShaderNodeTexCoord')
    mp = nb.n('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (0, 0, math.radians(rot))
    nb.l(tc, 'Generated', mp, 'Vector')
    env = nb.n('ShaderNodeTexEnvironment')
    p = os.path.join(M.A(), 'hdri', hid + '.hdr')
    if os.path.exists(p):
        env.image = bpy.data.images.load(p, check_existing=True)
    else:
        print('HDRI missing', p)
    nb.l(mp, 'Vector', env, 'Vector')
    tint_n = nb.n('ShaderNodeMix')
    tint_n.data_type = 'RGBA'
    tint_n.blend_type = 'MULTIPLY'
    tint_n.inputs['Factor'].default_value = 1
    tint_n.inputs[7].default_value = (*tint, 1)
    nb.l(env, 'Color', tint_n, 6)
    col = tint_n.outputs[2]
    if stars > 0:
        vo = nb.n('ShaderNodeTexVoronoi', Scale=1400.0)
        vo.feature = 'F1'
        nb.l(tc, 'Generated', vo, 'Vector')
        st = nb.math('POWER', nb.math('SUBTRACT', va=1.0, b=vo.outputs['Distance']).outputs[0], vb=60.0)
        nz = nb.n('ShaderNodeTexNoise', Scale=40.0)
        nb.l(tc, 'Generated', nz, 'Vector')
        st2 = nb.math('MULTIPLY', st.outputs[0], nz.outputs['Fac'])
        st3 = nb.math('MULTIPLY', st2.outputs[0], vb=stars * 3)
        # only above the horizon
        sep = nb.n('ShaderNodeSeparateXYZ')
        nb.l(tc, 'Generated', sep, 'Vector')
        up = nb.math('GREATER_THAN', sep.outputs['Z'], vb=0.02)
        st4 = nb.math('MULTIPLY', st3.outputs[0], up.outputs[0])
        add = nb.n('ShaderNodeMix')
        add.data_type = 'RGBA'
        add.blend_type = 'ADD'
        nb.l(st4, 0, add, 'Factor')
        nt.links.new(col, add.inputs[6])
        add.inputs[7].default_value = (0.8, 0.85, 1.0, 1)
        col = add.outputs[2]
    bgl = nb.n('ShaderNodeBackground', Strength=strength)
    nt.links.new(col, bgl.inputs['Color'])
    if bg_strength is not None:
        bgc = nb.n('ShaderNodeBackground', Strength=bg_strength)
        nt.links.new(col, bgc.inputs['Color'])
        lp = nb.n('ShaderNodeLightPath')
        mx = nb.n('ShaderNodeMixShader')
        nb.l(lp, 'Is Camera Ray', mx, 'Fac')
        nb.l(bgl, 'Background', mx, 1)
        nb.l(bgc, 'Background', mx, 2)
        nb.l(mx, 'Shader', out, 'Surface')
    else:
        nb.l(bgl, 'Background', out, 'Surface')
    return w


def moon(direction=(-0.4, 0.6, 0.35), strength=0.35, color=(0.62, 0.72, 1.0), angle=0.6):
    """Moonlight = soft cool sun lamp. direction points FROM the scene TOWARD the moon."""
    ld = bpy.data.lights.new('Moon', 'SUN')
    ld.energy = strength
    ld.color = color
    ld.angle = math.radians(angle)
    o = bpy.data.objects.new('Moon', ld)
    bpy.context.scene.collection.objects.link(o)
    d = Vector(direction).normalized()
    o.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    return o


def point(name, loc, color=(1, 0.6, 0.3), power=100, radius=0.1):
    ld = bpy.data.lights.new(name, 'POINT')
    ld.energy = power
    ld.color = color
    ld.shadow_soft_size = radius
    o = bpy.data.objects.new(name, ld)
    o.location = loc
    bpy.context.scene.collection.objects.link(o)
    return o


def spot(name, loc, target, color=(1, 0.85, 0.7), power=500, size_deg=40, blend=0.4, radius=0.05):
    ld = bpy.data.lights.new(name, 'SPOT')
    ld.energy = power
    ld.color = color
    ld.spot_size = math.radians(size_deg)
    ld.spot_blend = blend
    ld.shadow_soft_size = radius
    o = bpy.data.objects.new(name, ld)
    o.location = loc
    d = (Vector(target) - Vector(loc)).normalized()
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.collection.objects.link(o)
    return o


def area(name, loc, target, color=(1, 1, 1), power=200, size=2.0):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy = power
    ld.color = color
    ld.size = size
    o = bpy.data.objects.new(name, ld)
    o.location = loc
    d = (Vector(target) - Vector(loc)).normalized()
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.collection.objects.link(o)
    return o


def box(name, center, size):
    me = bpy.data.meshes.new(name)
    sx, sy, sz = [s / 2 for s in size]
    v = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz), (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me.from_pydata(v, [], f)
    o = bpy.data.objects.new(name, me)
    o.location = center
    bpy.context.scene.collection.objects.link(o)
    return o


def _gen11(nb, tc):
    """Generated (0..1 over the bounding box) -> [-1,1] vector socket."""
    vm = nb.n('ShaderNodeVectorMath')
    vm.operation = 'MULTIPLY_ADD'
    nb.l(tc, 'Generated', vm, 0)
    vm.inputs[1].default_value = (2, 2, 2)
    vm.inputs[2].default_value = (-1, -1, -1)
    return vm.outputs['Vector']


def fog(center=(0, 0, 0), size=(200, 200, 60), density=0.004, color=(0.75, 0.8, 0.9), anisotropy=0.35, noise=0.0,
        noise_scale=0.05, height_falloff=0.0):
    """Volumetric haze box (cheaper + more controllable than a world volume). Lights through it give god rays.
    noise > 0 breaks it into drifting banks; height_falloff > 0 thins it with altitude (ground fog)."""
    o = box('Fog', center, size)
    m = bpy.data.materials.new('FogVol')
    m.use_nodes = True
    nt = m.node_tree
    nb = M.NB(nt)
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    out = nt.nodes['Material Output']
    pv = nb.n('ShaderNodeVolumePrincipled', Density=density, Anisotropy=anisotropy)
    pv.inputs['Color'].default_value = (*color, 1)
    dens = None
    if noise or height_falloff:
        tc = nb.n('ShaderNodeTexCoord')
        g = _gen11(nb, tc)
        fac = None
        if noise:
            # noise_scale = features per metre-ish: scale by the box size so it is size independent
            nz = nb.n('ShaderNodeTexNoise', Scale=max(1.0, noise_scale * max(size) / 2), Detail=4.0)
            nz.noise_dimensions = '4D'
            nt.links.new(g, nz.inputs['Vector'])
            M.animate(nz.inputs['W'], 'default_value', [(0, 0.0), (900, 1.2)])
            mr = nb.n('ShaderNodeMapRange')
            mr.inputs['From Min'].default_value = 0.35
            mr.inputs['From Max'].default_value = 0.75
            mr.inputs['To Min'].default_value = 1 - noise
            mr.inputs['To Max'].default_value = 1 + noise
            nb.l(nz, 'Fac', mr, 'Value')
            fac = mr.outputs['Result']
        if height_falloff:
            sep = nb.n('ShaderNodeSeparateXYZ')
            nt.links.new(g, sep.inputs['Vector'])
            # box z in [-1,1] -> density factor exp(-falloff*(z+1))
            z1 = nb.math('ADD', sep.outputs['Z'], vb=1.0)
            e = nb.math('MULTIPLY', z1.outputs[0], vb=-height_falloff)
            ex = nb.math('EXPONENT', e.outputs[0])
            fac = nb.math('MULTIPLY', fac, ex.outputs[0]).outputs[0] if fac is not None else ex.outputs[0]
        dm = nb.math('MULTIPLY', fac, vb=density)
        nb.l(dm, 0, pv, 'Density')
    nb.l(pv, 'Volume', out, 'Volume')
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def clouds(center=(0, 0, -400), size=(9000, 9000, 260), density=0.06, scale=0.0009, coverage=0.48, detail=6,
           color=(0.92, 0.94, 1.0), anisotropy=0.6, drift=(0.0, 0.0), evolve=0.15, frames=900, sharp=0.18):
    """Volumetric cloud deck: 4D fractal noise -> coverage threshold -> vertical profile (puffy tops, flat base).
    drift moves the noise (m per frame); evolve morphs it."""
    o = box('Clouds', center, size)
    m = bpy.data.materials.new('CloudVol')
    m.use_nodes = True
    nt = m.node_tree
    nb = M.NB(nt)
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    out = nt.nodes['Material Output']
    tc = nb.n('ShaderNodeTexCoord')
    g = _gen11(nb, tc)  # box-normalised coords in [-1,1] (Object coords are metres)
    mp = nb.n('ShaderNodeMapping')
    nt.links.new(g, mp.inputs['Vector'])
    mp.inputs['Scale'].default_value = (size[0] / 2 * scale, size[1] / 2 * scale, size[2] / 2 * scale * 1.6)
    M.animate(mp.inputs['Location'], 'default_value', [(0, (0, 0, 0)), (frames, (drift[0] * frames * scale, drift[1] * frames * scale, 0))])
    nz = nb.n('ShaderNodeTexNoise', Scale=1.0, Detail=float(detail), Roughness=0.58, Lacunarity=2.2)
    nz.noise_dimensions = '4D'
    nb.l(mp, 'Vector', nz, 'Vector')
    M.animate(nz.inputs['W'], 'default_value', [(0, 0.0), (frames, evolve)])
    sep = nb.n('ShaderNodeSeparateXYZ')
    nt.links.new(g, sep.inputs['Vector'])
    # vertical profile: 0 at base (z=-1), peak at z=-0.4, fades to top (z=+1): cumulus-like
    zb = nb.n('ShaderNodeMapRange')
    zb.inputs['From Min'].default_value = -1.0
    zb.inputs['From Max'].default_value = -0.55
    nb.l(sep, 'Z', zb, 'Value')
    zt = nb.n('ShaderNodeMapRange')
    zt.inputs['From Min'].default_value = 1.0
    zt.inputs['From Max'].default_value = -0.2
    nb.l(sep, 'Z', zt, 'Value')
    prof = nb.math('MULTIPLY', zb.outputs['Result'], zt.outputs['Result'])
    # threshold rises with height so tops are rounded
    th = nb.math('MULTIPLY', prof.outputs[0], vb=-0.25)
    th2 = nb.math('ADD', th.outputs[0], vb=coverage + 0.25)
    d = nb.math('SUBTRACT', nz.outputs['Fac'], th2.outputs[0])
    d2 = nb.math('DIVIDE', d.outputs[0], vb=sharp, clamp=True)
    d3 = nb.math('MULTIPLY', d2.outputs[0], prof.outputs[0])
    dens = nb.math('MULTIPLY', d3.outputs[0], vb=density)
    pv = nb.n('ShaderNodeVolumePrincipled', Anisotropy=anisotropy)
    pv.inputs['Color'].default_value = (*color, 1)
    nb.l(dens, 0, pv, 'Density')
    nb.l(pv, 'Volume', out, 'Volume')
    o.data.materials.append(m)
    return o


def ocean(size=4000, center=(0, 0, 0), scale=1.0, wave_scale=1.2, choppy=1.2, res=12, time_frames=900, speed=1.0,
          color=(0.004, 0.008, 0.012), rough=0.06, foam=0.0, spatial=12.0, wind=12.0):
    """Ocean modifier (real FFT waves) + dark glossy water. Moon gives a glitter path. Animated by keying time."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=center)
    o = bpy.context.active_object
    o.name = 'Ocean'
    md = o.modifiers.new('Ocean', 'OCEAN')
    md.geometry_mode = 'GENERATE'
    md.repeat_x = md.repeat_y = 1
    md.size = scale
    md.spatial_size = int(spatial)
    md.resolution = res
    md.wave_scale = wave_scale
    md.choppiness = choppy
    md.wind_velocity = wind
    md.use_normals = True
    md.time = 0
    md.keyframe_insert('time', frame=0)
    md.time = time_frames / 30.0 * speed
    md.keyframe_insert('time', frame=time_frames)
    M.set_interp(o, 'LINEAR')
    m = M.principled('Water', base=color, rough=rough, spec=0.6, ior=1.33)
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def cloud_deck_far(z=-380, size=120000, hole=9000, color=(0.55, 0.6, 0.72), scale=0.00025, coverage=0.45):
    """Cheap distant cloud tops (a lit, bumpy surface) that continue the volumetric deck out to the horizon.
    The middle (radius `hole`) is cut away so the real volume shows there."""
    me = bpy.data.meshes.new('FarDeck')
    import bmesh
    bm = bmesh.new()
    n = 48
    inner, outer = [], []
    for k in range(n):
        a = 2 * math.pi * k / n
        inner.append(bm.verts.new((hole * math.cos(a), hole * math.sin(a), z)))
        outer.append(bm.verts.new((size / 2 * math.cos(a), size / 2 * math.sin(a), z)))
    for k in range(n):
        bm.faces.new((inner[k], outer[k], outer[(k + 1) % n], inner[(k + 1) % n]))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new('FarDeck', me)
    bpy.context.scene.collection.objects.link(o)
    m, nb, b, out = M.new('FarDeckMat')
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=scale * 1000, Detail=6.0, Roughness=0.6)
    vm = nb.n('ShaderNodeVectorMath')
    vm.operation = 'SCALE'
    nb.l(tc, 'Object', vm, 0)
    vm.inputs['Scale'].default_value = 0.001
    nb.l(vm, 'Vector', nz, 'Vector')
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].position = coverage
    cr.color_ramp.elements[0].color = (0.004, 0.006, 0.01, 1)
    cr.color_ramp.elements[1].position = coverage + 0.15
    cr.color_ramp.elements[1].color = (*color, 1)
    nb.l(nz, 'Fac', cr, 'Fac')
    nb.l(cr, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = 1.0
    b.inputs['Specular IOR Level'].default_value = 0.0
    bp = nb.n('ShaderNodeBump', Strength=0.6, Distance=40.0)
    nb.l(nz, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def sea_plane(size=60000, z=0.0, color=(0.002, 0.004, 0.007), rough=0.04, wave=0.35, wave_scale=0.08, frames=900):
    """Cheap infinite-looking sea for aerial views: glossy plane + animated multi-scale wave bump."""
    me = bpy.data.meshes.new('Sea')
    s = size / 2
    me.from_pydata([(-s, -s, z), (s, -s, z), (s, s, z), (-s, s, z)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new('Sea', me)
    bpy.context.scene.collection.objects.link(o)
    m, nb, b, out = M.new('SeaMat')
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['IOR'].default_value = 1.33
    b.inputs['Specular IOR Level'].default_value = 0.6
    tc = nb.n('ShaderNodeTexCoord')
    w1 = nb.n('ShaderNodeTexWave', Scale=wave_scale, Distortion=6.0, Detail=6.0, _wave_type='BANDS')
    w1.inputs['Detail Scale'].default_value = 2.0
    nb.l(tc, 'Object', w1, 'Vector')
    M.animate(w1.inputs['Phase Offset'], 'default_value', [(0, 0.0), (frames, 18.0)])
    nz = nb.n('ShaderNodeTexNoise', Scale=wave_scale * 25, Detail=8.0)
    nz.noise_dimensions = '4D'
    nb.l(tc, 'Object', nz, 'Vector')
    M.animate(nz.inputs['W'], 'default_value', [(0, 0.0), (frames, 3.0)])
    mix = nb.math('ADD', w1.outputs['Fac'], nz.outputs['Fac'])
    bp = nb.n('ShaderNodeBump', Strength=wave, Distance=1.0)
    nb.l(mix, 0, bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    o.data.materials.append(m)
    return o


def city_lights(name='Town', center=(0, 0, 0), radius=600, count=1500, seed=1, color=(1.0, 0.62, 0.3), strength=60.0,
                size=1.5, cluster=0.6, z_fn=None, shape='disc', length=0):
    """Scatter of tiny emissive quads = town/coast lights seen from altitude. Very cheap; bloom does the rest."""
    rnd = random.Random(seed)
    verts, faces = [], []
    centers = [(rnd.gauss(0, radius * 0.35), rnd.gauss(0, radius * 0.35)) for _ in range(max(3, count // 120))]
    for i in range(count):
        if rnd.random() < cluster:
            cx, cy = rnd.choice(centers)
            x, y = cx + rnd.gauss(0, radius * 0.12), cy + rnd.gauss(0, radius * 0.12)
        else:
            x, y = rnd.uniform(-radius, radius), rnd.uniform(-radius, radius)
        if shape == 'disc' and x * x + y * y > radius * radius:
            continue
        if shape == 'line' and length:
            x, y = rnd.uniform(-length / 2, length / 2), rnd.gauss(0, radius * 0.05)
        z = z_fn(x, y) if z_fn else 0.0
        s = size * rnd.uniform(0.5, 1.4)
        k = len(verts)
        verts += [(x - s, y - s, z), (x + s, y - s, z), (x + s, y + s, z), (x - s, y + s, z)]
        faces.append((k, k + 1, k + 2, k + 3))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    o = bpy.data.objects.new(name, me)
    o.location = center
    bpy.context.scene.collection.objects.link(o)
    m, nb, b, out = M.new(name + 'Mat')
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    e = nb.n('ShaderNodeEmission', Strength=strength)
    # per-light colour/brightness variation from object-space noise
    tc = nb.n('ShaderNodeTexCoord')
    wn = nb.n('ShaderNodeTexWhiteNoise')
    nb.l(tc, 'Object', wn, 'Vector')
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (*color, 1)
    cr.color_ramp.elements[1].color = (0.85, 0.9, 1.0, 1)
    cr.color_ramp.elements[1].position = 1.0
    cr.color_ramp.elements.new(0.8).color = (color[0], color[1] * 1.1, color[2] * 1.4, 1)
    nb.l(wn, 'Value', cr, 'Fac')
    nb.l(cr, 'Color', e, 'Color')
    br = nb.math('ADD', wn.outputs['Value'], vb=0.4)
    sm = nb.math('MULTIPLY', br.outputs[0], vb=strength)
    nb.l(sm, 0, e, 'Strength')
    nb.l(e, 'Emission', out, 'Surface')
    o.data.materials.append(m)
    o.visible_shadow = False
    return o


def terrain(name='Land', size=4000, res=200, height=120, scale=0.0012, center=(0, 0, 0), seed=0, mat=None,
            island=0.0, sea_level=0.0):
    """Displaced grid (fractal noise) with optional island mask (falls into the sea at the edge)."""
    from mathutils import noise as N
    n = res
    verts, faces = [], []
    off = Vector((seed * 13.7, seed * 7.1, 0))
    for j in range(n + 1):
        for i in range(n + 1):
            x = (i / n - 0.5) * size
            y = (j / n - 0.5) * size
            h = N.fractal(Vector((x * scale, y * scale, 0)) + off, 0.55, 2.1, 6) * height
            if island:
                r = math.sqrt(x * x + y * y) / (size / 2)
                h = h + height * 0.6 - island * height * 3 * max(0, r - 0.35) ** 1.5
            verts.append((x, y, max(h, sea_level - 30)))
    for j in range(n):
        for i in range(n):
            k = j * (n + 1) + i
            faces.append((k, k + 1, k + n + 2, k + n + 1))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    o.location = center
    bpy.context.scene.collection.objects.link(o)
    if mat:
        o.data.materials.append(mat)
    return o
