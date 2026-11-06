"""s03 WIDE 24 mm REVEAL 'He had. Five thousand three hundred years ago.' Reconstruction: a living Copper Age traveller (faceless,
fur cape, bow, quiver) climbs the same pass in low dawn light (chip c. 3300 BC; RECONSTRUCTION). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=3, sun_elev=15, az=100, warmth='golden', gully=False)
t = traveller('Traveller', (-6, 30, 0.3), yaw=-70)
key_loc(t, [(0, (-6, 30, 0.3)), (NF, (-6 + NF * 0.02, 30.5, 0.6))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-14, 8, 1.4), (-14 + NF * 0.02, 8, 1.4), look=(-6, 30, 1.4), look1=(-6 + NF * 0.02, 30, 1.4)), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
