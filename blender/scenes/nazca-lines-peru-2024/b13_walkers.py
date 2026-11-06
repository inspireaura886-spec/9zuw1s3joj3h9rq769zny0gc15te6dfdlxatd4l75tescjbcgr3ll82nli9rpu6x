"""nazca-lines-peru-2024 b13_walkers (28 mm, walking-height dolly; VO 'to be seen by people passing on foot.'): Eye-height dolly down the trail (no person), the slope figure sliding into view on the left.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=230, elev=14, warmth='golden')
foothills(center=(0, 1300, -10), height=60)
trail(pts=((-200, -20), (-60, -2), (0, 0), (80, -6), (220, 10)))
slope_figure('Relief', 'human', (-2, 9, 0.6), scale=1.0, tilt=16, yaw=-6)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-30, -4, 1.65), (-18, -1.5, 1.65), look=(-2, 8, 1.0), look1=(2, 10, 1.0)), 28, fstop=8, focus=22.0)
go(cam, NF, a, sc, meter=NF // 2)
