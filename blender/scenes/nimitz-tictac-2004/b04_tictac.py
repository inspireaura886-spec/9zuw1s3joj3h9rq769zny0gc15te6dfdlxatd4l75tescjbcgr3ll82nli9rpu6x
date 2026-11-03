"""nimitz plate 4 (171 f, VO 25.14-30.83 'Above it hovers a small white object. Forty feet long. No wings. No exhaust.'):
glossy white capsule hovering ~15 m over a patch of churned whitewater on a dusk Pacific; slow orbit, then push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy
a = core.args(); sc = core.reset(); NF = 171
setup(sc, exposure=1.2, vol=True, glare=0.5)
Wd.hdri('kloppenheim_02_puresky', strength=0.9, bg_strength=1.1, rot=100, tint=(1.0, 0.92, 0.85))
Wd.moon(direction=(0.5, 0.8, 0.35), strength=2.2, color=(1.0, 0.9, 0.8), angle=1.0)
o = Wd.ocean(center=(0, 0, 0), spatial=90, res=11, wave_scale=1.2, choppy=1.0, time_frames=NF, wind=10)
md = o.modifiers['Ocean']; md.repeat_x = md.repeat_y = 3
Wd.sea_plane(size=60000, z=-0.4, rough=0.12, frames=NF)
# churned whitewater: many small low foam blobs scattered (no big flat disc), sit just under the wave crests
import random; rnd = random.Random(4)
fm = M.principled('Foam', base=(0.82, 0.88, 0.9), rough=1.0, bump=0.8)
for i in range(70):
    r = abs(rnd.gauss(0, 11)); th = rnd.uniform(0, 6.283)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1.0, location=(r*math.cos(th), r*math.sin(th), 0.05))
    f = bpy.context.active_object; f.name = 'Foam%d' % i; f.scale = (rnd.uniform(1.2, 3.5), rnd.uniform(1.0, 2.5), 0.12)
    f.data.materials.append(fm)
# tic-tac: 12 m capsule, no wings, no exhaust
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0, location=(0, 0, 16))
tt = bpy.context.active_object; tt.name = 'TicTac'; tt.scale = (6.0, 2.0, 2.0); tt.rotation_euler = (0, 0, 1.2)
bpy.ops.object.shade_smooth()
tt.data.materials.append(M.principled('TicTacM', base=(0.95, 0.96, 0.98), rough=0.18, metal=0.0))
Md.fly(tt, [(0, (0, 0, 16), (0, 0, 70)), (NF, (0, 0, 17.5), (0, 0, 76))], interp='LINEAR')
Wd.fog(center=(0, 400, 20), size=(8000, 8000, 160), density=0.0004, color=(0.8, 0.85, 0.95))
cam = C.Cam(clip_end=60000)
cam.shot(0, 90, C.orbit((0, 0, 14), r=70, r1=62, a0=200, a1=240, h=9, look_h=2), lens=(40, 44), fstop=8, focus='TicTac')
cam.shot(90, NF, C.dolly((120, -60, 10), (70, -34, 14), look=(0, 0, 15)), lens=(55, 60), fstop=4, focus='TicTac')
finish_cam(cam, NF, a, sc)
