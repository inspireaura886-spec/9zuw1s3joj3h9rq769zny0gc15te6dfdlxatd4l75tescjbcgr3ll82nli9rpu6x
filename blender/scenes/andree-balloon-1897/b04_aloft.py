"""s04 WIDE 28 mm 'with Knut Fraenkel and photographer Nils Strindberg.' The balloon low over the sea ice, drag ropes
trailing in the snow, three faceless figures at the basket rim. Follow (dolly + pan)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=9, az=210, haze=0.0012, seed=3)
b = balloon('Ornen', (0, 300, 18), NF, crew=True)
fly_line(b, NF, (-NF * 0.15, 300, 18), (0.3, 0.05, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('Ornen', (-45, 245, 22), (-25, 240, 24), look_offset=(0, 0, 9)), lens=28, fstop=11, focus='Ornen')
go(cam, NF, a, sc, meter=NF // 2)
