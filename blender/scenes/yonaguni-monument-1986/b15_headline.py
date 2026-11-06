"""yonaguni b15_headline (MEDIUM-WIDE 35 mm, push-in; VO 'The headlines still sell a lost city, with one old line: Nobody explained it.'). Back on the boat table: a generic tabloid page "LOST CITY UNDER THE SEA?" beside the real photo prints. Push-in. Loops to b01.
NF default 168 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.22)
boat_table(NF, headline=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((-0.35, -1.4, 1.45), (-0.62, -0.1, 0.75), amount=0.24), lens=35, fstop=4.0, focus='Paper')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
