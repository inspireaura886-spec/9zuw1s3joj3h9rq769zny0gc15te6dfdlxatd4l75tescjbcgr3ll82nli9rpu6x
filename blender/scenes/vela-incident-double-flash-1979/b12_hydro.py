"""s12 WIDE 28 mm 'Navy scientists said underwater microphones heard a matching blast.' Underwater blue gloom: a
hydrophone on its cable, a pale sound ring expanding past it (chip NAVAL RESEARCH LAB). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=True)
hydrophone_world(NF, f_ring=int(NF * 0.3))
cam = C.Cam(clip_end=2000)
wide(cam, NF, C.push_in((-6, 6, 1.0), (0, 20, 0.6), amount=0.25), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
