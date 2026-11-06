"""s03 WIDE 24 mm 'That morning, airship L-8 lifted off Treasure Island, in San Francisco Bay,' Dawn: hangar and mooring
mast on the island apron, the blimp rising over the calm bay (chip '6:00 AM'). Crane UP with it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=4, az=95, haze=0.0012, ocean_center=(0, 300, 0), half=4000)
apron = M.texture_set('Apron', 'rough_concrete', scale=0.05, tint=(0.45, 0.45, 0.43), box=True)
boxm('Island', (0, -60, 0.8), (900, 400, 3.0), apron)
hangar('Hangar', (-120, -120, 2.3), L=80, W=50, H=22, yaw=90)
mooring_mast('Mast', (30, 20, 2.3))
b = blimp('L8', (30, 44, 12), NF, yaw=0)
fly_keys(b, [(0, (30, 44, 12), 0), (NF, (34, 70, 45), 6)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-50, -60, 6), (30, 50, 18), dz=30, dlook=26), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
