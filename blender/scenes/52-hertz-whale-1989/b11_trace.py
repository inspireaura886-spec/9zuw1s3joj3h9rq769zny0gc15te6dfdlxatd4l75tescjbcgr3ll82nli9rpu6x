"""52hz b11_trace (CLOSE accent 50 mm, push-in; VO 'far above every other whale.'). CLOSE accent: the procedural gram fills frame; the bright trace rides far above the faint low band.
NF default 64 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
sc = core.reset(); look(sc, vol=False, glare=0.6, vignette=0.28)
gradient_world('Room', up=(0.0, 0.0, 0.0), mid=(0.0, 0.0, 0.0), down=(0.0, 0.0, 0.0), light=0.0)
tm = spectro_trace_mat('GramM', NF, rise=(4, int(NF * 0.6)), band_y=0.22, trace_y=(0.64, 0.66), glow=3.2)
uv_plane('Gram', 0.86, 0.62, (0, 0, 0), rot=(math.radians(90), 0, 0), mat=tm)
boxm('Bezel', (0, 0.06, 0), (1.0, 0.1, 0.76), M.principled('BezM', base=(0.05, 0.05, 0.05), rough=0.4), 0.03)
cam = C.Cam(clip_end=50)
cam.shot(0, NF, C.push_in((0.05, -1.25, 0.02), (0.05, 0, 0.08), amount=0.18), lens=50, fstop=2.8, focus='Gram')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
