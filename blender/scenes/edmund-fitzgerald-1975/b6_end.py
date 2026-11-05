"""edmund-fitzgerald-1975 plate b6 (VO 'Nobody explained it. Only that final call.'): from astern, the freighter's
lights pull away into the storm haze until she is a faint glow; slow dolly, nothing resolves (loops to the photo)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 130, int)
setup(sc, exposure=arg(a, '--exp', 1.6, float), vol=True)
storm_lake(NF, wave_scale=2.6, wind=22.0, fog=arg(a, '--fog', 0.0035, float))
ship = freighter('Ship')
ship_motion(ship, NF, speed=0.55, list_deg=(4.0, 6.0), y0=0.0)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-30, -200, 14), (-26, -185, 13), look=(0, 0, 6), look1=(0, 70, 6)), lens=(36, 40), fstop=8,
         focus='Ship_Pilot')
finish_cam(cam, NF, a, sc)
