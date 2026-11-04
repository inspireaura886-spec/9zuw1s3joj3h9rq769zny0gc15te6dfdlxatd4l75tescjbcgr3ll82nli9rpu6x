"""mccormick b08 (L8 'A flood of tips later, the case is still open.'): stack + spill of tip envelopes on the desk under
the lamp, cardboard archive box behind; slow eased push-in. 'CASE OPEN' chip in Remotion. No readable text."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 105, int)
sc = core.reset()
setup(sc, exposure=0.95, vol=True, glare=0.5, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.015, bg_strength=0.0)
dark_room()
top = desk(loc=(0, 0, 0), w=1.6)
rnd = random.Random(8)
mats = [envelope_mat(i) for i in range(4)]
z = top
for k in range(34):                     # main stack
    w, h, t = rnd.uniform(0.22, 0.24), rnd.uniform(0.10, 0.115), 0.0035
    e = Wd.box('Env%d' % k, (rnd.gauss(0.0, 0.008), rnd.gauss(0.0, 0.008), z + t / 2), (w, h, t))
    e.rotation_euler = (0, 0, rnd.gauss(0, 0.09)); z += t + 0.0004
    M.assign(e, mats[k % 4])
for k in range(22):                     # spill across the desk
    w, h, t = rnd.uniform(0.21, 0.24), rnd.uniform(0.095, 0.115), 0.003
    x, y = rnd.uniform(-0.5, 0.45), rnd.uniform(-0.25, 0.2)
    if abs(x) < 0.17 and abs(y) < 0.09:
        continue
    e = Wd.box('Spill%d' % k, (x, y, top + 0.0016 + 0.0034 * (k % 3)), (w, h, t))
    e.rotation_euler = (0, 0, rnd.uniform(-0.8, 0.8))
    M.assign(e, mats[(k + 1) % 4])
model('cardboard_box_01', (0.32, 0.26, top), rot_z=math.radians(-12))
model('desk_lamp_arm_01', (-0.6, 0.25, top), rot_z=math.radians(-30))
lamp_light((0.0, 0.0, top), loc=(-0.45, 0.15, top + 0.5), power=42)
Wd.area('Rim', (0.7, 0.9, top + 0.9), (0, 0, top), color=(0.55, 0.65, 0.9), power=25, size=1.2)
haze(center=(0, 0.4, 1.4), size=(5, 5, 2.8), density=0.012)
T = (0.0, 0.0, z - 0.03)
cam = C.Cam()
cam.shot(0, NF, C.push_in((0.12, -0.78, top + 0.36), T, amount=0.25), lens=(40, 44), fstop=3.2, focus=T)
finish_cam(cam, NF, a, sc)
