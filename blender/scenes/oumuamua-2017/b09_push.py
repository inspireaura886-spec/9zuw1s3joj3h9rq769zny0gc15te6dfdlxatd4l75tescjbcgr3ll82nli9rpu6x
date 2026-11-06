"""s09 WIDE 24 mm TWIST 'Gravity alone couldn't explain its path. Something was gently pushing it.' The rock heading out,
the Sun a hard white disc far behind it; a faint ghost copy lags behind it on the gravity-only line. Track."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=9, sun_dir=(-1, -0.4, 0.1))
sun_ball((-9000, -3600, 900), r=180, strength=80.0)
o = oumuamua('Oumu', (0, 0, 0), L=40, NF=NF)
key_loc(o, [(0, (0, 0, 0)), (NF, (2.6 * NF, 1.05 * NF, 0))], interp='LINEAR')
g = oumuamua('Ghost', (0, 0, 0), L=40, NF=NF)
g.data.materials.clear()
g.data.materials.append(glow_mat('GhostM', color=(0.6, 0.75, 0.9), strength=0.4))
key_loc(g, [(0, (-6, 0, -4)), (NF, (2.5 * NF - 6, 1.0 * NF, -4))], interp='LINEAR')
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.track('Oumu', offset=(-40, -150, 20), offset1=(-30, -130, 16), look_offset=(0, 0, 0)), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
