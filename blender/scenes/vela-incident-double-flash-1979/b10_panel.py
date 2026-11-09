"""s10 WIDE 28 mm 'A White House panel said probably not a bomb, maybe space dust.' Long table, seven faceless panel
members, papers, one hanging lamp (chip RUINA PANEL 1980). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
panel_room(n=7)
cam = C.Cam()
wide(cam, NF, C.dolly((-1.6, -2.2, 1.5), (1.6, -2.2, 1.5), look=(-0.6, 3.0, 1.1), look1=(0.6, 3.0, 1.1)), lens=28, fstop=5.6, focus=5.2)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
