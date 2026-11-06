"""nazca-lines-peru-2024 b03_stones (24 mm, low dolly along the line; VO "In Peru's southern desert, people scraped away dark stones"): Ground level, low sun: dark oxide stones everywhere except a pale cleared line running to the horizon.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=20, elev=12, warmth='golden')
ribbon('Line', [(0, -10), (0, 600)], 1.4, line_mat(), z=0.01)
stones(center=(0, 2), radius=10, n=2600, cleared=((0, -20), (0, 40), 0.75))
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-1.6, -6, 0.6), (-1.4, -2.5, 0.65), look=(0, 30, 0)), 24, fstop=8, focus=6.0)
go(cam, NF, a, sc, meter=NF // 2)
