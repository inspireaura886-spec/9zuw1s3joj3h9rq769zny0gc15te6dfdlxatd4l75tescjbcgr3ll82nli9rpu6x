"""b14 (MEDIUM-WIDE 35 mm, 'tests were inconclusive'): FBI-style lab bench with three sample cards (handwriting, fingerprint, DNA bands); a rubber stamp lands INCONCLUSIVE. Slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 161, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.3)
Wd.hdri('moonless_golf', strength=0.03)
m = mats()
room_box(5.0, 4.0, 2.8, tag='B')
black = M.principled('Epoxy', base=(0.012, 0.014, 0.016), rough=0.12, spec=0.6)
cab = M.principled('Cabinet', base=(0.22, 0.26, 0.27), rough=0.5)
boxm('BenchBase', (0, 0.1, 0.45), (3.2, 0.9, 0.9), cab, 0.02)
boxm('BenchTop', (0, 0.1, 0.92), (3.3, 1.0, 0.05), black, 0.005)
card = M.principled('CardStock', base=(0.55, 0.54, 0.48), rough=0.8)
ink = M.principled('LabInk', base=(0.015, 0.02, 0.05), rough=0.3)
band = M.principled('DnaBand', base=(0.02, 0.02, 0.025), rough=0.4)
tag = M.principled('TagText', base=(0.03, 0.03, 0.03), rough=0.5)
zc = 0.9455
for i, (cx, nm) in enumerate(((-0.2, 'HANDWRITING'), (0.0, 'FINGERPRINT'), (0.2, 'DNA'))):
    boxm('Card%d' % i, (cx, 0.02, 0.9435), (0.17, 0.23, 0.003), card, 0.0004)
    text_obj('CardTag%d' % i, nm, (cx - 0.075, 0.115, zc + 0.0005), size=0.0135, mat=tag)
for o in squiggle_lines('HW', -0.275, 0.06, zc + 0.0005, 0.13, 7, ink, seed=5, gap=0.015, amp=0.003, bevel=0.0005):
    pass
for k in range(8):
    rr = 0.012 + k * 0.0085
    pts = [(0.0 + rr * 1.0 * math.cos(t), 0.015 + rr * 1.25 * math.sin(t), zc + 0.0005) for t in [2 * math.pi * j / 40 for j in range(2, 39)]]
    curve_poly('FP%d' % k, pts, bevel=0.0006, mat=ink)
rnd = random.Random(8)
for k in range(11):
    bw = rnd.choice((0.006, 0.01, 0.014))
    boxm('Dna%d' % k, (0.2 - 0.07 + k * 0.014, 0.0, zc + 0.0006), (bw * 0.8, rnd.uniform(0.06, 0.12), 0.0008), band)
# rubber stamp (lands at f ~ 118): handle + block, ink text appears on impact
red = M.principled('StampInk', base=(0.42, 0.06, 0.05), rough=0.5, emission=(0.42, 0.06, 0.05), emit=0.3)
rub = M.principled('StampRubber', base=(0.03, 0.03, 0.035), rough=0.7)
wood = M.principled('StampWood', base=(0.22, 0.12, 0.06), rough=0.45)
sp = Md.empty('Stamp', (0.0, -0.1, 0.95 + 0.3))
b1 = boxm('StampBlock', (0, 0, 0.0), (0.35, 0.075, 0.012), rub, 0.002)
b2 = boxm('StampBody', (0, 0, 0.03), (0.34, 0.07, 0.04), wood, 0.004)
b3 = cyl('StampKnob', (0, 0, 0.05), (0, 0, 0.115), 0.022, wood, 14)
for o in (b1, b2, b3):
    o.parent = sp
tf = 118 if NF > 125 else NF - 8
for f, z in ((0, 1.95), (tf - 14, 1.95), (tf, 0.9515 + 0.006), (tf + 4, 0.9515 + 0.006), (tf + 18, 1.9), (NF, 2.05)):
    sp.location = (0.0, -0.1, z)
    sp.keyframe_insert('location', frame=f)
if sp.animation_data:
    for fc in sp.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
txt = text_obj('Inconclusive', 'INCONCLUSIVE', (-0.158, -0.114, zc + 0.0012), size=0.043, mat=red, extrude=0.0004)
txt.hide_render = True
txt.keyframe_insert('hide_render', frame=0)
txt.hide_render = False
txt.keyframe_insert('hide_render', frame=tf)
desk_lamp(0.95, 0.5, 0.945, tag='LL', power=260, target=(0.0, 0.0, 0.94))
Wd.area('LabCool', (0, -0.4, 2.7), (0, 0.1, 0.9), color=(0.75, 0.88, 1.0), power=300, size=3.0)
CN.haze(center=(0, 0, 1.4), size=(4.8, 3.8, 2.7), density=0.006, color=(0.85, 0.92, 0.95), anisotropy=0.4, noise=0.2, noise_scale=0.4)
cam = C.Cam(clip_end=60)
cam.shot(0, NF, C.dolly((0.12, -0.98, 1.6), (0.02, -0.64, 1.42), look=(0.0, 0.03, 0.945), look1=(0.0, 0.0, 0.945)), lens=35, fstop=4.0, focus=Vector((0.0, 0.02, 0.945)))
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
