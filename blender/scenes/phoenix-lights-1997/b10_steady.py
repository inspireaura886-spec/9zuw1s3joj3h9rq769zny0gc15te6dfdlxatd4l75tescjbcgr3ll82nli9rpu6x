"""s10 MEDIUM 35 mm 'Steady lights. No blinking.' Tracking past one A-10's wingtip light, the next jet's
steady lights beyond, city far below. Track."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=7, ridge=False)
j = a10('J0', (0, 0, 2500), yaw=180)
a10('J1', (30, 26, 2500), yaw=180)
for o in (j, bpy.data.objects['J1']):
    p = o.location.copy()
    key_loc(o, [(0, p), (NF, p + Vector((0, -3.6 * NF, 0)))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.track('J0', offset=(-18, 10, 3), offset1=(-14, 4, 2.4), look_offset=(4, 2, 0)), lens=35, fstop=8, focus='J0')
go(cam, NF, a, sc, meter=NF // 2)
