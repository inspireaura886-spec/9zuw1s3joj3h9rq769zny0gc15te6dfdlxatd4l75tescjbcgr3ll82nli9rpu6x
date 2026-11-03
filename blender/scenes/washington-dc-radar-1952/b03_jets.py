"""dc-radar b03 (L3a 'The Air Force sent fighter jets.'): two generic jet fighters (no markings) in loose
formation over the lit city at night; smooth chase from behind-left."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 80, int)
sc = night_city(NF, exposure=1.2)
VF = 6.0
j1 = Md.fighter('Lead', f1=NF, burner=0.35)
Md.fly(j1, [(0, (0, 0, 0), (0, 0, 0)), (NF, (0, VF * NF, 0), (0, 0, 0))], interp='LINEAR')
j2 = Md.fighter('Wing', f1=NF, burner=0.35, seed=9)
Md.fly(j2, [(0, (26, -22, -4), (0, 0, -2)), (NF, (24, VF * NF - 20, -3), (0, 0, 2))], interp='LINEAR')
cam = C.Cam(clip_end=90000)
cam.shot(0, NF, C.track('Lead', offset=(-22, -46, 9), offset1=(-16, -36, 7), look_offset=(16, 30, -2)),
         lens=(40, 44), fstop=8, focus='Lead')
finish_cam(cam, NF, a, sc)
