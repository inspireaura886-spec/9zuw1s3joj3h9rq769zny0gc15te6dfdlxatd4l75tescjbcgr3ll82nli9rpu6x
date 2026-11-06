"""s09 CLOSE 45 mm (accent) 'Then Major Jesse Marcel, who gathered the debris, called it a cover story.' 1978 interview
table: reel-to-reel recorder turning, microphone, notepads, glasses. Slow push-in (chip '1978' in Remotion)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(5, 5, 2.8), wood_walls=True, window=False, seed=9)
top = desk('Table', (0, 0.3, 0), w=1.4, d=0.9)
reel_to_reel('R2R', (0, 0.3, top), NF)
CN.place('office_notepads', (-0.45, 0.25, top), rot=(0, 0, 0.4))
CN.place('round_spectacles', (0.42, 0.1, top), rot=(0, 0, 1.2))
Wd.spot('Key', (-0.8, -0.4, 1.9), (0, 0.3, top), color=(1.0, 0.84, 0.62), power=160, size_deg=45, blend=0.7)
cam = C.Cam()
wide(cam, NF, C.push_in((0.15, -0.75, top + 0.45), (0, 0.3, top + 0.12), amount=0.3), lens=45, fstop=2.8, focus='R2R')
go(cam, NF, a, sc, meter=NF // 2)
