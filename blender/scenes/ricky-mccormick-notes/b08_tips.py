"""mccormick b08 (L8 'A flood of tips later, the case is still open.'): stack + spill of tip envelopes on the desk under
the lamp, cardboard archive box behind; slow eased push-in. 'CASE OPEN' chip in Remotion. No readable text."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 95, int)
sc = core.reset()
setup(sc, exposure=0.95, vol=True, glare=0.5, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.015, bg_strength=0.0)
dark_room()
top = desk(loc=(0, 0, 0), w=1.6)
rnd = random.Random(8)
mats = [envelope_mat(i) for i in range(4)]
ink = M.principled('AddrInk', base=(0.06, 0.06, 0.07), rough=0.8)
stamp = [M.principled('Stamp%d' % i, base=c, rough=0.7) for i, c in enumerate(((0.32, 0.16, 0.13), (0.18, 0.24, 0.30), (0.22, 0.28, 0.18)))]
def dress(e, w, h, t, k):
    # look r2: plain slabs read as boards -> address lines + stamp on visible faces (generic marks, no readable text)
    for j in range(3):
        bar = Wd.box(e.name + 'a%d' % j, (0.012 * rnd.uniform(-1, 1), -0.012 - 0.011 * j, t / 2 + 0.00025), (w * rnd.uniform(0.28, 0.42), 0.0026, 0.0003))
        bar.parent = e; M.assign(bar, ink)
    st = Wd.box(e.name + 's', (w / 2 - 0.022, h / 2 - 0.02, t / 2 + 0.0003), (0.022, 0.026, 0.0004))
    st.parent = e; M.assign(st, stamp[k % 3])
z = top
N = 64
for k in range(N):                      # main stack (thin: ~1.2 mm per envelope)
    w, h, t = rnd.uniform(0.22, 0.24), rnd.uniform(0.10, 0.115), 0.0012
    e = Wd.box('Env%d' % k, (rnd.gauss(0.0, 0.007), rnd.gauss(0.0, 0.007), z + t / 2), (w, h, t))
    e.rotation_euler = (0, 0, rnd.gauss(0, 0.10)); z += t + 0.0003
    M.assign(e, mats[rnd.randrange(4)])
    if k >= N - 4:
        dress(e, w, h, t, k)
for k in range(26):                     # spill across the desk
    w, h, t = rnd.uniform(0.21, 0.24), rnd.uniform(0.095, 0.115), 0.0012
    x, y = rnd.uniform(-0.5, 0.45), rnd.uniform(-0.28, 0.2)
    if abs(x) < 0.17 and abs(y) < 0.09:
        continue
    e = Wd.box('Spill%d' % k, (x, y, top + 0.0007 + 0.0014 * (k % 3)), (w, h, t))
    e.rotation_euler = (0, 0, rnd.uniform(-0.8, 0.8))
    M.assign(e, mats[(k + 1) % 4]); dress(e, w, h, t, k)
model('cardboard_box_01', (0.42, 0.34, top), rot_z=math.radians(-12))
model('desk_lamp_arm_01', (-0.6, 0.25, top), rot_z=math.radians(-30))
lamp_light((0.0, 0.0, top), loc=(-0.45, 0.15, top + 0.5), power=42)
Wd.area('Rim', (0.7, 0.9, top + 0.9), (0, 0, top), color=(0.55, 0.65, 0.9), power=25, size=1.2)
haze(center=(0, 0.4, 1.4), size=(5, 5, 2.8), density=0.012)
T = (0.0, 0.0, z - 0.03)
cam = C.Cam()
cam.shot(0, NF, C.push_in((0.04, -0.78, top + 0.52), T, amount=0.22), lens=(38, 41), fstop=3.2, focus=T)   # look r2: stack cut at right edge
finish_cam(cam, NF, a, sc)
