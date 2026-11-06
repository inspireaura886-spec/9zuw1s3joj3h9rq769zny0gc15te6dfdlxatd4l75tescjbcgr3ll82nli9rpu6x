"""s03 CLOSE 35 mm 'Their death certificates were signed within a week.' Office desk: five blank state forms fanned out
(heading only, no names, no photos), a rubber stamp and ink pad under a desk lamp. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); sod_mats()
room(size=(5, 4, 3.0), wood_walls=True, window=True, sun_power=500, seed=3)
desk('Desk', (0, 0, 0))
for k in range(5):
    f = boxm('Form%d' % k, (-0.2 + 0.1 * k, 0.02 * k, 0.762 + 0.0008 * k), (0.21, 0.28, 0.0006), bpy.data.materials['Paper'])
    f.rotation_euler[2] = math.radians(-12 + 6 * k)
    text_obj('Head%d' % k, 'CERTIFICATE OF DEATH', (-0.2 + 0.1 * k, 0.11 + 0.02 * k, 0.7635 + 0.0008 * k), size=0.011, mat=bpy.data.materials['Ink'], rot=(0, 0, math.radians(-12 + 6 * k)))
cyl('Stamp', (0.3, -0.1, 0.76), (0.3, -0.1, 0.84), 0.025, M.principled('StampW', base=(0.3, 0.2, 0.12), rough=0.6), 16)
boxm('Pad', (0.42, -0.05, 0.765), (0.12, 0.08, 0.012), M.principled('PadM', base=(0.05, 0.05, 0.12), rough=0.5))
P.instance(P.gltf('desk_lamp_arm_01'), (-0.55, 0.25, 0.76), 0.6, 1.0)
CN.practical('Key', (-0.4, 0.2, 1.25), (0, 0.04, 0.76), power=55, cone=55)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.0, -0.55, 1.15), (0, 0.06, 0.76), amount=0.25), lens=35, fstop=4, focus=Vector((0, 0.06, 0.763)))
go(cam, NF, a, sc, meter=NF // 2)
