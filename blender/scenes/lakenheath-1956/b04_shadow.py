"""lakenheath b04 (L5+L6 'target whipped behind the fighter, shadowed it ten minutes, pilot tried to shake it'):
fighter jinking, a white light holds station behind it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 264, int)
sc = night_country(NF, exposure=1.2)
VF = 6.0
j = Md.fighter('Venom', f1=NF, burner=0.35)
Md.fly(j, [(0, (0, 0, 0), (0, 0, -8)), (NF // 2, (30, VF * NF // 2, 6), (0, 0, 10)), (NF, (-10, VF * NF, 0), (0, 0, -8))], interp='LINEAR')
o = Md.orb('Tail', (0, -90, 0), color=(1.0, 0.98, 0.95), strength=60, power=3e5, radius=3, halo=0.9, pulse=0.03, f1=NF, seed=5)
Md.fly(o, [(0, (0, -80, 0), None), (NF // 2, (30, VF * NF // 2 - 85, 6), None), (NF, (-10, VF * NF - 90, 0), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
cam.shot(0, NF, C.track('Venom', offset=(-30, -120, 18), offset1=(-40, -130, 14), look_offset=(0, -45, 0)), lens=(36, 40), fstop=8, focus='Venom')
finish_cam(cam, NF, a, sc)
