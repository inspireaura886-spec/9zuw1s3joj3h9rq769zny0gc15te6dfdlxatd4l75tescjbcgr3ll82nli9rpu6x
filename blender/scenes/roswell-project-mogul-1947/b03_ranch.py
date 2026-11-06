"""s03 WIDE 24 mm 'On a New Mexico ranch, Mac Brazel found tinfoil, rubber and sticks.' High desert at morning:
windpump, fence line, debris glinting across the scrub. Crane DOWN from 9 m to 2.2 m toward the debris."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=24, az=120, warmth='golden', seed=3)
windpump('Mill', (-38, 90, 0), NF)
fence('Fence', (-60, 40, 0), (40, 70, 0), n=18)
debris_field((0, 22, 0), radius=14, n=90, seed=4, scale=1.0)
cam = C.Cam()
wide(cam, NF, C.crane((2, -6, 9.0), (0, 24, 0.5), dz=-6.8, dlook=0.2), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
