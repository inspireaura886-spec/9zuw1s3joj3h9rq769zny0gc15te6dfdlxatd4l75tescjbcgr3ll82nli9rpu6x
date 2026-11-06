"""s08 WIDE 24 mm 'For thirty-one years, it went quiet.' Same ranch at dusk, debris gone, windpump still turning,
sun sinking and the light fading (keyed). Crane UP 2 -> 12 m."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=6, az=290, warmth='late', strength=3.0, seed=3, haze=0.0018)
windpump('Mill', (-38, 90, 0), NF)
fence('Fence', (-60, 40, 0), (40, 70, 0), n=18)
key_energy(bpy.data.objects['CineSun'], [(0, 3.0), (NF, 0.6)])
cam = C.Cam()
wide(cam, NF, C.crane((4, -4, 2.0), (-20, 80, 6), dz=10, dlook=6), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 3)
