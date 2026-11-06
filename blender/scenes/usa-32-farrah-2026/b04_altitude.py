"""usa-32-farrah-2026 b04_altitude (24 mm, crane up; VO 'about seven hundred seventy-five kilometres up.'): WIDE: the satellite high above the curved Earth, a thin measuring line with tick marks dropping from it to the surface.
NF default 77 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 77, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
space(sun_az=100); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=10, NF=NF)
ln = curve_poly('Alt', [(0, 0, -5), (0, 0, -200)], bevel=0.35, mat=glow_mat('AltM', (1.0, 0.8, 0.5), 3.0))
grow_curve(ln, [(0, 0.0), (int(NF * 0.7), 1.0), (NF, 1.0)])
tm = mat_once('Tick', base=(1.0, 0.8, 0.5), emission=(1.0, 0.8, 0.5), emit=3.0)
for i in range(1, 8):
    boxm('Tick%d' % i, (0, 0, -5 - i * 27.9), (7.0, 0.3, 0.3), tm)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.crane((46, -90, -90), (0, 0, -90), dz=34, dlook=24), 24, fstop=11, focus=100.0)
go(cam, NF, a, sc, meter=NF // 2)
