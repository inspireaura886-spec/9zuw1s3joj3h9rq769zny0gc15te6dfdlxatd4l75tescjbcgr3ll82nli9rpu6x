"""b13 (MEDIUM 50 mm, 'letter signed John Anglin'): desk, hooded lamp, a handwritten letter (illustrative ink lines, no readable text) and an envelope. Slow lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 212, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.3)
Wd.hdri('moonless_golf', strength=0.03)
m = mats()
room_box(4.0, 3.0, 2.6, tag='L')
top = M.texture_set('DeskTop', 'wood_table_worn', scale=1.0, tint=(0.34, 0.26, 0.18), box=True)
boxm('DeskTop', (0, 0, 0.72), (1.8, 0.9, 0.05), top, 0.01)
paper = M.principled('Paper', base=(0.62, 0.6, 0.52), rough=0.8, bump=0.1, bump_scale=300)
ink = M.principled('Ink', base=(0.015, 0.02, 0.06), rough=0.3)
root = Md.empty('Letter', (0.02, -0.02, 0.747))
sheet = boxm('Sheet', (0, 0, 0.001), (0.21, 0.297, 0.002), paper, 0.0005)
sheet.parent = root
for o in squiggle_lines('Ink', -0.085, 0.12, 0.0028, 0.17, 13, ink, rot=0.0, seed=3, gap=0.0165, amp=0.0035, bevel=0.0006):
    o.parent = root
sig = curve_poly('Sign', [(-0.07 + 0.012 * k, -0.115 + 0.012 * math.sin(k * 1.7) * (1 + k * 0.1), 0.0028) for k in range(16)], bevel=0.0009, mat=ink)
sig.parent = root
root.rotation_euler = (0, 0, math.radians(9))
env = Md.empty('Env', (-0.33, 0.1, 0.746))
e = boxm('EnvBody', (0, 0, 0.002), (0.225, 0.115, 0.004), M.principled('Envelope', base=(0.58, 0.55, 0.45), rough=0.85), 0.001)
e.parent = env
st = boxm('Stamp', (0.083, 0.037, 0.0045), (0.022, 0.026, 0.001), M.principled('StampM', base=(0.3, 0.1, 0.08), rough=0.6))
st.parent = env
for o in squiggle_lines('Addr', -0.07, 0.015, 0.0046, 0.1, 3, ink, seed=9, gap=0.014, amp=0.003, bevel=0.0005):
    o.parent = env
env.rotation_euler = (0, 0, math.radians(-12))
beam('Pen', (0.28, -0.12, 0.756), (0.28 + 0.14, -0.12 + 0.03, 0.756), 0.012, 0.012, M.principled('PenM', base=(0.02, 0.02, 0.03), rough=0.3, metal=0.5))
desk_lamp(0.62, 0.33, 0.745, tag='DL', power=300, target=(0.0, 0.0, 0.75))
Wd.area('RoomFill', (0.5, -1.4, 2.3), (0, 0, 0.75), color=(0.55, 0.65, 1.0), power=45, size=2.0)
CN.haze(center=(0, 0, 1.2), size=(3.8, 2.8, 2.4), density=0.01, color=(0.9, 0.88, 0.8), anisotropy=0.55, noise=0.35, noise_scale=0.3)
cam = C.Cam(clip_end=60)
cam.shot(0, NF, C.dolly((-0.5, -0.62, 1.2), (0.3, -0.5, 1.05), look=(-0.06, 0.0, 0.75), look1=(0.03, 0.02, 0.75)), lens=50, fstop=3.2, focus=Vector((0.0, 0.0, 0.75)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
