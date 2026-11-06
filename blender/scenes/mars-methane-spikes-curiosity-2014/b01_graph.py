"""mars b01_graph (MEDIUM-WIDE 35 mm, push-in; VO 'A rover on Mars keeps smelling a gas that, on Earth, is made in large part by living things.'). Dim mission room; the REAL NASA/JPL PIA22328 methane graphic on the wall screen. Slow push-in.
NF default 225 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 225, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.24)
gradient_world('Ops', up=(0.02, 0.022, 0.03), mid=(0.01, 0.01, 0.012), down=(0, 0, 0), light=0.2)
mission_room(NF)
CN.haze(center=(0, 0, 2.5), size=(18, 16, 5), density=0.008, color=(0.85, 0.9, 1.0), anisotropy=0.4, noise=0.2, height_falloff=0.0)
cam = C.Cam(clip_end=300)
cam.shot(0, NF, C.push_in((0.3, -7.5, 2.2), (0, 4.08, 2.6), amount=0.22), lens=35, fstop=5.6, focus='WallScreen')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
