"""nimitz plate b05 (183 f): Fravor's jet spirals down toward the tic-tac; the object turns and rises to meet it"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); sc = core.reset(); NF = 183
setup(sc, exposure=1.2, vol=True, glare=0.5)
dusk_sea(NF, hdri_rot=100)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0, location=(0, 0, 16))
tt = bpy.context.active_object; tt.name = 'TicTac'; tt.scale = (6.0, 2.0, 2.0); bpy.ops.object.shade_smooth()
tt.data.materials.append(M.principled('TicTacM', base=(0.95, 0.96, 0.98), rough=0.18))
Md.fly(tt, [(0, (0, 0, 16), (0, 0, 70)), (70, (0, 0, 16), (0, 0, 70)), (120, (0, 0, 40), (0, 0, 150)), (NF, (0, 0, 120), (0, 0, 150))])
jet = Md.fighter('Fighter', f1=NF, burner=0.0)
pts = []
for f in range(0, NF + 1, 12):
    t = f / NF; ang = 6.283 * 0.8 * t; r = 420 - 330 * t
    pts.append((f, (r*math.cos(ang), r*math.sin(ang), 520 - 440 * t), (0, 0, math.degrees(ang) + 180)))
Md.fly(jet, pts, interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, 100, C.track('Fighter', offset=(-40, -70, 18), offset1=(-30, -50, 10), look_offset=(0, 0, 0)), lens=(40, 46), fstop=8, focus='Fighter')
cam.shot(100, NF, C.dolly((140, -90, 40), (110, -70, 30), look=(0, 0, 40)), lens=(40, 48), fstop=6, focus='TicTac')
finish_cam(cam, NF, a, sc)
