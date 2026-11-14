"""s04 CLOSE 45 mm (accent) 'on a coastal radar screen.' A-scope CRT in the dark radar trailer: green trace and grass,
one target spike rising at 35 percent (chip '1:45 AM'). Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(2.6, 5.5, 2.3), wood_walls=False, window=False, seed=4)
top = desk('Bench', (0, 0.4, 0), w=1.6, d=0.7)
ascope('Scope', (0, 0.62, top + 0.38), NF, blip_at=0.35)
Wd.point('Green', (0, 0.3, top + 0.4), color=(0.45, 1.0, 0.5), power=25, radius=0.2)
cam = C.Cam()
wide(cam, NF, C.push_in((0.25, -0.75, top + 0.5), (0, 0.6, top + 0.36), amount=0.35), lens=45, fstop=2.8, focus='Scope')
go(cam, NF, a, sc, meter=int(NF * 0.7), target=0.26)
