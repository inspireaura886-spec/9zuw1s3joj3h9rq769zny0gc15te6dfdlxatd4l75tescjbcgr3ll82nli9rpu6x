"""PBR materials + node helpers (Cycles). Textures: CC0 Poly Haven sets fetched by fetch_assets.py into $IA3D_ASSETS."""
import bpy, os, math, glob

A = lambda: os.environ.get('IA3D_ASSETS', os.path.expanduser('~/ia3d_assets'))


class NB:
    """Tiny node-builder: nb = NB(mat); n = nb.n('ShaderNodeNoiseTexture', Scale=4); nb.l(n, 'Fac', other, 'Roughness')"""
    def __init__(self, tree):
        self.t = tree
        self.N = tree.nodes
        self.L = tree.links

    def n(self, kind, _loc=None, **inputs):
        node = self.N.new(kind)
        for k, v in inputs.items():
            if k.startswith('_'):
                setattr(node, k[1:], v)
            else:
                node.inputs[k].default_value = v
        return node

    def l(self, a, ao, b, bi):
        out = a.outputs[ao] if isinstance(ao, (str, int)) else ao
        inp = b.inputs[bi] if isinstance(bi, (str, int)) else bi
        self.L.new(out, inp)
        return b

    def math(self, op, a=None, b=None, va=None, vb=None, clamp=False):
        """a / b are output sockets (or None -> constants va / vb)."""
        m = self.N.new('ShaderNodeMath')
        m.operation = op
        m.use_clamp = clamp
        if a is not None:
            self.L.new(a, m.inputs[0])
        elif va is not None:
            m.inputs[0].default_value = va
        if b is not None:
            self.L.new(b, m.inputs[1])
        elif vb is not None:
            m.inputs[1].default_value = vb
        return m


def new(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nb = NB(m.node_tree)
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    out = m.node_tree.nodes.get('Material Output')
    return m, nb, bsdf, out


def principled(name, base=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, coat=0.0, coat_rough=0.05, spec=0.5,
               emission=None, emit=0.0, alpha=1.0, transmission=0.0, ior=1.45, sss=0.0, rough_noise=0.0,
               bump=0.0, bump_scale=40.0, grime=0.0):
    """General PBR. rough_noise / grime add procedural breakup so nothing looks CG-clean."""
    m, nb, b, out = new(name)
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    b.inputs['Specular IOR Level'].default_value = spec
    b.inputs['Transmission Weight'].default_value = transmission
    b.inputs['IOR'].default_value = ior
    b.inputs['Alpha'].default_value = alpha
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
    if emission is not None:
        b.inputs['Emission Color'].default_value = (*emission, 1)
        b.inputs['Emission Strength'].default_value = emit
    if rough_noise or grime:
        tc = nb.n('ShaderNodeTexCoord')
        nz = nb.n('ShaderNodeNoiseTexture', Scale=6.0, Detail=8.0, Roughness=0.6)
        nb.l(tc, 'Object', nz, 'Vector')
        if rough_noise:
            mr = nb.n('ShaderNodeMapRange')
            mr.inputs['To Min'].default_value = max(0, rough - rough_noise)
            mr.inputs['To Max'].default_value = min(1, rough + rough_noise)
            nb.l(nz, 'Fac', mr, 'Value')
            nb.l(mr, 'Result', b, 'Roughness')
        if grime:
            cr = nb.n('ShaderNodeValToRGB')
            cr.color_ramp.elements[0].position = 0.45
            cr.color_ramp.elements[0].color = (*base, 1)
            cr.color_ramp.elements[1].position = 0.75
            cr.color_ramp.elements[1].color = (base[0] * (1 - grime), base[1] * (1 - grime), base[2] * (1 - grime * 0.9), 1)
            nb.l(nz, 'Fac', cr, 'Fac')
            nb.l(cr, 'Color', b, 'Base Color')
    if bump:
        tc = nb.n('ShaderNodeTexCoord')
        n2 = nb.n('ShaderNodeNoiseTexture', Scale=bump_scale, Detail=4.0)
        nb.l(tc, 'Object', n2, 'Vector')
        bp = nb.n('ShaderNodeBump', Strength=bump, Distance=0.02)
        nb.l(n2, 'Fac', bp, 'Height')
        nb.l(bp, 'Normal', b, 'Normal')
    if alpha < 1:
        m.blend_method = 'HASHED'
    return m


def emission(name, color=(1, 0.2, 0.1), strength=10.0):
    m, nb, b, out = new(name)
    m.node_tree.nodes.remove(b)
    e = nb.n('ShaderNodeEmission', Strength=strength)
    e.inputs['Color'].default_value = (*color, 1)
    nb.l(e, 'Emission', out, 'Surface')
    return m


def glass(name, tint=(0.9, 0.95, 1.0), rough=0.02, dark=0.0):
    m = principled(name, base=tint, rough=rough, transmission=1.0, ior=1.5, spec=0.5)
    if dark:
        m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (tint[0] * (1 - dark), tint[1] * (1 - dark), tint[2] * (1 - dark), 1)
    return m


def texture_set(name, tid, scale=1.0, tint=None, rough_mul=1.0, normal=1.0, metal=None, disp=0.0, box=False):
    """PBR from a Poly Haven texture set (Diffuse / nor_gl / Rough or arm). Falls back to grey if missing."""
    d = os.path.join(A(), 'tex', tid)
    m, nb, b, out = new(name)
    def img(mapname, non_color=True):
        f = glob.glob(os.path.join(d, mapname + '.*'))
        if not f:
            return None
        n = nb.n('ShaderNodeTexImage')
        n.image = bpy.data.images.load(f[0], check_existing=True)
        if non_color:
            n.image.colorspace_settings.name = 'Non-Color'
        if box:
            n.projection = 'BOX'
            n.projection_blend = 0.25
        return n
    tc = nb.n('ShaderNodeTexCoord')
    mp = nb.n('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    nb.l(tc, 'Object' if box else 'UV', mp, 'Vector')
    di = img('Diffuse', non_color=False)
    if di:
        nb.l(mp, 'Vector', di, 'Vector')
        if tint:
            mx = nb.n('ShaderNodeMix')
            mx.data_type = 'RGBA'
            mx.blend_type = 'MULTIPLY'
            mx.inputs['Factor'].default_value = 1.0
            mx.inputs[7].default_value = (*tint, 1)
            nb.l(di, 'Color', mx, 6)
            nb.l(mx, 2, b, 'Base Color')
        else:
            nb.l(di, 'Color', b, 'Base Color')
    ro = img('Rough')
    arm = img('arm')
    if ro:
        nb.l(mp, 'Vector', ro, 'Vector')
        mm = nb.math('MULTIPLY', ro.outputs['Color'], vb=rough_mul)
        nb.l(mm, 0, b, 'Roughness')
    elif arm:
        nb.l(mp, 'Vector', arm, 'Vector')
        sp = nb.n('ShaderNodeSeparateColor')
        nb.l(arm, 'Color', sp, 'Color')
        mm = nb.math('MULTIPLY', sp.outputs['Green'], vb=rough_mul)
        nb.l(mm, 0, b, 'Roughness')
        if metal is None:
            nb.l(sp, 'Blue', b, 'Metallic')
    if metal is not None:
        b.inputs['Metallic'].default_value = metal
    no = img('nor_gl')
    if no:
        nb.l(mp, 'Vector', no, 'Vector')
        nm = nb.n('ShaderNodeNormalMap', Strength=normal)
        nb.l(no, 'Color', nm, 'Color')
        nb.l(nm, 'Normal', b, 'Normal')
    return m


def animate(socket_or_obj, path, keys, interp='LINEAR'):
    """keys = [(frame, value), ...] on a node input (default_value) or any RNA path."""
    for f, v in keys:
        if path == 'default_value':
            socket_or_obj.default_value = v
            socket_or_obj.keyframe_insert('default_value', frame=f)
        else:
            setattr(socket_or_obj, path, v)
            socket_or_obj.keyframe_insert(path, frame=f)
    return socket_or_obj


def set_interp(idblock, interp='LINEAR', extrapolate=False):
    ad = getattr(idblock, 'animation_data', None)
    if not ad or not ad.action:
        return
    for fc in ad.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = interp
        if extrapolate:
            fc.extrapolation = 'LINEAR'


def assign(obj, m, slot=None):
    if slot is None:
        obj.data.materials.clear()
    obj.data.materials.append(m)
    return obj
