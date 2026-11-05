"""oak b06: cutaway of the island: limestone dissolving into caves, surface sags into a sinkhole, a pine slides in. NF 175. Calm slow orbit-dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oc import *
a = core.args(); NF = arg(a, '--nf', 175, int)
sc = core.reset()
setup(sc, exposure=0.9, vol=True, glare=0.45, vignette=0.35)
CN.hdri_sun('industrial_sunset_02', strength=0.5)
Wd.area('Key', (3, -4, 3.5), (0, 0, 0), color=(1.0, 0.85, 0.7), power=500, size=3.0)
W, Dp = 4.0, 1.4
layers = [('Till', 0.9, 'forest_ground_04', (0.55, 0.45, 0.35)), ('Lime', 1.0, 'rough_concrete', (0.62, 0.6, 0.55)), ('Rock', 1.1, 'rough_concrete', (0.3, 0.3, 0.32))]
zt = 0.0
for nm, h, tex, tint in layers:
    o = Wd.box(nm, (0, 0, zt - h / 2 - (0.0 if nm != 'Till' else 0)), (W, Dp, h))
    M.assign(o, M.texture_set(nm + 'M', tex, scale=1.0, tint=tint, box=True)); zt -= h
# surface sheet that sags
N = 40
def surf(sag):
    me = bpy.data.meshes.new('Sur')
    vs, fs = [], []
    for j in range(N + 1):
        for i in range(N + 1):
            x = (i / N - .5) * W; y = (j / N - .5) * Dp
            d = ((x - 0.2) ** 2 / 0.55 + y * y / 0.35)
            z = 0.02 - sag * 0.75 * math.exp(-d * 1.6)
            vs.append((x, y, z))
    for j in range(N):
        for i in range(N):
            fs.append((j * (N + 1) + i, j * (N + 1) + i + 1, (j + 1) * (N + 1) + i + 1, (j + 1) * (N + 1) + i))
    me.from_pydata(vs, [], fs); return me
base = surf(0.0); sag_me = surf(1.0)
so = bpy.data.objects.new('Surface', base); bpy.context.scene.collection.objects.link(so)
so.shape_key_add(name='Basis')
sk = so.shape_key_add(name='Sag')
for v, p in zip(sk.data, sag_me.vertices): v.co = p.co
for p in base.polygons: p.use_smooth = True
M.assign(so, M.texture_set('GrassM', 'forest_ground_04', scale=1.4, tint=(0.4, 0.5, 0.3), box=True))
for f, v in ((0, 0.0), (60, 0.0), (140, 1.0), (NF - 1, 1.0)):
    sk.value = v; sk.keyframe_insert('value', frame=f)
for fc in so.data.shape_keys.animation_data.action.fcurves:
    for kp in fc.keyframe_points: kp.interpolation = 'BEZIER'
# caves on the front face (flattened ellipsoids sitting just proud of the face)
cm = M.principled('Cave', base=(0.005, 0.005, 0.006), rough=1.0)
fy = -Dp / 2 - 0.004
for k, (x, z, r) in enumerate(((-0.6, -1.5, 0.3), (0.1, -1.7, 0.4), (0.6, -1.4, 0.32), (0.25, -1.1, 0.25))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=(x, fy, z))
    o = bpy.context.active_object; o.name = 'Cave%d' % k; M.assign(o, cm)
    for p in o.data.polygons: p.use_smooth = True
    t0 = 20 + 18 * k
    for f, s in ((0, 0.01), (t0, 0.01), (t0 + 70, 1.0), (NF - 1, 1.0)):
        o.scale = (r * s, 0.012 * (1 if s > 0.02 else 0.1), r * 0.7 * s); o.keyframe_insert('scale', frame=f)
# pine slides in
tr = CN.place('pine_tree_01', (0.2, 0.0, 0.02), rot=(0, 0, 0.5), scale=0.35, name='Tree')
for f, z, rx in ((0, 0.02, 0), (100, 0.02, 0), (150, -0.62, 0.35), (NF - 1, -0.62, 0.35)):
    tr.location = (0.2, 0.0, z); tr.rotation_euler = (rx, 0, 0.5); tr.keyframe_insert('location', frame=f); tr.keyframe_insert('rotation_euler', frame=f)
CN.haze(center=(0, 0, 0.3), size=(6, 3, 2.5), density=0.01, color=(1.0, 0.92, 0.85), anisotropy=0.6, height_falloff=0.0)
cam = C.Cam()
CN.shot(cam, 0, NF, C.dolly(Vector((-1.4, -4.2, 0.9)), Vector((-0.5, -3.3, 0.55)), look=Vector((0.1, 0, -0.9)), look1=Vector((0.2, 0, -0.7))), lens=50, fstop=2.8, focus=Vector((0.1, -Dp / 2, -1.0)))
finish_cam(cam, NF, a, sc)
