"""s10 WIDE 28 mm 'He even stopped secretly in Argentina, which broke the rules.' Dusk: low flat coast and a river
mouth, the trimaran anchored, a small fishing boat beside it. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=6, az=260, warmth='late', hdri='industrial_sunset_02', strength=2.4, sea=(0.03, 0.04, 0.035))
gm = M.texture_set('Coast', 'damp_beach_sand', scale=0.2, tint=(0.4, 0.36, 0.28), box=True)
Wd.terrain('Coast', size=3000, res=160, height=6, scale=0.002, center=(0, 900, -1.0), seed=6, mat=gm)
trimaran('Electron', (0, 120, 0), yaw_deg=80.0, NF=NF, sails='none')
Md.boat('Fisher', (12, 118, 0.0), length=8.0, cabin_light=True)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-40, 40, 3.5), (-20, 40, 3.5), look=(0, 120, 3), look1=(8, 120, 3)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
