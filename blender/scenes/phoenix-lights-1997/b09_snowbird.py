"""s09 WIDE 28 mm 'Air National Guard A-10s on a training run, Operation Snowbird.' The five-ship V high over the dark valley, the city grid below, steady lights. Follow (dolly + pan)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=6, city_center=(0, 1500, 0))
lead = a10('Lead', (0, 0, 2500), yaw=180)
for i, (dx, dy) in enumerate([(-30, 26), (30, 26), (-60, 52), (60, 52)]):
    a10('W%d' % i, (dx, dy, 2500), yaw=180)
for o in [lead] + [bpy.data.objects['W%d' % i] for i in range(4)]:
    p = o.location.copy()
    key_loc(o, [(0, p), (NF, p + Vector((0, -110.0 * NF / 30, 0)))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('Lead', (-260, 160, 2560), (-250, -330, 2575), look_offset=(0, 30, -20)), lens=28, fstop=11, focus='Lead')
go(cam, NF, a, sc, meter=NF // 2)
