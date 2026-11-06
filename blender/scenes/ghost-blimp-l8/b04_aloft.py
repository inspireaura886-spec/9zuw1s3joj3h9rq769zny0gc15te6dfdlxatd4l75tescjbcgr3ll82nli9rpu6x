"""s04 WIDE 28 mm 'carrying Lieutenant Ernest Cody and Ensign Charles Adams.' The blimp heads out low over the sea; two
faceless silhouettes behind the gondola glass. Follow: camera dollies alongside and pans with it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=12, az=100, haze=0.0010, ocean_center=(0, 300, 0))
b = blimp('L8', (0, 0, 150), NF, crew=True, yaw=0)
fly_line(b, NF, (0, -NF * 0.35, 150), (0, 0.7, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('L8', (-70, -40, 140), (-62, 20, 142), look_offset=(0, 4, -3)), lens=28, fstop=11, focus='L8')
go(cam, NF, a, sc, meter=NF // 2)
