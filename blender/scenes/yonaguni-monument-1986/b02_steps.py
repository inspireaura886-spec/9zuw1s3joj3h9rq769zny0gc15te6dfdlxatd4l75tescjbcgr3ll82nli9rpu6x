"""yonaguni b02_steps (WIDE 24 mm, eased dolly; VO 'Flat steps. Right-angled walls.'). The terraces in blue water, a small diver for scale: flat treads, sheer jointed side wall. Eased dolly.
NF default 52 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 52, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=60, sun_elev=64, sun_strength=5.5, density=0.03, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
faceless_diver('Diver', loc=(5.0, 3.0, -14.5), yaw=160, NF=NF)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.dolly((-19, -21, -17), (-15, -20, -16.6), look=(0, 8, -20), look1=(1, 8, -19.5)), lens=24, fstop=8, focus=26.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
