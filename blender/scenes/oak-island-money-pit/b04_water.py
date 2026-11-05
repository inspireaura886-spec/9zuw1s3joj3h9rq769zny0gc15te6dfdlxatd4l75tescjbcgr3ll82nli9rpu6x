"""oak b04: from above, a crowbar taps the hard bottom of the shaft twice; dark water then rises up the shaft; camera pulls up. NF 165."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oc import *
a = core.args(); NF = arg(a, '--nf', 165, int)
sc = core.reset()
setup(sc, exposure=0.8, vol=True, glare=0.5, vignette=0.4)
Wd.hdri('moonless_golf', strength=0.05, bg_strength=0.0)
D = 6.0
fl = shaft(depth=D)
platform(-2.2); 
M.assign(bpy.data.objects['Floor'], M.texture_set('FloorStone', 'rough_concrete', scale=1.0, tint=(0.3, 0.3, 0.3), box=True))
Wd.area('Sky', (0, 0, 2.5), (0, 0, -4), color=(0.7, 0.8, 1.0), power=500, size=1.4)
lan = Wd.point('Lantern', (0.35, -0.3, -1.4), color=(1.0, 0.62, 0.3), power=70, radius=0.15)
CN.haze(center=(0, 0, -D / 2), size=(1.7, 1.7, D), density=0.05, color=(0.9, 0.82, 0.7), anisotropy=0.5, height_falloff=0.0)
# crowbar
bar = cyl('Crowbar', (0, 0, 0), (0, 0, 1.6), 0.016, M.principled('Bar', base=(0.12, 0.12, 0.13), rough=0.45, metal=1.0))
bar.rotation_mode = 'XYZ'
bar.rotation_euler = (math.radians(12), 0, 0)
fz = -D
def tap(f, up):  # position of bar centre
    return (0, 0.05, fz + 0.8 + up)
for f in range(0, NF, 1):
    up = 0.0
    for t0 in (18, 44):
        k = f - t0
        if 0 <= k < 16: up = max(up, 0.45 * math.sin(math.pi * k / 16) ** 2)
    bar.location = (0, 0.05, fz + 0.8 + up)
    bar.keyframe_insert('location', frame=f)
# water
wm = M.principled('Water', base=(0.02, 0.03, 0.03), rough=0.04, transmission=0.6, ior=1.33, spec=0.8)
w = Wd.box('Water', (0, 0, fz), (1.8, 1.8, 0.02)); M.assign(w, wm)
for f in range(0, NF, 3):
    t = max(0.0, min(1.0, (f - 66) / 70.0)); e = t * t * (3 - 2 * t)
    w.location = (0, 0, fz + 4.2 * e); w.keyframe_insert('location', frame=f)
cam = C.Cam()
def mv(t):
    e = C.cruise(t)
    return {'pos': Vector((0.1, -0.2, -0.3 + 2.4 * max(0, (t - 0.62)) / 0.38 * e + 0.0)), 'look': Vector((0, 0.05, fz + 0.5 + 3.0 * e))}
CN.shot(cam, 0, NF, mv, lens=35 if False else 50, fstop=2.8, focus=Vector((0, 0.05, fz + 1.0)))
finish_cam(cam, NF, a, sc)
