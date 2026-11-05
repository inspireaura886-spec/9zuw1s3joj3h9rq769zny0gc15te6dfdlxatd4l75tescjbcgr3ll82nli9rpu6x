"""nimitz plate b06 (256 f): it leaves; infrared-style gimbal view of a pale capsule on a grey sky, then a text-free hold"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 256
setup(sc, exposure=1.1, vol=False, glare=0.4, sat=0.0)
Wd.hdri('kloppenheim_02_puresky', strength=0.8, bg_strength=1.0, rot=40, tint=(0.9, 0.9, 0.9))
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0, location=(0, 0, 0))
tt = bpy.context.active_object; tt.name = 'TicTac'; tt.scale = (6.0, 2.0, 2.0); bpy.ops.object.shade_smooth()
tt.data.materials.append(M.emission('TicTacIR', (1, 1, 1), 3.0))
Md.fly(tt, [(0, (0, 400, 0), (0, 0, 80)), (150, (0, 420, 2), (0, 0, 80)), (NF, (900, 460, 40), (0, 0, 80))])
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((0, 0, 0), (60, 0, 3), look=(0, 400, 0)), lens=(55, 70), fstop=8, focus='TicTac')
finish_cam(cam, NF, a, sc)
