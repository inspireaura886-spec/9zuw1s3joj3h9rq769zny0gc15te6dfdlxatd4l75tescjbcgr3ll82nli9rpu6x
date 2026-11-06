"""s15 WIDE 28 mm 'A decade later, one of those pilots confirmed it.' Dawn on a Guard flight line: a parked A-10
under hangar floods, a faceless pilot figure walking past (chip LT COL ED JONES, 2007; ARIZONA REPUBLIC). Dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert_mats()
Wd.hdri('qwantani_dawn_puresky', strength=0.3, bg_strength=0.8, rot=90)
CN.sun(elev=4, az=95, warmth='golden', strength=2.0)
boxm('Ramp', (0, 0, -0.05), (300, 300, 0.1), M.texture_set('RampC', 'concrete_floor_worn_001', scale=0.2))
a10('Parked', (0, 20, 2.3), yaw=200, lights=False)
boxm('Hangar', (-30, 70, 9), (60, 30, 18), M.texture_set('HangarM', 'metal_plate', scale=0.2, tint=(0.5, 0.52, 0.5)))
Wd.spot('Flood', (-12, 55, 14), (0, 20, 1), color=(1.0, 0.85, 0.6), power=40000, size_deg=60)
p = figure('Pilot', (12, 6, 0), yaw=100)
key_loc(p, [(0, (12, 6, 0)), (NF, (6, 7.5, 0))], interp='LINEAR')
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.dolly((34, -22, 2.0), (26, -26, 2.2), look=(2, 18, 2.5), look1=(0, 18, 2.6)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
