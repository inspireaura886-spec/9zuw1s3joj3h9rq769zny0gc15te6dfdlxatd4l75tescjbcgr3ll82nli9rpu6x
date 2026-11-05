"""oak b03: oil lantern pool on a flat dark stone with invented carved glyphs, slow push-in. NF 290."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oc import *
a = core.args(); NF = arg(a, '--nf', 290, int)
sc = core.reset()
setup(sc, exposure=0.9, vol=True, glare=0.55, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.02, bg_strength=0.0)
g = CN.ground('Mud', SOIL, (6, 6), tile_m=1.2, tint=(0.35, 0.29, 0.24))
stone = Wd.box('Stone', (0, 0, 0.04), (0.95, 0.62, 0.08))
M.assign(stone, M.texture_set('StoneM', 'rough_concrete', scale=1.0, tint=(0.32, 0.31, 0.3), box=True))
top = 0.08
gm = M.principled('Groove', base=(0.01, 0.01, 0.01), rough=0.9)
import random
rnd = random.Random(7)
cols, rows = 7, 4
for r in range(rows):
    for c in range(cols):
        x = -0.34 + c * 0.113 + rnd.uniform(-0.01, 0.01); y = 0.18 - r * 0.12 + rnd.uniform(-0.01, 0.01)
        n = rnd.randint(2, 3); pts = []
        for k in range(n + 1):
            pts.append((x + rnd.uniform(-0.03, 0.03), y + rnd.uniform(-0.04, 0.04), top + 0.0008))
        cu = bpy.data.curves.new('g%d%d' % (r, c), 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0032; cu.bevel_resolution = 2
        sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for p, q in zip(sp.points, pts): p.co = (q[0], q[1], q[2], 1)
        o = bpy.data.objects.new('G%d%d' % (r, c), cu); bpy.context.scene.collection.objects.link(o); o.data.materials.append(gm)
lamp = CN.place('vintage_oil_lamp', (0.42, 0.22, top), rot=(0, 0, 0.6), name='Lamp')
oz = lamp['size'][2]
Wd.point('Flame', (0.42, 0.22, top + oz * 0.55), color=(1.0, 0.6, 0.28), power=14, radius=0.02)
Wd.spot('Key', (0.55, 0.30, top + 0.45), (0, 0, top), color=(1.0, 0.66, 0.36), power=90, size_deg=70, blend=0.7, radius=0.05)
Wd.area('Fill', (-0.6, -0.5, 0.7), (0, 0, top), color=(0.55, 0.65, 0.95), power=6, size=1.0)
CN.haze(center=(0, 0, 0.4), size=(2.5, 2.5, 1.0), density=0.05, color=(1.0, 0.9, 0.8), anisotropy=0.5, height_falloff=0.0)
cam = C.Cam()
P0, P1 = Vector((-0.2, -0.62, 0.42)), Vector((-0.08, -0.34, 0.26))
CN.shot(cam, 0, NF, C.dolly(P0, P1, look=Vector((0, 0.02, top)), look1=Vector((0, 0.02, top))), lens=55, fstop=2.4, focus=Vector((0, 0.0, top)))
finish_cam(cam, NF, a, sc)
