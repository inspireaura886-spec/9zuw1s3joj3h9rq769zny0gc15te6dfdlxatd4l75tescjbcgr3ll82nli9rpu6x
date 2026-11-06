"""s07 WIDE 28 mm 'Two boats watched it circle and sink to about thirty feet,' A Liberty-type freighter and a fishing boat in
the foreground swell, the blimp low over the water (gondola ~9 m up) in a slow turn. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=20, az=115, haze=0.0010)
freighter('Ship', (-160, 360, 0), yaw=12)
fb = Md.boat('Fisher', (45, 110, 0.1), length=11.0)
fb.rotation_euler = (0, 0, math.radians(-30))
b = blimp('L8', (0, 520, 40), NF)
fly_keys(b, [(0, (-40, 520, 40), 70), (NF // 2, (0, 540, 24), 90), (NF, (40, 520, 16.6), 110)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-40, -30, 6), (10, -36, 6.5), look=(0, 480, 18), look1=(20, 480, 14)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
