"""edmund-fitzgerald-1975 plate b3 (VO 'Earlier, its captain reported both radars dead, and heavy seas over the deck.'):
from the starboard bridge wing looking aft: the long deck of hatch covers, the ship listing to starboard, green water
sweeping across the deck. Shot 2: lower and closer along the rail. --variant hatch = 2 s close on one hatch cover."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 125, int)
VAR = arg(a, '--variant', 'deck')
setup(sc, exposure=arg(a, '--exp', 1.7, float), vol=True)
storm_lake(NF, wave_scale=arg(a, '--ws', 3.0, float), wind=24.0, crest=1.4, crest1=3.0)
ship = freighter('Ship')
ship_motion(ship, NF, speed=0.10, list_deg=(4.0, 5.5), roll_amp=2.0, z0=-0.6)
cam = C.Cam(clip_end=20000)
if VAR == 'hatch':
    cam.shot(0, NF, C.track('Ship', offset=(14.0, 12.0, 9.0), offset1=(12.5, 2.0, 8.0), look_offset=(1.0, 4.0, 4.6)),
             lens=(34, 36), fstop=5.6, focus='Ship_Hatch11')
else:
    h = int(NF * 0.52)
    cam.shot(0, h, C.track('Ship', offset=(15.5, 101.0, 15.5), offset1=(15.0, 94.0, 14.5), look_offset=(0.0, -30.0, 4.0)),
             lens=(24, 26), fstop=8, focus='Ship_Hatch12')
    cam.shot(h, NF, C.track('Ship', offset=(16.0, 38.0, 8.5), offset1=(15.0, 26.0, 8.0), look_offset=(2.0, -20.0, 4.5)),
             lens=(26, 28), fstop=6, focus='Ship_Hatch8')
finish_cam(cam, NF, a, sc)
