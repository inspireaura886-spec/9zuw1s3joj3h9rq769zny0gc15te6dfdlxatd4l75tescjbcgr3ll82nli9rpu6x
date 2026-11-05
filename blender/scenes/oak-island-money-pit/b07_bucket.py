"""oak b07: from below, an EMPTY wooden bucket on a rope is hauled up the shaft toward a bright daylight opening. NF 100."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oc import *
a = core.args(); NF = arg(a, '--nf', 100, int)
sc = core.reset()
setup(sc, exposure=0.5, vol=True, glare=0.7, vignette=0.4)
CN.hdri_sun('kloppenheim_02_puresky', strength=0.8)
D = 12.0
shaft(depth=D)
platform(-4.0, axis=1); platform(-8.0)
Wd.area('Day', (0, 0, 1.0), (0, 0, -6), color=(1.0, 0.95, 0.85), power=900, size=2.8)
CN.haze(center=(0, 0, -D / 2), size=(2.9, 2.9, D), density=0.02, color=(0.95, 0.9, 0.8), anisotropy=0.7, height_falloff=0.0)
wm = wood_mat()
bpy.ops.mesh.primitive_cone_add(vertices=28, radius1=0.2, radius2=0.28, depth=0.4, end_fill_type='NOTHING', location=(0, 0, 0))
bk = bpy.context.active_object; bk.name = 'Bucket'; M.assign(bk, wm)
for p in bk.data.polygons: p.use_smooth = True
rope = cyl('Rope', (0, 0, 0), (0, 0, 14), 0.012, M.principled('RopeM', base=(0.3, 0.24, 0.16), rough=0.9))
rope.parent = bk
rope.location = (0, 0, 7.15)
bm = M.principled('Metal', base=(0.1, 0.1, 0.1), rough=0.5, metal=1)
z0, z1 = -9.5, -1.8
for f in range(NF):
    t = f / (NF - 1); e = C.smooth(t) if hasattr(C, 'smooth') else t
    bk.location = (0, 0.0, z0 + (z1 - z0) * e); bk.keyframe_insert('location', frame=f)
lan = Wd.point('Lantern', (0.6, -0.6, -9.2), color=(1.0, 0.6, 0.3), power=50, radius=0.1)
cam = C.Cam()
CN.shot(cam, 0, NF, C.dolly(Vector((0.7, -0.7, -10.5)), Vector((0.5, -0.5, -9.0)), look=Vector((0, 0, -2.0)), look1=Vector((0, 0, 0.0))), lens=22, fstop=8.0, focus=4.0)
finish_cam(cam, NF, a, sc)
