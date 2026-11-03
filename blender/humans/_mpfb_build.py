"""Child build (run by build_humans.py in a Blender that has MPFB enabled). Builds IA_Witness + IA_Pilot, previews,
packs textures, saves humans.blend into $IA_HUM_OUT. Characters (both cmu_mb rig = CMU mocap bone names):
  WITNESS  1970s civilian, ~35, dark work jacket over plaid shirt, jeans, brown leather shoes, side-parted short hair
  PILOT    1970s airline captain, ~48, navy uniform suit + white shirt + tie, 4 gold sleeve rings, black shoes, greying hair
"""
import bpy, os, sys, importlib, math, shutil, json, traceback
from mathutils import Vector, Matrix

OUT = os.environ['IA_HUM_OUT']
UDATA = os.environ.get('IA_HUM_UDATA', '')
PKG = os.environ.get('IA_HUM_PKG', '')


def log(*a):
    print('IA3D', *a, flush=True)


# --- make sure MPFB is loaded -------------------------------------------------------------------------------------
if not any(m.endswith('mpfb') for m in sys.modules):
    import addon_utils
    try:
        addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
    except Exception as e:
        log('enable failed', e)
if not any(m.endswith('mpfb') for m in sys.modules):
    # last resort: copy the package into the extensions repo and enable it
    import addon_utils
    dst = os.path.join(bpy.utils.user_resource('EXTENSIONS'), 'user_default', 'mpfb')
    if PKG and not os.path.isdir(dst):
        shutil.copytree(PKG, dst)
    try:
        bpy.ops.extensions.repo_refresh_all()
    except Exception as e:
        log('refresh', e)
    addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
log('mpfb modules', [m for m in sys.modules if m.endswith('mpfb')])


def dyn(absolute, key):
    for amod in list(sys.modules):
        if amod.endswith(absolute):
            return getattr(importlib.import_module(amod), key)
    raise ValueError(absolute)


HumanService = dyn('mpfb.services.humanservice', 'HumanService')
AssetService = dyn('mpfb.services.assetservice', 'AssetService')
TargetService = dyn('mpfb.services.targetservice', 'TargetService')
LocationService = dyn('mpfb.services.locationservice', 'LocationService')
ObjectService = dyn('mpfb.services.objectservice', 'ObjectService')

ud = LocationService.get_user_data()
log('mpfb user data', ud, 'assets staged at', UDATA)
if UDATA and os.path.abspath(ud) != os.path.abspath(UDATA):
    for d in os.listdir(UDATA):
        s, t = os.path.join(UDATA, d), os.path.join(ud, d)
        if not os.path.exists(t):
            shutil.copytree(s, t)
    try:
        AssetService.update_all_asset_lists()
    except Exception as e:
        log('asset list refresh', e)

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)


def asset(fname, sub):
    p = AssetService.find_asset_absolute_path(fname, asset_subdir=sub)
    if p is None:
        cand = os.path.join(ud, sub, os.path.splitext(fname)[0], fname)
        p = cand if os.path.exists(cand) else None
    log('asset', sub, fname, '->', p)
    return p


# --- material helpers ---------------------------------------------------------------------------------------------
def base_color_link(mat):
    nt = mat.node_tree
    for n in nt.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            s = n.inputs['Base Color']
            if s.links:
                return nt, n, s, s.links[0].from_socket
            return nt, n, s, None
    return nt, None, None, None


def tint(mat, mul=(1, 1, 1), sat=1.0, val=1.0, dark_only=None):
    """Recolour a clothes/hair material after its diffuse texture. dark_only=(lo, hi): apply only where the texture
    is darker than lo..hi (keeps a white shirt white while the suit turns navy)."""
    nt, p, sock, src = base_color_link(mat)
    if p is None or src is None:
        log('tint: no principled/texture in', mat.name)
        return
    N, L = nt.nodes.new, nt.links.new
    hs = N('ShaderNodeHueSaturation')
    hs.inputs['Saturation'].default_value = sat
    hs.inputs['Value'].default_value = val
    L(src, hs.inputs['Color'])
    mx = N('ShaderNodeMixRGB')
    mx.blend_type = 'MULTIPLY'
    mx.inputs['Fac'].default_value = 1.0
    mx.inputs['Color2'].default_value = (*mul, 1)
    L(hs.outputs['Color'], mx.inputs['Color1'])
    out = mx.outputs['Color']
    if dark_only:
        bw = N('ShaderNodeRGBToBW')
        L(src, bw.inputs['Color'])
        mr = N('ShaderNodeMapRange')
        mr.inputs['From Min'].default_value = dark_only[0]
        mr.inputs['From Max'].default_value = dark_only[1]
        mr.inputs['To Min'].default_value = 1.0
        mr.inputs['To Max'].default_value = 0.0
        L(bw.outputs['Val'], mr.inputs['Value'])
        m2 = N('ShaderNodeMixRGB')
        L(mr.outputs['Result'], m2.inputs['Fac'])
        L(src, m2.inputs['Color1'])
        L(out, m2.inputs['Color2'])
        out = m2.outputs['Color']
    L(out, sock)
    log('tinted', mat.name)


def principled_set(mat, **kw):
    for n in mat.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            for k, v in kw.items():
                if k in n.inputs:
                    n.inputs[k].default_value = v


def children(rig):
    return [o for o in bpy.data.objects if o.parent == rig]


def find_asset_obj(rig, key):
    for o in children(rig):
        if key.lower() in o.name.lower():
            return o
    return None


# --- character build ----------------------------------------------------------------------------------------------
def build(name, macro, skin, hair, eyebrow, clothes, eye_rgb):
    md = TargetService.get_default_macro_info_dict()
    for k, v in macro.items():
        if k == 'race':
            md['race'] = v
        else:
            md[k] = v
    bm = HumanService.create_human(macro_detail_dict=md)
    bm.name = name + '_body'
    HumanService.set_character_skin(asset(skin, 'skins'), bm, skin_type='ENHANCED_SSS')
    rig = HumanService.add_builtin_rig(bm, 'cmu_mb')
    rig.name = name + '_rig'
    for sub, fn, at, mt in ([('eyes', 'high-poly.mhclo', 'Eyes', 'PROCEDURAL_EYES'),
                             ('eyebrows', eyebrow, 'Eyebrows', 'MAKESKIN'),
                             ('eyelashes', 'eyelashes01.mhclo', 'Eyelashes', 'MAKESKIN'),
                             ('hair', hair, 'Hair', 'MAKESKIN')] + [('clothes', c, 'Clothes', 'MAKESKIN') for c in clothes]):
        p = asset(fn, sub)
        if p is None:
            log('MISSING', sub, fn)
            continue
        try:
            HumanService.add_mhclo_asset(p, bm, asset_type=at, subdiv_levels=1, material_type=mt)
        except Exception:
            log('add failed', fn, traceback.format_exc()[-800:])
    # render subdivision on the body (smooth skin silhouette), after the armature modifier
    if not any(m.type == 'SUBSURF' for m in bm.modifiers):
        s = bm.modifiers.new('Subdiv', 'SUBSURF')
        s.levels, s.render_levels = 0, 1
    # eye colour (procedural eyes group)
    eyes = ObjectService.find_object_of_type_amongst_nearest_relatives(bm, 'Eyes')
    if eyes and eyes.material_slots:
        for n in eyes.material_slots[0].material.node_tree.nodes:
            if n.type == 'GROUP':
                log('eye inputs', [i.name for i in n.inputs])
                for i in n.inputs:
                    if 'Iris' in i.name and 'Color' in i.name:
                        c = eye_rgb[0] if 'Minor' in i.name else eye_rgb[1]
                        i.default_value = (*c, 1)
    log('built', name, [o.name for o in children(rig)])
    return rig, bm


def sleeve_rings(rig, jacket, side, n=4, gold=None):
    """4 gold captain's rings around the jacket sleeve just above its cuff, bone-parented to the forearm."""
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ev = jacket.evaluated_get(dg)
    me = ev.to_mesh()
    vs = [ev.matrix_world @ v.co for v in me.vertices]
    ev.to_mesh_clear()
    b = rig.data.bones[side + 'ForeArm']
    h = rig.matrix_world @ b.head_local
    t = rig.matrix_world @ b.tail_local
    d = (t - h).normalized()
    L = (t - h).length
    near = [(v, (v - h).dot(d)) for v in vs if ((v - h) - d * (v - h).dot(d)).length < 0.09 and -0.02 < (v - h).dot(d) < L + 0.08]
    if not near:
        log('no sleeve verts', side)
        return
    cuff = max(s for v, s in near)
    rings = []
    for k in range(n):
        s0 = cuff - 0.022 - k * 0.0125
        sl = [((v - h) - d * (v - h).dot(d)).length for v, s in near if abs(s - s0) < 0.01]
        if not sl:
            continue
        sl.sort()
        r = sl[int(len(sl) * 0.8)] + 0.0025
        c = h + d * s0
        # ring mesh: band of 40 segments, width 6.5 mm
        import bmesh
        bmm = bmesh.new()
        q = Vector((0, 0, 1)).rotation_difference(d)
        verts = []
        for i in range(40):
            a = 2 * math.pi * i / 40
            for w in (-0.00325, 0.00325):
                verts.append(bmm.verts.new(c + q @ Vector((math.cos(a) * r, math.sin(a) * r, w))))
        for i in range(40):
            j = (i + 1) % 40
            bmm.faces.new((verts[2 * i], verts[2 * j], verts[2 * j + 1], verts[2 * i + 1]))
        mesh = bpy.data.meshes.new(rig.name + '_ring%s%d' % (side, k))
        bmm.to_mesh(mesh)
        bmm.free()
        for p in mesh.polygons:
            p.use_smooth = True
        o = bpy.data.objects.new(mesh.name, mesh)
        bpy.context.scene.collection.objects.link(o)
        mesh.materials.append(gold)
        sol = o.modifiers.new('Solid', 'SOLIDIFY')
        sol.thickness = 0.0012
        o.parent = rig
        o.parent_type = 'BONE'
        o.parent_bone = side + 'ForeArm'
        bpy.context.view_layer.update()
        o.matrix_world = Matrix.Identity(4)
        rings.append(o)
    log('rings', side, len(rings), 'cuff', round(cuff, 3))


def collect(rig, colname):
    col = bpy.data.collections.new(colname)
    bpy.context.scene.collection.children.link(col)
    objs = [rig] + [o for o in bpy.data.objects if o.parent == rig]
    objs += [o for o in bpy.data.objects if o.parent in objs and o not in objs]
    for o in objs:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    return col


ok = True
try:
    W, Wb = build('IA_Witness', {'gender': 1.0, 'age': 0.58, 'muscle': 0.55, 'weight': 0.52, 'height': 0.55,
                                 'proportions': 0.62, 'race': {'caucasian': 1.0, 'african': 0.0, 'asian': 0.0}},
                  'young_caucasian_male2.mhmat', 'short02.mhclo', 'eyebrow010.mhclo',
                  ['male_casualsuit05.mhclo', 'shoes01.mhclo'], ((0.20, 0.12, 0.05), (0.32, 0.22, 0.10)))
    P, Pb = build('IA_Pilot', {'gender': 1.0, 'age': 0.70, 'muscle': 0.5, 'weight': 0.6, 'height': 0.56,
                               'proportions': 0.6, 'race': {'caucasian': 1.0, 'african': 0.0, 'asian': 0.0}},
                  'middleage_caucasian_male.mhmat', 'short04.mhclo', 'eyebrow001.mhclo',
                  ['male_elegantsuit01.mhclo', 'shoes04.mhclo'], ((0.16, 0.20, 0.22), (0.28, 0.34, 0.36)))
    P.location.x = 0.0
    W.location.x = 0.0
    # --- looks: pilot navy uniform + greying hair; witness slightly warmer, period-dull jacket
    for o in children(P):
        for s in o.material_slots:
            m = s.material
            if not m:
                continue
            nm = m.name.lower()
            if 'elegantsuit' in nm:
                tint(m, mul=(0.55, 0.72, 1.45), sat=1.0, val=1.0, dark_only=(0.22, 0.45))
            if 'short04' in nm or 'hair' in nm:
                tint(m, mul=(1.0, 1.0, 1.0), sat=0.35, val=1.6)
    for o in children(W):
        for s in o.material_slots:
            m = s.material
            if m and 'casualsuit05' in m.name.lower():
                tint(m, mul=(1.08, 0.98, 0.86), sat=0.85, val=1.0)
    gold = bpy.data.materials.new('IA_CaptainGold')
    gold.use_nodes = True
    principled_set(gold, **{'Base Color': (0.80, 0.56, 0.20, 1), 'Metallic': 1.0, 'Roughness': 0.32})
    jacket = find_asset_obj(P, 'elegantsuit')
    if jacket:
        for side in ('Left', 'Right'):
            sleeve_rings(P, jacket, side, gold=gold)
    collect(W, 'IA_Witness')
    collect(P, 'IA_Pilot')
    P.location.x = 1.2  # side by side for the previews only
except Exception:
    ok = False
    log('BUILD FAILED', traceback.format_exc())

# --- previews (Cycles, studio-ish soft light) ---------------------------------------------------------------------
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = 32
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 540, 960
sc.view_settings.view_transform = 'AgX'
w = bpy.data.worlds.new('W')
sc.world = w
w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.022, 0.026, 1)
prev = bpy.data.collections.new('IA_preview')
sc.collection.children.link(prev)


def add(o):
    prev.objects.link(o)
    return o


def area(nm, loc, tgt, power, size, color=(1, 1, 1)):
    L = bpy.data.lights.new(nm, 'AREA')
    L.energy, L.size, L.color = power, size, color
    o = add(bpy.data.objects.new(nm, L))
    o.location = loc
    o.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o


cam = add(bpy.data.objects.new('PrevCam', bpy.data.cameras.new('PrevCam')))
sc.camera = cam
fl = bpy.data.meshes.new('floor')
fl.from_pydata([(-5, -5, 0), (5, -5, 0), (5, 5, 0), (-5, 5, 0)], [], [(0, 1, 2, 3)])
add(bpy.data.objects.new('floor', fl))
shots = []
if ok:
    for i, (rig, x) in enumerate(((W, 0.0), (P, 1.2))):
        for lx in [o for o in prev.objects if o.type == 'LIGHT']:
            bpy.data.objects.remove(lx, do_unlink=True)
        head = rig.matrix_world @ rig.data.bones['Head'].head_local
        area('Key', (x - 1.2, -2.0, 2.2), head, 220, 1.5, (1.0, 0.93, 0.85))
        area('Fill', (x + 1.6, -1.6, 1.4), head, 60, 2.0, (0.8, 0.88, 1.0))
        area('Rim', (x + 0.4, 1.8, 2.4), head, 160, 1.0, (0.9, 0.95, 1.0))
        for j, (dist, lens, look_z) in enumerate(((4.4, 50, 0.92), (0.95, 85, head.z))):
            cam.location = (x + 0.25 * (dist / 4.4), -dist, look_z + (0.05 if j else 0.0))
            cam.rotation_euler = (Vector((x, 0, look_z)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
            cam.data.lens = lens
            sc.render.filepath = os.path.join(OUT, '%05d.png' % (i * 2 + j))
            try:
                bpy.ops.render.render(write_still=True)
                shots.append(sc.render.filepath)
            except Exception:
                log('render fail', traceback.format_exc()[-500:])
log('previews', shots)

# --- save humans.blend (preview stuff removed, textures packed) ----------------------------------------------------
if ok:
    P.location.x = 0.0
    for o in list(prev.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(prev)
    info = {}
    for rig in (W, P):
        info[rig.name] = {b.name: {'head': list(b.head_local), 'tail': list(b.tail_local), 'parent': b.parent.name if b.parent else ''}
                          for b in rig.data.bones}
        info[rig.name + '_objects'] = [o.name for o in bpy.data.objects if o.parent == rig]
    json.dump(info, open(os.path.join(OUT, 'rig_info.json'), 'w'), indent=0)
    try:
        bpy.ops.file.pack_all()
    except Exception as e:
        log('pack', e)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'humans.blend'), compress=True)
    log('saved', os.path.getsize(os.path.join(OUT, 'humans.blend')))
