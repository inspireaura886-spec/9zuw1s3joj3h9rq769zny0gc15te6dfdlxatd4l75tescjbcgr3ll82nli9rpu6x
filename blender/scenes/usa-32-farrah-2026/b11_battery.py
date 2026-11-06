"""usa-32-farrah-2026 b11_battery (35 mm, slow orbit; VO 'Analysts suggest something duller: an old battery or fuel tank may simply have ruptured.'): MEDIUM-WIDE: the foil body turned to a ghost shell; inside, battery blocks and a round tank glow and pulse, a thin crack of light opens at the end.
NF default 169 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 169, int)
sc = core.reset(); look(sc, vol=False, glare=0.5)
space(sun_az=100); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=0, NF=NF)
shell = mat_once('SatGhost', base=(0.72, 0.5, 0.16), rough=0.2, metal=0.2, alpha=0.16)
parts[0].data.materials[0] = shell
inner = []
for k, x in enumerate((-1.4, 0.0, 1.4)):
    gm = glow_mat('Batt%d' % k, (1.0, 0.78, 0.45), 4.0)
    b = boxm('Batt%d' % k, (x, 0.0, -0.4), (0.9, 1.6, 1.2), gm)
    key_fac(gm, [(0, 0.2), (int(NF * 0.3) + k * 6, 1.0), (int(NF * 0.55) + k * 6, 0.35), (int(NF * 0.8), 1.0), (NF, 0.7)])
tk = sphere('Tank', (0, 0, 1.0), 0.9, mat_once('TankM', base=(0.55, 0.57, 0.6), rough=0.3, metal=0.9), seg=24)
cr = curve_poly('Crack', [(2.6, -1.0, 1.6), (2.2, -1.0, 0.6), (2.9, -1.0, -0.3), (2.4, -1.0, -1.2)], bevel=0.05, mat=glow_mat('CrackM', (1.0, 0.9, 0.7), 10.0))
cr.parent = root
grow_curve(cr, [(0, 0.0), (int(NF * 0.78), 0.0), (NF, 1.0)])
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=14, a0=-118, a1=-66, h=(2, 4), look_h=0.0), 35, fstop=5.6, focus=14.0)
go(cam, NF, a, sc, meter=NF // 2)
