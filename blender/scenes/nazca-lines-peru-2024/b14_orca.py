"""nazca-lines-peru-2024 b14_orca (35 mm, push-in; VO 'Humans, llamas, and killer whales holding knives.'): Medium: the orca-with-knife relief figure on the slope in raking light (simplified tracing).
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=250, elev=10, warmth='golden')
foothills(center=(0, 1300, -10), height=60)
trail(pts=((-60, -6), (0, -1), (60, -6)))
slope_figure('Orca', 'orca', (0, 8, 0.8), scale=1.0, tilt=20, yaw=0)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-4, -18, 6), (0, 8, 1.2), amount=0.22), 35, fstop=8, focus=20.0)
go(cam, NF, a, sc, meter=NF // 2)
