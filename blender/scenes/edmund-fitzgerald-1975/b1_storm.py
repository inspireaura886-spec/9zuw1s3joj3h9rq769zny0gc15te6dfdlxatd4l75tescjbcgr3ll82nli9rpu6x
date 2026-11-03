"""edmund-fitzgerald-1975 plate b1 (VO line 2 tail + 'freighter on Lake Superior'): the laker ploughs through a night
storm, seas breaking along her side. Low port-bow camera tracks with the ship, slow push along the hull."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 150, int)
setup(sc, exposure=arg(a, '--exp', 1.6, float), vol=True)
storm_lake(NF, wave_scale=arg(a, '--ws', 2.4, float), wind=22.0)
ship = freighter('Ship')
ship_motion(ship, NF, speed=0.12, list_deg=(2.5, 3.0))
cam = C.Cam(clip_end=20000)
h = NF // 2
cam.shot(0, h, C.track('Ship', offset=(-120, 150, 16), offset1=(-105, 110, 13), look_offset=(0, 40, 4)),
         lens=(30, 32), fstop=8, focus='Ship_Pilot')
cam.shot(h, NF, C.track('Ship', offset=(-58, 40, 9), offset1=(-52, 10, 8), look_offset=(0, 70, 6)),
         lens=(28, 30), fstop=8, focus='Ship_Pilot')
finish_cam(cam, NF, a, sc)
