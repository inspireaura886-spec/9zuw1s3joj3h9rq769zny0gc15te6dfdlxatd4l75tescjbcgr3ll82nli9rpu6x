"""s06 WIDE 24 mm 'This one came from near the Prince Edward Islands, far south of Africa.' Aerial: two dark rocky
islands in a cold grey sea at dusk. Crane down."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=250, strength=0.6)
CN.sun(elev=5, az=250, warmth='blue', strength=1.5, check=False)
Wd.sea_plane(size=90000, z=0.0, color=(0.01, 0.015, 0.02), rough=0.1, wave=0.2, wave_scale=0.06, frames=max(NF, 60))
islands(seed=4)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((2500, -4200, 1500), (-600, 600, 0), dz=-500.0, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
