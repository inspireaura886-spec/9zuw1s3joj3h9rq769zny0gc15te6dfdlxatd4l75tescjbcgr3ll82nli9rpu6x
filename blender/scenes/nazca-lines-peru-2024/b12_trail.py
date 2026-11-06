"""nazca-lines-peru-2024 b12_trail (30 mm, crane down; VO 'Smaller. Older. Drawn beside walking trails,'): Medium-wide: a worn walking trail along a low hillside, a small relief figure on the slope beside it.
NF default 78 = 6 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 78, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=230, elev=14, warmth='golden')
foothills(center=(0, 1300, -10), height=60)
trail(pts=((-200, -20), (-60, -2), (0, 0), (80, -6), (220, 10)))
slope_figure('Relief', 'llama', (6, 9, 0.6), scale=1.0, tilt=16, yaw=4)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.crane((-16, -22, 14), (4, 8, 0.5), dz=-6, dlook=0), 30, fstop=8, focus=27.0)
go(cam, NF, a, sc, meter=NF // 2)
