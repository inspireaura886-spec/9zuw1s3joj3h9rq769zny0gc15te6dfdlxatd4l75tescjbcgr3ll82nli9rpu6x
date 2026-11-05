"""b15 (WIDE 24 mm, VO 'Eighty-nine years on'): open Pacific at dawn, empty horizon, long swells. Slow crane down."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 102, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
dawn_world(sun_az=62, elev=6, strength=3.8, hdri_strength=0.95)
swell_ocean(NF, half=4500, wave_scale=2.0, wind=14, color=(0.006, 0.018, 0.026))
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.crane((0, -80, 62), (30, 600, 3), dz=-34, dlook=0), lens=24, fstop=11, focus=1500.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
