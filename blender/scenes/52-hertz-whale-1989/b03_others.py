"""52hz b03_others (WIDE 28 mm, orbit; VO 'Blue whales call between ten and thirty-nine. Fin whales, around twenty.'). Two distant whales (blue and fin silhouettes, generic) send slow, wide, deep rings (illustration of low calls).
NF default 133 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=80, half=480, sun_az=40, sun_elev=58, sun_strength=5.0, density=0.02)
seabed('Bed', 1000, 80, height=8.0, scale=0.01, seed=5)
w1 = whale('BlueW', NF, length=26, beat=120, tint=(0.18, 0.22, 0.28))
move_line(w1, NF, (-30, 95, -32), (-0.08, 0.0, 0.0))
w2 = whale('FinW', NF, length=20, beat=100, phase=1.3, tint=(0.14, 0.15, 0.17))
w2.rotation_euler = (0, 0, math.radians(180))
move_line(w2, NF, (20, 130, -42), (0.09, 0.0, 0.0))
pulse_rings('LowA', (-22, 95, -31), 3, 8, 40, 60, 80, color=(0.45, 0.62, 0.95), strength=3.5, w=0.02, rot=(math.radians(90), 0, 0))
pulse_rings('LowB', (24, 130, -41), 3, 26, 40, 50, 80, color=(0.45, 0.62, 0.95), strength=3.0, w=0.02, rot=(math.radians(90), 0, 0))
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.orbit((0, 110, -34), r=125, a0=258, a1=276, h=(10, 6), look_h=0.0), lens=28, fstop=9, focus=125.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
