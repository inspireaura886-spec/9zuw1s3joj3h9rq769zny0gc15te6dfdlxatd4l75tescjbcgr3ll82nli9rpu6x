"""s04 MEDIUM 35 mm 'The satellite had seen it forty-one times before.' Analyst's scope in a dark room: the double-hump
trace draws on (chip BHANGMETER; comp tally 41). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = mats()
top = desk_lamp_set(d)
scope_screen('Scope', (0, 1.05, top + 0.26), NF, f0=int(NF * 0.15), f1=int(NF * 0.75))
paper_stack('Sheets', (-0.55, 0.8, top + 0.001), 12, 4, d)
cam = C.Cam()
wide(cam, NF, C.push_in((0.15, -0.3, top + 0.42), (0, 1.0, top + 0.26), amount=0.3), lens=35, fstop=4.0, focus='ScopeGlass')
go(cam, NF, a, sc, meter=int(NF * 0.8), target=0.17)
