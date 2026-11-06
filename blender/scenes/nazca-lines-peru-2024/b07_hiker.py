"""nazca-lines-peru-2024 b07_hiker (28 mm, slow lateral dolly; VO 'But in 1927, Toribio Mejía found them on foot, hiking the foothills.'): MOMENT (slow): golden-hour foothills, a lone hatted figure with a stick walking a slope, a pale line below.
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
pampa(NF, sun_az=200, elev=8, warmth='golden')
foothills(center=(0, 1300, -10))
ribbon('Below', [(-300, 40), (400, 120)], 1.4, line_mat(), z=0.01)
h = hiker('Mejia', (0, 0, 0), yaw=-80)
walk(h, NF, (-3, 0, 0), (1.5, 0.3, 0))
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-10, -14, 2.0), (-7, -14.5, 2.1), look=(-1, 0, 1.3), look1=(1.5, 0.3, 1.3)), 28, fstop=5.6, focus=14.0)
go(cam, NF, a, sc, meter=NF // 2)
