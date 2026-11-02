"""manises-1979 plate 4 (117 f, VO 9.77-13.17 'and radar in Barcelona and Madrid couldn't identify them.'):
1970s radar scope: the airliner blip and two unknown echoes beside it. Beam passes the blips near 'Madrid'."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 117
setup(sc, exposure=0.95, vol=False, glare=0.6, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.02)
blips = [((0.30, 0.20), (0.32, 0.27), 3.0),      # the airliner
         ((0.47, 0.05), (0.37, 0.22), 4.0),      # unknown 1
         ((0.51, 0.12), (0.40, 0.28), 3.5)]      # unknown 2
I.radar_room(frames=NF, blips=blips, seed=3, haze=0.02, t0=-0.6)
tgt = (0.06, 0.04, 1.03)
cam = C.Cam()
cam.shot(0, 58, C.dolly((0.36, -0.95, 1.86), (0.26, -0.78, 1.70), look=tgt), lens=(36, 38), fstop=2.2, focus=tgt)
cam.shot(58, NF, C.dolly((0.16, -0.52, 1.48), (0.12, -0.42, 1.40), look=(0.08, 0.06, 1.03)), lens=(48, 52),
         fstop=1.8, focus=(0.08, 0.06, 1.03))
finish_cam(cam, NF, a, sc)
