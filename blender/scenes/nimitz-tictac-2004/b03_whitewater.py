"""nimitz plate b03 (263 f): two fighters circle a patch of whitewater on the dusk sea"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); sc = core.reset(); NF = 263
setup(sc, exposure=1.2, vol=True, glare=0.5)
dusk_sea(NF, hdri_rot=120, wave_scale=1.5, wind=14)
import random; rnd = random.Random(7)
fm = M.principled('Foam', base=(0.82, 0.88, 0.9), rough=1.0, bump=0.8)
for i in range(90):
    r = abs(rnd.gauss(0, 14)); th = rnd.uniform(0, 6.283)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1.0, location=(r*math.cos(th), r*math.sin(th), 0.05))
    f = bpy.context.active_object; f.scale = (rnd.uniform(1.2, 3.8), rnd.uniform(1.0, 2.6), 0.12); f.data.materials.append(fm)
j1 = Md.fighter('F1', f1=NF, burner=0.0); j2 = Md.fighter('F2', f1=NF, burner=0.0, seed=9)
Md.fly(j1, [(0, (-160, -120, 140), (0, 0, 0)), (NF, (160, 90, 120), (0, 0, 0))], interp='LINEAR')
Md.fly(j2, [(0, (-190, -60, 150), (0, 0, 0)), (NF, (130, 140, 128), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, 130, C.orbit((0, 0, 20), r=240, r1=200, a0=200, a1=250, h=70, look_h=20), lens=(32, 36), fstop=8, focus='F1')
cam.shot(130, NF, C.dolly((60, -150, 60), (30, -110, 40), look=(0, 0, 8)), lens=(45, 52), fstop=6, focus=(0, 0, 8))
finish_cam(cam, NF, a, sc)
