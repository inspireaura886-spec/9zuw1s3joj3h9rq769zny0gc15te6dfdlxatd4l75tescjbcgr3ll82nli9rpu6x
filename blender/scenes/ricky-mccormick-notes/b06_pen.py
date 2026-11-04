"""mccormick b06 (L6 TWIST 'his own family says Ricky could barely write his name'): macro of a pen over ruled paper;
an ink line writes a few shaky generic marks, then STOPS and the pen hovers. Shallow real DOF. Slow push-in only."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 120, int)
sc = core.reset()
setup(sc, exposure=0.95, vol=False, glare=0.45, vignette=0.42)
Wd.hdri('moonless_golf', strength=0.02, bg_strength=0.0)
dark_room()
top = desk(loc=(0, 0, 0))
img = lined_paper_img()
paper('Lined', img, (0, 0, top + 0.0004), rot=(0, 0, math.radians(-4)), curl=0.002, base=(1, 1, 1))
z = top + 0.0018
pts = scribble_points(-0.03, -0.004, z, letters=4, seed=5)
# stroke grows with hesitations, stops at ~58 % of the plate, never finishes
f_end = int(NF * 0.58)
grow = [(0, 0.0), (8, 0.02), (int(f_end * 0.35), 0.38), (int(f_end * 0.45), 0.40), (int(f_end * 0.8), 0.62),
        (int(f_end * 0.88), 0.63), (f_end, 0.72), (NF, 0.72)]
ink = ink_curve(pts, grow=grow)
# arc length table so the pen tip follows bevel_factor_end
L = [0.0]
for p, q in zip(pts, pts[1:]):
    L.append(L[-1] + (Vector(q) - Vector(p)).length)
def at(frac):
    s = frac * L[-1]
    for i in range(1, len(L)):
        if L[i] >= s:
            u = (s - L[i - 1]) / max(1e-9, L[i] - L[i - 1])
            return Vector(pts[i - 1]).lerp(Vector(pts[i]), u)
    return Vector(pts[-1])
def g(f):
    for (f0, v0), (f1, v1) in zip(grow, grow[1:]):
        if f0 <= f <= f1:
            t = (f - f0) / max(1, f1 - f0)
            return v0 + (v1 - v0) * t
    return grow[-1][1]
pn = pen()
pn.rotation_euler = (math.radians(-32), math.radians(18), 0)
for f in range(NF):
    p = at(g(f))
    lift = 0.0 if f <= f_end else min(0.012, 0.012 * (f - f_end) / 25.0)   # pen lifts off and hovers
    pn.location = (p.x, p.y, z - 0.0012 + lift)
    pn.keyframe_insert('location', frame=f)
lamp_light((0.0, 0.0, top), loc=(-0.35, 0.25, top + 0.45), power=30)
Wd.area('Rim', (0.4, 0.5, top + 0.4), (0, 0, top), color=(0.55, 0.65, 0.9), power=10, size=0.8)
F = (0.0, 0.0, top)
cam = C.Cam()
cam.shot(0, NF, C.push_in((0.07, -0.20, top + 0.13), (0.0, 0.002, top + 0.004), amount=0.22),
         lens=(70, 76), fstop=2.2, focus=(0.0, 0.0, top + 0.004))
finish_cam(cam, NF, a, sc)
