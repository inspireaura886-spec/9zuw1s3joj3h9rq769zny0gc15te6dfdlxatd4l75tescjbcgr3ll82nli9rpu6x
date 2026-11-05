"""oak b02: camera cranes DOWN the Money Pit shaft past oak log platforms every 10 ft, lantern light. NF 260 (0-99 used first,100-259 reused)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oc import *
a = core.args(); NF = arg(a, '--nf', 260, int)
sc = core.reset()
setup(sc, exposure=0.8, vol=True, glare=0.5, vignette=0.4)
Wd.hdri('moonless_golf', strength=0.05, bg_strength=0.0)
D = 33.0
fl = shaft(depth=D)
for k in range(1, 11):
    platform(-3.05 * k)
CN.haze(center=(0, 0, -D / 2), size=(1.7, 1.7, D), density=0.045, color=(0.9, 0.82, 0.7), anisotropy=0.5, noise=0.3, noise_scale=0.8, height_falloff=0.0)
Wd.area('Sky', (0, 0, 2.5), (0, 0, -8), color=(0.7, 0.8, 1.0), power=900, size=1.4)
# lantern rides just under the camera
lan = bpy.data.objects.new('Lantern', bpy.data.lights.new('Lantern', 'POINT'))
lan.data.energy = 90; lan.data.color = (1.0, 0.62, 0.3); lan.data.shadow_soft_size = 0.15
bpy.context.scene.collection.objects.link(lan)
cam = C.Cam()
z0, z1 = -1.0, -27.0
def mv(t):
    e = C.cruise(t); z = z0 + (z1 - z0) * e
    return {'pos': Vector((0.3, -0.35, z)), 'look': Vector((0.0, 0.05, z - 3.5))}
cam.shot(0, NF, mv, lens=(30, 36), fstop=3.2, focus=3.5)
for f in range(0, NF, 2):
    t = f / (NF - 1); z = z0 + (z1 - z0) * C.cruise(t)
    lan.location = (0.15, -0.2, z - 0.9); lan.keyframe_insert('location', frame=f)
finish_cam(cam, NF, a, sc)
