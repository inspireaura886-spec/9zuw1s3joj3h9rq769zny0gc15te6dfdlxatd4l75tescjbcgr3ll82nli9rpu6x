"""b08 (MEDIUM-WIDE 35 mm, 'fifty stolen raincoats'): workshop table with stitched tan raincoat sheets, rubber-cement pots, thread and scissors under a hooded lamp. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 92, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.28)
Wd.hdri('moonless_golf', strength=0.03)
m = mats()
room_box(5.0, 4.0, 2.6, tag='W')
top = M.texture_set('TableTop', 'wood_table_worn', scale=1.0, tint=(0.4, 0.31, 0.22), box=True)
boxm('TableTop', (0, 0, 0.9), (2.1, 0.95, 0.06), top, 0.01)
for sx in (-1, 1):
    for sy in (-1, 1):
        boxm('TLeg%d%d' % (sx, sy), (sx * 0.98, sy * 0.4, 0.44), (0.07, 0.07, 0.88), m['steel'])
tan = M.principled('CoatTan', base=(0.30, 0.22, 0.10), rough=0.5, bump=0.5, bump_scale=160, grime=0.25)
tan2 = M.principled('CoatTan2', base=(0.24, 0.19, 0.09), rough=0.55, bump=0.5, bump_scale=140)
rnd = random.Random(4)
for k in range(6):
    s = boxm('Sheet%d' % k, (-0.55 + k * 0.17 + rnd.uniform(-0.03, 0.03), rnd.uniform(-0.12, 0.12), 0.935 + k * 0.003), (0.62, 0.42, 0.004), tan if k % 2 else tan2, 0.002)
    s.rotation_euler = (0, 0, math.radians(rnd.uniform(-9, 9)))
# folded stacks
for k in range(7):
    boxm('Fold%d' % k, (0.78, 0.22, 0.94 + k * 0.022), (0.5, 0.34, 0.02), tan if k % 2 else tan2, 0.006)
# stitch row along a seam + thread spool
thr = M.principled('Thread', base=(0.02, 0.02, 0.02), rough=0.6)
for k in range(46):
    st = boxm('St%d' % k, (-0.82 + k * 0.032, 0.0, 0.9655 + 0.0), (0.014, 0.0025, 0.002), thr)
    st.rotation_euler = (0, 0, math.radians(18))
cyl('Spool', (-0.9, -0.28, 0.93), (-0.9, -0.28, 0.99), 0.025, M.principled('SpoolM', base=(0.4, 0.2, 0.12), rough=0.5), 14)
# glue pots + brush
glass = M.principled('PotGlass', base=(0.05, 0.07, 0.06), rough=0.15, spec=0.7)
goo = M.principled('Cement', base=(0.12, 0.07, 0.03), rough=0.3, spec=0.7)
for k, (px, py) in enumerate(((0.35, -0.27), (0.5, -0.31))):
    cyl('Pot%d' % k, (px, py, 0.93), (px, py, 1.03), 0.045, glass, 18)
    cyl('Goo%d' % k, (px, py, 1.02), (px, py, 1.026), 0.038, goo, 18)
beam('Brush', (0.42, -0.34, 0.945), (0.62, -0.4, 0.96), 0.012, 0.012, m['wood'])
# scissors
for s in (1, -1):
    beam('Scis%d' % s, (0.05, -0.3, 0.945), (0.22, -0.3 + s * 0.04, 0.945), 0.012, 0.004, m['tin'])
desk_lamp(-1.0, 0.33, 0.93, tag='WL', power=260, target=(-0.1, 0.0, 0.94))
Wd.area('RoomFill', (0.5, -1.5, 2.4), (0, 0, 0.9), color=(0.55, 0.65, 1.0), power=60, size=2.0)
CN.haze(center=(0, 0, 1.3), size=(4.8, 3.8, 2.5), density=0.01, color=(0.9, 0.88, 0.8), anisotropy=0.55, noise=0.35, noise_scale=0.3)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.dolly((-1.35, -1.25, 1.45), (0.95, -1.15, 1.4), look=(-0.2, 0.0, 0.94), look1=(0.4, 0.0, 0.94)), lens=35, fstop=4.0, focus=Vector((0.1, 0.0, 0.94)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
