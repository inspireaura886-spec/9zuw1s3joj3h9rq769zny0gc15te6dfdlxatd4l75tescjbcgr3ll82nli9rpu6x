"""yonaguni b07_kimura (MEDIUM-WIDE 30 mm, eased dolly; VO 'Then marine geologist Masaaki Kimura dived it over a hundred times,'). Deeper, bluer light: a torch-lit faceless diver glides along the channel between two rock masses (the "road" claim).
NF default 133 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.24)
underwater(NF, depth=28, half=220, sun_az=120, sun_elev=58, sun_strength=3.0, density=0.036, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('L', origin=(-9, 0, -26), steps=5, rise=2.0, tread=2.4, width=10.0, seed=7, wall_side=False)
terraces('R', origin=(9, 0, -26), steps=4, rise=2.4, tread=2.8, width=10.0, seed=11, wall_side=False)
dv = faceless_diver('Diver', loc=(0, -6, -22.5), yaw=90, NF=NF, torch=True)
move_line(dv, NF, (0, -6, -22.5), (0, 0.05, 0.004))
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.dolly((-1.5, -16, -20.5), (-1.0, -10.5, -20.4), look=(0, -4, -22.3), look1=(0, 2, -22.0)), lens=30, fstop=4.0, focus='DiverTorso')
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
