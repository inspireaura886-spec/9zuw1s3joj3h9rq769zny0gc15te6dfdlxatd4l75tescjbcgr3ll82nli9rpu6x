"""yonaguni b01_print (MEDIUM-WIDE 35 mm, push-in; VO 'Twenty-five metres under the sea off Japan, theres a stone staircase.'). Dive-boat cabin table in morning light: the REAL CC0 photo of the Main Terrace stair as a print, mask, rope. Push-in.
NF default 133 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.22)
boat_table(NF)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0.05, -1.35, 1.42), (-0.15, -0.05, 0.75), amount=0.25), lens=35, fstop=4.0, focus='Print0')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
