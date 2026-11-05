"""b05 (WIDE 24 mm, VO 'In October 2026, a ship sailed'): generic expedition ship small in frame on open Pacific swell, golden hour. Eased dolly alongside."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 104, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
dawn_world(sun_az=248, elev=9, strength=4.6, hdri_strength=1.0)
swell_ocean(NF, half=4000, wave_scale=1.8, wind=13, color=(0.006, 0.02, 0.03))
expedition_ship(NF, y_speed=0.2)
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((120, -150, 17), (92, -96, 14), look=(0, -6, 6), look1=(0, 6, 6)), lens=26, fstop=8, focus=Vector((0, 0, 5)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
