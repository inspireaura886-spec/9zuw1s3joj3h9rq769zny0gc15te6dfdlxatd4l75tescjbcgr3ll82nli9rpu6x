"""yonaguni b06_ruins (WIDE 28 mm, push-in; VO 'named the spot Ruins Point.'). The diver hovers above the top terrace looking down the steps. Slow push-in from wide.
NF default 64 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=80, sun_elev=66, sun_strength=5.5, density=0.03, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
dv = faceless_diver('Diver', loc=(1.0, 9.0, -11.5), yaw=-90, NF=NF)
move_line(dv, NF, (1.0, 9.0, -11.5), (0.0, -0.01, 0.0))
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.push_in((-12, -16, -12.5), (1, 8, -15.5), amount=0.2), lens=28, fstop=6.3, focus='DiverTorso')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
